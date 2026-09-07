export interface TestResult {
  passed: boolean;
  message: string;
}

export interface ExecutionResult {
  /** Saída completa do console, já unida por quebras de linha. */
  output: string;
  /** Cada chamada de console.log como uma entrada separada (usado pelo terminal dos projetos). */
  logs: string[];
  testResults: TestResult[];
  error?: string;
}

// O código submetido pelo usuário é encapsulado num bloco Try/Catch para capturar erros sintáticos e de execução.
// Também sobrescrevemos o console.log para capturar as mensagens de saída em forma de string.
export function executeCodeInWorker(code: string, testCases: string[]): ExecutionResult {
  const logs: string[] = [];
  const testResults: TestResult[] = [];

  // Intercepta e captura console.log
  const originalLog = console.log;
  console.log = (...args) => {
    logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
  };

  try {
    // 1. Executa o código do usuário para registrar funções/variáveis no escopo (usando Function de forma controlada)
    // Atenção: Esta é uma execução em cliente controlada para fins didáticos. O worker real interceptaria isso mais abaixo.
    const userFunc = new Function(`
      ${code}
      // Retorna o escopo global criado pelas variáveis (limitado no strict mode, mas atende o MVP)
      return { pontuacao: typeof pontuacao !== 'undefined' ? pontuacao : undefined, jogador: typeof jogador !== 'undefined' ? jogador : undefined };
    `);
    
    const userScope = userFunc();

    // 2. Executa os testes contra o escopo gerado
    testCases.forEach((test, index) => {
      try {
        const testFunc = new Function('scope', `
          const { pontuacao, jogador } = scope;
          ${test}
        `);
        testFunc(userScope);
        testResults.push({ passed: true, message: `Teste ${index + 1} passou` });
      } catch (err: any) {
        testResults.push({ passed: false, message: err.message });
      }
    });

  } catch (error: any) {
    return { output: logs.join('\n'), logs, testResults, error: error.message };
  } finally {
    // Restaura o console.log original
    console.log = originalLog;
  }

  return { output: logs.join('\n'), logs, testResults };
}
