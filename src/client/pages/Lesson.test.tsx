import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { getLesson } from '../../content';
import { buildLessonSteps } from '../lib/lesson-steps';
import { Lesson } from './Lesson';
import { botaoDeAvanco, irAtePasso, responderErrado } from './aula.test-utils';

/**
 * Testes da navegação em passos.
 *
 * A reformulação inteira foi feita sem rede automática: typecheck e testes de
 * lógica pura não veem nada do que acontece na tela. Estes cobrem o que mais
 * quebraria em silêncio — o aluno preso num passo, o progresso mentindo, ou o
 * conteúdo da aula anterior vazando para a próxima.
 */

// O Monaco não roda no jsdom e não é o objeto destes testes: um textarea
// preserva o contrato (valor entra, alteração sai) sem arrastar o editor real.
vi.mock('../components/ui/CodeEditor', () => ({
  CodeEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="Editor de código" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
// Atravessar a aula pede responder os exercícios; os que rodam código usam o
// sandbox, que não existe no jsdom. Vazio é "errou" em todos.
vi.mock('../lib/sandbox', () => ({
  executeCode: () => Promise.resolve({ output: '', logs: [], testResults: [], error: null, timedOut: false }),
}));

// Sem sessão: o aluno segue navegando, só não gera histórico.
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

function abrirAula(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/lesson/${id}`]}>
      <Routes>
        <Route path="/lesson/:id" element={<Lesson />} />
        <Route path="/app" element={<p>tela inicial</p>} />
      </Routes>
    </MemoryRouter>
  );
}

const AULA = 'lesson-js-4';
const totalDePassos = buildLessonSteps(getLesson(AULA)!).length;

/** O contador de passos, no cabeçalho. */
function passoAtual() {
  const cabecalho = screen.getByRole('banner');
  const texto = within(cabecalho).getByText(/Passo \d+ de \d+/).textContent ?? '';
  // O contador traz também a linguagem; aqui só interessa a posição.
  return texto.split(' · ')[0];
}

async function avancar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(botaoDeAvanco());
}

describe('navegação entre passos', () => {
  it('abre no primeiro passo', () => {
    abrirAula(AULA);
    expect(passoAtual()).toBe(`Passo 1 de ${totalDePassos}`);
  });

  it('mostra o objetivo da aula apenas no primeiro passo', async () => {
    const user = userEvent.setup();
    abrirAula(AULA);

    const objetivo = getLesson(AULA)!.objective;
    expect(screen.getByText(objetivo)).toBeInTheDocument();

    await avancar(user);
    expect(screen.queryByText(objetivo)).not.toBeInTheDocument();
  });

  it('avança e volta', async () => {
    const user = userEvent.setup();
    abrirAula(AULA);

    await avancar(user);
    expect(passoAtual()).toBe(`Passo 2 de ${totalDePassos}`);

    await user.click(screen.getByRole('button', { name: 'Passo anterior' }));
    expect(passoAtual()).toBe(`Passo 1 de ${totalDePassos}`);
  });

  it('não deixa voltar antes do primeiro passo', () => {
    abrirAula(AULA);
    expect(screen.getByRole('button', { name: 'Passo anterior' })).toBeDisabled();
  });

  it('a barra de progresso acompanha o passo', async () => {
    const user = userEvent.setup();
    abrirAula(AULA);

    const barra = screen.getByRole('progressbar', { name: 'Progresso da aula' });
    expect(barra).toHaveAttribute('aria-valuenow', '1');
    expect(barra).toHaveAttribute('aria-valuemax', String(totalDePassos));

    await avancar(user);
    expect(barra).toHaveAttribute('aria-valuenow', '2');
  });

  it('no último passo oferece saída, não avanço', async () => {
    const user = userEvent.setup();
    abrirAula(AULA);

    await irAtePasso(user, buildLessonSteps(getLesson(AULA)!), totalDePassos - 1);

    expect(passoAtual()).toBe(`Passo ${totalDePassos} de ${totalDePassos}`);
    expect(screen.queryByRole('button', { name: /Continuar|Responda para continuar/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Próxima aula|Voltar ao início/ })).toBeInTheDocument();
  });
});

describe('o exercício pede uma resposta, mas não prende quem erra', () => {
  it('sem resposta o avanço espera; depois de errar, libera e diz isso', async () => {
    const user = userEvent.setup();
    abrirAula(AULA);

    // Avança até o primeiro passo de exercício.
    const passos = buildLessonSteps(getLesson(AULA)!);
    const indiceDoExercicio = passos.findIndex((p) => p.kind === 'exercise');
    expect(indiceDoExercicio).toBeGreaterThan(-1);
    const passo = passos[indiceDoExercicio];
    if (passo.kind !== 'exercise') throw new Error('passo inesperado');

    for (let i = 0; i < indiceDoExercicio; i++) await avancar(user);

    // "Pular por ora" existiu aqui e saiu: sem resposta, não há para onde ir.
    const botao = screen.getByRole('button', { name: 'Responda para continuar' });
    expect(botao).toBeDisabled();
    await user.click(botao);
    expect(passoAtual()).toBe(`Passo ${indiceDoExercicio + 1} de ${totalDePassos}`);

    // Errar não tranca ninguém — dificuldade não vira parede (§280).
    await responderErrado(user, passo.exercise);
    const seguir = screen.getByRole('button', { name: 'Continuar assim mesmo' });
    expect(seguir).toBeEnabled();
    await user.click(seguir);
    expect(passoAtual()).toBe(`Passo ${indiceDoExercicio + 2} de ${totalDePassos}`);
  });
});

describe('aula inexistente', () => {
  it('redireciona em vez de quebrar', () => {
    abrirAula('nao-existe');
    expect(screen.getByText('tela inicial')).toBeInTheDocument();
  });
});

describe('acessibilidade da navegação', () => {
  it('a troca de passo é anunciada, sem texto duplicado', () => {
    abrirAula(AULA);

    const contadores = screen.getAllByText(/Passo \d+ de \d+/);
    // Duplicar num span oculto faria o leitor anunciar a mesma coisa duas vezes.
    expect(contadores).toHaveLength(1);
    expect(contadores[0]).toHaveAttribute('aria-live', 'polite');
  });

  it('a saída da aula tem nome acessível', () => {
    abrirAula(AULA);
    expect(screen.getByRole('link', { name: 'Sair da aula' })).toBeInTheDocument();
  });

  it('o cabeçalho mostra o título da aula', () => {
    abrirAula(AULA);
    const cabecalho = screen.getByRole('banner');
    expect(within(cabecalho).getByText(getLesson(AULA)!.title)).toBeInTheDocument();
  });
});
