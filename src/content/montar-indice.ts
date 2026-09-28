import type { Lesson, Project, ResumoDaAula, ResumoDeExercicio, ResumoDoProjeto } from './types';

/**
 * Monta o texto de `indice.gerado.ts` a partir do catálogo.
 *
 * Quem roda é `scripts/gerar-indice.ts` (no Node, pelo `tsx`) e o teste
 * `indice.test.ts` (no Vitest) — o mesmo código dos dois lados, então o
 * teste compara o arquivo com o que o script escreveria agora, texto com
 * texto.
 *
 * O caminho e o nome de cada aula e projeto saem dos `import` do próprio
 * `catalogo.ts`: é de lá que o `import()` do índice vai buscar o corpo.
 */

const IMPORTACAO = /^import \{ (\w+) \} from '\.\/((?:lessons|projects)\/[\w-]+)';$/gm;

type Importar = (caminho: string) => Promise<Record<string, unknown>>;

/** O que fica fora do resumo do projeto: só a tela do projeto usa (`ResumoDoProjeto`). */
const SO_NA_TELA_DO_PROJETO = ['brief', 'initialCode', 'checkpoints', 'referenceSolution', 'servidor'] as const;

const CABECALHO = `/**
 * GERADO por \`npm run indice\` (scripts/gerar-indice.ts) a partir de
 * \`catalogo.ts\`. Não edite à mão: \`indice.test.ts\` confere que este arquivo
 * diz o mesmo que o catálogo, e falha pedindo para rodar o script.
 *
 * O que as telas usam sem abrir uma aula, e onde está o corpo de cada uma.
 */
import type { Lesson, Project, ResumoDaAula, ResumoDeExercicio, ResumoDoProjeto } from './types';
`;

/** Um item por linha: o diff de uma aula mudada é a linha dela. */
const json = (lista: unknown[]) => `[\n${lista.map((item) => `  ${JSON.stringify(item)}`).join(',\n')}\n]`;

export async function montarIndice(catalogo: string, importar: Importar): Promise<string> {
  const aulas: ResumoDaAula[] = [];
  const exercicios: ResumoDeExercicio[] = [];
  const projetos: ResumoDoProjeto[] = [];
  const corpoDaAula: string[] = [];
  const corpoDoProjeto: string[] = [];

  for (const [, nome, caminho] of catalogo.matchAll(IMPORTACAO)) {
    const modulo = await importar(caminho);
    const item = modulo[nome];
    if (!item || typeof item !== 'object') throw new Error(`${caminho} não exporta ${nome}`);
    const carregador = `() => import('./${caminho}').then((m) => m.${nome})`;

    if (caminho.startsWith('lessons/')) {
      const { blocks, ...resumo } = item as Lesson;
      aulas.push(resumo);
      for (const bloco of blocks) {
        if (bloco.kind !== 'exercise') continue;
        const { id, type, concepts } = bloco.exercise;
        exercicios.push({ id, type, concepts, lessonId: resumo.id });
      }
      corpoDaAula.push(`  ${JSON.stringify(resumo.id)}: ${carregador},`);
    } else {
      const resumo: Record<string, unknown> = { ...(item as Project), criterios: (item as Project).checkpoints.length };
      for (const campo of SO_NA_TELA_DO_PROJETO) delete resumo[campo];
      projetos.push(resumo as ResumoDoProjeto);
      corpoDoProjeto.push(`  ${JSON.stringify(resumo.id)}: ${carregador},`);
    }
  }

  if (aulas.length === 0) throw new Error('nenhuma aula encontrada nos imports do catálogo');

  return [
    CABECALHO,
    `export const AULAS: ResumoDaAula[] = ${json(aulas)};`,
    '',
    `export const EXERCICIOS: ResumoDeExercicio[] = ${json(exercicios)};`,
    '',
    `export const PROJETOS: ResumoDoProjeto[] = ${json(projetos)};`,
    '',
    '/** O corpo de cada aula, por id — um arquivo por aula no build. */',
    `export const CORPO_DA_AULA: Record<string, () => Promise<Lesson>> = {\n${corpoDaAula.join('\n')}\n};`,
    '',
    `export const CORPO_DO_PROJETO: Record<string, () => Promise<Project>> = {\n${corpoDoProjeto.join('\n')}\n};`,
    '',
  ].join('\n');
}
