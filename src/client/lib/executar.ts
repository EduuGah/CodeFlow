import type { LanguageId } from '../../content/types';
import { executeCode, type ExecutionResult } from './sandbox';
import { montarCodigoDoServidor } from './servidor-core';
import type { SandboxProperty, SandboxTest } from './sandbox-core';
import { formatarErros, verificarTrechos, type Compilador, type TrechoDeTipo } from './typescript-core';

/**
 * Executa o código do aluno na linguagem da aula.
 *
 * JavaScript vai direto para o sandbox. TypeScript passa antes pelo
 * compilador: se ele recusa, o resultado traz os erros e nada roda — um
 * programa com erro de tipo não é "quase certo", é o que a aula ensina a
 * não entregar. Se ele aceita, o JavaScript gerado entra no mesmo sandbox,
 * e os testes são os mesmos.
 *
 * Os trechos de tipo (`typeTests`) só existem em TypeScript e são
 * verificados depois dos testes de comportamento, na mesma lista: para o
 * aluno, "o compilador recusa `somar('a', 1)`" é um teste como outro
 * qualquer.
 */
export interface Execucao {
  language: LanguageId;
  code: string;
  tests?: SandboxTest[];
  properties?: SandboxProperty[];
  typeTests?: TrechoDeTipo[];
}

async function compiladorDoNavegador(): Promise<Compilador | null> {
  try {
    const { compilarNoNavegador } = await import('./typescript');
    return compilarNoNavegador;
  } catch {
    return null;
  }
}

export async function executarNaLinguagem({
  language,
  code,
  tests = [],
  properties = [],
  typeTests = [],
}: Execucao): Promise<ExecutionResult> {
  if (language === 'react') {
    // Um componente só roda no iframe do motor de página (`executarPagina`,
    // com `react: true`). Chegar aqui é um exercício de tipo errado numa
    // aula de React — o CI recusa esse conteúdo, mas o aluno merece uma
    // frase e não um silêncio.
    return {
      output: '',
      logs: [],
      testResults: [],
      error: 'Este exercício é de React e precisa do motor de componente; avise que ele está numa aula de React com um tipo que não roda lá.',
    };
  }
  if (language === 'sql') {
    // SQL roda no motor de banco (`executarSqlNoNavegador`), por um
    // exercício de tipo próprio. O CI recusa outro tipo numa aula de SQL.
    return {
      output: '',
      logs: [],
      testResults: [],
      error: 'Este exercício é de SQL e precisa do motor de banco; avise que ele está numa aula de SQL com um tipo que não roda lá.',
    };
  }
  // Node: o mesmo sandbox, com o Node de mentira na frente (`require`,
  // `process`, `module.exports`) e os testes em série.
  if (language === 'node') {
    return executeCode(montarCodigoDoServidor(code), tests, properties, { sequencial: true });
  }
  if (language !== 'typescript') return executeCode(code, tests, properties);

  const compilar = await compiladorDoNavegador();
  if (!compilar) {
    return {
      output: '',
      logs: [],
      testResults: [],
      error:
        'O verificador de tipos não carregou — ele vem junto com o editor. Confira a conexão e tente executar de novo.',
    };
  }

  let compilacao;
  try {
    compilacao = await compilar(code);
  } catch (erro) {
    // O worker do Monaco pode falhar por conta própria (sem memória, bloqueado
    // por extensão). Isso não é erro do aluno, e não pode deixar o botão
    // preso em "Executando…".
    return {
      output: '',
      logs: [],
      testResults: [],
      error: `O verificador de tipos falhou: ${erro instanceof Error ? erro.message : String(erro)}. Tente executar de novo.`,
    };
  }

  const { js, erros } = compilacao;
  if (erros.length > 0) {
    return { output: '', logs: [], testResults: [], error: formatarErros(erros), compileErrors: erros };
  }

  const resultado = await executeCode(js, tests, properties);
  if (typeTests.length === 0 || resultado.error) return resultado;

  const trechos = await verificarTrechos(compilar, code, typeTests);
  return { ...resultado, testResults: [...resultado.testResults, ...trechos] };
}
