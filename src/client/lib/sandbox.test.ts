import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Os dois relógios do sandbox.
 *
 * O worker de verdade só existe no navegador; aqui ele é um dublê que o teste
 * comanda: diz "pronto" quando o teste manda, responde quando o teste manda.
 * O que está sob teste é a contagem — a partir de quando os 3 segundos do
 * aluno começam, e o que acontece quando o worker nem chega a existir.
 */
type Mensagem = 'pronto' | { logs: string[]; testResults: never[]; error?: string };

class WorkerFalso {
  static instancias: WorkerFalso[] = [];
  onmessage: ((e: { data: Mensagem }) => void) | null = null;
  onerror: ((e: { message: string; preventDefault(): void }) => void) | null = null;
  recebidas: unknown[] = [];
  encerrado = false;

  constructor() {
    WorkerFalso.instancias.push(this);
  }
  postMessage(m: unknown) {
    this.recebidas.push(m);
  }
  terminate() {
    this.encerrado = true;
  }

  // O que o teste faz o worker dizer.
  pronto() {
    this.onmessage?.({ data: 'pronto' });
  }
  responder(logs: string[]) {
    this.onmessage?.({ data: { logs, testResults: [] } });
  }
}

vi.mock('./sandbox.worker?worker', () => ({ default: WorkerFalso }));

const { executeCode, EXECUTION_TIMEOUT_MS, STARTUP_TIMEOUT_MS } = await import('./sandbox');

const ultimo = () => WorkerFalso.instancias[WorkerFalso.instancias.length - 1];

beforeEach(() => {
  vi.useFakeTimers();
  WorkerFalso.instancias = [];
});

afterEach(() => {
  vi.useRealTimers();
});

describe('o relógio do aluno começa quando o worker está pronto', () => {
  it('um worker que demora a subir não conta contra o programa', async () => {
    const resultado = executeCode('console.log(1)');
    const worker = ultimo();

    // O arquivo do worker levou mais do que os 3s do aluno para chegar.
    await vi.advanceTimersByTimeAsync(EXECUTION_TIMEOUT_MS + 2_000);
    worker.pronto();

    // E o programa, uma vez rodando, terminou em 1s.
    await vi.advanceTimersByTimeAsync(1_000);
    worker.responder(['1']);

    await expect(resultado).resolves.toMatchObject({ output: '1', logs: ['1'] });
    expect((await resultado).timedOut).toBeUndefined();
    expect(worker.encerrado).toBe(true);
  });

  it('um programa que passa de 3s depois de pronto é interrompido', async () => {
    const resultado = executeCode('while (true) {}');
    const worker = ultimo();

    worker.pronto();
    await vi.advanceTimersByTimeAsync(EXECUTION_TIMEOUT_MS + 1);

    const r = await resultado;
    expect(r.timedOut).toBe(true);
    expect(r.error).toMatch(/passou de 3 segundos/);
    // Interromper é a única saída de um laço infinito: o worker morre.
    expect(worker.encerrado).toBe(true);
  });

  it('o programa recebe o código mesmo antes de o worker dizer pronto', () => {
    // A mensagem fica na fila do worker; não há motivo para segurá-la.
    executeCode('x', [{ description: 't', assertion: 'a' }]);
    expect(ultimo().recebidas).toEqual([
      { code: 'x', tests: [{ description: 't', assertion: 'a' }], properties: [] },
    ]);
  });
});

describe('quando o worker nem chega a existir', () => {
  it('avisa que foi o ambiente, e não o código do aluno', async () => {
    const resultado = executeCode('console.log(1)');
    const worker = ultimo();

    await vi.advanceTimersByTimeAsync(STARTUP_TIMEOUT_MS + 1);

    const r = await resultado;
    expect(r.error).toMatch(/ambiente de execução não ficou pronto/);
    // Não é um laço infinito, e a tela não deve dizer que foi.
    expect(r.timedOut).toBeUndefined();
    expect(worker.encerrado).toBe(true);
  });

  it('o prazo de subir é bem maior do que o do aluno', () => {
    // Rede de celular, arquivo do worker disputando banda com o editor.
    expect(STARTUP_TIMEOUT_MS).toBeGreaterThanOrEqual(EXECUTION_TIMEOUT_MS * 5);
  });
});

describe('o resultado', () => {
  it('encerra o worker e entrega saída e registros', async () => {
    const resultado = executeCode('console.log("a"); console.log("b")');
    const worker = ultimo();

    worker.pronto();
    worker.responder(['a', 'b']);

    await expect(resultado).resolves.toEqual({
      output: 'a\nb',
      logs: ['a', 'b'],
      testResults: [],
      error: undefined,
    });
    expect(worker.encerrado).toBe(true);
  });

  it('um erro do worker vira mensagem, e não exceção na página', async () => {
    const resultado = executeCode('x');
    const worker = ultimo();
    const preventDefault = vi.fn();

    worker.onerror?.({ message: 'SyntaxError: inesperado', preventDefault });

    await expect(resultado).resolves.toMatchObject({ error: 'SyntaxError: inesperado' });
    expect(preventDefault).toHaveBeenCalled();
    expect(worker.encerrado).toBe(true);
  });
});
