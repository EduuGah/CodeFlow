import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { MultipleChoiceExercise } from '../../../content/types';
import { MultipleChoice } from './MultipleChoice';

/**
 * Testes do exercício de múltipla escolha.
 *
 * O que importa aqui não é o clique, é a pedagogia: errar não pode encerrar o
 * exercício, a explicação aparece nos dois casos, e a tentativa registrada
 * precisa refletir o que de fato aconteceu — inclusive quantas dicas estavam
 * abertas.
 */

const registrar = vi.fn();

vi.mock('../../hooks/useRecordAttempt', () => ({
  useRecordAttempt: () => registrar,
}));

const EXERCICIO: MultipleChoiceExercise = {
  id: 'ex-teste',
  type: 'multiple-choice',
  prompt: 'Quantas voltas este laço executa?',
  concepts: ['loops'],
  difficulty: 'iniciante',
  hints: ['Liste os valores no papel.', 'O contador começa em zero.'],
  tags: [],
  options: ['Quatro', 'Cinco', 'Seis'],
  correctIndex: 1,
  explanation: 'O contador vai de 0 a 4, portanto cinco valores.',
};

function montar() {
  registrar.mockClear();
  return {
    user: userEvent.setup(),
    ...render(<MultipleChoice exercise={EXERCICIO} lessonId="lesson-teste" />),
  };
}

const verificar = () => screen.getByRole('button', { name: /Verificar/ });

describe('antes de responder', () => {
  it('não dá para verificar sem escolher', () => {
    montar();
    expect(verificar()).toBeDisabled();
  });

  it('mostra todas as alternativas como opções de rádio', () => {
    montar();
    expect(screen.getAllByRole('radio')).toHaveLength(EXERCICIO.options.length);
  });

  it('não entrega a explicação antes da resposta', () => {
    montar();
    expect(screen.queryByText(EXERCICIO.explanation)).not.toBeInTheDocument();
  });
});

describe('resposta errada', () => {
  it('explica em vez de apenas dizer que errou', async () => {
    const { user } = montar();

    await user.click(screen.getByRole('radio', { name: 'Seis' }));
    await user.click(verificar());

    expect(screen.getByText(/Ainda não é essa/)).toBeInTheDocument();
    // A explicação aparece nos dois casos: entender vale mais que pontuar.
    expect(screen.getByText(EXERCICIO.explanation)).toBeInTheDocument();
  });

  it('não encerra o exercício: dá para tentar de novo', async () => {
    const { user } = montar();

    await user.click(screen.getByRole('radio', { name: 'Seis' }));
    await user.click(verificar());

    expect(screen.getByRole('button', { name: /Verificar de novo/ })).toBeEnabled();
    expect(screen.getByRole('radio', { name: 'Cinco' })).toBeEnabled();
  });

  it('mantém a dica disponível para quem errou', async () => {
    const { user } = montar();

    await user.click(screen.getByRole('radio', { name: 'Seis' }));
    await user.click(verificar());

    expect(screen.getByRole('button', { name: /dica/i })).toBeInTheDocument();
  });

  it('registra a tentativa como incorreta', async () => {
    const { user } = montar();

    await user.click(screen.getByRole('radio', { name: 'Seis' }));
    await user.click(verificar());

    expect(registrar).toHaveBeenCalledWith(
      expect.objectContaining({ exerciseId: 'ex-teste', correct: false, hintsUsed: 0 })
    );
  });
});

describe('resposta certa', () => {
  it('confirma e explica o porquê', async () => {
    const { user } = montar();

    await user.click(screen.getByRole('radio', { name: 'Cinco' }));
    await user.click(verificar());

    expect(screen.getByText('Correto')).toBeInTheDocument();
    expect(screen.getByText(EXERCICIO.explanation)).toBeInTheDocument();
  });

  it('encerra o exercício e retira a dica, que já cumpriu a função', async () => {
    const { user } = montar();

    await user.click(screen.getByRole('radio', { name: 'Cinco' }));
    await user.click(verificar());

    expect(screen.queryByRole('button', { name: /Verificar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /dica/i })).not.toBeInTheDocument();
  });

  it('registra a tentativa como correta', async () => {
    const { user } = montar();

    await user.click(screen.getByRole('radio', { name: 'Cinco' }));
    await user.click(verificar());

    expect(registrar).toHaveBeenCalledWith(expect.objectContaining({ correct: true }));
  });
});

describe('histórico honesto', () => {
  it('verificar duas vezes a mesma resposta não vira duas tentativas', async () => {
    const { user } = montar();

    await user.click(screen.getByRole('radio', { name: 'Seis' }));
    await user.click(verificar());
    await user.click(screen.getByRole('button', { name: /Verificar de novo/ }));

    // Reenviar sem mudar nada não é uma tentativa nova; contar seria inflar a
    // taxa de erro do aluno com um clique repetido.
    expect(registrar).toHaveBeenCalledTimes(1);
  });

  it('mudar de resposta e verificar conta como nova tentativa', async () => {
    const { user } = montar();

    await user.click(screen.getByRole('radio', { name: 'Seis' }));
    await user.click(verificar());

    await user.click(screen.getByRole('radio', { name: 'Cinco' }));
    await user.click(screen.getByRole('button', { name: /Verificar/ }));

    expect(registrar).toHaveBeenCalledTimes(2);
    expect(registrar).toHaveBeenLastCalledWith(expect.objectContaining({ correct: true }));
  });

  it('conta quantas dicas estavam abertas na hora da resposta', async () => {
    const { user } = montar();

    await user.click(screen.getByRole('button', { name: /dica/i }));
    await user.click(screen.getByRole('radio', { name: 'Cinco' }));
    await user.click(verificar());

    // Acertar sem dica e acertar com dica são evidências diferentes de domínio.
    expect(registrar).toHaveBeenCalledWith(expect.objectContaining({ hintsUsed: 1 }));
  });
});
