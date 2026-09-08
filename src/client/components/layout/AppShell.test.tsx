import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AppShell } from './AppShell';

/**
 * Testes da navegação.
 *
 * Cobrem duas regras que o produto assumiu e que quebrariam sem alarme: todo
 * item aponta para uma tela que existe, e a barra inferior fica entre três e
 * cinco itens. Um destino a mais não gera erro nenhum — só torna a barra
 * inutilizável no polegar.
 */

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

const ROTAS_REAIS = ['/app', '/app/trilhas', '/app/praticar', '/app/perfil'];

function abrir(rota: string) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<p>conteúdo do início</p>} />
          <Route path="trilhas" element={<p>conteúdo de trilhas</p>} />
          <Route path="praticar" element={<p>conteúdo de praticar</p>} />
          <Route path="perfil" element={<p>conteúdo de perfil</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

/** A barra inferior; a lateral tem os mesmos destinos e é a segunda no DOM. */
function barraInferior() {
  return screen.getAllByRole('navigation', { name: 'Navegação principal' })[1];
}

describe('destinos', () => {
  it('a barra inferior tem entre três e cinco itens', () => {
    abrir('/app');
    const itens = within(barraInferior()).getAllByRole('link');

    // Acima de cinco, a barra vira uma fileira de ícones indistinguíveis.
    expect(itens.length).toBeGreaterThanOrEqual(3);
    expect(itens.length).toBeLessThanOrEqual(5);
  });

  it('todo item aponta para uma rota que existe', () => {
    abrir('/app');

    for (const item of within(barraInferior()).getAllByRole('link')) {
      const destino = item.getAttribute('href');
      // Item apontando para o vazio é o mesmo problema do botão que não faz nada.
      expect(ROTAS_REAIS, `destino ${destino} não é uma rota do app`).toContain(destino);
    }
  });

  it('lateral e barra inferior levam aos mesmos lugares', () => {
    abrir('/app');
    const navs = screen.getAllByRole('navigation', { name: 'Navegação principal' });

    const destinos = navs.map((nav) =>
      within(nav)
        .getAllByRole('link')
        .map((l) => l.getAttribute('href'))
    );

    expect(destinos[0]).toEqual(destinos[1]);
  });

  it('cada item tem rótulo em texto, não só ícone', () => {
    abrir('/app');

    for (const item of within(barraInferior()).getAllByRole('link')) {
      expect(item.textContent?.trim()).toBeTruthy();
    }
  });
});

describe('estado ativo', () => {
  it.each([
    ['/app', 'Início'],
    ['/app/trilhas', 'Trilhas'],
    ['/app/praticar', 'Praticar'],
    ['/app/perfil', 'Perfil'],
  ])('em %s o item %s fica marcado como página atual', (rota, rotulo) => {
    abrir(rota);

    const ativo = within(barraInferior()).getByRole('link', { name: rotulo });
    expect(ativo).toHaveAttribute('aria-current', 'page');
  });

  it('o início não fica ativo enquanto se navega nas outras abas', () => {
    abrir('/app/trilhas');

    const inicio = within(barraInferior()).getByRole('link', { name: 'Início' });
    // Sem `end` na rota índice, o início ficaria ativo em todas as abas.
    expect(inicio).not.toHaveAttribute('aria-current');
  });

  it('apenas um item fica ativo por vez', () => {
    abrir('/app/praticar');

    const ativos = within(barraInferior())
      .getAllByRole('link')
      .filter((l) => l.getAttribute('aria-current') === 'page');

    expect(ativos).toHaveLength(1);
  });
});

describe('conteúdo da aba', () => {
  it.each([
    ['/app', 'conteúdo do início'],
    ['/app/trilhas', 'conteúdo de trilhas'],
    ['/app/praticar', 'conteúdo de praticar'],
    ['/app/perfil', 'conteúdo de perfil'],
  ])('%s renderiza a tela correspondente', (rota, texto) => {
    abrir(rota);
    expect(screen.getByText(texto)).toBeInTheDocument();
  });
});
