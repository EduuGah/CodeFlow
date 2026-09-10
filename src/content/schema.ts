import { z } from 'zod';

import { problemasDoMolde } from '../client/lib/fill-blank';
import { problemasDaOrdenacao } from '../client/lib/ordenar';

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
      type: z.literal('fill-blank'),
      template: z.string().min(1),
      blanks: z
        .array(z.object({ placeholder: z.string().optional(), size: z.number().int().positive().optional() }))
        .min(1, 'exercício de lacuna precisa de ao menos uma lacuna'),
      tests: z.array(testCaseSchema).min(1, 'exercício de lacuna precisa de ao menos um teste'),
      properties: z.array(propertySchema).optional(),
      explanation: z.string().min(1),
      solution: z.array(z.string()).optional(),
    })
    // `superRefine` porque a mensagem depende do valor: dizer qual lacuna está
    // faltando é a diferença entre uma pista e um "molde inválido".
    .superRefine((ex, ctx) => {
      // Um molde com {{1}} e {{3}} deixa a segunda lacuna sem campo na tela, e o
      // aluno vê um exercício que não tem como resolver.
      for (const problema of problemasDoMolde(ex.template, ex.blanks.length)) {
        ctx.addIssue({ code: 'custom', message: problema, path: ['template'] });
      }

      // Sem uma resposta por lacuna, o CI não consegue provar que o exercício é
      // resolvível.
      if (ex.solution && ex.solution.length !== ex.blanks.length) {
        ctx.addIssue({
          code: 'custom',
          message: `a solução tem ${ex.solution.length} respostas para ${ex.blanks.length} lacunas`,
          path: ['solution'],
        });
      }
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
  z
    .object({
      ...exerciseBase,
      type: z.literal('order-steps'),
      steps: z
        .array(
          z.object({
            id: idSchema,
            text: z.string().min(1),
            ordem: z.number().int().nonnegative(),
          })
        )
        .min(3, 'ordenar dois passos é uma escolha entre duas, não uma sequência'),
      explanation: z.string().min(1),
    })
    // Um exercício em que qualquer arrumação passa não cobra nada, e passaria
    // despercebido: todo teste que alguém fizesse daria verde.
    .superRefine((ex, ctx) => {
      for (const problema of problemasDaOrdenacao(ex.steps)) {
        ctx.addIssue({ code: 'custom', message: problema, path: ['steps'] });
      }
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
