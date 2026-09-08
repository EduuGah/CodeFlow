import { z } from 'zod';

/**
 * Validação de conteúdo (§295). Roda uma vez, no carregamento, e falha alto em
 * desenvolvimento: um exercício sem teste ou uma trilha apontando para uma aula
 * inexistente é um bug pedagógico que não pode chegar ao aluno silenciosamente.
 */

const statusSchema = z.enum(['draft', 'published', 'archived']);
const difficultySchema = z.enum(['iniciante', 'intermediario', 'avancado']);
const languageSchema = z.enum(['javascript', 'typescript', 'python', 'sql']);
const idSchema = z.string().min(1).regex(/^[a-z0-9-]+$/, 'ids usam apenas minúsculas, números e hífen');

export const conceptSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  prerequisites: z.array(idSchema),
  tags: z.array(z.string().min(1)),
});

const testCaseSchema = z.object({
  description: z.string().min(1),
  assertion: z.string().min(1),
  hidden: z.boolean().optional(),
});

/**
 * O gerador e a verificação são corpos de função, não expressões: precisam de
 * `return` e de `throw`. Um campo vazio produziria uma propriedade que passa sem
 * verificar nada — o pior defeito possível num exercício, porque é verde.
 */
const propertySchema = z.object({
  description: z.string().min(1),
  generate: z.string().min(1, 'a propriedade precisa de um gerador de casos'),
  check: z.string().min(1, 'a propriedade precisa verificar alguma coisa'),
  runs: z.number().int().positive().max(200).optional(),
});

const exerciseBase = {
  id: idSchema,
  prompt: z.string().min(1),
  concepts: z.array(idSchema).min(1, 'todo exercício precisa declarar ao menos um conceito'),
  difficulty: difficultySchema,
  hints: z.array(z.string().min(1)),
  tags: z.array(z.string().min(1)),
};

export const exerciseSchema = z.discriminatedUnion('type', [
  z.object({
    ...exerciseBase,
    type: z.literal('code'),
    initialCode: z.string(),
    // Exercício de código sem teste daria feedback errado ao aluno (§ "testes pedagógicos").
    tests: z.array(testCaseSchema).min(1, 'exercício de código precisa de ao menos um teste'),
    properties: z.array(propertySchema).optional(),
    solution: z.string().optional(),
  }),
  z
    .object({
      ...exerciseBase,
      type: z.literal('multiple-choice'),
      options: z.array(z.string().min(1)).min(2),
      correctIndex: z.number().int().nonnegative(),
      explanation: z.string().min(1),
    })
    // Um correctIndex fora da lista faria a alternativa certa ser `undefined`:
    // o aluno nunca conseguiria acertar, e nada denunciaria o erro.
    .refine((ex) => ex.correctIndex < ex.options.length, {
      message: 'correctIndex aponta para uma alternativa que não existe',
      path: ['correctIndex'],
    }),
  z.object({
    ...exerciseBase,
    type: z.literal('predict-output'),
    code: z.string().min(1),
    expectedOutput: z.string(),
    explanation: z.string().min(1),
  }),
]);

const lessonBlockSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('prose'), markdown: z.string().min(1) }),
  z.object({
    kind: z.literal('example'),
    language: z.string().min(1),
    code: z.string().min(1),
    caption: z.string().optional(),
  }),
  z.object({ kind: z.literal('exercise'), exercise: exerciseSchema }),
  z.object({ kind: z.literal('summary'), markdown: z.string().min(1) }),
]);

export const lessonSchema = z.object({
  id: idSchema,
  trackId: idSchema,
  title: z.string().min(1),
  language: languageSchema,
  objective: z.string().min(1),
  concepts: z.array(idSchema).min(1),
  blocks: z.array(lessonBlockSchema).min(1),
  status: statusSchema,
  estimatedMinutes: z.number().int().positive(),
});

const checkpointSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  // Checkpoint sem teste seria critério de aceitação decorativo.
  tests: z.array(testCaseSchema).min(1, 'checkpoint precisa de ao menos um teste'),
});

export const projectSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: difficultySchema,
  language: languageSchema,
  concepts: z.array(idSchema).min(1),
  brief: z.string().min(1),
  initialCode: z.string(),
  checkpoints: z.array(checkpointSchema).min(1, 'projeto precisa de ao menos um checkpoint'),
  referenceSolution: z.string().optional(),
  status: statusSchema,
});

export const flashcardSchema = z.object({
  id: idSchema,
  front: z.string().min(1),
  back: z.string().min(1),
  concepts: z.array(idSchema).min(1),
});

export const trackSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  language: languageSchema,
  lessonIds: z.array(idSchema).min(1),
  status: statusSchema,
});
