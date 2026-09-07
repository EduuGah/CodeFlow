import { z } from 'zod';

/**
 * Validação de conteúdo (§295). Roda uma vez, no carregamento, e falha alto em
 * desenvolvimento: um exercício sem teste ou uma trilha apontando para uma aula
 * inexistente é um bug pedagógico que não pode chegar ao aluno silenciosamente.
 */

const statusSchema = z.enum(['draft', 'published', 'archived']);
const difficultySchema = z.enum(['iniciante', 'intermediario', 'avancado']);
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
    solution: z.string().optional(),
  }),
  z.object({
    ...exerciseBase,
    type: z.literal('multiple-choice'),
    options: z.array(z.string().min(1)).min(2),
    correctIndex: z.number().int().nonnegative(),
    explanation: z.string().min(1),
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
  objective: z.string().min(1),
  concepts: z.array(idSchema).min(1),
  blocks: z.array(lessonBlockSchema).min(1),
  status: statusSchema,
  estimatedMinutes: z.number().int().positive(),
});

export const projectSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: difficultySchema,
  concepts: z.array(idSchema).min(1),
  brief: z.string().min(1),
  initialCode: z.string(),
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
  lessonIds: z.array(idSchema).min(1),
  status: statusSchema,
});
