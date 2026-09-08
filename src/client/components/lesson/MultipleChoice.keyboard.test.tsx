import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { MultipleChoiceExercise } from '../../../content/types';
import { MultipleChoice } from './MultipleChoice';

vi.mock('../../hooks/useRecordAttempt', () => ({ useRecordAttempt: () => vi.fn() }));

const exercicio: MultipleChoiceExercise = {
  id: 'ex-teclado-mc',
  type: 'multiple-choice',
  prompt: 'Qual palavra declara uma constante?',
  concepts: ['variaveis'],
  difficulty: 'iniciante',
  tags: ['javascript'],
  hints: ['Ela impede reatribuição.'],
  options: ['var', 'let', 'const'],
  correctIndex: 2,
  explanation: '`const` cria uma ligação que não pode ser reatribuída.',
};

function abrir() {
  return render(<MultipleChoice exercise={exercicio} lessonId="lesson-js-1" />);
}

describe('múltipla escolha pelo teclado', () => {
  it('o grupo de alternativas é uma única parada de Tab', async () => {
    const user = userEvent.setup();
    abrir();

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'var' }));

    // Radios de um mesmo grupo se navegam com as setas; se cada um fosse uma
    // parada, um exercício de cinco alternativas custaria cinco tabulações.
    await user.tab();
    expect(document.activeElement).not.toBe(screen.getByRole('radio', { name: 'let' }));
  });

  it('as setas escolhem a alternativa', async () => {
    const user = userEvent.setup();
    abrir();

    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}');

    expect(screen.getByRole('radio', { name: 'const' })).toBeChecked();
  });

  it('dá para responder inteiro sem mouse', async () => {
    const user = userEvent.setup();
    abrir();

    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await user.tab();

    expect(document.activeElement).toHaveAccessibleName('Verificar resposta');
    await user.keyboard('{Enter}');

    expect(screen.getByRole('status')).toHaveTextContent('Correto');
  });

  it('o foco não se perde quando o botão de verificar desaparece', async () => {
    const user = userEvent.setup();
    abrir();

    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await user.tab();
    await user.keyboard('{Enter}');

    // Acertar remove o botão. Se o foco cair no <body>, a próxima tabulação
    // recomeça do topo do documento em vez de seguir para "Continuar".
    expect(document.activeElement).not.toBe(document.body);
    expect(screen.getByRole('status').contains(document.activeElement)).toBe(true);
  });

  it('errar mantém o foco no botão, que continua ali para tentar de novo', async () => {
    const user = userEvent.setup();
    abrir();

    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.tab();
    await user.keyboard('{Enter}');

    expect(document.activeElement).toHaveAccessibleName('Verificar de novo');
  });

  it('as alternativas saem da ordem de tabulação depois do acerto', async () => {
    const user = userEvent.setup();
    abrir();

    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await user.tab();
    await user.keyboard('{Enter}');

    // O exercício terminou; voltar a mexer nas alternativas não faria nada.
    expect(screen.getByRole('radio', { name: 'var' })).toBeDisabled();
  });

  it('o pedido de dica se anuncia como fechado antes de abrir', async () => {
    const user = userEvent.setup();
    abrir();

    const pedir = screen.getByRole('button', { name: /Precisa de uma dica/i });
    expect(pedir).toHaveAttribute('aria-expanded', 'false');

    await user.click(pedir);
    // Uma só dica neste exercício: o botão cumpriu a função e sai.
    expect(screen.queryByRole('button', { name: /Precisa de uma dica/i })).not.toBeInTheDocument();
    expect(screen.getByText('Dica 1 de 1')).toBeInTheDocument();
  });

  it('a dica revelada é anunciada e fica com o foco', async () => {
    const user = userEvent.setup();
    abrir();

    await user.click(screen.getByRole('button', { name: /Precisa de uma dica/i }));

    const anuncio = screen.getByRole('status');
    expect(anuncio).toHaveTextContent('Ela impede reatribuição.');

    // O botão que tinha o foco desapareceu: sem resgate, o Tab seguinte
    // recomeçaria do topo do documento.
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toContainElement(anuncio);
  });
});
