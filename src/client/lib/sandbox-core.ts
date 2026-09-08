/**
 * Núcleo de execução do código do aluno.
 *
 * Puro de propósito: não depende de Worker, DOM nem de nada do navegador. Isso
 * permite que o worker use este módulo em produção e que os testes automatizados
 * o chamem direto no Node, sem duplicar a lógica de montagem do programa —
 * é exatamente o mesmo código que o aluno vai executar que a suíte verifica.
 *
 * O isolamento (thread separada, timeout, bloqueio de rede) é responsabilidade
 * de quem chama, não daqui.
 */

/** Um teste: o JavaScript que verifica, e a frase que o aluno lê quando passa. */
export interface SandboxTest {
  description: string;
  assertion: string;
}

/**
 * Uma propriedade: uma regra que vale para qualquer entrada, verificada contra
 * dezenas de casos sorteados.
 *
 * Existe porque o teste de caso fixo tem um buraco que só aparece do lado do
 * aluno. `somar(2, 3) !== 5` é passável com `if (a === 2 && b === 3) return 5` —
 * o exercício recompensa decorar o teste em vez de resolver o problema, que é o
 * oposto do que a plataforma existe para fazer.
 *
 * O sorteio é determinístico: a semente vem do texto da descrição, então o mesmo
 * exercício sempre gera os mesmos casos. Sem isso um exercício passaria hoje e
 * falharia amanhã, e o CI viraria loteria.
 */
export interface SandboxProperty {
  /** O que a propriedade afirma, em uma frase. */
  description: string;
  /** Corpo de função que devolve um caso. Tem `rnd()` disponível — sorteio em [0, 1). */
  generate: string;
  /** Corpo de função que recebe `caso` e lança quando a propriedade não vale. */
  check: string;
  /** Quantos casos sortear. Padrão 50. */
  runs?: number;
}

export interface SandboxTestResult {
  passed: boolean;
  message: string;
}

export interface SandboxRunResult {
  logs: string[];
  testResults: SandboxTestResult[];
  error?: string;
}

/** Teto de logs: um laço que imprime sem parar não pode estourar a memória. */
export const MAX_LOGS = 500;
/** Teto por linha, para um único console.log gigante não travar a renderização. */
export const MAX_LOG_LENGTH = 2000;

/** Casos sorteados por propriedade, quando o autor não diz outro número. */
export const PROPERTY_RUNS_PADRAO = 50;
/** Teto de casos: o worker tem 3 segundos, e cada caso roda o código do aluno. */
export const PROPERTY_RUNS_MAX = 200;
/**
 * Teto de tentativas de simplificação depois de uma falha.
 *
 * Encolher é útil mas não é o objetivo: gastar o orçamento inteiro procurando o
 * caso mínimo perfeito arrisca estourar o tempo e o aluno não ver falha nenhuma.
 */
export const PROPERTY_SHRINK_MAX = 60;

/**
 * Prazo de cada teste, em milissegundos.
 *
 * Sem ele, um exercício de callback trava para sempre quando o aluno esquece de
 * chamar o callback: a asserção espera uma promessa que ninguém resolve. E travar
 * é o pior retorno possível — a tela fica rodando e não diz nada.
 *
 * O prazo transforma a trava numa frase que ensina.
 */
export const TEST_TIMEOUT_MS = 2000;

/**
 * Janela para o que ficou agendado terminar antes de fechar a saída.
 *
 * `setTimeout(fn, 0)` roda depois do código atual, então sem esta espera o
 * `console.log` de dentro dele não entraria na saída — e uma aula sobre ordem de
 * execução não teria como mostrar justamente o que ela ensina.
 */
export const SETTLE_MAX_MS = 300;

/**
 * Espera o que ficou agendado terminar, enquanto a saída continuar crescendo.
 *
 * `setTimeout(fn, 0)` só roda depois que o código atual acaba. Sem esta janela, o
 * `console.log` de dentro dele ficaria de fora da saída — e uma aula sobre ordem
 * de execução não conseguiria demonstrar o que ensina.
 *
 * Para quando a saída para de crescer, e não fica esperando o teto à toa: um
 * programa comum sai daqui em poucos milissegundos.
 */
async function esperarAgendados(medir: () => number): Promise<void> {
  const passo = 10;
  let quietas = 0;
  let anterior = medir();

  for (let esperado = 0; esperado < SETTLE_MAX_MS && quietas < 2; esperado += passo) {
    await new Promise((resolve) => setTimeout(resolve, passo));

    const agora = medir();
    quietas = agora === anterior ? quietas + 1 : 0;
    anterior = agora;
  }
}

function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}`;

  try {
    return JSON.stringify(arg) ?? String(arg);
  } catch {
    // Referência circular, por exemplo.
    return String(arg);
  }
}

/**
 * Auxiliares injetados no programa quando há propriedades a verificar.
 *
 * Ficam em JavaScript de string, e não em TypeScript aqui em cima, porque
 * precisam rodar no mesmo escopo que o código do aluno — é isso que permite às
 * propriedades chamarem funções que o aluno acabou de declarar, sem saber os
 * nomes de antemão.
 *
 * O prefixo `__cf` existe para não colidir com nada que o aluno escreva.
 */
const AUXILIARES = `
function __cfSemente(texto) {
  var h = 2166136261;
  for (var i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Fonte que devolve sempre o mesmo valor, para sondar os limites do gerador. */
function __cfConstante(valor) {
  return function () { return valor; };
}

function __cfRnd(semente) {
  var a = semente >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function __cfFormatar(valor) {
  try {
    var texto = JSON.stringify(valor);
    if (texto === undefined) return String(valor);
    return texto.length > 200 ? texto.slice(0, 200) + '…' : texto;
  } catch (e) {
    return String(valor);
  }
}

/** Devolve a mensagem de erro, ou null quando a propriedade vale para o caso. */
async function __cfFalha(caso, verificar) {
  try {
    await verificar(caso);
    return null;
  } catch (err) {
    var msg = err && err.message ? err.message : String(err);
    return msg || 'a propriedade não valeu';
  }
}

/** Versões mais simples de um valor, da mais simples para a menos. */
function __cfCandidatos(valor) {
  if (typeof valor === 'number' && isFinite(valor)) {
    var opcoes = [0, Math.trunc(valor / 2), valor > 0 ? valor - 1 : valor + 1];
    return opcoes.filter(function (n) {
      return Math.abs(n) < Math.abs(valor);
    });
  }

  if (typeof valor === 'string') {
    if (valor.length === 0) return [];
    return ['', valor.slice(0, Math.floor(valor.length / 2)), valor.slice(0, valor.length - 1)];
  }

  if (Array.isArray(valor)) {
    if (valor.length === 0) return [];
    return [[], valor.slice(0, Math.floor(valor.length / 2)), valor.slice(0, valor.length - 1)];
  }

  if (typeof valor === 'boolean') return valor ? [false] : [];
  return [];
}

function __cfCopia(objeto) {
  if (Array.isArray(objeto)) return objeto.slice();
  var novo = {};
  for (var k in objeto) {
    if (Object.prototype.hasOwnProperty.call(objeto, k)) novo[k] = objeto[k];
  }
  return novo;
}

/**
 * Procura um caso mais simples que ainda falhe.
 *
 * Falhar com n = 0 ensina muito mais do que falhar com n = 73: o aluno vê o caso
 * extremo que ele não tratou, em vez de um número sorteado sem significado.
 */
async function __cfEncolher(caso, verificar, orcamento) {
  var atual = caso;
  var ehObjeto = atual !== null && typeof atual === 'object' && !Array.isArray(atual);
  var melhorou = true;

  while (melhorou && orcamento.restante > 0) {
    melhorou = false;

    if (ehObjeto) {
      for (var chave in atual) {
        if (!Object.prototype.hasOwnProperty.call(atual, chave)) continue;

        var opcoes = __cfCandidatos(atual[chave]);
        for (var i = 0; i < opcoes.length && orcamento.restante > 0; i++) {
          var tentativa = __cfCopia(atual);
          tentativa[chave] = opcoes[i];
          orcamento.restante--;

          if (await __cfFalha(tentativa, verificar)) {
            atual = tentativa;
            melhorou = true;
            break;
          }
        }
      }
    } else {
      var diretas = __cfCandidatos(atual);
      for (var j = 0; j < diretas.length && orcamento.restante > 0; j++) {
        orcamento.restante--;
        if (await __cfFalha(diretas[j], verificar)) {
          atual = diretas[j];
          melhorou = true;
          break;
        }
      }
    }
  }

  return atual;
}
`;

/**
 * Um caso de teste vira uma função assíncrona que devolve passou/falhou.
 *
 * Assíncrona por necessidade, não por elegância. Sem isso, `await` na asserção é
 * erro de sintaxe — e uma asserção escrita com `.then()` reportava sucesso antes
 * de a promise resolver, dizendo ao aluno que a resposta errada estava certa.
 * Um exercício que mente é pior do que um exercício que falta.
 */
function expressaoDeTeste(test: SandboxTest): string {
  return `
        (async function () {
          try {
            await Promise.race([
              (async function () { ${test.assertion} })(),
              new Promise(function (_, rejeitar) {
                setTimeout(function () {
                  rejeitar(new Error(
                    'O teste não terminou em ${TEST_TIMEOUT_MS}ms. Se o exercício usa callback ou promise, confira se o seu código chega a avisar que terminou.'
                  ));
                }, ${TEST_TIMEOUT_MS});
              })
            ]);
            return { passed: true, message: ${JSON.stringify(test.description)} };
          } catch (err) {
            return { passed: false, message: err && err.message ? err.message : String(err) };
          }
        })()`;
}

/** Uma propriedade vira um laço sobre casos sorteados, com simplificação na falha. */
function expressaoDePropriedade(propriedade: SandboxProperty): string {
  const runs = Math.min(
    PROPERTY_RUNS_MAX,
    Math.max(1, Math.trunc(propriedade.runs ?? PROPERTY_RUNS_PADRAO))
  );
  const descricao = JSON.stringify(propriedade.description);

  return `
        (async function () {
          var descricao = ${descricao};
          var aleatorio = __cfRnd(__cfSemente(descricao));
          // O mesmo prazo dos casos fixos: sem ele, um exercício de callback em
          // que o aluno esqueceu de avisar trava o laço inteiro.
          var prazo = new Promise(function (_, rejeitar) {
            setTimeout(function () {
              rejeitar(new Error(
                'A propriedade não terminou em ${TEST_TIMEOUT_MS}ms. Se o exercício usa callback ou promise, confira se o seu código chega a avisar que terminou.'
              ));
            }, ${TEST_TIMEOUT_MS});
          });

          // As sondas rodam antes do sorteio. Um gerador uniforme quase nunca
          // acerta o caso extremo — em 50 sorteios de 0 a 99, o zero sai em
          // menos da metade das execuções, e é justamente o caso que o aluno
          // esqueceu. Forçando a fonte aos limites, o gerador produz o extremo
          // da forma que ele mesmo montou, seja número, tamanho de lista ou
          // escolha entre ramos.
          var sondas = [__cfConstante(0), __cfConstante(0.9999999), __cfConstante(0.5)];
          var rnd = aleatorio;

          async function gerar() { ${propriedade.generate} }
          async function verificar(caso) { ${propriedade.check} }

          try {
            return await Promise.race([prazo, (async function () {
            for (var i = 0; i < ${runs}; i++) {
              rnd = i < sondas.length ? sondas[i] : aleatorio;
              var caso = await gerar();
              var erro = await __cfFalha(caso, verificar);
              if (!erro) continue;

              var orcamento = { restante: ${PROPERTY_SHRINK_MAX} };
              var simples = await __cfEncolher(caso, verificar, orcamento);
              var mensagem = (await __cfFalha(simples, verificar)) || erro;

              return {
                passed: false,
                message: descricao + ' — falhou com ' + __cfFormatar(simples) + ': ' + mensagem
              };
            }

            return { passed: true, message: descricao + ' (${runs} casos)' };
            })()]);
          } catch (err) {
            return {
              passed: false,
              message: descricao + ' — ' + (err && err.message ? err.message : String(err))
            };
          }
        })()`;
}

/**
 * Monta um único corpo de função com o código do aluno seguido dos testes.
 *
 * Os testes ficam em funções aninhadas dentro do mesmo escopo, então enxergam as
 * variáveis e funções que o aluno declarou — sem precisar saber os nomes de
 * antemão. As propriedades vêm depois dos casos: quando as duas falham, o caso
 * fixo costuma ser a mensagem mais fácil de entender primeiro.
 */
export function buildProgram(
  code: string,
  tests: SandboxTest[],
  properties: SandboxProperty[] = []
): string {
  const expressoes = [...tests.map(expressaoDeTeste), ...properties.map(expressaoDePropriedade)];

  // Os auxiliares só entram quando são usados: um programa de exercício simples
  // não precisa carregar o sorteio nem o encolhimento.
  const auxiliares = properties.length > 0 ? AUXILIARES : '';

  return `"use strict";
${code}
;${auxiliares}
;return Promise.all([${expressoes.join(',')}]);`;
}

/**
 * Executa o código do aluno e roda os testes contra ele.
 *
 * Devolve uma promessa porque o código do aluno pode ser assíncrono, e uma
 * asserção que não é esperada reporta sucesso antes de a promise resolver.
 *
 * Um laço infinito só é interrompido por quem chama (no navegador, encerrando o
 * worker). Nunca lança — erro de sintaxe ou de execução volta no campo `error`.
 */
export async function runProgram(
  code: string,
  tests: SandboxTest[],
  properties: SandboxProperty[] = []
): Promise<SandboxRunResult> {
  const logs: string[] = [];
  let truncated = false;

  const capture = (...args: unknown[]) => {
    if (logs.length >= MAX_LOGS) {
      if (!truncated) {
        truncated = true;
        logs.push(`… saída interrompida após ${MAX_LOGS} linhas.`);
      }
      return;
    }

    const line = args.map(formatArg).join(' ');
    logs.push(line.length > MAX_LOG_LENGTH ? `${line.slice(0, MAX_LOG_LENGTH)}…` : line);
  };

  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  console.log = capture;
  console.info = capture;
  console.warn = capture;
  console.error = capture;

  try {
    const program = new Function(buildProgram(code, tests, properties));
    const testResults = (await program()) as SandboxTestResult[];

    await esperarAgendados(() => logs.length);

    return { logs, testResults };
  } catch (error) {
    // Erro de sintaxe (na construção) ou de execução do código do aluno.
    return {
      logs,
      testResults: [],
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    };
  } finally {
    console.log = original.log;
    console.info = original.info;
    console.warn = original.warn;
    console.error = original.error;
  }
}
