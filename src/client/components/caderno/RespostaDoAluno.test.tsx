import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type {
  CodeExercise,
  FillBlankExercise,
  FindBugExercise,
  MultipleChoiceExercise,
  OrderStepsExercise,
} from '../../../content/types';
import { RespostaDoAluno } from './RespostaDoAluno';
import { primeiroParagrafo, TextoEmLinha } from './TextoEmLinha';

/**
 * A evidência no formato em que a pessoa a viu: o texto da alternativa, a
 * linha de código, os passos — nunca o índice ou o id que o banco guarda.
 */

const base = { concepts: [], difficulty: 'iniciante', hints: [], tags: [], prompt: 'P' } satisfies Partial<CodeExercise>;

describe('o que a pessoa respondeu', () => {
  it('múltipla escolha: o texto da alternativa, com o código formatado', () => {
    const exercise: MultipleChoiceExercise = {
      ...base,
      id: 'mc',
      type: 'multiple-choice',
      options: ['`NaN`', '`0`'],
      correctIndex: 1,
      explanation: '',
    };
    const { container } = render(<RespostaDoAluno resposta={{ tipo: 'alternativa', indice: 0 }} exercise={exercise} />);

    expect(container.querySelector('code')).toHaveTextContent('NaN');
    expect(container).not.toHaveTextContent('`');
  });

  it('encontrar o bug: a linha e o código dela', () => {
    const exercise: FindBugExercise = {
      ...base,
      id: 'fb',
      type: 'find-bug',
      code: 'const a = 1;\n  let b = a +;\n',
      buggyLine: 2,
      fix: '',
      explanation: '',
    };
    render(<RespostaDoAluno resposta={{ tipo: 'linha', linha: 2 }} exercise={exercise} />);

    expect(screen.getByText(/Linha 2/)).toBeInTheDocument();
    expect(screen.getByText('let b = a +;')).toBeInTheDocument();
  });

  it('ordenar: os passos na ordem enviada, pelo texto', () => {
    const exercise: OrderStepsExercise = {
      ...base,
      id: 'os',
      type: 'order-steps',
      steps: [
        { id: 'p1', text: 'Primeiro', ordem: 1 },
        { id: 'p2', text: 'Segundo', ordem: 2 },
      ],
      explanation: '',
    };
    render(<RespostaDoAluno resposta={{ tipo: 'ordem', ids: ['p2', 'p1'] }} exercise={exercise} />);

    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Segundo', 'Primeiro']);
  });

  it('lacunas: a vazia é dita, não some', () => {
    const exercise: FillBlankExercise = { ...base, id: 'fb2', type: 'fill-blank', template: '', blanks: [], tests: [], explanation: '' };
    render(<RespostaDoAluno resposta={{ tipo: 'lacunas', valores: ['i < n', ' '] }} exercise={exercise} />);

    expect(screen.getByText('i < n')).toBeInTheDocument();
    expect(screen.getByText('(vazia)')).toBeInTheDocument();
  });

  it('código: o que foi escrito, como foi escrito', () => {
    const exercise: CodeExercise = { ...base, id: 'c', type: 'code', initialCode: '', tests: [] };
    const { container } = render(
      <RespostaDoAluno resposta={{ tipo: 'codigo', codigo: 'function f() {\n  return 1;\n}' }} exercise={exercise} />
    );

    expect(container.querySelector('pre')?.textContent).toBe('function f() {\n  return 1;\n}');
  });
});

describe('o enunciado numa linha', () => {
  it('o primeiro parágrafo, sem bloco de código', () => {
    expect(primeiroParagrafo('Complete a função\n`somar`.\n\nDepois rode.')).toBe('Complete a função `somar`.');
    expect(primeiroParagrafo('Leia:\n```js\nx()\n```\nE responda.')).toBe('Leia:');
  });

  it('crase vira código; ênfase perde os asteriscos', () => {
    const { container } = render(<TextoEmLinha texto="Use **sempre** `const` aqui" />);
    expect(container).toHaveTextContent('Use sempre const aqui');
    expect(container.querySelector('code')).toHaveTextContent('const');
  });
});
