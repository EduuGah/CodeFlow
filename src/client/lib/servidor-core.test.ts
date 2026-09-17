import { describe, expect, it } from 'vitest';

import { runProgram } from './sandbox-core';
import { montarCodigoDoServidor, type Troca } from './servidor-core';

/**
 * O servidor simulado, rodando no mesmo sandbox dos outros exercícios — em
 * Node, aqui, como o CI o roda para provar que cada exercício é resolvível.
 * O que se prova: o código que o aluno escreve é o de um Express de
 * verdade, e o que o Express de verdade faria é o que acontece.
 */
async function rodar(codigo: string, asserts: string[], opcoes = {}) {
  const tests = asserts.map((assertion, i) => ({ description: `t${i + 1}`, assertion }));
  return runProgram(montarCodigoDoServidor(codigo, opcoes), tests, [], { sequencial: true });
}

const SERVIDOR = `
const express = require('express');
const app = express();
app.use(express.json());

const tarefas = [{ id: 1, titulo: 'Estudar', feita: false }];

app.get('/tarefas', (req, res) => {
  const so = req.query.feita;
  const lista = so === undefined ? tarefas : tarefas.filter((t) => String(t.feita) === so);
  res.json(lista);
});

app.get('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.json(tarefa);
});

app.post('/tarefas', (req, res) => {
  if (!req.body || typeof req.body.titulo !== 'string' || !req.body.titulo.trim()) {
    return res.status(400).json({ erro: 'titulo é obrigatório' });
  }
  const nova = { id: tarefas.length + 1, titulo: req.body.titulo, feita: false };
  tarefas.push(nova);
  res.status(201).json(nova);
});

app.listen(3000, () => console.log('ouvindo na porta 3000'));
`;

describe('o Express pequeno', () => {
  it('responde GET com JSON, e o teste lê o corpo já convertido', async () => {
    const r = await rodar(SERVIDOR, [
      `const res = await pedir(app, 'GET', '/tarefas');
       if (res.status !== 200) throw new Error('status ' + res.status);
       if (res.body.length !== 1 || res.body[0].titulo !== 'Estudar') throw new Error('corpo: ' + res.texto);`,
    ]);
    expect(r.error).toBeUndefined();
    expect(r.testResults).toEqual([{ passed: true, message: 't1' }]);
    expect(r.logs).toEqual(['ouvindo na porta 3000']);
  });

  it('parâmetros de rota e de consulta chegam em req.params e req.query', async () => {
    const r = await rodar(SERVIDOR, [
      `const res = await pedir(app, 'GET', '/tarefas/1');
       if (res.body.id !== 1) throw new Error('params: ' + res.texto);`,
      `const res = await pedir(app, 'GET', '/tarefas?feita=false');
       if (res.body.length !== 1) throw new Error('query: ' + res.texto);
       const vazio = await pedir(app, 'GET', '/tarefas?feita=true');
       if (vazio.body.length !== 0) throw new Error('query true: ' + vazio.texto);`,
    ]);
    expect(r.testResults.map((t) => t.passed)).toEqual([true, true]);
  });

  it('o POST com JSON cria, e os testes em série veem o estado um do outro', async () => {
    const r = await rodar(SERVIDOR, [
      `const res = await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Praticar' } });
       if (res.status !== 201) throw new Error('status ' + res.status + ' ' + res.texto);
       if (res.body.id !== 2) throw new Error('id: ' + res.texto);`,
      `const res = await pedir(app, 'GET', '/tarefas');
       if (res.body.length !== 2) throw new Error('não persistiu: ' + res.texto);`,
      `const res = await pedir(app, 'POST', '/tarefas', { body: { titulo: '' } });
       if (res.status !== 400) throw new Error('validação: ' + res.status);`,
    ]);
    expect(r.testResults.map((t) => t.passed)).toEqual([true, true, true]);
  });

  it('rota inexistente é 404, e as trocas ficam registradas na ordem', async () => {
    const r = await rodar(SERVIDOR, [
      `const res = await pedir(app, 'DELETE', '/nada');
       if (res.status !== 404) throw new Error('status ' + res.status);`,
    ]);
    expect(r.testResults[0].passed).toBe(true);
    const trocas = r.trocas as Troca[];
    expect(trocas).toHaveLength(1);
    expect(trocas[0]).toMatchObject({ metodo: 'DELETE', caminho: '/nada', status: 404 });
    expect(trocas[0].resposta).toContain('Rota não encontrada');
  });

  it('sem express.json() o corpo não é lido — como no Express de verdade', async () => {
    const semJson = `
      const express = require('express');
      const app = express();
      app.post('/eco', (req, res) => res.json({ corpo: req.body === undefined ? 'indefinido' : req.body }));
    `;
    const r = await rodar(semJson, [
      `const res = await pedir(app, 'POST', '/eco', { body: { a: 1 } });
       if (res.body.corpo !== 'indefinido') throw new Error(res.texto);`,
    ]);
    expect(r.testResults[0].passed).toBe(true);
  });

  it('middleware com next, na ordem, e prefixo em app.use', async () => {
    const codigo = `
      const express = require('express');
      const app = express();
      const visto = [];
      app.use((req, res, next) => { visto.push('log ' + req.method + ' ' + req.path); next(); });
      app.use('/admin', (req, res, next) => {
        if (req.headers.authorization !== 'Bearer segredo') return res.status(401).json({ erro: 'sem token' });
        next();
      });
      app.get('/admin/painel', (req, res) => res.json({ ok: true, visto }));
      app.get('/aberto', (req, res) => res.send('oi'));
    `;
    const r = await rodar(codigo, [
      `const res = await pedir(app, 'GET', '/admin/painel');
       if (res.status !== 401) throw new Error('sem token deveria ser 401, veio ' + res.status);`,
      `const res = await pedir(app, 'GET', '/admin/painel', { headers: { Authorization: 'Bearer segredo' } });
       if (!res.body.ok) throw new Error(res.texto);
       if (res.body.visto.length !== 2) throw new Error('log: ' + JSON.stringify(res.body.visto));`,
      `const res = await pedir(app, 'GET', '/aberto');
       if (res.texto !== 'oi' || res.headers['content-type'] !== 'text/plain') throw new Error(res.texto);`,
    ]);
    expect(r.testResults.map((t) => t.passed)).toEqual([true, true, true]);
  });

  it('erro na rota vira 500 com a mensagem, ou passa pelo middleware de erro', async () => {
    const codigo = `
      const express = require('express');
      const app = express();
      app.get('/quebra', (req, res) => { throw new Error('deu ruim'); });
      app.get('/async', async (req, res) => { await Promise.resolve(); throw new Error('async ruim'); });
      app.get('/tratado', (req, res, next) => next(new Error('tratado')));
      app.use((erro, req, res, next) => {
        if (erro.message === 'tratado') return res.status(422).json({ erro: 'eu tratei: ' + erro.message });
        next(erro);
      });
    `;
    const r = await rodar(codigo, [
      `const res = await pedir(app, 'GET', '/quebra');
       if (res.status !== 500 || res.body.erro !== 'deu ruim') throw new Error(res.status + ' ' + res.texto);`,
      `const res = await pedir(app, 'GET', '/async');
       if (res.status !== 500 || res.body.erro !== 'async ruim') throw new Error(res.status + ' ' + res.texto);`,
      `const res = await pedir(app, 'GET', '/tratado');
       if (res.status !== 422) throw new Error(res.status + ' ' + res.texto);`,
    ]);
    expect(r.testResults.map((t) => t.passed)).toEqual([true, true, true]);
  });

  it('uma rota que não responde nem chama next é apontada, não fica pendurada', async () => {
    const codigo = `
      const express = require('express');
      const app = express();
      app.get('/mudo', (req, res) => { const x = 1; });
    `;
    const r = await rodar(codigo, [`await pedir(app, 'GET', '/mudo');`]);
    expect(r.testResults[0].passed).toBe(false);
    expect(r.testResults[0].message).toContain('não respondeu nem chamou next()');
  });

  it('process.env vem do exercício, e require de arquivo do exercício funciona', async () => {
    const codigo = `
      const { somar } = require('./calculo');
      const express = require('express');
      const app = express();
      app.get('/soma', (req, res) => res.json({ total: somar(2, 3), ambiente: process.env.AMBIENTE }));
    `;
    const r = await rodar(
      codigo,
      [
        `const res = await pedir(app, 'GET', '/soma');
         if (res.body.total !== 5 || res.body.ambiente !== 'teste') throw new Error(res.texto);`,
      ],
      { env: { AMBIENTE: 'teste' }, arquivos: { './calculo': 'module.exports = { somar: (a, b) => a + b };' } }
    );
    expect(r.error).toBeUndefined();
    expect(r.testResults[0].passed).toBe(true);
  });

  it('require de módulo que não existe explica o que existe', async () => {
    const r = await rodar(`const fs = require('fs');`, []);
    expect(r.error).toContain("Cannot find module 'fs'");
    expect(r.error).toContain('express');
  });
});
