/**
 * Proteção contra laço sem fim no código de uma página.
 *
 * O sandbox de Worker se defende sozinho: um laço sem fim trava o worker, e o
 * prazo o encerra. A página não tem essa saída. O `<iframe sandbox>` roda, na
 * maior parte dos celulares, na mesma thread da aba — e um `while (true) {}`
 * congela a aba inteira, prazo incluído, porque o prazo também precisa da
 * thread para disparar (P2-6 da auditoria).
 *
 * A saída é a de CodePen e JS Bin: instrumentar os laços do aluno. Cada
 * condição de `while`, `do…while` e `for` ganha uma chamada à guarda antes
 * dela — `while (guarda() && (cond))` —, e a guarda lança quando o código
 * está rodando sem soltar a thread há tempo demais. Pôr a guarda na condição,
 * e não no corpo, dispensa achar o fim do corpo (que pode não ter chaves) e a
 * deixa fora de qualquer `try` do corpo, que não consegue engoli-la.
 *
 * Não é um analisador de JavaScript: é um leitor de símbolos (textos, modelos,
 * expressões regulares, comentários) suficiente para achar `while (` e
 * `for (` de verdade e o parêntese que fecha cada um. O que ele deixa passar,
 * por decisão:
 *
 * - `for…of` e `for…in` (sem os dois `;` no cabeçalho): percorrem algo finito
 *   em quase todo código de aula;
 * - laços dentro de `${…}` de um modelo;
 * - um método de classe chamado `while`, com parâmetro (seria instrumentado
 *   e quebraria) — não existe em código de aluno real.
 *
 * O CI roda todo exercício de página do catálogo com a proteção ligada, e
 * os programas de JavaScript do catálogo, instrumentados, precisam fazer
 * exatamente o mesmo que sem ela (`content.test.ts`).
 */

/** O nome da guarda no documento. Longo e prefixado, para não colidir com o do aluno. */
export const NOME_DA_GUARDA = '__codeflowLaco';

/** Quanto o código pode rodar sem soltar a thread antes de a guarda lançar. */
export const LIMITE_DO_LACO_MS = 1500;

/**
 * O erro que o aluno lê. O nome vai na frente, como em `ReferenceError: …`
 * — a captura da página mostra `nome: mensagem`, e "Error:" em inglês não
 * diria nada.
 */
export const NOME_DO_ERRO_DO_LACO = 'Laço sem fim';
export const MENSAGEM_DO_LACO =
  'rodou por mais de 1,5 segundo sem soltar a página e foi interrompido. Confira se a condição de saída chega a ficar falsa.';

type Simbolo =
  | { tipo: 'nome'; valor: string; inicio: number; fim: number }
  | { tipo: 'sinal'; valor: string; inicio: number; fim: number }
  | { tipo: 'outro'; inicio: number; fim: number };

/** Palavras depois das quais uma `/` abre expressão regular, e não divide. */
const ANTES_DE_REGEX = new Set([
  'return',
  'typeof',
  'instanceof',
  'in',
  'of',
  'new',
  'delete',
  'void',
  'throw',
  'case',
  'do',
  'else',
  'yield',
  'await',
]);

const ehInicioDeNome = (c: string) => /[A-Za-z_$À-￿]/.test(c);
const ehParteDeNome = (c: string) => /[\w$À-￿]/.test(c);

/**
 * Lê os símbolos de `codigo` a partir de `inicio`, até o fim — ou até um `}`
 * sem par, quando `pararNoFechamento` (o fim de um `${…}` de modelo).
 * Devolve os símbolos e onde parou.
 */
function lerSimbolos(codigo: string, inicio: number, pararNoFechamento: boolean): { simbolos: Simbolo[]; fim: number } {
  const simbolos: Simbolo[] = [];
  let i = inicio;
  let chaves = 0;

  /** Se uma `/` agora abre expressão regular, pelo símbolo anterior. */
  const abreRegex = () => {
    const anterior = simbolos[simbolos.length - 1];
    if (!anterior) return true;
    if (anterior.tipo === 'nome') return ANTES_DE_REGEX.has(anterior.valor);
    if (anterior.tipo === 'outro') return false; // número, texto, regex
    return !/^[)\]}]$/.test(anterior.valor);
  };

  while (i < codigo.length) {
    const c = codigo[i];

    if (/\s/.test(c)) {
      i++;
      continue;
    }

    // Comentários.
    if (c === '/' && codigo[i + 1] === '/') {
      const quebra = codigo.indexOf('\n', i);
      i = quebra === -1 ? codigo.length : quebra;
      continue;
    }
    if (c === '/' && codigo[i + 1] === '*') {
      const fecha = codigo.indexOf('*/', i + 2);
      i = fecha === -1 ? codigo.length : fecha + 2;
      continue;
    }

    // Textos.
    if (c === '"' || c === "'") {
      const comeco = i;
      i++;
      while (i < codigo.length && codigo[i] !== c && codigo[i] !== '\n') i += codigo[i] === '\\' ? 2 : 1;
      i++;
      simbolos.push({ tipo: 'outro', inicio: comeco, fim: i });
      continue;
    }

    // Modelos, com as expressões de dentro lidas até o `}` que as fecha.
    if (c === '`') {
      const comeco = i;
      i++;
      while (i < codigo.length && codigo[i] !== '`') {
        if (codigo[i] === '\\') i += 2;
        else if (codigo[i] === '$' && codigo[i + 1] === '{') i = lerSimbolos(codigo, i + 2, true).fim + 1;
        else i++;
      }
      i++;
      simbolos.push({ tipo: 'outro', inicio: comeco, fim: i });
      continue;
    }

    // Expressão regular, com as classes (`[/]` não fecha).
    if (c === '/' && abreRegex()) {
      const comeco = i;
      i++;
      let classe = false;
      while (i < codigo.length && codigo[i] !== '\n') {
        if (codigo[i] === '\\') {
          i += 2;
          continue;
        }
        if (codigo[i] === '[') classe = true;
        else if (codigo[i] === ']') classe = false;
        else if (codigo[i] === '/' && !classe) break;
        i++;
      }
      i++;
      while (i < codigo.length && ehParteDeNome(codigo[i])) i++; // as flags
      simbolos.push({ tipo: 'outro', inicio: comeco, fim: i });
      continue;
    }

    // Nomes (e palavras reservadas).
    if (ehInicioDeNome(c)) {
      const comeco = i;
      while (i < codigo.length && ehParteDeNome(codigo[i])) i++;
      simbolos.push({ tipo: 'nome', valor: codigo.slice(comeco, i), inicio: comeco, fim: i });
      continue;
    }

    // Números.
    if (/\d/.test(c) || (c === '.' && /\d/.test(codigo[i + 1] ?? ''))) {
      const comeco = i;
      i++;
      while (i < codigo.length && /[\w.]/.test(codigo[i])) i++;
      simbolos.push({ tipo: 'outro', inicio: comeco, fim: i });
      continue;
    }

    // Sinais. `?.` é um só: depois dele vem nome de propriedade.
    if (c === '?' && codigo[i + 1] === '.' && !/\d/.test(codigo[i + 2] ?? '')) {
      simbolos.push({ tipo: 'sinal', valor: '?.', inicio: i, fim: i + 2 });
      i += 2;
      continue;
    }
    if (c === '{') chaves++;
    if (c === '}') {
      if (pararNoFechamento && chaves === 0) return { simbolos, fim: i };
      chaves--;
    }
    simbolos.push({ tipo: 'sinal', valor: c, inicio: i, fim: i + 1 });
    i++;
  }

  return { simbolos, fim: codigo.length };
}

const ABRE: Record<string, string> = { '(': ')', '[': ']', '{': '}' };

/** O índice do símbolo que fecha o `(` em `abre`, e os `;` do nível de dentro. */
function fechamento(simbolos: Simbolo[], abre: number): { fecha: number; pontosEVirgulas: number[] } | null {
  const pilha: string[] = [];
  const pontosEVirgulas: number[] = [];
  for (let k = abre; k < simbolos.length; k++) {
    const s = simbolos[k];
    if (s.tipo !== 'sinal') continue;
    if (ABRE[s.valor]) pilha.push(ABRE[s.valor]);
    else if (s.valor === ')' || s.valor === ']' || s.valor === '}') {
      if (pilha.pop() !== s.valor) return null; // desbalanceado: não mexe
      if (pilha.length === 0) return { fecha: k, pontosEVirgulas };
    } else if (s.valor === ';' && pilha.length === 1) {
      pontosEVirgulas.push(k);
    }
  }
  return null;
}

/**
 * O código com cada condição de laço guardada. O que não é laço — e o que não
 * dá para ler com segurança — sai como entrou.
 */
export function protegerLacos(codigo: string, guarda: string = NOME_DA_GUARDA): string {
  const { simbolos } = lerSimbolos(codigo, 0, false);
  const insercoes: Array<{ em: number; texto: string }> = [];

  for (let k = 0; k < simbolos.length; k++) {
    const s = simbolos[k];
    if (s.tipo !== 'nome' || (s.valor !== 'while' && s.valor !== 'for')) continue;

    // `obj.while`, `obj?.for`: propriedade, não laço.
    const anterior = simbolos[k - 1];
    if (anterior?.tipo === 'sinal' && (anterior.valor === '.' || anterior.valor === '?.')) continue;

    const abre = simbolos[k + 1];
    if (abre?.tipo !== 'sinal' || abre.valor !== '(') continue;

    const achado = fechamento(simbolos, k + 1);
    if (!achado) continue;
    const fecha = simbolos[achado.fecha];

    if (s.valor === 'while') {
      // `while ()` não é laço (é um método chamado `while`, ou erro de sintaxe).
      if (achado.fecha === k + 2) continue;
      insercoes.push({ em: abre.fim, texto: `${guarda}() && (` }, { em: fecha.inicio, texto: ')' });
      continue;
    }

    // `for`: só o de três partes. `for…of`/`for…in` não têm `;`.
    if (achado.pontosEVirgulas.length !== 2) continue;
    const [primeiro, segundo] = achado.pontosEVirgulas.map((p) => simbolos[p]);
    const condicaoVazia = achado.pontosEVirgulas[1] === achado.pontosEVirgulas[0] + 1;
    if (condicaoVazia) insercoes.push({ em: primeiro.fim, texto: ` ${guarda}()` });
    else insercoes.push({ em: primeiro.fim, texto: ` ${guarda}() && (` }, { em: segundo.inicio, texto: ')' });
  }

  // Do fim para o começo, para as posições não andarem.
  let saida = codigo;
  for (const { em, texto } of insercoes.sort((a, b) => b.em - a.em)) {
    saida = saida.slice(0, em) + texto + saida.slice(em);
  }
  return saida;
}

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
/** Os `type` que o navegador executa como JavaScript. */
const TIPO_DE_JAVASCRIPT = /^(|text\/javascript|application\/javascript|module)$/i;

/**
 * O HTML do aluno com os laços de cada `<script>` protegidos. Script com
 * `src` (a CSP da página não deixa carregar) e de outro tipo (`text/template`,
 * JSON) saem como entraram.
 */
export function protegerScripts(html: string, guarda: string = NOME_DA_GUARDA): string {
  return html.replace(SCRIPT, (inteiro, atributos: string, corpo: string) => {
    if (/\bsrc\s*=/i.test(atributos)) return inteiro;
    const tipo = atributos.match(/\btype\s*=\s*["']?([^"'\s>]*)/i)?.[1] ?? '';
    if (!TIPO_DE_JAVASCRIPT.test(tipo)) return inteiro;
    return `<script${atributos}>${protegerLacos(corpo, guarda)}</script>`;
  });
}

/**
 * A guarda, como texto de script para o documento. Conta o tempo desde a
 * primeira volta de laço sem a thread ter sido solta: um `setTimeout(0)`
 * zera a contagem quando a thread fica livre — e ele só dispara se ela
 * ficar. O relógio é lido a cada 1024 voltas, para a guarda não pesar.
 */
export function scriptDaGuarda(limiteMs: number = LIMITE_DO_LACO_MS): string {
  return `(function () {
  var inicio = 0, agendado = false, voltas = 0;
  window.${NOME_DA_GUARDA} = function () {
    if (!agendado) {
      agendado = true; inicio = Date.now(); voltas = 0;
      setTimeout(function () { agendado = false; }, 0);
      return true;
    }
    if ((++voltas & 1023) === 0 && Date.now() - inicio > ${limiteMs}) {
      var erro = new Error(${JSON.stringify(MENSAGEM_DO_LACO)});
      erro.name = ${JSON.stringify(NOME_DO_ERRO_DO_LACO)};
      throw erro;
    }
    return true;
  };
})();`;
}
