import { beforeEach, describe, expect, it, vi } from 'vitest';

const dublê = vi.hoisted(() => {
  const inseridos: unknown[] = [];
  const cliente = {
    from: (tabela: string) => ({
      insert: (linha: unknown) => {
        inseridos.push({ tabela, linha });
        return Promise.resolve({ error: null });
      },
    }),
  };
  return { inseridos, cliente };
});

vi.mock('./supabase', () => ({ supabase: dublê.cliente }));

import {
  codigoDoErro,
  LIMITE_POR_PAGINA,
  montarEvento,
  registrar,
  reiniciarRegistro,
  type DadosDoEvento,
} from './registro';

beforeEach(() => {
  dublê.inseridos.length = 0;
  reiniciarRegistro();
});

describe('a lista branca', () => {
  it('passa só os campos conhecidos, cada um no formato', () => {
    expect(
      montarEvento('falha_de_leitura', { operacao: 'fetchAttempts', codigo: 'PGRST204', duracaoMs: 2345.6 }, '/app')
    ).toEqual({ tipo: 'falha_de_leitura', dados: { rota: '/app', operacao: 'fetchAttempts', codigo: 'PGRST204', duracao_ms: 2346 } });
  });

  it('a mensagem de um erro nunca vai, nem com outro nome', () => {
    // O que viesse por engano — um campo a mais, um objeto de erro inteiro.
    const dados = {
      nome: 'TypeError',
      mensagem: 'não foi possível ler aluno@exemplo.com',
      message: 'const senha = "123"',
      stack: 'at Lesson.tsx:20',
    } as unknown as DadosDoEvento;
    const evento = montarEvento('erro_de_tela', dados, '/lesson/lesson-js-1');
    expect(evento).toEqual({ tipo: 'erro_de_tela', dados: { rota: '/lesson/lesson-js-1', nome: 'TypeError' } });
    expect(JSON.stringify(evento)).not.toMatch(/aluno@|senha|Lesson\.tsx/);
  });

  it('um valor fora do formato some, em vez de ir cortado', () => {
    const evento = montarEvento(
      'falha_do_motor',
      {
        nome: 'Erro com espaço e ponto.',
        codigo: 'drop table users;',
        operacao: 'fetch attempts()',
        exercicio: 'Ex_Inventado!',
        motor: 'cobol' as DadosDoEvento['motor'],
        etapa: 'depois' as DadosDoEvento['etapa'],
      },
      '/app'
    );
    expect(evento?.dados).toEqual({ rota: '/app' });
  });

  it('a rota vai sem busca nem âncora — é onde um token de login passaria', () => {
    expect(montarEvento('erro_de_tela', {}, '/auth/callback?code=segredo#access_token=x')?.dados.rota).toBe('/auth/callback');
    // Caminho fora do formato dos ids do catálogo: fica de fora.
    expect(montarEvento('erro_de_tela', {}, '/perfil/Aluno@Exemplo.com')?.dados.rota).toBeUndefined();
  });

  it('a duração é limitada a dez minutos e nunca negativa', () => {
    expect(montarEvento('consulta_lenta', { duracaoMs: 9e9 }, '/app')?.dados.duracao_ms).toBe(600_000);
    expect(montarEvento('consulta_lenta', { duracaoMs: -5 }, '/app')?.dados.duracao_ms).toBe(0);
    expect(montarEvento('consulta_lenta', { duracaoMs: Number.NaN }, '/app')?.dados.duracao_ms).toBeUndefined();
  });

  it('um tipo que não existe não vira evento', () => {
    expect(montarEvento('outra_coisa' as 'erro_de_tela', {}, '/app')).toBeNull();
  });

  it('do erro do Supabase, só o código', () => {
    expect(codigoDoErro({ code: '42703', message: 'column users.email does not exist' })).toBe('42703');
    expect(codigoDoErro(new Error('x'))).toBeUndefined();
    expect(codigoDoErro(null)).toBeUndefined();
  });
});

describe('o envio', () => {
  it('vai para a tabela de eventos, já limpo', () => {
    // Estes testes rodam no Node, sem janela: sem rota atual.
    registrar('falha_de_escrita', { operacao: 'recordAttempt', codigo: '23514' });
    expect(dublê.inseridos).toEqual([
      { tabela: 'eventos', linha: { tipo: 'falha_de_escrita', dados: { operacao: 'recordAttempt', codigo: '23514' } } },
    ]);
  });

  it('o mesmo evento em seguida vai uma vez só', () => {
    registrar('falha_de_leitura', { operacao: 'fetchAttempts' });
    registrar('falha_de_leitura', { operacao: 'fetchAttempts' });
    registrar('falha_de_leitura', { operacao: 'fetchReviews' });
    expect(dublê.inseridos).toHaveLength(2);
  });

  it('por página, no máximo o limite — um laço de erro não vira enxurrada', () => {
    for (let i = 0; i < LIMITE_POR_PAGINA + 20; i++) registrar('falha_de_leitura', { operacao: 'fetchAttempts', duracaoMs: i });
    expect(dublê.inseridos).toHaveLength(LIMITE_POR_PAGINA);
  });
});
