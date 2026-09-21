import type { ServerExercise } from '../../content/types';
import { executeCode, type ExecutionResult } from './sandbox';
import { montarCodigoDoServidor } from './servidor-core';

/**
 * Roda o servidor do aluno no sandbox e faz os pedidos dos testes.
 *
 * É o `executeCode` de sempre, com duas diferenças: o prelúdio do servidor
 * simulado vai antes do código (`servidor-core.ts`), e os testes rodam em
 * série — o servidor tem estado, e o POST de um teste é o GET do seguinte.
 * O resultado traz as trocas HTTP, que a tela mostra como um cliente de
 * API mostraria.
 */
export function executarServidor(
  codigo: string,
  exercicio: Pick<ServerExercise, 'tests' | 'env' | 'arquivos' | 'caminho'>
): Promise<ExecutionResult> {
  return executeCode(
    montarCodigoDoServidor(codigo, { env: exercicio.env, arquivos: exercicio.arquivos, caminho: exercicio.caminho }),
    exercicio.tests,
    [],
    { sequencial: true }
  );
}
