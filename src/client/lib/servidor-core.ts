/**
 * Motor 4: o servidor simulado.
 *
 * O aluno escreve o servidor como escreveria no Node de verdade —
 * `const express = require('express')`, `app.get('/rota', (req, res) =>
 * …)`, `app.listen(3000)` — e ele roda aqui dentro, no mesmo worker dos
 * outros exercícios, sem abrir porta nenhuma. O que existe é um Node de
 * mentira, com o bastante para o código ser o mesmo que rodaria fora:
 *
 * - `require`: devolve o `express` daqui, o módulo `./x` que o exercício
 *   fornecer em `arquivos` — resolvido relativo a quem pede, com `../` e
 *   pasta com `index.js`, como no Node — e recusa o resto com uma frase;
 * - `require('./banco')`: nos exercícios com banco, o SQLite do exercício
 *   (motor 5, dentro deste mesmo worker) com `consultar(sql, params)` e
 *   `executar(sql, params)`, os dois devolvendo Promises — como um driver
 *   de banco de verdade, e para o aluno manter o hábito do `await`;
 * - `process.env`: o que o exercício definir em `env`;
 * - `module.exports` / `exports`: para o aluno exportar como no Node;
 * - `express()`: um Express pequeno — rotas com `:parametro`, `req.query`,
 *   `req.body` (só depois de `express.json()`, como no de verdade), `res.status`,
 *   `res.json`, `res.send`, `res.set`, `app.use` com prefixo, `next`,
 *   middleware de erro com quatro argumentos, 404 e 500 padrão;
 * - `pedir(app, método, caminho, opções)`: o cliente HTTP dos testes. Cada
 *   pedido e a resposta vão para a lista de trocas, que a tela mostra como
 *   um cliente de API mostraria.
 *
 * Tudo em JavaScript de texto, porque precisa rodar no escopo do código do
 * aluno, dentro do `new Function` do sandbox. O sandbox continua sendo o
 * mesmo (`sandbox-core.ts`): isto é só o que vai antes do código.
 */

export interface Troca {
  metodo: string;
  caminho: string;
  /** O corpo enviado, já como texto (JSON quando era objeto). */
  corpo?: string;
  status: number;
  /** A resposta, como texto. */
  resposta: string;
  /** Cabeçalhos relevantes da resposta (content-type, por ora). */
  tipo?: string;
}

export interface OpcoesDoServidor {
  /** `process.env` do exercício. */
  env?: Record<string, string>;
  /** Módulos que `require('./nome')` encontra: caminho → código. */
  arquivos?: Record<string, string>;
  /** Onde o arquivo do aluno mora, para o `require` relativo dele. Padrão `'./servidor'`. */
  caminho?: string;
}

/**
 * O Node de mentira e o Express pequeno. Prefixo `__cf` no que é interno,
 * para não colidir com nada que o aluno escreva; `require`, `process`,
 * `module`, `exports` e `pedir` são os nomes que o aluno usa.
 */
const PRELUDIO = String.raw`
var __cfTrocas = [];
globalThis.__cfTrocas = __cfTrocas;
var process = { env: __CF_ENV__ };
var module = { exports: {} };
var exports = module.exports;
var __cfArquivos = __CF_ARQUIVOS__;
var __cfModulos = {};
// O arquivo do aluno é a raiz ('./servidor'); cada módulo carregado entra na
// pilha enquanto roda, para um require('../dados/x') dentro de
// './servicos/y' resolver como no Node: relativo ao arquivo que pede.
var __cfPilhaDeModulos = [__CF_CAMINHO__];

function __cfNormalizar(caminho) {
  var partes = caminho.split('/');
  var saida = [];
  for (var i = 0; i < partes.length; i++) {
    var p = partes[i];
    if (p === '' || p === '.') continue;
    if (p === '..') { if (saida.length > 0) saida.pop(); continue; }
    saida.push(p);
  }
  return './' + saida.join('/');
}

function __cfResolver(nome) {
  var base = __cfPilhaDeModulos[__cfPilhaDeModulos.length - 1];
  var pasta = base.slice(0, base.lastIndexOf('/'));
  return __cfNormalizar(pasta + '/' + nome.replace(/\.js$/, ''));
}

var __cfBancoModulo = null;
function __cfBanco() {
  if (__cfBancoModulo) return __cfBancoModulo;
  var nativo = typeof __cfBancoNativo === 'undefined' ? null : __cfBancoNativo;
  if (!nativo) {
    throw new Error("Este exercício não tem banco de dados: require('./banco') só existe nos exercícios que declaram um banco.");
  }
  __cfBancoModulo = {
    consultar: function (sql, params) {
      return Promise.resolve().then(function () { return nativo.consultar(String(sql), params || []); });
    },
    executar: function (sql, params) {
      return Promise.resolve().then(function () { return nativo.executar(String(sql), params || []); });
    },
  };
  return __cfBancoModulo;
}

function require(nome) {
  if (nome === 'express') return __cfExpress;
  // O banco do exercício, de qualquer pasta: './banco' na raiz, '../banco' de dentro de dados/.
  if (typeof nome === 'string' && /^\.\.?\/(?:.*\/)?banco(?:\.js)?$/.test(nome)) return __cfBanco();
  if (typeof nome === 'string' && (nome.startsWith('./') || nome.startsWith('../'))) {
    var chave = __cfResolver(nome);
    // Como no Node: 'x', 'x.js', ou a pasta x com o index.js dentro.
    var candidatos = [chave, chave + '.js', chave + '/index', chave + '/index.js'];
    var achada = null;
    for (var c = 0; c < candidatos.length; c++) {
      if (__cfArquivos[candidatos[c]] !== undefined) { achada = candidatos[c]; break; }
    }
    if (achada === null) {
      throw new Error("Cannot find module '" + nome + "' (procurado como " + chave + "). Neste exercício existem: " + (Object.keys(__cfArquivos).join(', ') || 'nenhum arquivo além deste') + '.');
    }
    if (__cfModulos[achada]) return __cfModulos[achada].exports;
    var mod = { exports: {} };
    __cfModulos[achada] = mod;
    __cfPilhaDeModulos.push(achada);
    try {
      new Function('require', 'module', 'exports', 'process', 'console', __cfArquivos[achada])(require, mod, mod.exports, process, console);
    } finally {
      __cfPilhaDeModulos.pop();
    }
    return mod.exports;
  }
  throw new Error("Cannot find module '" + nome + "'. Aqui dentro só existem o 'express' e os arquivos do exercício (require('./nome')).");
}

function __cfSegmentos(caminho) {
  return caminho.split('/').filter(function (s) { return s.length > 0; });
}

function __cfCasar(padrao, caminho) {
  var a = __cfSegmentos(padrao);
  var b = __cfSegmentos(caminho);
  if (a.length !== b.length) return null;
  var params = {};
  for (var i = 0; i < a.length; i++) {
    if (a[i].charAt(0) === ':') params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

function __cfPrefixo(prefixo, caminho) {
  if (prefixo === '/' || prefixo === '') return true;
  var a = __cfSegmentos(prefixo);
  var b = __cfSegmentos(caminho);
  if (a.length > b.length) return false;
  for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function __cfExpress() {
  var camadas = [];

  function registrar(metodo, args) {
    var caminho = typeof args[0] === 'string' ? args[0] : '/';
    var fns = (typeof args[0] === 'string' ? args.slice(1) : args).filter(function (f) { return typeof f === 'function'; });
    if (fns.length === 0) throw new Error('app.' + metodo.toLowerCase() + "('" + caminho + "') precisa de uma função (req, res) => …");
    fns.forEach(function (fn) { camadas.push({ metodo: metodo, caminho: caminho, fn: fn, rota: true }); });
    return app;
  }

  var app = {
    get: function () { return registrar('GET', [].slice.call(arguments)); },
    post: function () { return registrar('POST', [].slice.call(arguments)); },
    put: function () { return registrar('PUT', [].slice.call(arguments)); },
    patch: function () { return registrar('PATCH', [].slice.call(arguments)); },
    delete: function () { return registrar('DELETE', [].slice.call(arguments)); },
    all: function () { return registrar('*', [].slice.call(arguments)); },
    use: function () {
      var args = [].slice.call(arguments);
      var caminho = typeof args[0] === 'string' ? args[0] : '/';
      var fns = (typeof args[0] === 'string' ? args.slice(1) : args).filter(function (f) { return typeof f === 'function'; });
      if (fns.length === 0) throw new Error('app.use precisa de uma função (req, res, next) => …');
      fns.forEach(function (fn) { camadas.push({ metodo: '*', caminho: caminho, fn: fn, rota: false }); });
      return app;
    },
    listen: function (porta, cb) {
      app.porta = porta;
      // Como no Node: o callback roda depois, não na hora — um console.log
      // logo abaixo do listen aparece antes do "ouvindo na porta".
      if (typeof cb === 'function') setTimeout(cb, 0);
      return { close: function () {} };
    },
    porta: null,
    __cfCamadas: camadas,
  };
  // O último app criado é o que a página do motor 7 vai chamar: quem serve
  // a página não conhece o nome da variável do aluno.
  globalThis.__cfUltimoApp = app;
  return app;
}

__cfExpress.json = function () {
  return function __cfJson(req, res, next) {
    var tipo = (req.headers['content-type'] || '').toLowerCase();
    if (req.__cfCorpo !== undefined && tipo.indexOf('application/json') === 0) {
      try {
        req.body = JSON.parse(req.__cfCorpo);
      } catch (e) {
        res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
        return;
      }
    }
    next();
  };
};

function __cfResposta() {
  var res = {
    statusCode: 200,
    headers: {},
    corpo: undefined,
    enviado: false,
    status: function (n) { res.statusCode = n; return res; },
    set: function (nome, valor) { res.headers[String(nome).toLowerCase()] = String(valor); return res; },
    json: function (dado) {
      if (res.enviado) throw new Error('A resposta já foi enviada: só se pode responder uma vez por requisição.');
      res.headers['content-type'] = 'application/json';
      res.corpo = JSON.stringify(dado === undefined ? null : dado);
      res.enviado = true;
      return res;
    },
    send: function (dado) {
      if (res.enviado) throw new Error('A resposta já foi enviada: só se pode responder uma vez por requisição.');
      if (dado !== null && typeof dado === 'object') return res.json(dado);
      if (!res.headers['content-type']) res.headers['content-type'] = 'text/plain';
      res.corpo = dado === undefined ? '' : String(dado);
      res.enviado = true;
      return res;
    },
    sendStatus: function (n) { res.statusCode = n; return n === 204 || n === 304 ? res.end() : res.send(String(n)); },
    end: function () { if (!res.enviado) { res.corpo = res.corpo === undefined ? '' : res.corpo; res.enviado = true; } return res; },
  };
  return res;
}

async function __cfDespachar(app, req) {
  var res = __cfResposta();
  var camadas = app.__cfCamadas;
  var erro = undefined;

  for (var i = 0; i < camadas.length && !res.enviado; i++) {
    var camada = camadas[i];
    var ehDeErro = camada.fn.length === 4;
    if (erro !== undefined && !ehDeErro) continue;
    if (erro === undefined && ehDeErro) continue;
    if (camada.rota) {
      if (camada.metodo !== '*' && camada.metodo !== req.method) continue;
      var params = __cfCasar(camada.caminho, req.path);
      if (params === null) continue;
      req.params = params;
    } else {
      if (!__cfPrefixo(camada.caminho, req.path)) continue;
    }

    var seguiu = false;
    var proximoErro = undefined;
    var next = function (e) { seguiu = true; if (e !== undefined) proximoErro = e; };
    try {
      if (ehDeErro) await camada.fn(erro, req, res, next);
      else await camada.fn(req, res, next);
    } catch (e) {
      proximoErro = e;
      seguiu = true;
    }
    if (proximoErro !== undefined) { erro = proximoErro; continue; }
    if (erro !== undefined && ehDeErro && seguiu) { continue; }
    if (erro !== undefined && ehDeErro) { erro = undefined; }
    if (!seguiu && !res.enviado) {
      // A camada não respondeu nem chamou next(): a requisição ficaria pendurada.
      throw new Error('A rota ' + req.method + ' ' + req.path + ' não respondeu nem chamou next(). Toda rota precisa terminar com res.send/res.json ou next().');
    }
    if (!seguiu) break;
  }

  if (!res.enviado) {
    if (erro !== undefined) {
      res.statusCode = 500;
      res.headers['content-type'] = 'application/json';
      res.corpo = JSON.stringify({ erro: erro && erro.message ? erro.message : String(erro) });
      res.enviado = true;
    } else {
      res.statusCode = 404;
      res.headers['content-type'] = 'application/json';
      res.corpo = JSON.stringify({ erro: 'Rota não encontrada: ' + req.method + ' ' + req.path });
      res.enviado = true;
    }
  }
  return res;
}

globalThis.__cfPedir = pedir;
async function pedir(app, metodo, url, opcoes) {
  if (!app || !app.__cfCamadas) throw new Error('pedir() precisa do app criado por express().');
  opcoes = opcoes || {};
  var partes = String(url).split('?');
  var caminho = partes[0] || '/';
  var query = {};
  if (partes[1]) {
    partes[1].split('&').forEach(function (par) {
      if (!par) return;
      var kv = par.split('=');
      query[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
    });
  }
  var headers = {};
  Object.keys(opcoes.headers || {}).forEach(function (k) { headers[k.toLowerCase()] = String(opcoes.headers[k]); });
  var corpo = opcoes.body;
  var corpoTexto = undefined;
  if (corpo !== undefined) {
    if (typeof corpo === 'string') { corpoTexto = corpo; if (!headers['content-type']) headers['content-type'] = 'text/plain'; }
    else { corpoTexto = JSON.stringify(corpo); if (!headers['content-type']) headers['content-type'] = 'application/json'; }
  }
  var req = {
    method: String(metodo).toUpperCase(),
    url: String(url),
    path: caminho,
    query: query,
    params: {},
    headers: headers,
    body: undefined,
    __cfCorpo: corpoTexto,
    get: function (nome) { return headers[String(nome).toLowerCase()]; },
  };
  var res = await __cfDespachar(app, req);
  var tipo = res.headers['content-type'] || '';
  var texto = res.corpo === undefined ? '' : res.corpo;
  var body = texto;
  if (tipo.indexOf('application/json') === 0 && texto !== '') {
    try { body = JSON.parse(texto); } catch (e) { body = texto; }
  }
  __cfTrocas.push({ metodo: req.method, caminho: String(url), corpo: corpoTexto, status: res.statusCode, resposta: texto, tipo: tipo || undefined });
  return { status: res.statusCode, headers: res.headers, body: body, texto: texto };
}
`;

/**
 * O programa: o prelúdio com o ambiente do exercício, e o código do aluno
 * depois. Os testes entram pelo sandbox, em série — um servidor tem estado
 * (o POST de um teste é o GET do seguinte), e testes em paralelo disputariam
 * a mesma lista.
 */
export function montarCodigoDoServidor(codigo: string, opcoes: OpcoesDoServidor = {}): string {
  const preludio = PRELUDIO.replace('__CF_ENV__', JSON.stringify(opcoes.env ?? {}))
    .replace('__CF_ARQUIVOS__', JSON.stringify(opcoes.arquivos ?? {}))
    .replace('__CF_CAMINHO__', JSON.stringify(opcoes.caminho ?? './servidor'));
  return `${preludio}\n${codigo}`;
}

/** Um pedido que a página faz ao servidor vivo, pelo `fetch` de mentira. */
export interface PedidoAoServidor {
  metodo: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

/** O que o servidor vivo responde: o suficiente para o `fetch` da página montar um Response. */
export interface RespostaDoServidor {
  status: number;
  headers: Record<string, string>;
  texto: string;
}

/**
 * Um servidor que continua de pé depois de rodar: a segunda metade do
 * motor 7. Roda o programa (o prelúdio já dentro) e, em vez de testes, deixa
 * uma função `pedir` que entrega pedidos ao último `app` criado — é ela que
 * o `fetch` da página do aluno chama, por mensagens, do iframe até aqui.
 */
export interface ServidorVivo {
  pedir(pedido: PedidoAoServidor): Promise<RespostaDoServidor>;
  /** O que o servidor imprimiu ao subir. */
  logs: string[];
  /** Se o programa quebrou ao subir: não há app para pedir. */
  error?: string;
  /** As trocas registradas até agora, para a tela mostrar. */
  trocas(): Troca[];
}

type PedirDoPreludio = (
  app: unknown,
  metodo: string,
  url: string,
  opcoes: { headers?: Record<string, string>; body?: string }
) => Promise<{ status: number; headers: Record<string, string>; texto: string }>;

/**
 * Sobe o servidor no escopo global de quem chama — o worker, ou o Node do CI
 * — e devolve o `ServidorVivo`. O programa roda como qualquer outro
 * (`runProgram`, sem testes); o app e o `pedir` ficam em `globalThis`, que é
 * por onde o prelúdio os deixa. Recebe o `runProgram` por parâmetro para
 * este módulo continuar sem importar o sandbox.
 */
export async function subirServidor(
  programa: string,
  rodar: (programa: string) => Promise<{ logs: string[]; error?: string }>
): Promise<ServidorVivo> {
  const escopo = globalThis as {
    __cfUltimoApp?: unknown;
    __cfPedir?: PedirDoPreludio;
    __cfTrocas?: Troca[];
  };
  delete escopo.__cfUltimoApp;
  const resultado = await rodar(programa);
  const app = escopo.__cfUltimoApp;
  const pedir = escopo.__cfPedir;
  const trocas = escopo.__cfTrocas ?? [];
  const error =
    resultado.error ??
    (app === undefined || pedir === undefined
      ? "O servidor não criou nenhuma aplicação: falta o `const app = express()`, e as rotas nele."
      : undefined);

  return {
    logs: resultado.logs,
    error,
    trocas: () => trocas.slice(),
    async pedir(pedido) {
      if (error || !pedir) return { status: 503, headers: { 'content-type': 'application/json' }, texto: JSON.stringify({ erro: error ?? 'servidor fora do ar' }) };
      const r = await pedir(app, pedido.metodo, pedido.url, { headers: pedido.headers, body: pedido.body });
      return { status: r.status, headers: r.headers, texto: r.texto };
    },
  };
}
