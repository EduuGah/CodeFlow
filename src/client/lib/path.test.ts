import { describe, expect, it } from 'vitest';

import type { Concept, Lesson } from '../../content/types';
import type { ConceptMastery } from './mastery';
import { buildPath, summarizePath } from './path';

function aula(id: string, concepts: string[]): Lesson {
  return {
    id,
    trackId: 'track-1',
    title: `Aula ${id}`,
    language: 'javascript',
    objective: 'objetivo',
    concepts,
    status: 'published',
    estimatedMinutes: 10,
    blocks: [{ kind: 'prose', markdown: 'conteúdo' }],
  };
}

function conceito(id: string, prerequisites: string[] = []): Concept {
  return { id, title: `Conceito ${id}`, summary: 'resumo', prerequisites, tags: [] };
}

function dominio(conceptId: string, level: ConceptMastery['level']): ConceptMastery {
  return {
    conceptId,
    level,
    attempts: 0,
    correctAttempts: 0,
    exercisesSolved: 0,
    accuracy: 0,
    solvedUnaided: false,
    needsReview: false,
  };
}

const conceitos = [
  conceito('variaveis'),
  conceito('condicoes', ['variaveis']),
  conceito('loops', ['condicoes']),
];

const aulas = [
  aula('l1', ['variaveis']),
  aula('l2', ['condicoes']),
  aula('l3', ['loops']),
];

describe('estados do caminho', () => {
  it('sem nada concluído, a primeira aula é a atual', () => {
    const path = buildPath(aulas, [], conceitos, []);
    expect(path.map((n) => n.state)).toEqual(['atual', 'proxima', 'proxima']);
  });

  it('a etapa atual é a primeira NÃO concluída', () => {
    const path = buildPath(aulas, ['l1'], conceitos, []);
    expect(path.map((n) => n.state)).toEqual(['concluida', 'atual', 'proxima']);
  });

  it('conclusão fora de ordem não confunde a etapa atual', () => {
    // O aluno pulou para a l3 e concluiu. A l1 continua sendo o passo sugerido.
    const path = buildPath(aulas, ['l3'], conceitos, []);
    expect(path.map((n) => n.state)).toEqual(['atual', 'proxima', 'concluida']);
  });

  it('trilha inteira concluída não deixa etapa atual', () => {
    const path = buildPath(aulas, ['l1', 'l2', 'l3'], conceitos, []);
    expect(path.every((n) => n.state === 'concluida')).toBe(true);
    expect(summarizePath(path).current).toBeUndefined();
  });

  it('numera as posições a partir de um', () => {
    expect(buildPath(aulas, [], conceitos, []).map((n) => n.position)).toEqual([1, 2, 3]);
  });
});

describe('aviso de pré-requisito', () => {
  it('avisa quando o pré-requisito nunca foi praticado', () => {
    const path = buildPath(aulas, [], conceitos, []);
    const l2 = path[1];

    expect(l2.shakyPrerequisites.map((c) => c.id)).toEqual(['variaveis']);
  });

  it('não avisa quando o pré-requisito já está praticado', () => {
    const path = buildPath(aulas, [], conceitos, [dominio('variaveis', 'praticando')]);
    expect(path[1].shakyPrerequisites).toEqual([]);
  });

  it('ainda avisa quando o aluno só está "conhecendo" o pré-requisito', () => {
    // Tentou e não acertou nenhuma vez: a base não sustenta o próximo conceito.
    const path = buildPath(aulas, [], conceitos, [dominio('variaveis', 'conhecendo')]);
    expect(path[1].shakyPrerequisites.map((c) => c.id)).toEqual(['variaveis']);
  });

  it('não avisa sobre a própria aula já concluída', () => {
    const path = buildPath(aulas, ['l2'], conceitos, []);
    expect(path[1].shakyPrerequisites).toEqual([]);
  });

  it('não avisa sobre conceito que nenhuma aula ensina', () => {
    // 'recursao' é pré-requisito declarado, mas não há aula sobre ele — avisar
    // deixaria o aluno sem ação possível.
    const comOrfao = [...conceitos, conceito('avancado', ['recursao'])];
    const path = buildPath([aula('lx', ['avancado'])], [], comOrfao, []);

    expect(path[0].shakyPrerequisites).toEqual([]);
  });

  it('não trata como pré-requisito um conceito que a própria aula ensina', () => {
    const aulaDupla = aula('lz', ['variaveis', 'condicoes']);
    const path = buildPath([aulaDupla], [], conceitos, []);

    // 'variaveis' é pré-requisito de 'condicoes', mas as duas são desta aula.
    expect(path[0].shakyPrerequisites).toEqual([]);
  });

  it('nunca bloqueia: aula com pré-requisito fraco continua acessível', () => {
    const path = buildPath(aulas, [], conceitos, []);
    // O estado é de progressão, não de permissão — não existe 'bloqueada'.
    expect(path.map((n) => n.state)).not.toContain('bloqueada');
    expect(path[2].shakyPrerequisites.length).toBeGreaterThan(0);
  });
});

describe('resumo do caminho', () => {
  it('trilha vazia não divide por zero', () => {
    expect(summarizePath([])).toEqual({
      total: 0,
      completed: 0,
      percentage: 0,
      current: undefined,
    });
  });

  it('calcula o percentual concluído', () => {
    const path = buildPath(aulas, ['l1'], conceitos, []);
    const resumo = summarizePath(path);

    expect(resumo.total).toBe(3);
    expect(resumo.completed).toBe(1);
    expect(resumo.percentage).toBe(33);
    expect(resumo.current?.lesson.id).toBe('l2');
  });
});
