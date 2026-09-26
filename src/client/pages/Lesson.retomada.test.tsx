import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getLesson } from '../../content';
import { buildLessonSteps } from '../lib/lesson-steps';
import { Lesson } from './Lesson';
import { botaoDeAvanco } from './aula.test-utils';

/**
 * Voltar a uma aula pela metade.
 *
 * A aula busca o que a pessoa já resolveu em visitas anteriores, para ela não
 * precisar refazer tudo numa sessão só. O defeito (auditoria de 2026-09-26):
 * ao chegar num desses exercícios, o componente montava e avisava "inicial",
 * e isso **apagava** o resolvido de antes — o contador caía, o botão voltava
 * a "Responda para continuar" e, se a pessoa agora errasse, a aula nunca
 * mais fechava.
 *
 * E o outro lado da mesma corrida: com os resolvidos chegando antes da lista
 * de aulas concluídas, a aula já concluída parecia recém-fechada — confete e
 * conclusão gravada de novo a cada visita.
 */

vi.mock('../components/ui/CodeEditor', () => ({
  CodeEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="Editor de código" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

const confete = vi.hoisted(() => vi.fn());
vi.mock('canvas-confetti', () => ({ default: confete }));

const AULA = 'lesson-js-1';
const passos = buildLessonSteps(getLesson(AULA)!);
const exercicios = passos.flatMap((p) => (p.kind === 'exercise' ? [p.exercise] : []));

const servidor = vi.hoisted(() => ({
  resolvidos: [] as string[],
  concluidas: [] as string[],
  progressoDemora: Promise.resolve(),
  marcar: vi.fn(() => Promise.resolve()),
}));

vi.mock('../lib/progress', () => ({
  fetchProgress: async () => {
    await servidor.progressoDemora;
    return { completedLessons: servidor.concluidas, completedProjects: [] };
  },
  fetchSolvedExercises: () => Promise.resolve(servidor.resolvidos),
  markLessonCompleted: () => servidor.marcar(),
  recordAttempt: () => Promise.resolve(),
}));

vi.mock('../lib/sandbox', () => ({
  executeCode: () => Promise.resolve({ output: '', error: null, testResults: [], timedOut: false }),
}));

const ALUNO = { id: 'aluno-de-teste' };
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: ALUNO }),
}));

/** O contador do cabeçalho ("5 de 6 exercícios resolvidos"), pelo rótulo que ele anuncia. */
function contadorDaAula(): string | null {
  return document.querySelector('header [aria-label$="exercícios resolvidos"]')?.getAttribute('aria-label') ?? null;
}

function abrir() {
  return render(
    <MemoryRouter initialEntries={[`/lesson/${AULA}`]}>
      <Routes>
        <Route path="/lesson/:id" element={<Lesson />} />
        <Route path="/app" element={<p>tela inicial</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  servidor.resolvidos = [];
  servidor.concluidas = [];
  servidor.progressoDemora = Promise.resolve();
  servidor.marcar.mockClear();
  confete.mockClear();
});

describe('voltar a uma aula pela metade', () => {
  it('o exercício resolvido antes continua resolvido ao passar por ele', async () => {
    // Todos resolvidos menos o último.
    servidor.resolvidos = exercicios.slice(0, -1).map((e) => e.id);
    const user = userEvent.setup();
    abrir();

    const contador = `${exercicios.length - 1} de ${exercicios.length} exercícios resolvidos`;
    await waitFor(() => expect(contadorDaAula()).toBe(contador));

    // Anda até o primeiro exercício — que já foi resolvido numa visita antiga.
    const primeiro = passos.findIndex((p) => p.kind === 'exercise');
    for (let i = 0; i < primeiro; i++) await user.click(botaoDeAvanco());

    // Ao montar, o exercício avisa "inicial"; o resolvido de antes não some.
    expect(contadorDaAula()).toBe(contador);
    expect(botaoDeAvanco()).toHaveTextContent(/^Continuar$/);
    expect(botaoDeAvanco()).toBeEnabled();
    expect(screen.getByText(/Você já resolveu este exercício/)).toBeInTheDocument();
  });

  it('a aula já concluída não solta confete nem grava de novo, nem se os resolvidos chegarem primeiro', async () => {
    servidor.resolvidos = exercicios.map((e) => e.id);
    servidor.concluidas = [AULA];
    // A lista de concluídas chega depois da de resolvidos: é a corrida.
    let liberar!: () => void;
    servidor.progressoDemora = new Promise<void>((r) => (liberar = r));

    abrir();
    await waitFor(() =>
      expect(contadorDaAula()).toBe(`${exercicios.length} de ${exercicios.length} exercícios resolvidos`)
    );
    liberar();
    await waitFor(() => expect(servidor.marcar).not.toHaveBeenCalled());
    // Um tique a mais para qualquer efeito atrasado.
    await new Promise((r) => setTimeout(r, 20));

    expect(servidor.marcar).not.toHaveBeenCalled();
    expect(confete).not.toHaveBeenCalled();
  });

  it('a gravação que falha não é anunciada como salva, e dá para tentar de novo', async () => {
    // Antes a falha ia só para o console, e o resumo dizia "Seu progresso foi
    // salvo" do mesmo jeito.
    servidor.resolvidos = exercicios.map((e) => e.id);
    servidor.marcar.mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch')));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    abrir();

    await waitFor(() => expect(servidor.marcar).toHaveBeenCalledTimes(1));
    // Até o resumo, que é o último passo.
    for (let i = 0; i < passos.length - 1; i++) await user.click(botaoDeAvanco());

    expect(await screen.findByText(/A conclusão não foi salva/)).toBeInTheDocument();
    expect(screen.queryByText(/progresso foi salvo/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tentar salvar de novo' }));

    expect(servidor.marcar).toHaveBeenCalledTimes(2);
    expect(await screen.findByText(/Seu progresso foi salvo/)).toBeInTheDocument();
  });
});
