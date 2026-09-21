import { beforeAll, describe, expect, it } from 'vitest';

import {
  compararTabelas,
  executarSql,
  formatarLinha,
  retratoDasTabelas,
  traduzirErroSql,
  type AbrirBanco,
  type Saida,
} from './sql-core';
import { abrirBancoNoNode } from './sql-node';

/**
 * O motor de SQL, com o SQLite de verdade.
 *
 * O que está sob teste é o julgamento — as linhas certas passam, as erradas
 * reprovam com a frase certa — e o adaptador do `sql.js`, que corta o SQL em
 * comandos e devolve as colunas até de um SELECT vazio.
 */

const SETUP = `
CREATE TABLE produtos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, preco REAL NOT NULL, categoria TEXT);
INSERT INTO produtos (id, nome, preco, categoria) VALUES
  (1, 'Caderno', 12.5, 'papelaria'),
  (2, 'Caneta', 2.3, 'papelaria'),
  (3, 'Mouse', 65, 'eletrônicos'),
  (4, 'Fone', 89, 'eletrônicos');
`;

let abrir: AbrirBanco;

beforeAll(async () => {
  abrir = await abrirBancoNoNode();
});

describe('o adaptador do sql.js', () => {
  it('devolve cada comando na ordem: tabelas com colunas, comandos com as linhas mexidas', () => {
    const banco = abrir();
    const saidas = banco.rodar(`${SETUP}
      SELECT nome, preco FROM produtos WHERE preco > 50 ORDER BY preco;
      UPDATE produtos SET preco = 3 WHERE categoria = 'papelaria';
      -- um comentário antes do comando
      DELETE FROM produtos WHERE id = 4;
      SELECT nome FROM produtos WHERE preco > 1000;`);
    banco.fechar();

    // CREATE, INSERT, SELECT, UPDATE, DELETE, SELECT.
    expect(saidas.map((s) => s.tipo)).toEqual(['comando', 'comando', 'tabela', 'comando', 'comando', 'tabela']);
    expect(saidas[0]).toEqual({ tipo: 'comando', comando: 'CREATE', linhas: null });
    expect(saidas[1]).toEqual({ tipo: 'comando', comando: 'INSERT', linhas: 4 });
    expect(saidas[2]).toEqual({
      tipo: 'tabela',
      columns: ['nome', 'preco'],
      values: [
        ['Mouse', 65],
        ['Fone', 89],
      ],
    });
    expect(saidas[3]).toEqual({ tipo: 'comando', comando: 'UPDATE', linhas: 2 });
    expect(saidas[4]).toEqual({ tipo: 'comando', comando: 'DELETE', linhas: 1 });
    // Um SELECT sem linhas ainda tem colunas: é o que distingue "vazio" de "sem SELECT".
    expect(saidas[5]).toEqual({ tipo: 'tabela', columns: ['nome'], values: [] });
  });

  it('respeita ponto e vírgula dentro de aspas', () => {
    const banco = abrir();
    const saidas = banco.rodar(`SELECT 'a;b' AS texto; SELECT 2 AS n`);
    banco.fechar();
    expect(saidas).toEqual([
      { tipo: 'tabela', columns: ['texto'], values: [['a;b']] },
      { tipo: 'tabela', columns: ['n'], values: [[2]] },
    ]);
  });

  it('lança no comando que falha, com a mensagem do SQLite', () => {
    const banco = abrir();
    expect(() => banco.rodar(`${SETUP} SELECT nomee FROM produtos`)).toThrow('no such column: nomee');
    banco.fechar();
  });
});

describe('o banco visto por um programa: consultar e executar com parâmetros', () => {
  it('consultar devolve objetos por coluna, e os parâmetros entram no lugar dos ?', () => {
    const banco = abrir();
    banco.rodar(SETUP);
    const caros = banco.consultar('SELECT nome, preco FROM produtos WHERE preco > ? ORDER BY preco', [10]);
    expect(caros).toEqual([
      { nome: 'Caderno', preco: 12.5 },
      { nome: 'Mouse', preco: 65 },
      { nome: 'Fone', preco: 89 },
    ]);
    // O parâmetro é valor, nunca SQL: um texto com aspas não vira injeção.
    expect(banco.consultar('SELECT id FROM produtos WHERE nome = ?', ["' OR 1=1 --"])).toEqual([]);
    banco.fechar();
  });

  it('executar diz quantas linhas mexeu e o id do último INSERT', () => {
    const banco = abrir();
    banco.rodar(SETUP);
    const inserido = banco.executar('INSERT INTO produtos (nome, preco) VALUES (?, ?)', ['Régua', 4]);
    expect(inserido).toEqual({ linhas: 1, ultimoId: 5 });
    const alterados = banco.executar('UPDATE produtos SET preco = preco * 2 WHERE categoria = ?', ['papelaria']);
    expect(alterados.linhas).toBe(2);
    banco.fechar();
  });

  it('o retrato das tabelas traz cada uma com as linhas de agora', () => {
    const banco = abrir();
    banco.rodar(SETUP + "CREATE TABLE vazia (id INTEGER PRIMARY KEY, x TEXT);");
    const retrato = retratoDasTabelas(banco, 2);
    expect(retrato.map((t) => t.nome)).toEqual(['produtos', 'vazia']);
    expect(retrato[0].columns).toEqual(['id', 'nome', 'preco', 'categoria']);
    expect(retrato[0].values).toHaveLength(2);
    expect(retrato[1]).toEqual({ nome: 'vazia', columns: ['id', 'x'], values: [] });
    banco.fechar();
  });
});

describe('traduzirErroSql', () => {
  it.each([
    ['near "SELEC": syntax error', /sintaxe perto de "SELEC"/],
    ['no such table: produto', /tabela "produto" não existe/],
    ['no such column: preco2', /coluna "preco2" não existe/],
    ['ambiguous column name: nome', /mais de uma tabela/],
    ['incomplete input', /terminou no meio/],
    ['unrecognized token: "\'abc"', /aspas simples/],
    ['NOT NULL constraint failed: produtos.nome', /"nome" da tabela "produtos" não aceita valor vazio/],
    ['UNIQUE constraint failed: produtos.id', /não aceita repetição/],
    ['FOREIGN KEY constraint failed', /chave estrangeira/],
    ['table produtos already exists', /"produtos" já existe/],
    ['HAVING clause on a non-aggregate query', /HAVING só faz sentido/],
    ['misuse of aggregate: COUNT()', /não pode ficar dentro do WHERE/],
    ['no such function: LEN', /"LEN" não existe/],
  ])('%s → uma frase em português', (original, esperado) => {
    expect(traduzirErroSql(original)).toMatch(esperado);
  });

  it('sem tradução, mantém o original entre parênteses para dar para pesquisar', () => {
    expect(traduzirErroSql('database is locked')).toBe('O banco recusou o comando (database is locked).');
  });
});

describe('compararTabelas', () => {
  const tabela = (columns: string[], values: Array<Array<number | string | null>>) => ({ columns, values });

  it('as mesmas linhas em outra ordem passam quando a ordem não importa', () => {
    const esperada = tabela(['nome'], [['a'], ['b'], ['c']]);
    const obtida = tabela(['nome'], [['c'], ['a'], ['b']]);
    expect(compararTabelas(esperada, obtida)).toBeNull();
    expect(compararTabelas(esperada, obtida, { ordered: true })).toMatch(
      /na ordem errada: a linha 1 deveria ser \('a'\), e veio \('c'\)/
    );
  });

  it('linhas repetidas contam: dois iguais não são um', () => {
    const esperada = tabela(['n'], [[1], [1], [2]]);
    expect(compararTabelas(esperada, tabela(['n'], [[1], [2], [2]]))).toMatch(/faltou a linha \(1\); sobrou a linha \(2\)/);
  });

  it('nomeia a coluna que falta e a que sobra', () => {
    expect(compararTabelas(tabela(['nome', 'preco'], [['a', 1]]), tabela(['nome'], [['a']]))).toBe(
      'Eram esperadas 2 colunas (nome, preco), mas vieram 1 (nome).'
    );
  });

  it('nomes de coluna só contam quando o exercício pede', () => {
    const esperada = tabela(['total'], [[3]]);
    const obtida = tabela(['COUNT(*)'], [[3]]);
    expect(compararTabelas(esperada, obtida)).toBeNull();
    expect(compararTabelas(esperada, obtida, { columns: true })).toMatch(/deveria se chamar "total"/);
    // Sem diferenciar maiúsculas: TOTAL e total são a mesma coluna no SQLite.
    expect(compararTabelas(esperada, tabela(['TOTAL'], [[3]]), { columns: true })).toBeNull();
  });

  it('diz quantas linhas faltam e qual foi a primeira', () => {
    const esperada = tabela(['nome'], [['a'], ['b'], ['c']]);
    expect(compararTabelas(esperada, tabela(['nome'], [['a']]))).toBe(
      'Eram esperadas 3 linhas e vieram 1: faltou a linha (\'b\').'
    );
    expect(compararTabelas(esperada, tabela(['nome'], [['a'], ['b'], ['c'], ['d']]))).toBe(
      "Eram esperadas 3 linhas e vieram 4: sobrou a linha ('d')."
    );
  });

  it('com a ordem importando, aponta a primeira linha diferente', () => {
    const esperada = tabela(['n'], [[1], [2], [3]]);
    expect(compararTabelas(esperada, tabela(['n'], [[1], [9], [3]]), { ordered: true })).toBe(
      'A linha 2 deveria ser (2), mas veio (9).'
    );
    expect(compararTabelas(esperada, tabela(['n'], [[1], [2]]), { ordered: true })).toBe(
      'Eram esperadas 3 linhas e vieram 2: faltou a linha (3).'
    );
  });

  it('números com diferença de ponto flutuante são o mesmo número', () => {
    expect(compararTabelas(tabela(['m'], [[33.333333333333336]]), tabela(['m'], [[33.33333333333333]]))).toBeNull();
    expect(compararTabelas(tabela(['m'], [[33.33]]), tabela(['m'], [[33.34]]))).not.toBeNull();
  });

  it('sem tabela de um dos lados, explica o que era esperado', () => {
    expect(compararTabelas(tabela(['n'], [[1], [2]]), null)).toMatch(/tabela com 2 linhas, mas o seu SQL não devolveu nenhuma/);
    expect(compararTabelas(null, tabela(['n'], [[1]]))).toMatch(/não pede uma consulta/);
    expect(compararTabelas(null, null)).toBeNull();
  });

  it('formata NULL, texto e número como o aluno os escreveria', () => {
    expect(formatarLinha(['Ana', 12.5, null])).toBe("('Ana', 12.5, NULL)");
  });
});

describe('executarSql', () => {
  const consulta = (code: string, solution: string, teste: Partial<{ ordered: boolean; columns: boolean; query: string }> = {}) =>
    executarSql(abrir, {
      setup: SETUP,
      code,
      solution,
      tests: [{ description: 'devolve o esperado', ...teste }],
    });

  it('uma consulta que devolve as linhas certas passa, escrita de qualquer jeito', () => {
    const r = consulta('select preco, nome from produtos where 50 < preco', 'SELECT preco, nome FROM produtos WHERE preco > 50');
    expect(r.error).toBeUndefined();
    expect(r.testResults).toEqual([{ passed: true, message: 'devolve o esperado' }]);
    expect(r.saidas).toEqual<Saida[]>([
      { tipo: 'tabela', columns: ['preco', 'nome'], values: [[65, 'Mouse'], [89, 'Fone']] },
    ]);
  });

  it('a consulta errada reprova com a linha que faltou', () => {
    const r = consulta('SELECT nome FROM produtos WHERE preco > 70', 'SELECT nome FROM produtos WHERE preco > 50');
    expect(r.testResults[0].passed).toBe(false);
    expect(r.testResults[0].message).toBe(
      "devolve o esperado — Eram esperadas 2 linhas e vieram 1: faltou a linha ('Mouse')."
    );
  });

  it('erro de SQL vira a frase traduzida, e nada é verificado', () => {
    const r = consulta('SELECT nome FROM produto', 'SELECT nome FROM produtos');
    expect(r.error).toMatch(/A tabela "produto" não existe/);
    expect(r.testResults).toEqual([]);
    expect(r.saidas).toEqual([]);
  });

  it('um teste com consulta própria olha o que ficou no banco', () => {
    const teste = { query: 'SELECT nome, preco FROM produtos ORDER BY id' };
    const certo = consulta(
      "INSERT INTO produtos (nome, preco) VALUES ('Lápis', 1.8)",
      "INSERT INTO produtos (id, nome, preco, categoria) VALUES (5, 'Lápis', 1.80, NULL)",
      teste
    );
    expect(certo.testResults[0].passed).toBe(true);
    expect(certo.saidas).toEqual([{ tipo: 'comando', comando: 'INSERT', linhas: 1 }]);

    const errado = consulta("INSERT INTO produtos (nome, preco) VALUES ('Lápis', 18)", "INSERT INTO produtos (nome, preco) VALUES ('Lápis', 1.8)", teste);
    expect(errado.testResults[0].message).toMatch(/faltou a linha \('Lápis', 1.8\); sobrou a linha \('Lápis', 18\)/);
  });

  it('quando a referência é recusada pelo banco, o aluno precisa ser recusado também', () => {
    // A restrição é o que está sendo ensinado: a referência tem NOT NULL, e o
    // teste tenta violá-la.
    const setup = '';
    const teste = { description: 'recusa nome vazio', query: "INSERT INTO alunos (nome) VALUES (NULL)" };
    const comRegra = executarSql(abrir, {
      setup,
      code: 'CREATE TABLE alunos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL)',
      solution: 'CREATE TABLE alunos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL)',
      tests: [teste],
    });
    expect(comRegra.testResults[0]).toEqual({ passed: true, message: 'recusa nome vazio' });

    const semRegra = executarSql(abrir, {
      setup,
      code: 'CREATE TABLE alunos (id INTEGER PRIMARY KEY, nome TEXT)',
      solution: 'CREATE TABLE alunos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL)',
      tests: [teste],
    });
    expect(semRegra.testResults[0].passed).toBe(false);
    expect(semRegra.testResults[0].message).toMatch(/deveria recusar esta operação .*não aceita valor vazio.*mas aceitou/);
  });

  it('a verificação que não roda no banco do aluno diz por quê', () => {
    const r = executarSql(abrir, {
      setup: '',
      code: 'CREATE TABLE aluno (id INTEGER)',
      solution: 'CREATE TABLE alunos (id INTEGER)',
      tests: [{ description: 'a tabela alunos existe', query: 'SELECT COUNT(*) FROM alunos' }],
    });
    expect(r.testResults[0].message).toMatch(/não pôde rodar: A tabela "alunos" não existe/);
  });

  it('cada verificação parte de um banco novo: a ordem dos testes não importa', () => {
    const r = executarSql(abrir, {
      setup: SETUP,
      code: 'DELETE FROM produtos WHERE id = 1',
      solution: 'DELETE FROM produtos WHERE id = 1',
      tests: [
        { description: 'apaga de novo', query: 'DELETE FROM produtos WHERE preco > 1; SELECT COUNT(*) FROM produtos' },
        { description: 'só o caderno saiu', query: 'SELECT COUNT(*) FROM produtos' },
      ],
    });
    expect(r.testResults.map((t) => t.passed)).toEqual([true, true]);
  });

  it('o último SELECT é o que conta', () => {
    const r = consulta('SELECT 1; SELECT nome FROM produtos WHERE id = 1', 'SELECT nome FROM produtos WHERE id = 1');
    expect(r.testResults[0].passed).toBe(true);
    expect(r.saidas).toHaveLength(2);
  });
});
