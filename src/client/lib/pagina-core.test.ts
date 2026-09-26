import { describe, expect, it } from 'vitest';

import { interpretarMensagem, montarDocumento, TIPO_DA_MENSAGEM } from './pagina-core';
import { rodarPaginaNoJsdom } from './pagina-jsdom';
import { LIMITE_DO_LACO_MS, MENSAGEM_DO_LACO, NOME_DO_ERRO_DO_LACO } from './protecao-de-laco';

/**
 * O motor de página, rodando de verdade — no jsdom, com o mesmo documento que
 * o navegador do aluno recebe. Cada teste aqui é um contrato que os exercícios
 * de HTML, CSS e DOM vão assumir.
 */
describe('o documento', () => {
  it('tem a CSP, a captura antes do aluno, e os testes depois', () => {
    const doc = montarDocumento('<h1>Oi</h1>', []);

    const csp = doc.indexOf('Content-Security-Policy');
    const captura = doc.indexOf('__codeflow');
    const aluno = doc.indexOf('<h1>Oi</h1>');
    const testes = doc.indexOf('new Function(');

    expect(csp).toBeGreaterThan(-1);
    // A ordem é o que garante que um erro na primeira linha do aluno já é
    // capturado, e que os testes veem a página pronta.
    expect(captura).toBeLessThan(aluno);
    expect(aluno).toBeLessThan(testes);
  });

  it('um </script> dentro de um teste não encerra o script dos testes', () => {
    const doc = montarDocumento('', [
      { description: 'x', assertion: `const s = '</script>'; if (!s) throw new Error('x');` },
    ]);
    // Se sobrasse um `</script>` literal dentro do corredor, o HTML terminaria
    // o script ali e o resto viraria texto na página.
    const corredor = doc.slice(doc.lastIndexOf('<script>'));
    expect(corredor.indexOf('</script>')).toBe(corredor.lastIndexOf('</script>'));
  });
});

describe('interpretar a mensagem', () => {
  it('recusa o que não é do motor', () => {
    expect(interpretarMensagem(null)).toBeNull();
    expect(interpretarMensagem('oi')).toBeNull();
    expect(interpretarMensagem({ tipo: 'outra' })).toBeNull();
    expect(interpretarMensagem({ tipo: TIPO_DA_MENSAGEM })).toBeNull();
  });

  it('normaliza os campos, sem confiar na forma que veio', () => {
    const r = interpretarMensagem({
      tipo: TIPO_DA_MENSAGEM,
      logs: [1, 'a'],
      testResults: [{ passed: 1, message: 2 }],
      error: 42,
    });
    expect(r).toEqual({
      tipo: TIPO_DA_MENSAGEM,
      logs: ['1', 'a'],
      testResults: [{ passed: true, message: '2' }],
      error: undefined,
    });
  });
});

describe('rodando no jsdom', () => {
  it('os testes enxergam o DOM que o aluno escreveu', async () => {
    const r = await rodarPaginaNoJsdom('<h1 id="titulo">Olá, mundo</h1>', [
      {
        description: 'há um h1 com a saudação',
        assertion: `const h = document.querySelector('h1'); if (!h || h.textContent.trim() !== 'Olá, mundo') throw new Error('faltou o h1');`,
      },
    ]);

    expect(r.error).toBeUndefined();
    expect(r.testResults).toEqual([{ passed: true, message: 'há um h1 com a saudação' }]);
  });

  it('um teste que falha vem com a mensagem escrita para o aluno', async () => {
    const r = await rodarPaginaNoJsdom('<p>sem título</p>', [
      {
        description: 'há um h1',
        assertion: `if (!document.querySelector('h1')) throw new Error('A página precisa de um <h1>.');`,
      },
    ]);

    expect(r.testResults).toEqual([{ passed: false, message: 'A página precisa de um <h1>.' }]);
  });

  it('os testes enxergam o que o script do aluno declarou, inclusive const', async () => {
    const r = await rodarPaginaNoJsdom(
      `<script>const saudacao = 'oi'; function dobro(n) { return n * 2; }</script>`,
      [
        {
          description: 'dobro existe e funciona',
          assertion: `if (dobro(4) !== 8) throw new Error('dobro(4) devia ser 8'); if (saudacao !== 'oi') throw new Error('const invisível');`,
        },
      ]
    );

    expect(r.testResults[0].passed).toBe(true);
  });

  it('o console do aluno chega em ordem', async () => {
    const r = await rodarPaginaNoJsdom(
      `<script>console.log('a', 1); console.log({ x: 2 }); console.warn('cuidado');</script>`,
      []
    );

    expect(r.logs).toEqual(['a 1', '{"x":2}', 'cuidado']);
  });

  it('um erro no script do aluno vira mensagem, e os testes ainda rodam', async () => {
    const r = await rodarPaginaNoJsdom(`<h1>x</h1><script>naoExiste();</script>`, [
      { description: 'o h1 está lá', assertion: `if (!document.querySelector('h1')) throw new Error('sem h1');` },
    ]);

    expect(r.error).toMatch(/naoExiste/);
    // O DOM antes do erro existe; o teste sobre ele passa. É o que o aluno
    // vê no navegador também: a página, com o erro no console.
    expect(r.testResults[0].passed).toBe(true);
  });

  it('um evento disparado pelo teste roda o manipulador do aluno', async () => {
    const r = await rodarPaginaNoJsdom(
      `<button id="b">0</button>
       <script>
         const b = document.getElementById('b');
         b.addEventListener('click', () => { b.textContent = String(Number(b.textContent) + 1); });
       </script>`,
      [
        {
          description: 'clicar duas vezes conta 2',
          assertion: `const b = document.getElementById('b'); b.click(); b.click(); if (b.textContent !== '2') throw new Error('esperava 2, veio ' + b.textContent);`,
        },
      ]
    );

    expect(r.testResults[0].passed).toBe(true);
  });

  it('atributos de <html> e <body> escritos pelo aluno são mesclados', async () => {
    const r = await rodarPaginaNoJsdom(
      `<!doctype html><html lang="en"><head><title>Minha página</title></head><body class="escuro"><p>x</p></body></html>`,
      [
        {
          description: 'lang, title e class chegam ao documento',
          assertion: `if (document.documentElement.lang !== 'en') throw new Error('lang: ' + document.documentElement.lang); if (document.title !== 'Minha página') throw new Error('title: ' + document.title); if (!document.body.classList.contains('escuro')) throw new Error('class do body');`,
        },
      ]
    );

    expect(r.testResults[0].passed).toBe(true);
  });

  it('código que espera o DOMContentLoaded ainda roda antes dos testes', async () => {
    const r = await rodarPaginaNoJsdom(
      `<p id="p"></p><script>document.addEventListener('DOMContentLoaded', () => { document.getElementById('p').textContent = 'pronto'; });</script>`,
      [
        {
          description: 'o texto foi preenchido',
          assertion: `if (document.getElementById('p').textContent !== 'pronto') throw new Error('vazio');`,
        },
      ]
    );

    expect(r.testResults[0].passed).toBe(true);
  });
});

describe('o que a página do aluno recebe no lugar do que a origem opaca não tem', () => {
  it('localStorage funciona durante a execução, com a API de verdade', async () => {
    const r = await rodarPaginaNoJsdom(
      `<script>
         localStorage.setItem('tema', 'escuro');
         localStorage.setItem('lista', JSON.stringify([1, 2]));
         document.title = localStorage.getItem('tema') + ':' + localStorage.length;
         localStorage.removeItem('tema');
       </script>`,
      [
        {
          description: 'guardou, leu e removeu',
          assertion: `if (document.title !== 'escuro:2') throw new Error('title: ' + document.title); if (localStorage.getItem('tema') !== null) throw new Error('não removeu'); if (JSON.parse(localStorage.getItem('lista'))[1] !== 2) throw new Error('lista');`,
        },
      ]
    );
    expect(r.error).toBeUndefined();
    expect(r.testResults[0]).toEqual({ passed: true, message: 'guardou, leu e removeu' });
  });

  it('fetch responde com o que a página declarou em __servidor, e 404 para o resto', async () => {
    const r = await rodarPaginaNoJsdom(
      `<script>
         window.__servidor = { '/api/produtos': [{ nome: 'pão', preco: 8 }] };
         async function carregar() {
           const resposta = await fetch('/api/produtos');
           const produtos = await resposta.json();
           document.body.dataset.nome = produtos[0].nome;
           const outra = await fetch('https://exemplo.com/api/nada');
           document.body.dataset.status = String(outra.status) + ':' + outra.ok;
         }
         window.pronto = carregar();
       </script>`,
      [
        {
          description: 'a busca chegou, e o caminho inexistente deu 404',
          assertion: `await window.pronto; if (document.body.dataset.nome !== 'pão') throw new Error('nome: ' + document.body.dataset.nome); if (document.body.dataset.status !== '404:false') throw new Error('status: ' + document.body.dataset.status);`,
        },
      ]
    );
    expect(r.error).toBeUndefined();
    expect(r.testResults[0].passed).toBe(true);
  });
});

describe('laço sem fim na página (P2-6)', () => {
  // Um laço que só termina depois do dobro do limite: sem a guarda, ele
  // demora e o teste falha pela mensagem ausente — um `while (true)` de
  // verdade travaria o próprio executor de testes, que roda na mesma thread.
  const LACO_LONGO = `const fim = Date.now() + ${LIMITE_DO_LACO_MS * 2}; while (Date.now() < fim) {}`;

  it('o laço no carregamento é interrompido, com a mensagem, e os testes ainda rodam', async () => {
    const r = await rodarPaginaNoJsdom(`<h1>x</h1><script>${LACO_LONGO}</script>`, [
      { description: 'o h1 está lá', assertion: `if (!document.querySelector('h1')) throw new Error('sem h1');` },
    ]);

    expect(r.error).toBe(`${NOME_DO_ERRO_DO_LACO}: ${MENSAGEM_DO_LACO}`);
    expect(r.testResults[0].passed).toBe(true);
  });

  it('o laço num clique é interrompido: a página continua, e o erro aparece', async () => {
    // Exceção de manipulador não volta para quem chamou `click()` — vai para o
    // `error` da janela, como no navegador. O teste segue e confere o efeito
    // que o laço impediu.
    const r = await rodarPaginaNoJsdom(
      `<button id="b">ir</button>
       <script>
         const b = document.getElementById('b');
         b.addEventListener('click', () => { ${LACO_LONGO}; b.textContent = 'feito'; });
       </script>`,
      [
        {
          description: 'clicar termina o trabalho',
          assertion: `const b = document.getElementById('b'); b.click(); if (b.textContent !== 'feito') throw new Error('o clique não terminou');`,
        },
      ]
    );

    expect(r.error).toBe(`${NOME_DO_ERRO_DO_LACO}: ${MENSAGEM_DO_LACO}`);
    expect(r.testResults[0].passed).toBe(false);
  });
});
