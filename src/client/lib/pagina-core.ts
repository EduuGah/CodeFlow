import { buildProgram, type SandboxTest, type SandboxTestResult } from './sandbox-core';

/**
 * O motor de página: o código do aluno vira um documento HTML de verdade.
 *
 * O sandbox de Worker roda JavaScript puro, e não tem `document`. As aulas de
 * HTML, CSS e DOM precisam de uma página — e a única página segura para rodar
 * código de aluno é um `<iframe sandbox>` com origem opaca: sem acesso aos
 * cookies, ao `localStorage` nem à sessão do Supabase da página de fora, e sem
 * rede, por CSP.
 *
 * Este módulo é a parte **pura** do motor: monta o documento e interpreta a
 * mensagem que volta dele. Não toca em DOM nenhum, e por isso roda também no
 * Node com jsdom — é assim que o CI prova que cada exercício de página é
 * resolvível sem abrir um navegador.
 *
 * Como o documento é montado:
 *
 * 1. `<head>` nosso, com a CSP e a captura de `console` e de erros — instalada
 *    ANTES de qualquer código do aluno.
 * 2. O código do aluno, dentro do `<body>`. Se ele escrever um documento
 *    inteiro (`<html lang>`, `<title>`, `<style>`), o analisador de HTML
 *    tolera: atributos de `<html>` e `<body>` são mesclados nos elementos que
 *    já existem, e `<title>`, `<meta>` e `<style>` funcionam de dentro do
 *    corpo. Um exercício sobre `lang` ou sobre `<title>` continua verificável.
 * 3. Os testes, num `<script>` no fim do corpo, disparados no `load` — depois
 *    dos scripts do aluno e de qualquer `DOMContentLoaded` que ele tenha usado.
 *    As asserções são as mesmas do sandbox de Worker (`buildProgram`), então
 *    `await`, prazo por teste e mensagem de falha funcionam igual; a diferença
 *    é que aqui elas enxergam `document`.
 */

/** O que o iframe manda de volta. Só existe uma mensagem, no fim. */
export const TIPO_DA_MENSAGEM = 'codeflow:pagina';

export interface ResultadoDaPagina {
  tipo: typeof TIPO_DA_MENSAGEM;
  logs: string[];
  testResults: SandboxTestResult[];
  /** Erro de script do aluno (`window.onerror`), se houve. */
  error?: string;
}

/**
 * Sem rede, sem recursos externos.
 *
 * `default-src 'none'` bloqueia `fetch`, `XMLHttpRequest`, imagens, fontes e
 * scripts de fora. É o equivalente do `lockDownGlobals` do Worker, só que
 * aplicado pelo navegador — que é mais confiável do que apagar funções.
 * Imagens entram só como `data:` ou `blob:`, para as aulas de `<img>`.
 *
 * `'unsafe-eval'` é necessário: os testes rodam por `new Function`, e sem ele
 * o Chromium recusa ("Evaluating a string as JavaScript violates…"). O jsdom
 * ignora CSP, então isto só apareceu no E2E — é o tipo de coisa que a página
 * de verdade decide.
 */
export const CSP_DA_PAGINA =
  "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data:";

/**
 * Atributo `sandbox` do iframe.
 *
 * `allow-scripts` sem `allow-same-origin` é o que dá a origem opaca. Sem
 * `allow-top-navigation`, nada tira o aluno da aula. `allow-modals` deixa
 * `alert()` funcionar, porque é a primeira coisa que todo iniciante escreve,
 * e vê-lo mudo seria confuso.
 *
 * `allow-forms` entrou com a trilha de React: sem ele, o Chromium não
 * dispara o `submit` quando a pessoa clica num botão de envio ou aperta
 * Enter no campo — a pré-visualização ficava muda num formulário certo, e
 * a aula diz que Enter envia. Com ele, o `submit` acontece; um formulário
 * sem `preventDefault` navega o iframe, que é exatamente o que a página de
 * verdade faria — e o que a aula de formulários ensina a impedir.
 */
export const SANDBOX_DO_IFRAME = 'allow-scripts allow-modals allow-forms';

/** Prazo para a página carregar e os testes responderem. */
export const PRAZO_DA_PAGINA_MS = 5000;

/**
 * Fecha um `</script>` que o aluno tenha dentro de uma string, para o nosso
 * `<script>` de testes não ser encerrado no meio.
 */
function escaparParaScript(codigo: string): string {
  return codigo.replace(/<\/script/gi, '<\\/script');
}

const CAPTURA = `
(function () {
  var logs = [];
  var erro;
  function texto(v) {
    if (typeof v === 'string') return v;
    if (v instanceof Error) return v.name + ': ' + v.message;
    if (typeof v === 'function') return '[Function: ' + (v.name || 'anônima') + ']';
    try { var j = JSON.stringify(v); return j === undefined ? String(v) : j; }
    catch (e) { return String(v); }
  }
  function registrar() {
    if (logs.length >= 500) return;
    logs.push(Array.prototype.map.call(arguments, texto).join(' '));
  }
  var original = console;
  ['log', 'info', 'warn', 'error'].forEach(function (nome) {
    var real = original[nome] ? original[nome].bind(original) : function () {};
    console[nome] = function () { registrar.apply(null, arguments); real.apply(null, arguments); };
  });
  window.addEventListener('error', function (e) {
    // O e.message do Chrome já vem com "Uncaught ReferenceError: ..."; o
    // objeto do erro, quando existe, dá o nome e a mensagem limpos.
    if (!erro) {
      erro = e.error && e.error.name
        ? e.error.name + ': ' + e.error.message
        : (e.message || 'Erro no script').replace(/^Uncaught /, '');
    }
    e.preventDefault();
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    if (!erro) erro = 'Rejeição sem tratamento: ' + (r && r.message ? r.message : String(r));
    e.preventDefault();
  });
  window.__codeflow = { logs: logs, erro: function () { return erro; } };

  // Armazenamento em memória no lugar do localStorage.
  //
  // A origem opaca do iframe não tem localStorage: ler window.localStorage
  // lança SecurityError no navegador e ReferenceError no jsdom. As aulas de
  // armazenamento ensinam a API — getItem, setItem, JSON —, e é a API que
  // este objeto oferece; ele dura uma execução da página, e a aula diz isso.
  function criarArmazenamento() {
    var dados = {};
    return {
      getItem: function (chave) { return Object.prototype.hasOwnProperty.call(dados, chave) ? dados[chave] : null; },
      setItem: function (chave, valor) { dados[String(chave)] = String(valor); },
      removeItem: function (chave) { delete dados[chave]; },
      clear: function () { dados = {}; },
      key: function (i) { return Object.keys(dados)[i] === undefined ? null : Object.keys(dados)[i]; },
      get length() { return Object.keys(dados).length; }
    };
  }
  try { Object.defineProperty(window, 'localStorage', { value: criarArmazenamento(), configurable: true }); } catch (e) {}
  try { Object.defineProperty(window, 'sessionStorage', { value: criarArmazenamento(), configurable: true }); } catch (e) {}

  // Um servidor de mentira para o fetch.
  //
  // A CSP bloqueia toda rede, de propósito. Mas a aula de buscar dados precisa
  // do gesto real — fetch(url), conferir ok, await resposta.json() —, então
  // fetch aqui responde com o que a página declarou em window.__servidor:
  // um objeto de caminho → dados. Caminho desconhecido é 404, como na vida.
  window.fetch = function (url, opcoes) {
    var caminho = String(url).replace(/^https?:\\/\\/[^/]+/, '').split('?')[0];
    var servidor = window.__servidor || {};
    var metodo = (opcoes && opcoes.method ? opcoes.method : 'GET').toUpperCase();
    var existe = Object.prototype.hasOwnProperty.call(servidor, caminho);
    var dados = existe ? servidor[caminho] : null;
    if (existe && typeof dados === 'function') dados = dados(opcoes || {});
    var status = existe ? 200 : 404;
    var corpo = existe ? JSON.stringify(dados) : JSON.stringify({ erro: 'não encontrado: ' + caminho });
    var resposta = {
      ok: status >= 200 && status < 300,
      status: status,
      statusText: status === 200 ? 'OK' : 'Not Found',
      url: String(url),
      headers: { get: function (nome) { return String(nome).toLowerCase() === 'content-type' ? 'application/json' : null; } },
      json: function () { return Promise.resolve(JSON.parse(corpo)); },
      text: function () { return Promise.resolve(corpo); }
    };
    void metodo;
    return new Promise(function (resolver) { setTimeout(function () { resolver(resposta); }, 30); });
  };
})();
`;

/**
 * O documento completo, pronto para `srcdoc`.
 *
 * Os testes são o mesmo programa do Worker, com o código do aluno vazio: só
 * as asserções, que aqui rodam no escopo global da página e enxergam
 * `document`, `window` e tudo que os `<script>` do aluno declararam no
 * topo — inclusive `let` e `const`, porque uma função criada com `Function`
 * resolve nomes pelo ambiente global do realm.
 */
export function montarDocumento(codigoDoAluno: string, tests: SandboxTest[]): string {
  // Em série: os testes compartilham o DOM, e um clique de um não pode
  // atropelar o que o outro está lendo.
  const programaDeTestes = escaparParaScript(buildProgram('', tests, [], { sequencial: true }));

  const corredor = `
(function () {
  function enviar(resultado) {
    var estado = window.__codeflow || { logs: [], erro: function () { return undefined; } };
    var mensagem = {
      tipo: ${JSON.stringify(TIPO_DA_MENSAGEM)},
      logs: estado.logs.slice(),
      testResults: resultado,
      error: estado.erro()
    };
    window.parent.postMessage(mensagem, '*');
  }
  function rodar() {
    var testes;
    try {
      testes = new Function(${JSON.stringify(programaDeTestes)})();
    } catch (e) {
      enviar([{ passed: false, message: 'Os testes não puderam rodar: ' + (e && e.message ? e.message : String(e)) }]);
      return;
    }
    Promise.resolve(testes).then(enviar, function (e) {
      enviar([{ passed: false, message: 'Os testes não puderam rodar: ' + (e && e.message ? e.message : String(e)) }]);
    });
  }
  if (document.readyState === 'complete') rodar();
  else window.addEventListener('load', rodar);
})();
`;

  return [
    '<!doctype html>',
    '<html lang="pt-BR">',
    '<head>',
    '<meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="${CSP_DA_PAGINA}">`,
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<script>${CAPTURA}</script>`,
    '</head>',
    '<body>',
    codigoDoAluno,
    `<script>${corredor}</script>`,
    '</body>',
    '</html>',
  ].join('\n');
}

/**
 * Lê a mensagem do iframe, ou devolve `null` se não for dele.
 *
 * O `message` do `window` recebe de qualquer origem — inclusive de extensões
 * e de outros iframes. Quem chama ainda precisa conferir `event.source`;
 * aqui se confere a forma.
 */
export function interpretarMensagem(data: unknown): ResultadoDaPagina | null {
  if (!data || typeof data !== 'object') return null;
  const m = data as Partial<ResultadoDaPagina>;
  if (m.tipo !== TIPO_DA_MENSAGEM) return null;
  if (!Array.isArray(m.logs) || !Array.isArray(m.testResults)) return null;

  return {
    tipo: TIPO_DA_MENSAGEM,
    logs: m.logs.map(String),
    testResults: m.testResults.map((t) => ({
      passed: Boolean((t as SandboxTestResult).passed),
      message: String((t as SandboxTestResult).message ?? ''),
    })),
    error: typeof m.error === 'string' ? m.error : undefined,
  };
}
