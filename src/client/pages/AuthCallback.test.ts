import { describe, expect, it, vi } from 'vitest';

import { erroDoProvedor } from './AuthCallback';

describe('o erro que o provedor devolve na URL', () => {
  it('sem erro, nada a dizer', () => {
    expect(erroDoProvedor('?code=abc', '')).toBeNull();
  });

  it('os conhecidos viram a nossa frase', () => {
    expect(erroDoProvedor('?error=access_denied', '')).toMatch(/cancelou a autorização/);
    expect(erroDoProvedor('', '#error=server_error')).toMatch(/servidor de login falhou/);
  });

  it('o texto da URL nunca chega à tela', () => {
    // Qualquer um escreve um link com a descrição que quiser; a página a
    // mostrava como se fosse dela.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const frase = erroDoProvedor('?error=invalid_request&error_description=Sua+conta+foi+bloqueada.+Ligue+para+0800', '');

    expect(frase).not.toMatch(/bloqueada|0800/);
    expect(frase).toMatch(/não concluiu o login/);
  });
});
