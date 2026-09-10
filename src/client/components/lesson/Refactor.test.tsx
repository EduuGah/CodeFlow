import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { RefactorExercise } from '../../../content/types';
import { Refactor } from './Refactor';

vi.mock('../../hooks/useRecordAttempt', () => ({ useRecordAttempt: () => () => {} }));

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="Editor de código" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

// O sandbox real usa Web Worker. Aqui basta um executor que rode o programa e
// aplique as asserções, porque o que está sob teste é a leitura do veredito.
vi.mock('../../lib/sandbox', () => ({
  executeCode: (codigo: string, testes: Array<{ description: string; assertion: string }> = []) => {
    const resultados = testes.map((teste) => {
      try {
        new Function(`${codigo}\n${teste.assertion}`)();
        return { passed: true, message: teste.description };
      } catch (erro) {
        return { passed: false, message: erro instanceof Error ? erro.message : String(erro) };
      }
    });

    return Promise.resolve({ output: '', testResults: resultados, timedOut: false });
  },
}));

const EXERCICIO: RefactorExercise = {
  id: 'ex-teste-refatorar',
  type: 'refactor',
  prompt: 'Reescreva.',
  concepts: ['arrays'],
  difficulty: 'intermediario',
  hints: ['pense nos métodos'],
  tags: ['teste'],
  initialCode: `function caros(produtos) {
  const saida = [];
  for (const p of produtos) {
    if (p.preco > 100) saida.push(p.nome);
  }
  return saida;
}`,
  constraints: [
    { description: 'Sem laço manual', forbidden: 'for (' },
    { description: 'Use filter', required: '.filter(' },
  ],
  tests: [
    {
      description: 'seleciona os caros',
      assertion: `const r = caros([{ nome: 'a', preco: 200 }, { nome: 'b', preco: 5 }]);
if (r.join(',') !== 'a') throw new Error('esperava só o a');`,
    },
  ],
  explanation: 'A intenção fica declarada.',
  solution: `function caros(produtos) {
  return produtos.filter((p) => p.preco > 100).map((p) => p.nome);
}`,
};

/** A lista de restrições, que é a primeira `ul` da tela. */
function listaDeForma() {
  return screen.getAllByRole('list')[0];
}

async function escrever(user: ReturnType<typeof userEvent.setup>, codigo: string) {
  const editor = screen.getByRole('textbox', { name: 'Editor de código' });
  await user.clear(editor);
  await user.click(editor);
  await user.paste(codigo);
}

async function rodar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Rodar os testes|Rodar de novo/ }));
}

describe('a lista de restrições', () => {
  /**
   * Escondê-las até a primeira tentativa transformaria o exercício em
   * adivinhação do que o autor queria.
   */
  it('aparece antes de qualquer verificação', () => {
    render(<Refactor exercise={EXERCICIO} lessonId="aula" language="javascript" />);

    const lista = listaDeForma();
    expect(within(lista).getByText('Sem laço manual')).toBeInTheDocument();
    expect(within(lista).getByText('Use filter')).toBeInTheDocument();
  });

  it('diz por que cada uma ainda não foi cumprida', () => {
    render(<Refactor exercise={EXERCICIO} lessonId="aula" language="javascript" />);

    const lista = listaDeForma();
    expect(within(lista).getByText(/o código ainda tem for \(/)).toBeInTheDocument();
    expect(within(lista).getByText(/o código ainda não usa \.filter\(/)).toBeInTheDocument();
  });

  it('marca em tempo real, enquanto o aluno escreve', async () => {
    const user = userEvent.setup();
    render(<Refactor exercise={EXERCICIO} lessonId="aula" language="javascript" />);

    await escrever(user, EXERCICIO.solution!);

    const lista = listaDeForma();
    expect(within(lista).queryByText(/o código ainda tem/)).not.toBeInTheDocument();
    expect(within(lista).queryByText(/o código ainda não usa/)).not.toBeInTheDocument();
  });
});

describe('os três desfechos', () => {
  it('forma e comportamento certos: aprovado, com a explicação', async () => {
    const user = userEvent.setup();
    render(<Refactor exercise={EXERCICIO} lessonId="aula" language="javascript" />);

    await escrever(user, EXERCICIO.solution!);
    await rodar(user);

    expect(screen.getByText('Mesma coisa, escrita melhor')).toBeInTheDocument();
    expect(screen.getByText(EXERCICIO.explanation)).toBeInTheDocument();
  });

  /**
   * O desfecho que dá sentido ao tipo: quebrar um teste que passava é o que
   * refatoração nunca pode fazer.
   */
  it('forma certa e comportamento quebrado: reprovado por isso', async () => {
    const user = userEvent.setup();
    render(<Refactor exercise={EXERCICIO} lessonId="aula" language="javascript" />);

    await escrever(
      user,
      'function caros(produtos) {\n  return produtos.filter((p) => p.preco > 999).map((p) => p.nome);\n}'
    );
    await rodar(user);

    expect(screen.getByText('A reescrita mudou o comportamento')).toBeInTheDocument();
  });

  it('comportamento intacto e forma pendente: reprovado por isso', async () => {
    const user = userEvent.setup();
    render(<Refactor exercise={EXERCICIO} lessonId="aula" language="javascript" />);

    // O código de partida já passa nos testes — só a forma falta.
    await rodar(user);

    expect(screen.getByText('O comportamento está intacto — falta a forma')).toBeInTheDocument();
  });
});

describe('estado reportado à aula', () => {
  it('aprovar reporta acertou', async () => {
    const user = userEvent.setup();
    const vistos: string[] = [];

    render(
      <Refactor
        exercise={EXERCICIO}
        lessonId="aula"
        language="javascript"
        onEstado={(e) => vistos.push(e)}
      />
    );

    await escrever(user, EXERCICIO.solution!);
    await rodar(user);

    expect(vistos[vistos.length - 1]).toBe('acertou');
  });

  it('passar nos testes sem cumprir a forma NÃO é acertar', async () => {
    const user = userEvent.setup();
    const vistos: string[] = [];

    render(
      <Refactor
        exercise={EXERCICIO}
        lessonId="aula"
        language="javascript"
        onEstado={(e) => vistos.push(e)}
      />
    );

    await rodar(user);

    expect(vistos[vistos.length - 1]).toBe('errou');
    expect(vistos).not.toContain('acertou');
  });
});
