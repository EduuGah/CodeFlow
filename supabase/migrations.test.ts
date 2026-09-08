import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Conferência estática das migrações.
 *
 * Uma view que cita uma coluna inexistente não quebra nada até alguém colar o
 * arquivo no SQL Editor — e aí quebra na cara da pessoa, no meio da configuração
 * do projeto. Foi o que aconteceu com `users.last_login_at`, que a view
 * `user_summary` lia e a tabela nunca teve.
 *
 * Isto não substitui rodar as migrações num Postgres de verdade: não valida
 * sintaxe, tipos nem funções. Cobre a classe de erro que de fato apareceu — nome
 * de coluna que não existe na tabela de origem.
 */

const DIR = join(import.meta.dirname, 'migrations');

const arquivos = readdirSync(DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort();

const sql = arquivos.map((nome) => ({ nome, texto: readFileSync(join(DIR, nome), 'utf8') }));
const tudo = sql.map((f) => f.texto).join('\n');

/** Remove comentários de linha para não confundir prosa com código. */
function semComentarios(texto: string): string {
  return texto
    .split('\n')
    .map((linha) => linha.replace(/--.*$/, ''))
    .join('\n');
}

/**
 * Colunas declaradas em cada `create table`.
 *
 * O corpo é lido até o parêntese que fecha o `create table`, contando aninhamento
 * — `check (x in ('a','b'))` tem parênteses dentro e pararia cedo demais numa
 * busca ingênua pelo primeiro `)`.
 */
function colunasCriadas(texto: string): Map<string, Set<string>> {
  const limpo = semComentarios(texto);
  const tabelas = new Map<string, Set<string>>();
  const inicio = /create table (?:if not exists )?public\.(\w+)\s*\(/gi;

  let m: RegExpExecArray | null;
  while ((m = inicio.exec(limpo)) !== null) {
    let profundidade = 1;
    let i = inicio.lastIndex;

    while (i < limpo.length && profundidade > 0) {
      if (limpo[i] === '(') profundidade++;
      else if (limpo[i] === ')') profundidade--;
      i++;
    }

    const corpo = limpo.slice(inicio.lastIndex, i - 1);
    const colunas = new Set<string>();

    // Cada definição de coluna começa na primeira palavra da linha; restrições
    // de tabela (primary key, check, constraint) não são colunas.
    for (const linha of corpo.split('\n')) {
      const nome = linha.trim().match(/^(\w+)\s+\w/);
      if (!nome) continue;
      if (/^(primary|foreign|unique|check|constraint|exclude)$/i.test(nome[1])) continue;
      colunas.add(nome[1]);
    }

    tabelas.set(m[1], colunas);
  }

  // Colunas acrescentadas depois, por alter table.
  const adicionadas = /alter table public\.(\w+)\s+add column (?:if not exists )?(\w+)/gi;
  while ((m = adicionadas.exec(limpo)) !== null) {
    if (!tabelas.has(m[1])) tabelas.set(m[1], new Set());
    tabelas.get(m[1])!.add(m[2]);
  }

  return tabelas;
}

const TABELAS = colunasCriadas(tudo);

describe('as tabelas esperadas existem', () => {
  it('encontra users, exercise_attempts e flashcard_reviews', () => {
    expect([...TABELAS.keys()].sort()).toEqual([
      'exercise_attempts',
      'flashcard_reviews',
      'users',
    ]);
  });

  it('users tem as colunas que a aplicação lê', () => {
    // Os nomes usados em `lib/progress.ts`.
    for (const coluna of ['id', 'email', 'name', 'role', 'completed_lessons', 'completed_projects']) {
      expect(TABELAS.get('users'), `users.${coluna}`).toContain(coluna);
    }
  });

  it('exercise_attempts guarda o que a lógica derivada precisa', () => {
    for (const coluna of ['user_id', 'exercise_id', 'lesson_id', 'concepts', 'correct', 'hints_used', 'created_at']) {
      expect(TABELAS.get('exercise_attempts'), `exercise_attempts.${coluna}`).toContain(coluna);
    }
  });
});

describe('nenhuma view cita coluna que não existe', () => {
  /**
   * Aliases de tabela declarados num `from`/`join`, para resolver `u.coluna`.
   * Só aliases de tabelas nossas: subconsultas agregadas inventam colunas
   * próprias e são conferidas pelo teste seguinte.
   */
  function aliases(texto: string): Map<string, string> {
    const mapa = new Map<string, string>();
    const re = /(?:from|join)\s+public\.(\w+)\s+(\w+)/gi;

    let m: RegExpExecArray | null;
    while ((m = re.exec(texto)) !== null) {
      if (!/^(on|where|group|order|left|right|inner|as)$/i.test(m[2])) mapa.set(m[2], m[1]);
    }
    return mapa;
  }

  it.each(sql.map((f) => f.nome))('%s', (nome) => {
    const texto = semComentarios(sql.find((f) => f.nome === nome)!.texto);
    const mapa = aliases(texto);
    if (mapa.size === 0) return;

    const problemas: string[] = [];
    const referencias = /\b(\w+)\.(\w+)\b/g;

    let m: RegExpExecArray | null;
    while ((m = referencias.exec(texto)) !== null) {
      const [, alias, coluna] = m;
      const tabela = mapa.get(alias);
      if (!tabela) continue;

      const colunas = TABELAS.get(tabela);
      if (colunas && !colunas.has(coluna)) {
        problemas.push(`${alias}.${coluna} — ${tabela} não tem essa coluna`);
      }
    }

    // Este é o erro que o aluno recebe no SQL Editor, e só lá.
    expect([...new Set(problemas)]).toEqual([]);
  });
});

describe('segurança', () => {
  it('toda view usa security_invoker', () => {
    const views = tudo.matchAll(/create (?:or replace )?view public\.(\w+)([\s\S]*?)\bas\b/gi);

    for (const v of views) {
      // Sem isso, a view roda com os privilégios de quem a criou e ignora o RLS
      // das tabelas de origem — vazando o progresso de todos os alunos.
      expect(v[2], `view ${v[1]} sem security_invoker`).toMatch(/security_invoker\s*=\s*true/i);
    }
  });

  it('toda tabela liga row level security', () => {
    for (const tabela of TABELAS.keys()) {
      expect(tudo, `${tabela} sem RLS`).toMatch(
        new RegExp(`alter table public\\.${tabela} enable row level security`, 'i')
      );
    }
  });

  it('função security definer que escreve não é chamável pelo cliente', () => {
    // Cabeçalho e corpo separados: a checagem de escrita tem que olhar o corpo.
    // A primeira versão deste teste capturava só o cabeçalho, nunca encontrava um
    // `update`, e passava sem conferir nada.
    const funcoes = tudo.matchAll(
      /create (?:or replace )?function public\.(\w+)\s*\([^)]*\)([\s\S]*?)\$\$([\s\S]*?)\$\$/gi
    );

    let conferidas = 0;

    for (const [, nome, cabecalho, corpo] of funcoes) {
      if (!/security definer/i.test(cabecalho)) continue;
      if (/returns\s+trigger/i.test(cabecalho)) continue; // gatilho não é chamável por RPC
      if (!/\b(insert|update|delete)\b/i.test(corpo)) continue;

      conferidas++;

      // Uma função que escreve com os privilégios do dono e que o aluno pode
      // chamar pela API é um caminho de escalada de privilégio, por mais que o
      // corpo pareça inofensivo.
      //
      // `[^;]*` porque um revoke termina no ponto e vírgula. E a montagem é com
      // barras duplas: `[\s\S]` dentro de template string vira `[sS]`, que foi o
      // segundo motivo de este teste não conferir nada.
      expect(semComentarios(tudo), `${nome} escreve como definer sem revoke`).toMatch(
        new RegExp(`revoke\\b[^;\\n]*\\bon function public\\.${nome}\\b`, 'i')
      );
    }

    // Sem isto, apagar as funções do projeto deixaria o teste verde e vazio.
    expect(conferidas, 'nenhuma função definer com escrita foi encontrada').toBeGreaterThan(0);
  });

  it('toda função security definer fixa o search_path', () => {
    const funcoes = tudo.matchAll(/create (?:or replace )?function public\.(\w+)([\s\S]*?)\$\$/gi);

    for (const f of funcoes) {
      if (!/security definer/i.test(f[2])) continue;

      // Sem `search_path` fixo, quem chama a função pode antepor um schema seu e
      // fazer o corpo executar as tabelas dele com privilégios de dono.
      expect(f[2], `${f[1]} é security definer sem search_path`).toMatch(/set search_path\s*=/i);
    }
  });
});
