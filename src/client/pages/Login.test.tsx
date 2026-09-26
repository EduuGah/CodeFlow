import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { destinoDepoisDoLogin, Login } from './Login';

const signInWithPassword = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    authError: null,
    isConfigured: true,
    signInWithGoogle: vi.fn(),
    signInWithPassword,
  }),
}));

function renderizar() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

/**
 * As contas de demonstração são a porta de quem chega pelo portfólio: um
 * clique precisa entrar, sem conta Google.
 */
describe('Login — testar sem criar conta', () => {
  beforeEach(() => {
    signInWithPassword.mockReset();
    signInWithPassword.mockResolvedValue(undefined);
  });

  it('entra como aluno com um clique', () => {
    renderizar();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar como aluno' }));
    expect(signInWithPassword).toHaveBeenCalledWith('aluno', 'aluno');
  });

  it('entra como admin com um clique', () => {
    renderizar();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar como admin' }));
    expect(signInWithPassword).toHaveBeenCalledWith('admin', 'admin');
  });

  it('aceita o usuário e a senha digitados', () => {
    renderizar();
    fireEvent.change(screen.getByLabelText('Usuário'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'admin' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar com usuário e senha' }));
    expect(signInWithPassword).toHaveBeenCalledWith('admin', 'admin');
  });
});

describe('para onde voltar depois de entrar', () => {
  it('volta para a rota que a pessoa tentou abrir', () => {
    expect(destinoDepoisDoLogin({ from: { pathname: '/lesson/lesson-js-3', search: '' } })).toBe('/lesson/lesson-js-3');
    expect(destinoDepoisDoLogin({ from: { pathname: '/app/trilhas', search: '?aba=projetos' } })).toBe(
      '/app/trilhas?aba=projetos'
    );
  });

  it('sem rota guardada, ou com uma de fora, vai para o início', () => {
    expect(destinoDepoisDoLogin(null)).toBe('/app');
    expect(destinoDepoisDoLogin({ from: { pathname: '//outro.site/x' } })).toBe('/app');
    expect(destinoDepoisDoLogin({ from: { pathname: 'https://outro.site' } })).toBe('/app');
    expect(destinoDepoisDoLogin({ from: { pathname: '/login' } })).toBe('/app');
  });
});
