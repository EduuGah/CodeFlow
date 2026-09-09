import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { getLesson, getLessonAfter, getLessonsOfTrack, listTracks } from '../../content';
import { buildLessonSteps } from '../lib/lesson-steps';
import { Lesson } from './Lesson';

/**
 * Passar de uma aula para a seguinte.
 *
 * Isto era tela branca, e o aluno só recuperava recarregando a página.
 *
 * A rota `/lesson/:id` é a mesma para as duas aulas, então trocar de aula não
 * desmonta o componente: só muda o parâmetro. O passo atual voltava para zero
 * num `useEffect`, que roda **depois** do render — e nesse render a aula nova já
 * estava em cena com o índice da anterior. Quem terminava a aula 1 (nove passos)
 * e ia para a 2 (oito) caía em `steps[8]`, que é `undefined`, e a leitura de
 * `passo.kind` derrubava a aplicação inteira.
 *
 * O teste percorre os pares de aulas em que a seguinte é mais curta, que são
 * exatamente os que quebravam.
 */

vi.mock('@monaco-editor/react', () => ({
  default: () => <textarea aria-label="Editor de código" />,
}));

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

vi.mock('../lib/progress', () => ({
  fetchProgress: () => Promise.resolve({ completedLessons: [], completedProjects: [] }),
  fetchSolvedExercises: () => Promise.resolve([]),
  markLessonCompleted: () => Promise.resolve(),
  recordAttempt: () => Promise.resolve(),
}));

vi.mock('../lib/sandbox', () => ({ executeCode: () => Promise.resolve(null) }));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

function abrir(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/lesson/${id}`]}>
      <Routes>
        <Route path="/lesson/:id" element={<Lesson />} />
        <Route path="/app" element={<p>tela inicial</p>} />
      </Routes>
    </MemoryRouter>
  );
}

function contadorDePassos() {
  const cabecalho = screen.getByRole('banner');
  return within(cabecalho).getByText(/Passo \d+ de \d+/).textContent ?? '';
}

/**
 * O primeiro par de aulas em que a seguinte tem menos passos.
 *
 * Lança em vez de pular: se um dia todas as aulas tiverem o mesmo tamanho, o
 * teste precisa avisar que perdeu o alvo, não passar em silêncio.
 */
function parQueEncolhe(): { atual: string; proxima: string; passosDaAtual: number } {
  for (const track of listTracks()) {
    for (const aula of getLessonsOfTrack(track.id)) {
      const proxima = getLessonAfter(aula.id);
      if (!proxima) continue;

      const daAtual = buildLessonSteps(aula).length;
      const daProxima = buildLessonSteps(proxima).length;

      if (daProxima < daAtual) {
        return { atual: aula.id, proxima: proxima.id, passosDaAtual: daAtual };
      }
    }
  }

  throw new Error('nenhuma aula é seguida por outra mais curta; escolha outro alvo para o teste');
}

describe('trocar de aula', () => {
  it('ir para uma aula mais curta a partir do último passo não quebra a tela', async () => {
    const user = userEvent.setup();
    const { atual, proxima, passosDaAtual } = parQueEncolhe();

    abrir(atual);

    // Até o último passo da aula atual, onde mora o link para a próxima.
    for (let i = 1; i < passosDaAtual; i++) {
      await user.click(screen.getByRole('button', { name: /Continuar|Pular por ora/ }));
    }

    await user.click(screen.getByRole('link', { name: /Próxima aula/ }));

    // A tela continua de pé, e no começo da aula nova.
    const daProxima = buildLessonSteps(getLesson(proxima)!).length;
    expect(contadorDePassos()).toContain(`Passo 1 de ${daProxima}`);
    expect(screen.getByText(getLesson(proxima)!.title)).toBeInTheDocument();
  });

  it('o estado dos exercícios não vaza para a aula seguinte', async () => {
    const user = userEvent.setup();
    const { atual, proxima, passosDaAtual } = parQueEncolhe();

    abrir(atual);
    for (let i = 1; i < passosDaAtual; i++) {
      await user.click(screen.getByRole('button', { name: /Continuar|Pular por ora/ }));
    }
    await user.click(screen.getByRole('link', { name: /Próxima aula/ }));

    // O contador de exercícios resolvidos começa zerado na aula nova.
    const exercicios = buildLessonSteps(getLesson(proxima)!).filter((p) => p.kind === 'exercise');
    if (exercicios.length > 0) {
      expect(
        screen.getByLabelText(`0 de ${exercicios.length} exercícios resolvidos`)
      ).toBeInTheDocument();
    }
  });
});

describe('a próxima aula é a seguinte da trilha', () => {
  it('não volta para uma aula anterior que ficou pendente', () => {
    // `getLessonAfter` responde pela ordem, não pelo que falta — usar a versão
    // que devolve "a primeira pendente" mandava quem pulou a aula 3 e terminou
    // a 7 de volta para a 3.
    const aulas = getLessonsOfTrack(listTracks()[0].id);

    for (let i = 0; i < aulas.length - 1; i++) {
      expect(getLessonAfter(aulas[i].id)?.id).toBe(aulas[i + 1].id);
    }

    expect(getLessonAfter(aulas[aulas.length - 1].id)).toBeUndefined();
  });
});
