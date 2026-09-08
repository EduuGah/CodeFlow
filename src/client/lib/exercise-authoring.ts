import { exerciseSchema } from '../../content/schema';
import type { Difficulty } from '../../content/types';

/**
 * Autoria de exercício de código.
 *
 * Existe para tirar da mão a escrita do módulo TypeScript, **sem** tirar as
 * garantias que ela traz. O conteúdo continua sendo código versionado, revisado
 * e testado no CI: o que muda é que o autor preenche campos e recebe o módulo
 * pronto, em vez de acertar aspas e vírgulas.
 *
 * A validação usada aqui é o mesmo `exerciseSchema` que roda no carregamento do
 * conteúdo. Duplicar as regras num formulário faria as duas versões divergirem,
 * e o formulário aceitaria coisa que a aplicação recusa.
 */

export interface ExerciseDraft {
  id: string;
  prompt: string;
  concepts: string[];
  difficulty: Difficulty;
  tags: string[];
  hints: string[];
  initialCode: string;
  solution: string;
  tests: Array<{ description: string; assertion: string; hidden: boolean }>;
}

export function emptyDraft(): ExerciseDraft {
  return {
    id: '',
    prompt: '',
    concepts: [],
    difficulty: 'iniciante',
    tags: [],
    hints: [''],
    initialCode: '',
    solution: '',
    tests: [{ description: '', assertion: '', hidden: false }],
  };
}

export interface ValidationIssue {
  /** Caminho do campo, como `tests.0.description`. */
  path: string;
  message: string;
}

/** Converte o rascunho no formato que o schema espera. */
function toExercise(draft: ExerciseDraft) {
  return {
    id: draft.id,
    type: 'code' as const,
    prompt: draft.prompt,
    concepts: draft.concepts,
    difficulty: draft.difficulty,
    hints: draft.hints.filter((h) => h.trim() !== ''),
    tags: draft.tags,
    initialCode: draft.initialCode,
    solution: draft.solution,
    tests: draft.tests
      .filter((t) => t.description.trim() !== '' || t.assertion.trim() !== '')
      .map((t) => (t.hidden ? t : { description: t.description, assertion: t.assertion })),
  };
}

/** Problemas do rascunho segundo o schema real do conteúdo. */
export function validateDraft(draft: ExerciseDraft): ValidationIssue[] {
  const resultado = exerciseSchema.safeParse(toExercise(draft));
  if (resultado.success) return [];

  return resultado.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

/**
 * Escapa um texto para dentro de uma template string do TypeScript.
 *
 * Três coisas quebram o módulo gerado se passarem cruas: a crase fecha a
 * string, `${` inicia uma interpolação que o TypeScript tenta avaliar, e a
 * barra invertida come o caractere seguinte. Errar aqui produz um arquivo que
 * não compila — ou, pior, que compila fazendo outra coisa.
 */
export function escapeTemplate(texto: string): string {
  return texto.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

/** Escapa para dentro de aspas simples. */
function escapeSingle(texto: string): string {
  return texto.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function listaDeTextos(itens: string[], indent: string): string {
  if (itens.length === 0) return '[]';
  return `[\n${itens.map((i) => `${indent}  '${escapeSingle(i)}',`).join('\n')}\n${indent}]`;
}

/**
 * Gera o módulo TypeScript do exercício, pronto para colar num arquivo de aula.
 *
 * O código do aluno e as asserções saem em template string porque quase sempre
 * contêm aspas dos dois tipos — usar aspas normais exigiria escapar quase tudo e
 * tornaria o resultado ilegível para quem for revisar no pull request.
 */
export function toTypeScript(draft: ExerciseDraft): string {
  const testes = draft.tests
    .filter((t) => t.description.trim() !== '')
    .map((t) => {
      const oculto = t.hidden ? '\n          hidden: true,' : '';
      return `        {
          description: '${escapeSingle(t.description)}',
          assertion: \`${escapeTemplate(t.assertion)}\`,${oculto}
        },`;
    })
    .join('\n');

  return `{
  kind: 'exercise',
  exercise: {
    id: '${escapeSingle(draft.id)}',
    type: 'code',
    prompt: \`${escapeTemplate(draft.prompt)}\`,
    concepts: ${listaDeTextos(draft.concepts, '    ')},
    difficulty: '${draft.difficulty}',
    tags: ${listaDeTextos(draft.tags, '    ')},
    initialCode: \`${escapeTemplate(draft.initialCode)}\`,
    hints: ${listaDeTextos(
      draft.hints.filter((h) => h.trim() !== ''),
      '    '
    )},
    tests: [
${testes}
    ],
    solution: \`${escapeTemplate(draft.solution)}\`,
  },
},`;
}
