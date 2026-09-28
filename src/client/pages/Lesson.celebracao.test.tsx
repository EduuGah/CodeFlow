import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getLesson } from '../../content/catalogo';
import { buildLessonSteps } from '../lib/lesson-steps';
import { Lesson } from './Lesson';

/**
 * A celebração equipada é a que toca na conclusão — não o confete de sempre.
 *
 * A aula abre com todos os exercícios já resolvidos e sem estar concluída:
 * é o caminho mais curto até o efeito da conclusão, o mesmo que a retomada
 * usa.
 */

vi.mock('../components/ui/CodeEditor', () => ({
  CodeEditor: () => <textarea aria-label="Editor de código" readOnly />,
}));

const celebrar = vi.hoisted(() => vi.fn());
vi.mock('../lib/celebrar', () => ({ celebrar }));

const AULA = 'lesson-js-1';
const exercicios = buildLessonSteps(getLesson(AULA)!).flatMap((p) => (p.kind === 'exercise' ? [p.exercise] : []));

vi.mock('../lib/progress', () => ({
  fetchProgress: () => Promise.resolve({ completedLessons: [], completedProjects: [] }),
  fetchSolvedExercises: () => Promise.resolve(exercicios.map((e) => e.id)),
  markLessonCompleted: () => Promise.resolve(),
  recordAttempt: () => Promise.resolve(),
}));

vi.mock('../lib/sandbox', () => ({
  executeCode: () => Promise.resolve({ output: '', error: null, testResults: [], timedOut: false }),
}));

const ALUNO = { id: 'aluno-de-teste' };
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: ALUNO }),
}));

const dados = vi.hoisted(() => ({ atual: undefined as { perfil: { celebracao: string | null } } | undefined }));
vi.mock('../contexts/StudentDataContext', () => ({
  useStudentDataOpcional: () => dados.atual,
}));

function abrir() {
  return render(
    <MemoryRouter initialEntries={[`/lesson/${AULA}`]}>
      <Routes>
        <Route path="/lesson/:id" element={<Lesson />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  celebrar.mockClear();
  dados.atual = undefined;
});

describe('a celebração da conclusão', () => {
  it('toca a que a pessoa equipou', async () => {
    dados.atual = { perfil: { celebracao: 'fogos' } };
    abrir();
    await waitFor(() => expect(celebrar).toHaveBeenCalledTimes(1));
    expect(celebrar).toHaveBeenCalledWith('aula', 'fogos');
  });

  it('sem nada equipado (ou fora do app), toca a de sempre', async () => {
    abrir();
    await waitFor(() => expect(celebrar).toHaveBeenCalledTimes(1));
    expect(celebrar.mock.calls[0][1] ?? null).toBeNull();
  });
});
