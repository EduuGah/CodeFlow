import { describe, expect, it } from 'vitest';

import { avancoLiberado, estaResolvido, pendentes, rotuloDeAvanco, type ExerciseState } from './exercise-state';

/**
 * O rótulo do botão de avanço é a frase que o aluno lê logo depois de agir.
 * Antes ele dizia "Pular por ora" para quem tinha acabado de acertar, porque o
 * texto era decidido por um estado que metade dos exercícios não conseguia
 * preencher. Aqui a regra fica explícita e testada.
 */
describe('rótulo do botão de avanço', () => {
  it('quem acertou nunca é convidado a pular', () => {
    expect(rotuloDeAvanco('acertou')).toBe('Continuar');
  });

  it('quem errou pode seguir, e a frase não finge que resolveu', () => {
    const rotulo = rotuloDeAvanco('errou');
    expect(rotulo).toBe('Continuar assim mesmo');
    expect(rotulo).not.toMatch(/Pular/);
  });

  it('exercício intocado oferece pular', () => {
    expect(rotuloDeAvanco('inicial')).toBe('Responda para continuar');
    expect(rotuloDeAvanco(undefined)).toBe('Responda para continuar');
  });

  it('exercício em andamento ainda oferece pular, sem prometer conclusão', () => {
    expect(rotuloDeAvanco('respondendo')).toBe('Responda para continuar');
    expect(rotuloDeAvanco('verificando')).toBe('Responda para continuar');
  });

  it('só uma resposta verificada libera o avanço — certa ou errada', () => {
    expect(avancoLiberado('acertou')).toBe(true);
    expect(avancoLiberado('errou')).toBe(true);
    for (const estado of ['inicial', 'respondendo', 'verificando', undefined] as const) {
      expect(avancoLiberado(estado), String(estado)).toBe(false);
    }
  });

  it('todo estado tem rótulo — nenhum cai em vazio', () => {
    const todos: ExerciseState[] = [
      'inicial',
      'respondendo',
      'verificando',
      'errou',
      'acertou',
    ];

    for (const estado of todos) {
      expect(rotuloDeAvanco(estado)).toBeTruthy();
    }
  });
});

describe('resolvido', () => {
  it('só acertar conta', () => {
    expect(estaResolvido('acertou')).toBe(true);

    for (const estado of ['inicial', 'respondendo', 'verificando', 'errou'] as ExerciseState[]) {
      expect(estaResolvido(estado)).toBe(false);
    }

    expect(estaResolvido(undefined)).toBe(false);
  });
});

describe('pendências da aula', () => {
  it('lista o que ainda não foi resolvido, na ordem da aula', () => {
    const estados = new Map<string, ExerciseState>([
      ['a', 'acertou'],
      ['b', 'errou'],
    ]);

    expect(pendentes(['a', 'b', 'c'], estados)).toEqual(['b', 'c']);
  });

  it('aula toda resolvida não deixa pendência', () => {
    const estados = new Map<string, ExerciseState>([
      ['a', 'acertou'],
      ['b', 'acertou'],
    ]);

    expect(pendentes(['a', 'b'], estados)).toEqual([]);
  });

  it('aula sem exercício não tem pendência', () => {
    expect(pendentes([], new Map())).toEqual([]);
  });
});
