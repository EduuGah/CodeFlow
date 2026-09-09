import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getLesson } from '../../content';
import { buildLessonSteps } from '../lib/lesson-steps';
import { Lesson } from './Lesson';

/**
 * O fluxo de conclusão de uma atividade, nos quatro tipos.
 *
 * Estes testes existem por causa de três defeitos que a suíte inteira — mais de
 * quinhentos testes — não via, porque nenhum deles olhava para o que o aluno lê
 * depois de responder:
 *
 * 1. múltipla escolha e prever-saída não recebiam `onSolved`, então o botão do
 *    rodapé dizia "Pular por ora" para quem tinha acabado de acertar. Eram 36
 *    dos 78 exercícios publicados;
 * 2. acertar o **primeiro** exercício marcava a aula inteira como concluída e
 *    soltava o confete de conclusão no meio da aula;
 * 3. o resumo afirmava "Aula concluída — seu progresso foi salvo" mesmo para
 *    quem tinha pulado todos os exercícios e não tinha salvo nada.
 */

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea
      aria-label="Editor de código"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const marcarConcluida = vi.fn(() => Promise.resolve());

vi.mock('../lib/progress', () => ({
  fetchProgress: () => Promise.resolve({ completedLessons: [], completedProjects: [] }),
  fetchSolvedExercises: () => Promise.resolve([]),
  markLessonCompleted: () => marcarConcluida(),
  recordAttempt: () => Promise.resolve(),
}));

// O sandbox roda num Web Worker, que não existe no jsdom. O que está sob teste
// aqui é o fluxo da atividade, não a execução.
const executarMock = vi.fn();
vi.mock('../lib/sandbox', () => ({
  executeCode: (...args: unknown[]) => executarMock(...args),
}));

// O objeto do aluno precisa ser o MESMO a cada chamada. Um objeto novo por
// render faria os efeitos da aula dispararem sem parar — que é justamente o
// laço que a página passou a evitar dependendo de `user.id`, e não de `user`.
const ALUNO = { id: 'aluno-de-teste' };
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: ALUNO }),
}));

const AULA = 'lesson-js-1';
const passos = buildLessonSteps(getLesson(AULA)!);
const total = passos.length;

/** Índice do primeiro passo de um tipo de exercício. Lança em vez de pular. */
function passoDoTipo(tipo: string): number {
  const i = passos.findIndex((p) => p.kind === 'exercise' && p.exercise.type === tipo);
  if (i === -1) throw new Error(`${AULA} não tem exercício do tipo "${tipo}"`);
  return i;
}

function exercicioDoTipo<T extends string>(tipo: T) {
  const passo = passos[passoDoTipo(tipo)];
  if (passo.kind !== 'exercise') throw new Error('passo inesperado');
  return passo.exercise;
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

function botaoDeAvanco() {
  return screen.getByRole('button', { name: /Continuar|Pular por ora|Continuar assim mesmo/ });
}

async function irAtePasso(user: ReturnType<typeof userEvent.setup>, indice: number) {
  for (let i = 0; i < indice; i++) await user.click(botaoDeAvanco());
}

beforeEach(() => {
  marcarConcluida.mockClear();
  executarMock.mockReset();
});

describe('múltipla escolha', () => {
  it('acertar troca o convite de pular para continuar', async () => {
    const user = userEvent.setup();
    abrir();
    await irAtePasso(user, passoDoTipo('multiple-choice'));

    // O defeito original vivia exatamente aqui.
    expect(botaoDeAvanco()).toHaveTextContent('Pular por ora');

    const exercicio = exercicioDoTipo('multiple-choice');
    if (exercicio.type !== 'multiple-choice') throw new Error('tipo inesperado');

    await user.click(screen.getAllByRole('radio')[exercicio.correctIndex]);
    await user.click(screen.getByRole('button', { name: 'Verificar resposta' }));

    expect(botaoDeAvanco()).toHaveTextContent('Continuar');
  });

  it('errar libera o avanço sem fingir que resolveu', async () => {
    const user = userEvent.setup();
    abrir();
    await irAtePasso(user, passoDoTipo('multiple-choice'));

    const exercicio = exercicioDoTipo('multiple-choice');
    if (exercicio.type !== 'multiple-choice') throw new Error('tipo inesperado');

    const errada = exercicio.correctIndex === 0 ? 1 : 0;
    await user.click(screen.getAllByRole('radio')[errada]);
    await user.click(screen.getByRole('button', { name: 'Verificar resposta' }));

    const botao = botaoDeAvanco();
    expect(botao).toHaveTextContent('Continuar assim mesmo');
    expect(botao).toBeEnabled();
  });

  it('mudar de alternativa depois de responder volta ao estado de resposta', async () => {
    const user = userEvent.setup();
    abrir();
    await irAtePasso(user, passoDoTipo('multiple-choice'));

    const exercicio = exercicioDoTipo('multiple-choice');
    if (exercicio.type !== 'multiple-choice') throw new Error('tipo inesperado');

    const errada = exercicio.correctIndex === 0 ? 1 : 0;
    await user.click(screen.getAllByRole('radio')[errada]);
    await user.click(screen.getByRole('button', { name: 'Verificar resposta' }));
    expect(botaoDeAvanco()).toHaveTextContent('Continuar assim mesmo');

    await user.click(screen.getAllByRole('radio')[exercicio.correctIndex]);
    // A resposta mudou e ainda não foi verificada: nada a afirmar sobre ela.
    expect(botaoDeAvanco()).toHaveTextContent('Pular por ora');
  });
});

describe('prever a saída', () => {
  it('previsão certa troca o convite de pular para continuar', async () => {
    const user = userEvent.setup();
    const exercicio = exercicioDoTipo('predict-output');
    if (exercicio.type !== 'predict-output') throw new Error('tipo inesperado');

    executarMock.mockResolvedValue({
      output: exercicio.expectedOutput,
      error: null,
      testResults: [],
      timedOut: false,
    });

    abrir();
    await irAtePasso(user, passoDoTipo('predict-output'));
    expect(botaoDeAvanco()).toHaveTextContent('Pular por ora');

    await user.type(
      screen.getByRole('textbox', { name: /O que você acha que será impresso/ }),
      exercicio.expectedOutput
    );
    await user.click(screen.getByRole('button', { name: /Executar e comparar/ }));

    expect(botaoDeAvanco()).toHaveTextContent('Continuar');
  });

  it('previsão errada libera o avanço sem fingir que resolveu', async () => {
    const user = userEvent.setup();
    const exercicio = exercicioDoTipo('predict-output');
    if (exercicio.type !== 'predict-output') throw new Error('tipo inesperado');

    executarMock.mockResolvedValue({
      output: exercicio.expectedOutput,
      error: null,
      testResults: [],
      timedOut: false,
    });

    abrir();
    await irAtePasso(user, passoDoTipo('predict-output'));

    await user.type(
      screen.getByRole('textbox', { name: /O que você acha que será impresso/ }),
      'previsao claramente errada'
    );
    await user.click(screen.getByRole('button', { name: /Executar e comparar/ }));

    expect(botaoDeAvanco()).toHaveTextContent('Continuar assim mesmo');
  });
});

describe('conclusão da aula', () => {
  it('acertar um exercício não conclui a aula inteira', async () => {
    const user = userEvent.setup();
    abrir();
    await irAtePasso(user, passoDoTipo('multiple-choice'));

    const exercicio = exercicioDoTipo('multiple-choice');
    if (exercicio.type !== 'multiple-choice') throw new Error('tipo inesperado');

    await user.click(screen.getAllByRole('radio')[exercicio.correctIndex]);
    await user.click(screen.getByRole('button', { name: 'Verificar resposta' }));

    // A aula tem mais de um exercício; concluir aqui marcaria como feita uma
    // aula com um quinto do trabalho entregue.
    expect(marcarConcluida).not.toHaveBeenCalled();
  });

  it('o resumo não afirma conclusão de quem pulou os exercícios', async () => {
    const user = userEvent.setup();
    abrir();
    await irAtePasso(user, total - 1);

    expect(screen.queryByText('Aula concluída')).not.toBeInTheDocument();
    expect(screen.queryByText(/progresso foi salvo/)).not.toBeInTheDocument();
    expect(marcarConcluida).not.toHaveBeenCalled();
  });

  it('o resumo diz quantos exercícios ficaram para trás', async () => {
    const user = userEvent.setup();
    abrir();
    await irAtePasso(user, total - 1);

    const quantos = passos.filter((p) => p.kind === 'exercise').length;
    expect(
      screen.getByText(`Faltam ${quantos} exercícios para fechar esta aula`)
    ).toBeInTheDocument();
  });

  it('o rodapé do resumo leva embora mesmo com exercícios pendentes', async () => {
    const user = userEvent.setup();
    abrir();
    await irAtePasso(user, total - 1);

    expect(screen.getByRole('link', { name: /Próxima aula|Voltar ao início/ })).toBeInTheDocument();
  });
});
