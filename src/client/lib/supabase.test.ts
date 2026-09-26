import { describe, expect, it } from 'vitest';

import { papelDaChaveLegada } from './supabase';

/** Um JWT com o conteúdo dado e uma assinatura qualquer. */
function jwt(conteudo: object): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(conteudo)}.assinatura`;
}

describe('a chave legada diz o próprio papel', () => {
  it('reconhece a service_role, que nunca pode ir para o navegador', () => {
    // A validação antiga só olhava o prefixo — e a service_role legada começa
    // com `eyJ`, como a anon. Ela passava.
    expect(papelDaChaveLegada(jwt({ iss: 'supabase', role: 'service_role' }))).toBe('service_role');
  });

  it('reconhece a anon', () => {
    expect(papelDaChaveLegada(jwt({ iss: 'supabase', role: 'anon' }))).toBe('anon');
  });

  it('não inventa papel para o que não é JWT', () => {
    expect(papelDaChaveLegada('sb_publishable_abc')).toBeNull();
    expect(papelDaChaveLegada('a.%%%.c')).toBeNull();
  });
});
