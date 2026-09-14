import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { getLesson } from '../../content';
import { buildLessonSteps } from '../lib/lesson-steps';
import { Lesson } from './Lesson';

/**
 * Dois exercícios seguidos do mesmo tipo.
 *
 * O defeito: o React reaproveitava a instância do componente entre um passo e
 * o seguinte quando os dois eram do mesmo tipo. O segundo exercício de
 * múltipla escolha nascia com a resposta do primeiro já enviada — dizia
 * "Resposta correta" para uma pergunta que ninguém tinha respondido — e, como
 * o estado derivado não mudava, a aula nunca ficava sabendo que ele existia.
 * O contador parava em 5/6 e a aula não concluía. Nenhuma aula publicada
 * tinha dois seguidos até a trilha de TypeScript.
 */

vi.mock('../components/ui/CodeEditor', () => ({
  CodeEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="Editor de código" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
vi.mock('../lib/progress', () => ({
  fetchProgress: () => Promise.resolve({ completedLessons: [], completedProjects: [] }),
  fetchSolvedExercises: () => Promise.resolve([]),
  markLessonCompleted: () => Promise.resolve(),
  recordAttempt: () => Promise.resolve(),
}));
vi.mock('../lib/sandbox', () => ({ executeCode: () => Promise.resolve(null) }));
const ALUNO = { id: 'aluno-de-teste' };
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: ALUNO }) }));

const AULA = 'lesson-ts-2';
const passos = buildLessonSteps(getLesson(AULA)!);

/** O primeiro par de passos seguidos de múltipla escolha. Lança em vez de pular. */
function parSeguido(): number {
  for (let i = 0; i + 1 < passos.length; i++) {
    const a = passos[i];
    const b = passos[i + 1];
    if (
      a.kind === 'exercise' &&
      b.kind === 'exercise' &&
      a.exercise.type === 'multiple-choice' &&
      b.exercise.type === 'multiple-choice'
    ) {
      return i;
    }
  }
  throw new Error(`${AULA} não tem dois exercícios de múltipla escolha seguidos; o teste precisa de outra aula`);
}

function botaoDeAvanco() {
  return screen.getByRole('button', { name: /Continuar|Pular por ora|Continuar assim mesmo/ });
}

describe('dois exercícios seguidos do mesmo tipo', () => {
  it('o segundo nasce limpo, e a aula conta os dois', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={[`/lesson/${AULA}`]}>
        <Routes>
          <Route path="/lesson/:id" element={<Lesson />} />
        </Routes>
      </MemoryRouter>
    );

    const primeiro = parSeguido();
    for (let i = 0; i < primeiro; i++) await user.click(botaoDeAvanco());

    const a = passos[primeiro];
    const b = passos[primeiro + 1];
    if (a.kind !== 'exercise' || b.kind !== 'exercise') throw new Error('passo inesperado');
    if (a.exercise.type !== 'multiple-choice' || b.exercise.type !== 'multiple-choice') {
      throw new Error('tipo inesperado');
    }

    // Acerta o primeiro.
    await user.click(screen.getAllByRole('radio')[a.exercise.correctIndex]);
    await user.click(screen.getByRole('button', { name: 'Verificar resposta' }));
    expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    expect(botaoDeAvanco()).toHaveTextContent('Continuar');

    // O segundo começa do zero: nada marcado, nada verificado, e o rodapé
    // oferece pular — porque ninguém respondeu ainda.
    await user.click(botaoDeAvanco());
    expect(screen.queryByText('Resposta correta')).not.toBeInTheDocument();
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
    expect(botaoDeAvanco()).toHaveTextContent('Pular por ora');

    // E responder o segundo conta para a aula: o rodapé passa a "Continuar".
    await user.click(screen.getAllByRole('radio')[b.exercise.correctIndex]);
    await user.click(screen.getByRole('button', { name: 'Verificar resposta' }));
    expect(botaoDeAvanco()).toHaveTextContent('Continuar');
  });
});
