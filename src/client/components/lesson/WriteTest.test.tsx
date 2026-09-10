import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { WriteTestExercise } from '../../../content/types';
import { WriteTest } from './WriteTest';

vi.mock('../../hooks/useRecordAttempt', () => ({ useRecordAttempt: () => () => {} }));

// O Monaco não roda no jsdom e não é o objeto destes testes: um textarea
// preserva o contrato (valor entra, alteração sai) sem arrastar o editor real.
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="Editor de código" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

// O sandbox real usa Web Worker. Aqui o que está sob teste é a leitura do
// veredito na tela, então o executor roda o programa com `new Function`.
vi.mock('../../lib/sandbox', () => ({
  executeCode: (programa: string) => {
    try {
      new Function(programa)();
      return Promise.resolve({ output: '', testResults: [], timedOut: false });
    } catch (erro) {
      return Promise.resolve({
        output: '',
        error: erro instanceof Error ? erro.message : String(erro),
        testResults: [],
        timedOut: false,
      });
    }
  },
}));

const EXERCICIO: WriteTestExercise = {
  id: 'ex-teste-escrever',
  type: 'write-test',
  prompt: 'Teste a função.',
  concepts: ['casos-extremos'],
  difficulty: 'intermediario',
  hints: ['pense no caso vazio'],
  tags: ['teste'],
  subject: `function somar(lista) {
  let total = 0;
  for (const n of lista) total += n;
  return total;
}`,
  initialCode: '// escreva aqui\n',
  mutants: [
    { description: 'devolve sempre zero', code: 'function somar(lista) { return 0; }' },
    {
      description: 'ignora o último item',
      code: `function somar(lista) {
  let total = 0;
  for (let i = 0; i < lista.length - 1; i++) total += lista[i];
  return total;
}`,
    },
  ],
  explanation: 'Um teste que aceita tudo não vale nada.',
  solution: `assert(somar([1, 2, 3]) === 6, 'soma');`,
};

/**
 * Cola em vez de digitar.
 *
 * `type` interpreta `[` e `{` como sintaxe de tecla especial, e todo teste que
 * o aluno escreve tem colchete. Colar entrega o texto literal.
 */
async function escrever(user: ReturnType<typeof userEvent.setup>, codigo: string) {
  const editor = screen.getByRole('textbox', { name: 'Editor de código' });
  await user.clear(editor);
  await user.click(editor);
  await user.paste(codigo);
}

async function rodar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Rodar meus testes|Rodar de novo/ }));
}

describe('o enunciado', () => {
  it('mostra a função que o aluno vai testar', () => {
    render(<WriteTest exercise={EXERCICIO} lessonId="aula" language="javascript" />);
    expect(screen.getByText(/A função que você vai testar/)).toBeInTheDocument();
  });

  it('começa sem veredito nenhum', () => {
    render(<WriteTest exercise={EXERCICIO} lessonId="aula" language="javascript" />);
    expect(screen.queryByText(/Pegam:|Não percebem:/)).not.toBeInTheDocument();
  });
});

describe('veredito', () => {
  /**
   * A lição central do tipo: um teste vazio passa em toda implementação, e é
   * exatamente por isso que "meus testes passaram" não é resultado nenhum.
   */
  it('teste vazio é reprovado, com cada defeito nomeado', async () => {
    const user = userEvent.setup();
    render(<WriteTest exercise={EXERCICIO} lessonId="aula" language="javascript" />);

    await rodar(user);

    expect(screen.getByText('Aceitam a implementação correta')).toBeInTheDocument();
    expect(screen.getByText('Não percebem: devolve sempre zero')).toBeInTheDocument();
    expect(screen.getByText('Não percebem: ignora o último item')).toBeInTheDocument();
    expect(screen.getByText(/defeitos passaram pelos seus testes/)).toBeInTheDocument();
  });

  it('um teste que pega tudo é aprovado, e revela a explicação', async () => {
    const user = userEvent.setup();
    render(<WriteTest exercise={EXERCICIO} lessonId="aula" language="javascript" />);

    await escrever(user, "assert(somar([1, 2, 3]) === 6, 'soma');");
    await rodar(user);

    expect(screen.getByText('Seus testes pegam todos os defeitos')).toBeInTheDocument();
    expect(screen.getByText('Pegam: devolve sempre zero')).toBeInTheDocument();
    expect(screen.getByText(EXERCICIO.explanation)).toBeInTheDocument();
  });

  it('um teste que recusa a implementação correta é reprovado por isso', async () => {
    const user = userEvent.setup();
    render(<WriteTest exercise={EXERCICIO} lessonId="aula" language="javascript" />);

    await escrever(user, "assert(somar([1, 2]) === 99, 'expectativa errada');");
    await rodar(user);

    expect(screen.getByText('Seus testes recusam a implementação correta')).toBeInTheDocument();
    expect(screen.getByText(/Recusam a implementação correta/)).toBeInTheDocument();
  });

  it('um defeito só no singular', async () => {
    const user = userEvent.setup();
    render(<WriteTest exercise={EXERCICIO} lessonId="aula" language="javascript" />);

    // `[3, 0]` soma 3 nas duas: na correta e na que ignora o último. Só a que
    // devolve sempre zero discorda — então este teste pega uma e deixa a outra.
    await escrever(user, "assert(somar([3, 0]) === 3, 'um caso');");
    await rodar(user);

    expect(screen.getByText('Um defeito passou pelos seus testes')).toBeInTheDocument();
    expect(screen.getByText('Pegam: devolve sempre zero')).toBeInTheDocument();
  });

  it('mexer no editor avisa que o veredito ficou velho', async () => {
    const user = userEvent.setup();
    render(<WriteTest exercise={EXERCICIO} lessonId="aula" language="javascript" />);

    await rodar(user);
    expect(screen.getByText(/passaram pelos seus testes/)).toBeInTheDocument();

    await escrever(user, 'x');
    expect(screen.getByText(/O teste mudou depois desta execução/)).toBeInTheDocument();
    expect(screen.queryByText(/passaram pelos seus testes/)).not.toBeInTheDocument();
  });
});

describe('estado reportado à aula', () => {
  it('reprovar reporta errou, e não acertou', async () => {
    const user = userEvent.setup();
    const vistos: string[] = [];

    render(
      <WriteTest
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

  it('aprovar reporta acertou', async () => {
    const user = userEvent.setup();
    const vistos: string[] = [];

    render(
      <WriteTest
        exercise={EXERCICIO}
        lessonId="aula"
        language="javascript"
        onEstado={(e) => vistos.push(e)}
      />
    );

    await escrever(user, "assert(somar([1, 2, 3]) === 6, 'soma');");
    await rodar(user);

    expect(vistos[vistos.length - 1]).toBe('acertou');
  });

  it('editar depois de acertar volta para respondendo', async () => {
    const user = userEvent.setup();
    const vistos: string[] = [];

    render(
      <WriteTest
        exercise={EXERCICIO}
        lessonId="aula"
        language="javascript"
        onEstado={(e) => vistos.push(e)}
      />
    );

    await escrever(user, "assert(somar([1, 2, 3]) === 6, 'soma');");
    await rodar(user);
    expect(vistos[vistos.length - 1]).toBe('acertou');

    // O veredito na tela já não corresponde ao editor: dizer "acertou" seria
    // afirmar algo sobre um código que ninguém rodou.
    await escrever(user, 'x');
    expect(vistos[vistos.length - 1]).toBe('respondendo');
  });
});
