/**
 * Núcleo do motor de SQL.
 *
 * Puro de propósito, como `sandbox-core`: não sabe de Worker, de DOM nem de
 * onde o SQLite vem. Recebe uma fábrica de bancos e faz o resto — montar o
 * banco, rodar o SQL do aluno, rodar o de referência, comparar as linhas e
 * escrever a diferença numa frase que ensina. O worker chama isto no
 * navegador; a suíte de conteúdo chama no Node com o mesmo `sql.js`.
 *
 * O julgamento é por **linhas devolvidas**, nunca pelo texto do SQL. Duas
 * consultas diferentes que devolvem as mesmas linhas estão igualmente certas
 * — e é assim que o aluno aprende que SQL diz *o quê*, não *como*.
 */

import type { SqlTest } from '../../content/types';

/** Um valor de célula. BLOBs não aparecem nas aulas; se vierem, viram texto. */
export type Valor = number | string | null;

export interface Tabela {
  columns: string[];
  values: Valor[][];
}

/** O que um comando do aluno produziu: uma tabela (SELECT) ou linhas mexidas. */
export type Saida =
  | { tipo: 'tabela'; columns: string[]; values: Valor[][]; truncada?: boolean }
  | { tipo: 'comando'; comando: string; linhas: number | null };

/**
 * O contrato mínimo com o SQLite: rodar SQL comando a comando, cada um com as
 * colunas e as linhas que devolveu — inclusive um SELECT sem nenhuma linha,
 * que continua tendo colunas — e o total de linhas que um comando de escrita
 * mexeu.
 */
export interface Banco {
  /** Roda o SQL inteiro. Lança no primeiro comando que falha. */
  rodar(sql: string): Saida[];
  /**
   * Um SELECT com parâmetros (`?`), como um programa faz: cada linha vira um
   * objeto com as colunas. É o que `require('./banco')` do servidor
   * simulado entrega ao aluno — e é assim que se ensina a nunca concatenar
   * valores no SQL.
   */
  consultar(sql: string, params?: Valor[]): Array<Record<string, Valor>>;
  /** INSERT, UPDATE ou DELETE com parâmetros: quantas linhas mexeu, e o id do último INSERT. */
  executar(sql: string, params?: Valor[]): { linhas: number; ultimoId: number };
  fechar(): void;
}

/** Uma tabela como está agora: para a tela mostrar o banco depois do servidor rodar. */
export interface RetratoDeTabela {
  nome: string;
  columns: string[];
  values: Valor[][];
}

/**
 * As tabelas do banco com as linhas que têm, na ordem em que foram criadas.
 * Até `limite` linhas por tabela: o retrato é para olhar, não para paginar.
 */
export function retratoDasTabelas(banco: Banco, limite = 30): RetratoDeTabela[] {
  const nomes = banco
    .consultar("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid")
    .map((linha) => String(linha.name));
  return nomes.map((nome) => {
    const saidas = banco.rodar(`SELECT * FROM "${nome.replace(/"/g, '""')}" LIMIT ${limite}`);
    const tabela = saidas[0];
    if (!tabela || tabela.tipo !== 'tabela') return { nome, columns: [], values: [] };
    return { nome, columns: tabela.columns, values: tabela.values };
  });
}

export type AbrirBanco = () => Banco;

export interface ExecucaoSql {
  /** O banco de exemplo e o preparo do exercício, já concatenados. */
  setup: string;
  code: string;
  solution: string;
  tests: SqlTest[];
}

export interface ResultadoDeVerificacao {
  passed: boolean;
  message: string;
}

export interface ResultadoSql {
  /** O que cada comando do aluno produziu, na ordem. */
  saidas: Saida[];
  testResults: ResultadoDeVerificacao[];
  /** Erro do SQL do aluno, já traduzido. Quando existe, nada foi verificado. */
  error?: string;
  timedOut?: boolean;
}

/** Teto de linhas guardadas por tabela: um produto cartesiano não pode travar a tela. */
export const MAX_LINHAS = 500;

/**
 * Traduz a mensagem do SQLite para a frase que o aluno lê.
 *
 * As mensagens do SQLite são curtas e em inglês — `no such column: preco2` —
 * e quem está começando não sabe o que fazer com elas. Cada tradução diz o
 * que aconteceu e por onde procurar. O texto original fica entre parênteses
 * quando não há tradução, para a pessoa poder pesquisar.
 */
export function traduzirErroSql(mensagem: string): string {
  const m = mensagem.trim();
  let r: RegExpMatchArray | null;

  if ((r = m.match(/^near "(.+)": syntax error$/))) {
    return `Erro de sintaxe perto de "${r[1]}". Confira a palavra-chave e a ordem das cláusulas: SELECT … FROM … WHERE … GROUP BY … ORDER BY.`;
  }
  if (m === 'incomplete input') {
    return 'O SQL terminou no meio: falta alguma coisa depois da última palavra — um valor, uma condição, um nome de coluna, um parêntese que fecha.';
  }
  if ((r = m.match(/^unrecognized token: "(.+)"$/))) {
    return `O SQL não reconheceu ${r[1]}. Um texto vai entre aspas simples e precisa fechá-las ('Campinas'); um número não leva aspas.`;
  }
  if ((r = m.match(/^no such table: (.+)$/))) {
    return `A tabela "${r[1]}" não existe. As tabelas deste banco estão listadas acima do editor — confira o nome, letra por letra.`;
  }
  if ((r = m.match(/^no such column: (.+)$/))) {
    return `A coluna "${r[1]}" não existe. Confira o nome na lista de colunas da tabela — e, numa consulta com mais de uma tabela, se o apelido antes do ponto é o que você declarou.`;
  }
  if ((r = m.match(/^ambiguous column name: (.+)$/))) {
    return `A coluna "${r[1]}" existe em mais de uma tabela desta consulta. Diga de qual você quer, no formato tabela.coluna.`;
  }
  if ((r = m.match(/^NOT NULL constraint failed: (.+)\.(.+)$/))) {
    return `A coluna "${r[2]}" da tabela "${r[1]}" não aceita valor vazio (NULL). O comando precisa informar um valor para ela.`;
  }
  if ((r = m.match(/^UNIQUE constraint failed: (.+)\.(.+)$/))) {
    return `Já existe uma linha com esse valor em "${r[1]}.${r[2]}", e a coluna não aceita repetição.`;
  }
  if (m.startsWith('FOREIGN KEY constraint failed')) {
    return 'A linha aponta para um registro que não existe na outra tabela — a chave estrangeira não encontrou o id. Confira o número, ou crie o registro de lá primeiro.';
  }
  if ((r = m.match(/^CHECK constraint failed: (.+)$/))) {
    return `O valor não passou na regra da tabela (${r[1]}). A coluna só aceita o que a restrição CHECK permite.`;
  }
  if ((r = m.match(/^table (.+) already exists$/))) {
    return `A tabela "${r[1]}" já existe neste banco. Para criar outra, use outro nome; para mudar esta, é ALTER TABLE.`;
  }
  if ((r = m.match(/^no such index: (.+)$/))) {
    return `O índice "${r[1]}" não existe.`;
  }
  if ((r = m.match(/^index (.+) already exists$/))) {
    return `O índice "${r[1]}" já existe.`;
  }
  if (m === 'HAVING clause on a non-aggregate query') {
    return 'HAVING só faz sentido depois de um GROUP BY: ele filtra grupos. Para filtrar linhas, a cláusula é WHERE.';
  }
  if (m.startsWith('misuse of aggregate')) {
    return 'Uma função de agregação (COUNT, SUM, AVG…) não pode ficar dentro do WHERE — o WHERE filtra linhas antes de agrupar. O filtro por grupo é o HAVING.';
  }
  if ((r = m.match(/^no such function: (.+)$/))) {
    return `A função "${r[1]}" não existe no SQLite. Confira a grafia — as mais usadas são COUNT, SUM, AVG, MIN, MAX, LENGTH, UPPER, LOWER, ROUND, DATE.`;
  }
  if (m.startsWith('datatype mismatch')) {
    return 'O valor não é do tipo que a coluna exige — um texto onde só entra número, por exemplo.';
  }
  if (m.match(/^(\d+) values for (\d+) columns$/) || m.match(/^table .+ has (\d+) columns but (\d+) values were supplied$/)) {
    return `A quantidade de valores não bate com a de colunas: ${m}. Cada coluna listada precisa de um valor, na mesma ordem.`;
  }
  if (m.startsWith('cannot commit') || m.startsWith('cannot start a transaction')) {
    return `O banco recusou a transação: ${m}.`;
  }
  return `O banco recusou o comando (${m}).`;
}

/** O pedaço da API do `sql.js` que o adaptador usa — estrutural, para o núcleo não depender do pacote. */
export interface BancoSqlJs {
  iterateStatements(sql: string): {
    next(): IteratorResult<{
      step(): boolean;
      get(): Array<number | string | Uint8Array | null>;
      getColumnNames(): string[];
    }>;
    /** O texto que ainda não virou comando. */
    getRemainingSQL(): string;
  };
  getRowsModified(): number;
  /** Um comando preparado, para consultar com parâmetros. */
  prepare(sql: string): {
    bind(params: Array<number | string | null>): boolean;
    step(): boolean;
    getAsObject(): Record<string, number | string | Uint8Array | null>;
    free(): boolean;
  };
  run(sql: string, params?: Array<number | string | null>): unknown;
  close(): void;
}

/**
 * O primeiro verbo de um comando, para o painel de saída dizer "INSERT — 3
 * linhas" e para saber quando `getRowsModified` fala deste comando: o SQLite
 * só o atualiza em INSERT, UPDATE e DELETE — depois de um CREATE TABLE, ele
 * ainda mostra o número do comando anterior.
 */
function verboDe(sql: string): string {
  const semComentarios = sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  return (semComentarios.trim().match(/^[A-Za-z]+/)?.[0] ?? '').toUpperCase();
}

/**
 * O `sql.js` visto pelo contrato `Banco`.
 *
 * Comando a comando, e não `db.exec`: o `exec` devolve nada para um SELECT
 * sem linhas, e aí "a consulta não devolveu nenhuma linha" e "não há SELECT"
 * ficariam iguais — e o aluno perderia as colunas de uma consulta vazia. O
 * SQLite corta o texto nos comandos por conta própria, o que respeita um
 * ponto e vírgula dentro de aspas.
 */
export function adaptarSqlJs(db: BancoSqlJs): Banco {
  return {
    rodar(sql) {
      const saidas: Saida[] = [];
      const iterador = db.iterateStatements(sql);
      // O texto de cada comando é o que o iterador consumiu entre um `next` e
      // o seguinte: é de onde sai o verbo do painel de saída.
      let restante = sql;
      for (;;) {
        const passo = iterador.next();
        if (passo.done) break;
        const comando = passo.value;
        const depois = iterador.getRemainingSQL();
        const proprio = restante.slice(0, restante.length - depois.length);
        restante = depois;

        const columns = comando.getColumnNames();
        const values: Valor[][] = [];
        let truncada = false;
        while (comando.step()) {
          if (values.length >= MAX_LINHAS) {
            truncada = true;
            continue;
          }
          values.push(
            comando.get().map((v) => (v instanceof Uint8Array ? `[blob de ${v.length} bytes]` : v))
          );
        }

        if (columns.length > 0) {
          saidas.push(truncada ? { tipo: 'tabela', columns, values, truncada } : { tipo: 'tabela', columns, values });
        } else {
          const verbo = verboDe(proprio);
          const conta = verbo === 'INSERT' || verbo === 'UPDATE' || verbo === 'DELETE' || verbo === 'REPLACE';
          saidas.push({ tipo: 'comando', comando: verbo || 'comando', linhas: conta ? db.getRowsModified() : null });
        }
      }
      return saidas;
    },
    consultar(sql, params = []) {
      const comando = db.prepare(sql);
      try {
        comando.bind(params);
        const linhas: Array<Record<string, Valor>> = [];
        while (comando.step()) {
          if (linhas.length >= MAX_LINHAS) break;
          const objeto = comando.getAsObject();
          const linha: Record<string, Valor> = {};
          for (const chave of Object.keys(objeto)) {
            const v = objeto[chave];
            linha[chave] = v instanceof Uint8Array ? `[blob de ${v.length} bytes]` : v;
          }
          linhas.push(linha);
        }
        return linhas;
      } finally {
        comando.free();
      }
    },
    executar(sql, params = []) {
      db.run(sql, params);
      const linhas = db.getRowsModified();
      const id = db.prepare('SELECT last_insert_rowid() AS id');
      try {
        id.step();
        const ultimoId = Number(id.getAsObject().id ?? 0);
        return { linhas, ultimoId };
      } finally {
        id.free();
      }
    },
    fechar() {
      db.close();
    },
  };
}

/** Como uma linha aparece numa mensagem: (Ana, 12.5, NULL). */
export function formatarLinha(linha: Valor[]): string {
  return `(${linha.map(formatarValor).join(', ')})`;
}

function formatarValor(v: Valor): string {
  if (v === null) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${v}'`;
}

/**
 * Dois valores são o mesmo valor. Números com tolerância: `AVG(preco)` e
 * `SUM(preco) / COUNT(*)` chegam ao mesmo resultado por caminhos diferentes,
 * e a última casa do ponto flutuante não pode reprovar uma consulta certa.
 */
function mesmoValor(a: Valor, b: Valor): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  }
  return a === b;
}

function mesmaLinha(a: Valor[], b: Valor[]): boolean {
  return a.length === b.length && a.every((v, i) => mesmoValor(v, b[i]));
}

/**
 * A chave de uma linha para comparar conjuntos sem olhar a ordem. Números
 * arredondados para a tolerância acompanhar `mesmoValor`.
 */
function chaveDaLinha(linha: Valor[]): string {
  return JSON.stringify(
    linha.map((v) => (typeof v === 'number' ? Number(v.toPrecision(12)) : v))
  );
}

/**
 * Compara o que veio com o que era esperado, e devolve `null` quando batem —
 * ou a frase que explica a primeira diferença.
 *
 * As frases são escolhidas na ordem em que o aluno consegue agir: primeiro
 * "não veio tabela nenhuma", depois as colunas, depois o número de linhas,
 * depois a linha que faltou ou sobrou. Um "resultado diferente" seco mandaria
 * a pessoa reler a consulta inteira sem saber por onde começar.
 */
export function compararTabelas(
  esperada: Tabela | null,
  obtida: Tabela | null,
  { ordered = false, columns = false }: { ordered?: boolean; columns?: boolean } = {}
): string | null {
  if (!esperada && !obtida) return null;
  if (esperada && !obtida) {
    return `Era esperada uma tabela com ${plural(esperada.values.length, 'linha')}, mas o seu SQL não devolveu nenhuma. Confira se há um SELECT — e se ele é o último comando.`;
  }
  if (!esperada && obtida) {
    return `Este exercício não pede uma consulta, e o seu SQL devolveu uma tabela com ${plural(obtida.values.length, 'linha')}. O que se verifica aqui é o que ficou no banco.`;
  }
  const esp = esperada!;
  const obt = obtida!;

  if (esp.columns.length !== obt.columns.length) {
    return `Eram esperadas ${plural(esp.columns.length, 'coluna')} (${esp.columns.join(', ')}), mas vieram ${obt.columns.length} (${obt.columns.join(', ') || 'nenhuma'}).`;
  }
  if (columns) {
    const diferente = esp.columns.findIndex(
      (c, i) => c.toLowerCase() !== obt.columns[i].toLowerCase()
    );
    if (diferente !== -1) {
      return `A coluna ${diferente + 1} deveria se chamar "${esp.columns[diferente]}", mas veio como "${obt.columns[diferente]}". O nome de uma coluna calculada se dá com AS.`;
    }
  }

  if (ordered) {
    const n = Math.min(esp.values.length, obt.values.length);
    for (let i = 0; i < n; i++) {
      if (mesmaLinha(esp.values[i], obt.values[i])) continue;

      // As mesmas linhas, em outra ordem: a consulta está quase certa, e a
      // frase precisa dizer que o que falta é o ORDER BY.
      if (mesmoConjunto(esp.values, obt.values)) {
        return `As linhas estão certas, mas na ordem errada: a linha ${i + 1} deveria ser ${formatarLinha(esp.values[i])}, e veio ${formatarLinha(obt.values[i])}. Confira o ORDER BY — a coluna, e se é ASC ou DESC.`;
      }
      return `A linha ${i + 1} deveria ser ${formatarLinha(esp.values[i])}, mas veio ${formatarLinha(obt.values[i])}.`;
    }
    if (esp.values.length !== obt.values.length) {
      return diferencaDeTamanho(esp, obt);
    }
    return null;
  }

  if (mesmoConjunto(esp.values, obt.values)) return null;

  const faltou = linhasQueFaltam(esp.values, obt.values);
  const sobrou = linhasQueFaltam(obt.values, esp.values);
  const partes: string[] = [];
  if (faltou) partes.push(`faltou a linha ${formatarLinha(faltou)}`);
  if (sobrou) partes.push(`sobrou a linha ${formatarLinha(sobrou)}`);

  const tamanho =
    esp.values.length !== obt.values.length
      ? `Eram esperadas ${plural(esp.values.length, 'linha')} e vieram ${obt.values.length}: `
      : `O número de linhas está certo, mas o conteúdo não: `;
  return tamanho + partes.join('; ') + '.';
}

function diferencaDeTamanho(esp: Tabela, obt: Tabela): string {
  if (esp.values.length > obt.values.length) {
    return `Eram esperadas ${plural(esp.values.length, 'linha')} e vieram ${obt.values.length}: faltou a linha ${formatarLinha(esp.values[obt.values.length])}.`;
  }
  return `Eram esperadas ${plural(esp.values.length, 'linha')} e vieram ${obt.values.length}: sobrou a linha ${formatarLinha(obt.values[esp.values.length])}.`;
}

function contagem(linhas: Valor[][]): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const linha of linhas) {
    const chave = chaveDaLinha(linha);
    mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
  }
  return mapa;
}

function mesmoConjunto(a: Valor[][], b: Valor[][]): boolean {
  if (a.length !== b.length) return false;
  const ca = contagem(a);
  const cb = contagem(b);
  for (const [chave, n] of ca) if (cb.get(chave) !== n) return false;
  return true;
}

/** A primeira linha de `de` que não aparece (vezes suficientes) em `em`. */
function linhasQueFaltam(de: Valor[][], em: Valor[][]): Valor[] | null {
  const restante = contagem(em);
  for (const linha of de) {
    const chave = chaveDaLinha(linha);
    const n = restante.get(chave) ?? 0;
    if (n === 0) return linha;
    restante.set(chave, n - 1);
  }
  return null;
}

function plural(n: number, palavra: string): string {
  return `${n} ${palavra}${n === 1 ? '' : 's'}`;
}

/** A última tabela que um SQL devolveu — o SELECT que conta. */
export function ultimaTabela(saidas: Saida[]): Tabela | null {
  for (let i = saidas.length - 1; i >= 0; i--) {
    const s = saidas[i];
    if (s.tipo === 'tabela') return { columns: s.columns, values: s.values };
  }
  return null;
}

type Desfecho = { ok: true; tabela: Tabela | null } | { ok: false; erro: string };

/**
 * Monta o banco, roda o SQL e, se houver, a consulta de verificação em cima.
 * O erro do SQL vira desfecho, não exceção; o erro do preparo do banco é do
 * exercício, e esse sobe.
 */
function rodarNoBanco(
  abrir: AbrirBanco,
  setup: string,
  sql: string,
  consulta: string | undefined
): { desfecho: Desfecho; saidas: Saida[] } {
  const banco = abrir();
  try {
    banco.rodar(setup);
    let saidas: Saida[];
    try {
      saidas = banco.rodar(sql);
    } catch (erro) {
      return { desfecho: { ok: false, erro: mensagemDe(erro) }, saidas: [] };
    }
    if (consulta === undefined) return { desfecho: { ok: true, tabela: ultimaTabela(saidas) }, saidas };
    try {
      return { desfecho: { ok: true, tabela: ultimaTabela(banco.rodar(consulta)) }, saidas };
    } catch (erro) {
      return { desfecho: { ok: false, erro: mensagemDe(erro) }, saidas };
    }
  } finally {
    banco.fechar();
  }
}

function mensagemDe(erro: unknown): string {
  return erro instanceof Error ? erro.message : String(erro);
}

/**
 * Executa o SQL do aluno e verifica cada teste contra a referência.
 *
 * Cada verificação parte de um banco novo — o do aluno e o da referência —
 * para um teste que escreve não contaminar o seguinte, e para a ordem dos
 * testes não importar. Os bancos são pequenos; recriar custa milissegundos.
 */
export function executarSql(abrir: AbrirBanco, execucao: ExecucaoSql): ResultadoSql {
  const { setup, code, solution, tests } = execucao;

  const primeira = rodarNoBanco(abrir, setup, code, undefined);
  if (!primeira.desfecho.ok) {
    return { saidas: primeira.saidas, testResults: [], error: traduzirErroSql(primeira.desfecho.erro) };
  }
  const saidas = primeira.saidas;

  const testResults: ResultadoDeVerificacao[] = tests.map((teste) => {
    const doAluno =
      teste.query === undefined ? primeira.desfecho : rodarNoBanco(abrir, setup, code, teste.query).desfecho;
    const daReferencia = rodarNoBanco(abrir, setup, solution, teste.query).desfecho;

    if (!daReferencia.ok) {
      if (!doAluno.ok) return { passed: true, message: teste.description };
      // A referência falha de propósito: o exercício é sobre uma restrição
      // que o banco precisa impor, e o aluno deixou passar.
      return {
        passed: false,
        message: `${teste.description} — o banco deveria recusar esta operação (${traduzirErroSql(daReferencia.erro)}), mas aceitou.`,
      };
    }
    if (!doAluno.ok) {
      return {
        passed: false,
        message: `${teste.description} — a verificação não pôde rodar: ${traduzirErroSql(doAluno.erro)}`,
      };
    }

    const diferenca = compararTabelas(daReferencia.tabela, doAluno.tabela, {
      ordered: teste.ordered,
      columns: teste.columns,
    });
    return diferenca === null
      ? { passed: true, message: teste.description }
      : { passed: false, message: `${teste.description} — ${diferenca}` };
  });

  return { saidas, testResults };
}
