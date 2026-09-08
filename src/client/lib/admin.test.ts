import { describe, expect, it } from 'vitest';

import { getExercises, getLessonsOfTrack, listProjects, listTracks } from '../../content';
import type { Exercise, Lesson } from '../../content/types';
import {
  auditCatalog,
  diagnoseAll,
  diagnoseExercise,
  MINIMO_DE_ALUNOS,
  type ExercisePerformance,
} from './admin';

/**
 * O diagnóstico existe para orientar quem escreve o conteúdo. Um sinal errado
 * manda reescrever um exercício que estava bom, ou deixa passar um enunciado
 * que trava metade dos alunos — os dois custam caro e nenhum aparece sozinho.
 */

function desempenho(over: Partial<ExercisePerformance> = {}): ExercisePerformance {
  return {
    exerciseId: 'ex-1',
    lessonId: 'lesson-1',
    attempts: 20,
    correctAttempts: 16,
    students: 10,
    studentsSolved: 9,
    accuracyPercent: 80,
    avgHintsUsed: 1,
    attemptsPerStudent: 2,
    ...over,
  };
}

describe('dados insuficientes', () => {
  it('não julga com poucos alunos', () => {
    const d = diagnoseExercise(desempenho({ students: 2, studentsSolved: 0, attempts: 9 }));

    // Com dois alunos, "0% de conclusão" não significa nada.
    expect(d.signal).toBe('sem-dados');
    expect(d.reason).toContain('ruído');
  });

  it('exercício sem nenhuma tentativa não vira alerta', () => {
    const d = diagnoseExercise(
      desempenho({ students: 0, studentsSolved: 0, attempts: 0, accuracyPercent: null })
    );

    expect(d.signal).toBe('sem-dados');
    expect(d.completionRate).toBe(0);
  });

  it('passa a julgar a partir do mínimo de alunos', () => {
    const d = diagnoseExercise(
      desempenho({ students: MINIMO_DE_ALUNOS, studentsSolved: MINIMO_DE_ALUNOS })
    );
    expect(d.signal).not.toBe('sem-dados');
  });
});

describe('suspeita de enunciado confuso', () => {
  it('sinaliza quando poucos concluem e todos tentam muito', () => {
    const d = diagnoseExercise(
      desempenho({ students: 20, studentsSolved: 6, attemptsPerStudent: 7, accuracyPercent: 22 })
    );

    expect(d.signal).toBe('revisar-enunciado');
    expect(d.reason).toContain('30%');
  });

  it('exercício difícil, mas que os alunos vencem, não é alertado', () => {
    // Muitas tentativas e conclusão alta é o aprendizado funcionando: erra,
    // insiste e resolve. Alertar aqui mandaria facilitar o que está certo.
    const d = diagnoseExercise(
      desempenho({ students: 20, studentsSolved: 18, attemptsPerStudent: 6, accuracyPercent: 40 })
    );

    expect(d.signal).toBe('saudavel');
  });

  it('conclusão baixa com poucas tentativas não é enunciado confuso', () => {
    // Aluno que tenta uma vez e desiste é outro problema, e a solução não é
    // reescrever o enunciado.
    const d = diagnoseExercise(
      desempenho({ students: 20, studentsSolved: 6, attemptsPerStudent: 1.2, accuracyPercent: 30 })
    );

    expect(d.signal).not.toBe('revisar-enunciado');
  });
});

describe('suspeita de exercício fácil demais', () => {
  it('sinaliza acerto quase universal sem nenhuma dica', () => {
    const d = diagnoseExercise(
      desempenho({
        students: 30,
        studentsSolved: 30,
        accuracyPercent: 98,
        avgHintsUsed: 0,
        attemptsPerStudent: 1,
      })
    );

    expect(d.signal).toBe('facil-demais');
  });

  it('acerto alto com dicas abertas não conta como fácil demais', () => {
    // Se precisaram de dica, o exercício exigiu raciocínio.
    const d = diagnoseExercise(
      desempenho({ students: 30, studentsSolved: 30, accuracyPercent: 97, avgHintsUsed: 1.4 })
    );

    expect(d.signal).toBe('saudavel');
  });
});

describe('ordenação por urgência', () => {
  it('o que precisa de revisão vem primeiro, e sem dados por último', () => {
    const lista = diagnoseAll([
      desempenho({ exerciseId: 'saudavel' }),
      desempenho({ exerciseId: 'sem-dados', students: 1, studentsSolved: 1 }),
      desempenho({
        exerciseId: 'confuso',
        students: 20,
        studentsSolved: 4,
        attemptsPerStudent: 8,
        accuracyPercent: 15,
      }),
    ]);

    expect(lista.map((d) => d.exerciseId)).toEqual(['confuso', 'saudavel', 'sem-dados']);
  });

  it('entre dois problemáticos, o de menor conclusão vem antes', () => {
    const lista = diagnoseAll([
      desempenho({ exerciseId: 'ruim', students: 20, studentsSolved: 8, attemptsPerStudent: 6 }),
      desempenho({ exerciseId: 'pior', students: 20, studentsSolved: 2, attemptsPerStudent: 9 }),
    ]);

    expect(lista[0].exerciseId).toBe('pior');
  });

  it('lista vazia não quebra', () => {
    expect(diagnoseAll([])).toEqual([]);
  });
});

describe('auditoria do catálogo real', () => {
  const lessons: Lesson[] = listTracks().flatMap((t) => getLessonsOfTrack(t.id));
  const exercises: Exercise[] = lessons.flatMap((l) => getExercises(l));
  const saude = auditCatalog(lessons, exercises, listProjects());

  it('conta o catálogo publicado', () => {
    expect(saude.lessons).toBeGreaterThan(0);
    expect(saude.exercises).toBeGreaterThan(0);
    expect(saude.projects).toBeGreaterThan(0);
  });

  it('todo exercício de código publicado tem solução de referência', () => {
    // Sem ela, não há como provar que o exercício é resolvível.
    expect(saude.codeExercisesWithoutSolution).toEqual([]);
  });

  it('todo projeto publicado tem solução de referência', () => {
    expect(saude.projectsWithoutSolution).toEqual([]);
  });

  it('todo exercício publicado tem ao menos uma dica', () => {
    // Um exercício sem dica passa em todos os testes e ainda assim deixa o
    // aluno travado sem saída.
    expect(saude.exercisesWithoutHints).toEqual([]);
  });
});
