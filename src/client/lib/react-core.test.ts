import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { rodarPaginaNoJsdom } from './pagina-jsdom';
import { COMPONENTE_RAIZ, montarDocumentoReact } from './react-core';
import { BIBLIOTECAS_DO_REACT } from './react-umd';
import { compilarNoNode } from './typescript-node';
import {
  LIMITE_DO_LACO_MS,
  MENSAGEM_DO_LACO,
  NOME_DA_GUARDA,
  NOME_DO_ERRO_DO_LACO,
  scriptDaGuarda,
} from './protecao-de-laco';

/** Compila o TSX como o CI faz e roda o componente no jsdom. */
async function rodar(tsx: string, tests: Array<{ description: string; assertion: string }>) {
  const { js, erros } = compilarNoNode(tsx, { jsx: true });
  expect(erros, 'o componente do teste não deveria ter erro de tipo').toEqual([]);
  return rodarPaginaNoJsdom(js, tests, 8000, { react: true });
}

const CONTADOR = `function App() {
  const [n, setN] = React.useState(0);
  return (
    <div>
      <p id="contagem">Contagem: {n}</p>
      <button onClick={() => setN(n + 1)}>+1</button>
    </div>
  );
}`;

describe('o documento de React', () => {
  it('embute o React e o ReactDOM, os ajudantes, o código e a montagem, nessa ordem', () => {
    const doc = montarDocumentoReact('function App() { return null; }', [], BIBLIOTECAS_DO_REACT);
    const posicao = (trecho: string) => {
      const i = doc.indexOf(trecho);
      expect(i, `não achei "${trecho}" no documento`).toBeGreaterThan(-1);
      return i;
    };
    const react = posicao('React');
    const dom = posicao('ReactDOM');
    const ajudantes = posicao('async function clicar');
    const codigo = posicao('function App() { return null; }');
    const montagem = posicao(`React.createElement(${COMPONENTE_RAIZ})`);
    expect(react).toBeLessThan(dom);
    expect(dom).toBeLessThan(ajudantes);
    expect(ajudantes).toBeLessThan(codigo);
    expect(codigo).toBeLessThan(montagem);
  });

  it('as bibliotecas embutidas são a versão do projeto', () => {
    const versao = JSON.parse(readFileSync('node_modules/react/package.json', 'utf-8')).version as string;
    expect(BIBLIOTECAS_DO_REACT.react).toContain(`"${versao}"`);
    expect(BIBLIOTECAS_DO_REACT.reactDom).toContain(`"${versao}"`);
  });
});

describe('o componente no jsdom', () => {
  it('monta antes dos testes, e um clique atualiza o DOM', async () => {
    const r = await rodar(CONTADOR, [
      {
        description: 'começa em 0',
        assertion: `if (texto('#contagem') !== 'Contagem: 0') throw new Error('Esperava "Contagem: 0", veio ' + texto('#contagem'));`,
      },
      {
        description: 'clicar duas vezes chega a 2',
        assertion: `await clicar('button'); await clicar('button'); if (texto('#contagem') !== 'Contagem: 2') throw new Error('Esperava "Contagem: 2", veio ' + texto('#contagem'));`,
      },
    ]);
    expect(r.error).toBeUndefined();
    expect(r.testResults.map((t) => t.passed)).toEqual([true, true]);
  });

  it('digitar num input controlado passa pelo onChange', async () => {
    const r = await rodar(
      `function App() {
        const [nome, setNome] = React.useState('');
        return <div><input value={nome} onChange={(e) => setNome(e.target.value)} /><p id="eco">{nome.toUpperCase()}</p></div>;
      }`,
      [
        {
          description: 'o eco acompanha o input',
          assertion: `await digitar('input', 'ana'); if (texto('#eco') !== 'ANA') throw new Error('Esperava ANA, veio ' + texto('#eco')); if (document.querySelector('input').value !== 'ana') throw new Error('o input deveria mostrar ana');`,
        },
      ]
    );
    expect(r.error).toBeUndefined();
    expect(r.testResults).toEqual([{ passed: true, message: 'o eco acompanha o input' }]);
  });

  it('enviar um formulário dispara o onSubmit com preventDefault', async () => {
    const r = await rodar(
      `function App() {
        const [enviado, setEnviado] = React.useState(false);
        return <form onSubmit={(e) => { e.preventDefault(); setEnviado(true); }}><input name="x" /><button type="submit">ok</button>{enviado && <p id="ok">enviado</p>}</form>;
      }`,
      [
        {
          description: 'depois de enviar aparece a confirmação',
          assertion: `await enviar('form'); if (!document.querySelector('#ok')) throw new Error('faltou a confirmação');`,
        },
      ]
    );
    expect(r.error).toBeUndefined();
    expect(r.testResults[0].passed).toBe(true);
  });

  it('sem App, o erro diz o que declarar', async () => {
    const r = await rodar('function Outro() { return <p>x</p>; }', [
      { description: 'nunca chega aqui', assertion: 'if (!document.querySelector("p")) throw new Error("vazio");' },
    ]);
    expect(r.error).toMatch(/Nenhum componente App encontrado/);
  });

  it('um erro na renderização vira erro de script, não silêncio', async () => {
    const r = await rodar(
      `function App() { const lista: string[] | undefined = undefined as any; return <p>{lista!.length}</p>; }`,
      [{ description: 'x', assertion: 'void 0;' }]
    );
    expect(r.error).toMatch(/TypeError/);
  });

  it('um laço sem fim no componente é interrompido, e o erro diz qual é (P2-6)', async () => {
    // Só o JavaScript do aluno ganha a guarda; o laço que só termina depois
    // do dobro do limite prova que ela está lá sem arriscar travar o teste.
    const r = await rodar(
      `function App() { const fim = Date.now() + ${LIMITE_DO_LACO_MS * 2}; while (Date.now() < fim) {} return <p>x</p>; }`,
      [{ description: 'x', assertion: 'void 0;' }]
    );
    expect(r.error).toBe(`${NOME_DO_ERRO_DO_LACO}: ${MENSAGEM_DO_LACO}`);
  });

  it('as bibliotecas do React não são instrumentadas: só o código do aluno', () => {
    const doc = montarDocumentoReact('function App() { while (x) {} return null; }', [], BIBLIOTECAS_DO_REACT);
    expect(doc.split(NOME_DA_GUARDA).length - 1).toBe(
      // As menções da definição da guarda, e uma só do código: o laço do aluno.
      scriptDaGuarda().split(NOME_DA_GUARDA).length - 1 + 1
    );
  });

  it('o efeito roda e vê o DOM que o iframe tem', async () => {
    const r = await rodar(
      `function App() {
        const [n, setN] = React.useState(0);
        React.useEffect(() => { document.title = 'Cliques: ' + n; }, [n]);
        return <button onClick={() => setN(n + 1)}>+</button>;
      }`,
      [
        {
          description: 'o título acompanha os cliques',
          assertion: `await esperar(); if (document.title !== 'Cliques: 0') throw new Error('título inicial: ' + document.title); await clicar('button'); if (document.title !== 'Cliques: 1') throw new Error('título depois: ' + document.title);`,
        },
      ]
    );
    expect(r.error).toBeUndefined();
    expect(r.testResults[0]).toEqual({ passed: true, message: 'o título acompanha os cliques' });
  });
});

describe('o compilador em modo React', () => {
  it('aceita JSX, hooks e eventos sem anotação do evento', () => {
    const { erros, js } = compilarNoNode(CONTADOR, { jsx: true });
    expect(erros).toEqual([]);
    expect(js).toContain('React.createElement("button"');
  });

  it('recusa uma prop obrigatória que falta, e um estado do tipo errado', () => {
    const falta = compilarNoNode(
      'function S({ nome }: { nome: string }) { return <p>{nome}</p>; }\nfunction App() { return <S />; }',
      { jsx: true }
    );
    expect(falta.erros.map((e) => e.codigo)).toEqual([2322]);

    const errado = compilarNoNode(
      "function App() { const [n, setN] = React.useState(0); return <button onClick={() => setN('a')}>x</button>; }",
      { jsx: true }
    );
    expect(errado.erros.map((e) => e.codigo)).toEqual([2345]);
  });

  it('fora do modo React, JSX é erro e document continua não existindo', () => {
    expect(compilarNoNode('const x = <div />;').erros.length).toBeGreaterThan(0);
    expect(compilarNoNode('document.title = "x";').erros.map((e) => e.codigo)).toEqual([2584]);
  });
});

describe('achar pelo que a pessoa lê', () => {
  it('botao acha pelo texto e campo acha pelo rótulo, e os dois explicam quando não acham', async () => {
    const r = await rodar(
      `function App() {
        const [n, setN] = React.useState('');
        return (
          <form>
            <label>Nome <input value={n} onChange={(e) => setN(e.target.value)} /></label>
            <label htmlFor="idade">Idade</label><input id="idade" />
            <button type="button">Salvar</button>
            <p id="eco">{n}</p>
          </form>
        );
      }`,
      [
        {
          description: 'campo pelo rótulo, com o input dentro ou por htmlFor',
          assertion: `await digitar(campo('Nome'), 'Ana'); if (texto('#eco') !== 'Ana') throw new Error('eco: ' + texto('#eco')); if (campo('Idade').id !== 'idade') throw new Error('htmlFor não achou');`,
        },
        {
          description: 'botao pelo texto',
          assertion: `if (botao('Salvar').tagName !== 'BUTTON') throw new Error('não achou o botão');`,
        },
        {
          description: 'quando não acha, a mensagem lista o que existe',
          assertion: `try { botao('Enviar'); throw new Error('deveria ter lançado'); } catch (e) { if (!e.message.includes('Botões na tela: ["Salvar"]')) throw new Error('mensagem: ' + e.message); }`,
        },
      ]
    );
    expect(r.error).toBeUndefined();
    expect(r.testResults.map((t) => t.message + (t.passed ? '' : ' ✗'))).toEqual([
      'campo pelo rótulo, com o input dentro ou por htmlFor',
      'botao pelo texto',
      'quando não acha, a mensagem lista o que existe',
    ]);
  });
});
