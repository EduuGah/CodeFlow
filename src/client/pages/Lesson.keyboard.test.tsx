import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { getLesson } from '../../content';
import { buildLessonSteps } from '../lib/lesson-steps';
import { Lesson } from './Lesson';

/**
 * Percurso da aula usando só o teclado.
 *
 * Foco visível e nomes acessíveis já existiam, mas ninguém havia atravessado uma
 * aula inteira com Tab. Estes testes fazem esse percurso: quem não usa mouse
 * precisa conseguir ler, responder e avançar — e precisa saber onde está depois
 * de cada troca de passo.
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
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));

const AULA = 'lesson-js-4';
const passos = buildLessonSteps(getLesson(AULA)!);

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

function acaoPrincipal() {
  return screen.getByRole('button', { name: /Continuar|Pular por ora/ });
}

/** Tabula até encontrar o elemento, ou desiste — um laço infinito seria pior. */
async function tabularAte(
  user: ReturnType<typeof userEvent.setup>,
  alvo: HTMLElement,
  limite = 30
): Promise<number> {
  for (let i = 1; i <= limite; i++) {
    await user.tab();
    if (document.activeElement === alvo) return i;
  }
  return -1;
}

describe('percurso com Tab', () => {
  it('a saída da aula é o primeiro ponto de parada', async () => {
    const user = userEvent.setup();
    abrir();

    await user.tab();
    expect(document.activeElement).toHaveAccessibleName('Sair da aula');
  });

  it('chega à ação principal sem passar por dezenas de paradas', async () => {
    const user = userEvent.setup();
    abrir();

    const paradas = await tabularAte(user, acaoPrincipal());

    expect(paradas).toBeGreaterThan(0);
    // Um passo de leitura tem poucos elementos focáveis; muitas paradas aqui
    // indicariam que algo não interativo entrou na ordem de tabulação.
    expect(paradas).toBeLessThanOrEqual(5);
  });

  it('avança de passo pelo teclado', async () => {
    const user = userEvent.setup();
    abrir();

    await tabularAte(user, acaoPrincipal());
    await user.keyboard('{Enter}');

    expect(screen.getByText(/Passo 2 de/)).toBeInTheDocument();
  });

  it('o botão de voltar desabilitado sai da ordem de tabulação', async () => {
    const user = userEvent.setup();
    abrir();

    // Parada morta no caminho de quem navega por teclado.
    const voltar = screen.getByRole('button', { name: 'Passo anterior' });
    expect(voltar).toBeDisabled();
    expect(await tabularAte(user, voltar, 12)).toBe(-1);
  });

  it('não há armadilha de foco: o Tab nunca fica preso no mesmo elemento', async () => {
    const user = userEvent.setup();
    abrir();

    let anterior: Element | null = null;
    let travou = 0;

    for (let i = 0; i < 20; i++) {
      await user.tab();
      if (document.activeElement === anterior) travou += 1;
      anterior = document.activeElement;
    }

    expect(travou).toBe(0);
  });

  it('o conteúdo não entra na ordem de tabulação, apesar de receber foco', async () => {
    const user = userEvent.setup();
    abrir();

    // `tabIndex={-1}` existe para foco por script. Se virasse parada de Tab, todo
    // passo custaria uma tabulação a mais sem oferecer nada.
    const conteudo = screen.getByRole('main');
    expect(await tabularAte(user, conteudo, 12)).toBe(-1);
  });
});

describe('orientação depois de trocar de passo', () => {
  it('o foco vai para o conteúdo novo, não fica parado no rodapé', async () => {
    const user = userEvent.setup();
    abrir();

    await tabularAte(user, acaoPrincipal());
    await user.keyboard('{Enter}');

    // Sem isto o foco continua no botão do rodapé enquanto a tela inteira mudou
    // acima: quem usa leitor de tela não tem como alcançar o que apareceu.
    expect(document.activeElement).toBe(screen.getByRole('main'));
  });

  it('o nome do conteúdo acompanha o passo', async () => {
    const user = userEvent.setup();
    abrir();

    expect(screen.getByRole('main')).toHaveAccessibleName(`Passo 1 de ${passos.length}`);

    await user.click(acaoPrincipal());
    expect(screen.getByRole('main')).toHaveAccessibleName(`Passo 2 de ${passos.length}`);
  });

  it('não rouba o foco de quem acabou de abrir a aula', () => {
    abrir();

    // Mover o foco na montagem tiraria a pessoa do começo do documento sem
    // que ela tenha pedido nada.
    expect(document.activeElement).toBe(document.body);
  });

  it('a troca de passo é anunciada', async () => {
    const user = userEvent.setup();
    abrir();

    expect(screen.getByText(/Passo 1 de \d+/)).toHaveAttribute('aria-live', 'polite');

    await user.click(acaoPrincipal());
    expect(screen.getByText(/Passo 2 de/)).toHaveAttribute('aria-live', 'polite');
  });

  it('a barra de progresso informa o passo, não só a largura', async () => {
    const user = userEvent.setup();
    abrir();

    const barra = screen.getByRole('progressbar', { name: 'Progresso da aula' });
    expect(barra).toHaveAttribute('aria-valuenow', '1');

    await user.click(acaoPrincipal());
    expect(barra).toHaveAttribute('aria-valuenow', '2');
  });
});

describe('todo controle alcançável tem nome', () => {
  it('em nenhum passo há botão ou link anônimo', async () => {
    const user = userEvent.setup();
    abrir();

    for (let i = 0; i < passos.length; i++) {
      const controles = [...screen.getAllByRole('button'), ...screen.getAllByRole('link')];

      for (const controle of controles) {
        // Ícone sem rótulo é o caso comum: vira "botão" no leitor de tela.
        expect(
          controle.textContent?.trim() || controle.getAttribute('aria-label'),
          `passo ${i + 1}: controle sem nome — ${controle.outerHTML.slice(0, 120)}`
        ).toBeTruthy();
      }

      if (i < passos.length - 1) await user.click(acaoPrincipal());
    }
  });
});
