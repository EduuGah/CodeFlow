import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { listProjects } from '../../content';
import { ProjectWorkspace } from './ProjectWorkspace';

/**
 * As abas do workspace declaram `role="tab"`, e isso é uma promessa: o leitor de
 * tela anuncia "aba, 1 de 2" e a pessoa espera as setas funcionarem. Estes testes
 * cobrem a promessa inteira — seleção, foco, uma parada de Tab por grupo e a
 * ligação entre cada aba e o painel que ela controla.
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
vi.mock('../lib/sandbox', () => ({
  executeCode: vi.fn(async () => ({ output: [], testResults: [] })),
}));

const projeto = listProjects()[0];

function abrir() {
  return render(
    <MemoryRouter initialEntries={[`/projeto/${projeto.id}`]}>
      <Routes>
        <Route path="/projeto/:id" element={<ProjectWorkspace />} />
      </Routes>
    </MemoryRouter>
  );
}

function abas() {
  return screen.getAllByRole('tab');
}

describe('abas do projeto pelo teclado', () => {
  it('o grupo de abas é uma única parada de Tab', () => {
    abrir();

    const tabbable = abas().filter((t) => t.getAttribute('tabindex') !== '-1');
    // Uma aba por parada faria o Tab custar tantas paradas quantos painéis.
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('a seta direita troca de aba', async () => {
    const user = userEvent.setup();
    abrir();

    await user.click(abas()[0]);
    await user.keyboard('{ArrowRight}');

    expect(abas()[1]).toHaveAttribute('aria-selected', 'true');
    expect(abas()[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('a seta leva o foco junto', async () => {
    const user = userEvent.setup();
    abrir();

    await user.click(abas()[0]);
    await user.keyboard('{ArrowRight}');

    // Trocar a aba sem mover o foco deixaria a pessoa navegando o painel antigo.
    expect(document.activeElement).toBe(abas()[1]);
  });

  it('a seta esquerda volta, e dá a volta no fim', async () => {
    const user = userEvent.setup();
    abrir();

    await user.click(abas()[0]);
    await user.keyboard('{ArrowLeft}');

    expect(abas()[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('cada aba aponta para o painel que ela controla', () => {
    abrir();

    for (const aba of abas()) {
      const painelId = aba.getAttribute('aria-controls')!;
      const painel = document.getElementById(painelId);

      // `aria-controls` apontando para o vazio faz o leitor de tela oferecer um
      // salto que não vai a lugar nenhum.
      expect(painel, `aba ${aba.textContent} aponta para #${painelId}, que não existe`).not.toBeNull();
      expect(painel).toHaveAttribute('role', 'tabpanel');
    }
  });

  it('cada painel é nomeado pela sua aba', () => {
    abrir();

    const paineis = screen.getAllByRole('tabpanel', { hidden: true });
    expect(paineis).toHaveLength(abas().length);

    for (const painel of paineis) {
      const rotuloId = painel.getAttribute('aria-labelledby')!;
      expect(document.getElementById(rotuloId)).toHaveAttribute('role', 'tab');
    }
  });

  it('a lista de abas tem nome', () => {
    abrir();
    expect(screen.getByRole('tablist')).toHaveAccessibleName('Painéis do projeto');
  });

  it('as setas não sequestram outras teclas', async () => {
    const user = userEvent.setup();
    abrir();

    await user.click(abas()[0]);
    await user.keyboard('{ArrowUp}{ArrowDown}');

    // Só esquerda e direita movem; senão a rolagem pararia de funcionar.
    expect(abas()[0]).toHaveAttribute('aria-selected', 'true');
  });
});

describe('ações do workspace', () => {
  it('a saída do projeto é a primeira parada de Tab', async () => {
    const user = userEvent.setup();
    abrir();

    await user.tab();
    expect(document.activeElement).toHaveAccessibleName('Sair do projeto');
  });

  it('nenhum controle chega ao teclado sem nome', () => {
    abrir();

    const controles = [
      ...screen.getAllByRole('button'),
      ...screen.getAllByRole('link'),
      ...screen.getAllByRole('tab'),
    ];

    for (const controle of controles) {
      expect(
        controle.textContent?.trim() || controle.getAttribute('aria-label'),
        `controle sem nome: ${controle.outerHTML.slice(0, 120)}`
      ).toBeTruthy();
    }
  });
});
