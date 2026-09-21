import { describe, expect, it } from 'vitest';

import { rodarPaginaNoJsdom } from './pagina-jsdom';
import { runProgram } from './sandbox-core';
import { montarCodigoDoServidor, subirServidor } from './servidor-core';
import { abrirBancoNoNode } from './sql-node';

/**
 * A ponte do motor 7: a página faz `fetch`, o pedido chega ao servidor vivo,
 * a resposta volta e a página desenha. Aqui, no jsdom e no Node — o mesmo
 * caminho que o CI usa para provar os exercícios do projeto final; o
 * Chromium só troca o transporte (postMessage entre iframe e pai, e o
 * worker).
 */
const SERVIDOR = `
const express = require('express');
const banco = require('./banco');
const app = express();
app.use(express.json());

app.get('/tarefas', async (req, res) => {
  if (req.headers.authorization !== 'Bearer token-da-ana') return res.status(401).json({ erro: 'Não autenticado' });
  const linhas = await banco.consultar('SELECT * FROM tarefas ORDER BY id');
  res.json(linhas.map((t) => ({ id: t.id, titulo: t.titulo, feita: t.feita === 1 })));
});

app.post('/tarefas', async (req, res) => {
  const { ultimoId } = await banco.executar('INSERT INTO tarefas (titulo) VALUES (?)', [req.body.titulo]);
  res.status(201).json({ id: ultimoId, titulo: req.body.titulo, feita: false });
});

app.listen(3000, () => console.log('no ar'));
`;

const PAGINA = `
<ul id="lista"></ul>
<p id="estado">carregando</p>
<script>
  async function carregar() {
    const resposta = await fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } });
    if (!resposta.ok) { document.getElementById('estado').textContent = 'erro ' + resposta.status; return; }
    const tarefas = await resposta.json();
    for (const t of tarefas) {
      const li = document.createElement('li');
      li.textContent = t.titulo + (t.feita ? ' (feita)' : '');
      document.getElementById('lista').appendChild(li);
    }
    document.getElementById('estado').textContent = tarefas.length + ' tarefas';
  }
  carregar();
</script>
`;

describe('a página fala com o servidor vivo', () => {
  it('o fetch da página chega ao servidor com banco, e a resposta desenha a lista', async () => {
    const abrir = await abrirBancoNoNode();
    const banco = abrir();
    banco.rodar("CREATE TABLE tarefas (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, feita INTEGER NOT NULL DEFAULT 0); INSERT INTO tarefas (titulo, feita) VALUES ('Estudar', 0), ('Revisar', 1);");
    const servidor = await subirServidor(montarCodigoDoServidor(SERVIDOR), (programa) =>
      runProgram(programa, [], [], { sequencial: true, globais: { __cfBancoNativo: banco } })
    );
    expect(servidor.error).toBeUndefined();
    expect(servidor.logs).toEqual(['no ar']);

    const tests = [
      {
        description: 'a lista tem as duas tarefas, e a feita está marcada',
        assertion: `
          for (let i = 0; i < 100 && document.querySelectorAll('#lista li').length < 2; i++) await new Promise((r) => setTimeout(r, 20));
          const itens = [...document.querySelectorAll('#lista li')].map((li) => li.textContent);
          if (JSON.stringify(itens) !== JSON.stringify(['Estudar', 'Revisar (feita)'])) throw new Error('itens: ' + JSON.stringify(itens));
          if (document.getElementById('estado').textContent !== '2 tarefas') throw new Error(document.getElementById('estado').textContent);`,
      },
      {
        description: 'um POST pela página cria no banco',
        assertion: `
          const r = await fetch('/tarefas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo: 'Publicar' }) });
          if (r.status !== 201) throw new Error('status ' + r.status);
          const criada = await r.json();
          if (criada.id !== 3) throw new Error(JSON.stringify(criada));`,
      },
    ];
    const resultado = await rodarPaginaNoJsdom(PAGINA, tests, 8000, { servidor });
    expect(resultado.error).toBeUndefined();
    expect(resultado.testResults.map((t) => [t.passed, t.message])).toEqual([
      [true, 'a lista tem as duas tarefas, e a feita está marcada'],
      [true, 'um POST pela página cria no banco'],
    ]);
    expect(banco.consultar('SELECT COUNT(*) AS n FROM tarefas')).toEqual([{ n: 3 }]);
    expect(servidor.trocas().map((t) => `${t.metodo} ${t.caminho} ${t.status}`)).toEqual(['GET /tarefas 200', 'POST /tarefas 201']);
    banco.fechar();
  });

  it('sem app criado, o servidor avisa — e a página recebe 503 em vez de esperar', async () => {
    const servidor = await subirServidor(montarCodigoDoServidor(`console.log('nada de express aqui');`), (programa) =>
      runProgram(programa, [], [], { sequencial: true })
    );
    expect(servidor.error).toContain('não criou nenhuma aplicação');
    const resposta = await servidor.pedir({ metodo: 'GET', url: '/x' });
    expect(resposta.status).toBe(503);
  });
});
