import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { ITENS, MOEDAS } from '../src/client/lib/economia';
import { POR_PERIODO, RECOMPENSA } from '../src/client/lib/desafios';

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
  it('encontra users, exercise_attempts, flashcard_reviews, purchases e store_items', () => {
    expect([...TABELAS.keys()].sort()).toEqual([
      'exercise_attempts',
      'flashcard_reviews',
      'purchases',
      'store_items',
      'users',
    ]);
  });

  it('users tem as colunas que a aplicação lê', () => {
    // Os nomes usados em `lib/progress.ts`.
    for (const coluna of [
      'id',
      'email',
      'name',
      'role',
      'completed_lessons',
      'completed_projects',
      'display_name',
      'avatar',
      'theme',
      'accent',
    ]) {
      expect(TABELAS.get('users'), `users.${coluna}`).toContain(coluna);
    }
  });

  it('purchases guarda o que a economia derivada precisa', () => {
    for (const coluna of ['user_id', 'item', 'price', 'created_at']) {
      expect(TABELAS.get('purchases'), `purchases.${coluna}`).toContain(coluna);
    }
    // Compra é fato: sem policy de update nem delete.
    expect(tudo).not.toMatch(/on public\.purchases\s+for (update|delete)/i);
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

  it('função security definer que escreve só é chamável pelo cliente quando age sobre quem chama', () => {
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

      // A exceção deliberada é a porta que o aluno usa (a compra): liberada
      // para `authenticated`, e então o corpo só pode agir sobre quem chama.
      const liberadaAoCliente = new RegExp(
        `grant execute on function public\\.${nome}\\b[^;]*\\bto\\b[^;]*\\bauthenticated\\b`,
        'i'
      ).test(semComentarios(tudo));
      if (liberadaAoCliente) {
        expect(corpo, `${nome} é porta do cliente e não se prende a auth.uid()`).toMatch(/auth\.uid\(\)/);
      }
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

describe('a loja no banco', () => {
  const zero9 = semComentarios(sql.find((f) => f.nome.startsWith('0009'))!.texto);

  it('o catálogo do banco tem os mesmos itens, preços e tipos do código', () => {
    // A compra lê o preço de `store_items`. Um item novo em `ITENS` que não
    // entrasse aqui seria recusado como indisponível; um preço diferente faria
    // a loja mostrar um número e cobrar outro.
    const semente = zero9.match(/insert into public\.store_items \(id, price, tipo\) values([\s\S]*?)on conflict/i)![1];
    const noBanco = [...semente.matchAll(/\('([\w-]+)',\s*(\d+),\s*'(\w+)'\)/g)]
      .map(([, id, preco, tipo]) => ({ id, price: Number(preco), tipo }))
      .sort((a, b) => a.id.localeCompare(b.id));
    const noCodigo = ITENS.map((i) => ({ id: i.id, price: i.price, tipo: i.tipo })).sort((a, b) =>
      a.id.localeCompare(b.id)
    );

    expect(noBanco).toEqual(noCodigo);
  });

  it('o teto de moedas usa os números da economia', () => {
    // Um teto abaixo do que o histórico rende recusaria compras legítimas.
    const teto = zero9.match(/function public\.teto_de_moedas[\s\S]*?\$\$([\s\S]*?)\$\$/i)![1];

    expect(teto).toMatch(new RegExp(`aulas from progresso\\), 0\\) \\* ${MOEDAS.porAulaConcluida}\\b`));
    expect(teto).toMatch(new RegExp(`projetos from progresso\\), 0\\) \\* ${MOEDAS.porProjetoEntregue}\\b`));
    expect(teto).toContain(`dias.d * 2 * ${POR_PERIODO.dia} * ${RECOMPENSA.dia.moedas}`);
    expect(teto).toContain(`dias.w * 2 * ${POR_PERIODO.semana} * ${RECOMPENSA.semana.moedas}`);
    expect(teto).toContain(`* (${MOEDAS.porSemanaSeguida} + ${MOEDAS.porMesSeguido})`);
    expect(teto).toContain(`item = 'congelar-sequencia'`);
  });

  it('comprar só pela função: o INSERT direto em purchases deixa de existir', () => {
    // A ordem importa: a 0007 cria a policy, a 0009 a derruba.
    const criada = tudo.lastIndexOf('create policy "purchases_insert_own"');
    const derrubada = tudo.lastIndexOf('drop policy if exists "purchases_insert_own"');
    expect(derrubada).toBeGreaterThan(criada);
  });

  it('o admin deixa de ler as linhas cruas de todos os alunos', () => {
    for (const policy of ['users_select_admin', 'attempts_select_admin', 'reviews_select_admin']) {
      const criada = tudo.lastIndexOf(`create policy "${policy}"`);
      const derrubada = tudo.lastIndexOf(`drop policy if exists "${policy}"`);
      expect(derrubada, policy).toBeGreaterThan(criada);
    }
    // O agregado responde só a admin.
    expect(zero9).toMatch(/function public\.desempenho_por_exercicio[\s\S]*?where public\.is_admin\(\)/i);
  });
});
