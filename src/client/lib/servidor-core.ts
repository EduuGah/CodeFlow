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
 *   fornecer em `arquivos`, e recusa o resto com uma frase;
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

function require(nome) {
  if (nome === 'express') return __cfExpress;
  if (typeof nome === 'string' && (nome.startsWith('./') || nome.startsWith('../'))) {
    var chave = nome.replace(/\.js$/, '');
    if (__cfModulos[chave]) return __cfModulos[chave].exports;
    var fonte = __cfArquivos[chave] !== undefined ? __cfArquivos[chave] : __cfArquivos[chave + '.js'];
    if (fonte === undefined) {
      throw new Error("Cannot find module '" + nome + "'. Neste exercício existem: " + (Object.keys(__cfArquivos).join(', ') || 'nenhum arquivo além deste') + '.');
    }
    var mod = { exports: {} };
    __cfModulos[chave] = mod;
    new Function('require', 'module', 'exports', 'process', 'console', fonte)(require, mod, mod.exports, process, console);
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
    sendStatus: function (n) { res.statusCode = n; return res.send(String(n)); },
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
  const preludio = PRELUDIO.replace('__CF_ENV__', JSON.stringify(opcoes.env ?? {})).replace(
    '__CF_ARQUIVOS__',
    JSON.stringify(opcoes.arquivos ?? {})
  );
  return `${preludio}\n${codigo}`;
}

/** Quantas linhas o prelúdio ocupa: para um erro na linha N do aluno ser a linha N. */
export const LINHAS_DO_PRELUDIO = PRELUDIO.split('\n').length;
