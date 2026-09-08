import { describe, expect, it } from 'vitest';

import { exerciseSchema } from '../../content/schema';
import { runProgram } from './sandbox-core';
import {
  emptyDraft,
  escapeTemplate,
  toTypeScript,
  validateDraft,
  type ExerciseDraft,
} from './exercise-authoring';

/**
 * O gerador precisa produzir código que compila e faz exatamente o que o autor
 * escreveu. Um escape errado não gera aviso: produz um arquivo quebrado, ou —
 * pior — um que compila avaliando uma interpolação que ninguém pediu.
 */

function rascunho(over: Partial<ExerciseDraft> = {}): ExerciseDraft {
  return {
    ...emptyDraft(),
    id: 'ex-soma',
    prompt: 'Crie a função `somar(a, b)`.',
    concepts: ['funcoes'],
    difficulty: 'iniciante',
    tags: ['javascript'],
    hints: ['Pense na palavra return.'],
    initialCode: 'function somar(a, b) {\n  // seu código\n}\n',
    solution: 'function somar(a, b) {\n  return a + b;\n}',
    tests: [
      {
        description: 'somar(2, 3) devolve 5',
        assertion: `if (somar(2, 3) !== 5) throw new Error("Esperado 5.");`,
        hidden: false,
      },
    ],
    ...over,
  };
}

describe('validação usa o schema real do conteúdo', () => {
  it('rascunho completo é aceito', () => {
    expect(validateDraft(rascunho())).toEqual([]);
  });

  it('id fora do padrão é recusado', () => {
    const problemas = validateDraft(rascunho({ id: 'Exercício 1' }));
    expect(problemas.some((p) => p.path === 'id')).toBe(true);
  });

  it('exercício sem teste é recusado', () => {
    // Mesma regra do schema: teste nenhum daria feedback errado ao aluno.
    const problemas = validateDraft(rascunho({ tests: [] }));
    expect(problemas.some((p) => p.path.startsWith('tests'))).toBe(true);
  });

  it('exercício sem conceito é recusado', () => {
    const problemas = validateDraft(rascunho({ concepts: [] }));
    expect(problemas.some((p) => p.path.startsWith('concepts'))).toBe(true);
  });

  it('o rascunho vazio aponta o que falta em vez de passar', () => {
    expect(validateDraft(emptyDraft()).length).toBeGreaterThan(0);
  });

  it('dica em branco não conta como dica', () => {
    // O formulário começa com um campo vazio; ele não deve virar uma dica ''.
    const problemas = validateDraft(rascunho({ hints: ['', '  '] }));
    expect(problemas.some((p) => p.path.startsWith('hints'))).toBe(false);
  });
});

describe('escape para template string', () => {
  it('escapa a crase, que fecharia a string', () => {
    expect(escapeTemplate('use `let`')).toBe('use \\`let\\`');
  });

  it('escapa a interpolação, que o TypeScript tentaria avaliar', () => {
    expect(escapeTemplate('${perigoso}')).toBe('\\${perigoso}');
  });

  it('escapa a barra invertida antes das demais', () => {
    // Se a barra fosse escapada por último, ela escaparia o escape.
    expect(escapeTemplate('\\n')).toBe('\\\\n');
  });

  it('deixa texto comum intacto', () => {
    expect(escapeTemplate("const x = 'a';")).toBe("const x = 'a';");
  });
});

/**
 * O teste mais forte: gerar, avaliar e conferir que o objeto resultante é
 * exatamente o que o autor descreveu — e que passa pelo mesmo schema e pelo
 * mesmo sandbox que o conteúdo publicado.
 */
describe('ida e volta: o módulo gerado produz o exercício correto', () => {
  /** Avalia o literal gerado, que é um bloco `{ kind: 'exercise', ... },`. */
  function avaliar(ts: string) {
    const semVirgulaFinal = ts.trim().replace(/,$/, '');
    return new Function(`return (${semVirgulaFinal});`)() as {
      kind: string;
      exercise: unknown;
    };
  }

  it('gera um bloco de exercício válido segundo o schema', () => {
    const bloco = avaliar(toTypeScript(rascunho()));

    expect(bloco.kind).toBe('exercise');
    expect(exerciseSchema.safeParse(bloco.exercise).success).toBe(true);
  });

  it('preserva o código exatamente, quebras de linha inclusive', () => {
    const draft = rascunho();
    const bloco = avaliar(toTypeScript(draft)) as { exercise: { initialCode: string } };

    expect(bloco.exercise.initialCode).toBe(draft.initialCode);
  });

  it('sobrevive a código com crase, cifrão e barra invertida', () => {
    const draft = rascunho({
      initialCode: 'const s = `olá ${nome}`;\nconst r = /\\d+/;',
      solution: 'const s = `olá ${nome}`;',
    });

    const bloco = avaliar(toTypeScript(draft)) as {
      exercise: { initialCode: string; solution: string };
    };

    expect(bloco.exercise.initialCode).toBe(draft.initialCode);
    expect(bloco.exercise.solution).toBe(draft.solution);
  });

  it('preserva aspas dos dois tipos nas asserções', () => {
    const draft = rascunho({
      tests: [
        {
          description: 'aspas duplas e simples',
          assertion: `if (x !== "a'b") throw new Error('deu "ruim"');`,
          hidden: false,
        },
      ],
    });

    const bloco = avaliar(toTypeScript(draft)) as {
      exercise: { tests: Array<{ assertion: string }> };
    };

    expect(bloco.exercise.tests[0].assertion).toBe(draft.tests[0].assertion);
  });

  it('marca teste oculto e omite a marca nos demais', () => {
    const draft = rascunho({
      tests: [
        { description: 'visível', assertion: 'if (false) throw new Error("x");', hidden: false },
        { description: 'oculto', assertion: 'if (false) throw new Error("y");', hidden: true },
      ],
    });

    const bloco = avaliar(toTypeScript(draft)) as {
      exercise: { tests: Array<{ hidden?: boolean }> };
    };

    expect(bloco.exercise.tests[0].hidden).toBeUndefined();
    expect(bloco.exercise.tests[1].hidden).toBe(true);
  });

  it('o exercício gerado funciona no sandbox de verdade', () => {
    const draft = rascunho();
    const bloco = avaliar(toTypeScript(draft)) as {
      exercise: {
        initialCode: string;
        solution: string;
        tests: Array<{ description: string; assertion: string }>;
      };
    };

    const { initialCode, solution, tests } = bloco.exercise;

    // As duas checagens que o CI faz com o conteúdo publicado.
    const comSolucao = runProgram(`${initialCode}\n${solution}`, tests);
    expect(comSolucao.error).toBeUndefined();
    expect(comSolucao.testResults.every((t) => t.passed)).toBe(true);

    const semNada = runProgram(initialCode, tests);
    expect(semNada.testResults.every((t) => t.passed)).toBe(false);
  });
});
