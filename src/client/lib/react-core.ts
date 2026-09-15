import { montarDocumento } from './pagina-core';
import type { SandboxTest } from './sandbox-core';

/**
 * O motor de React — a parte pura.
 *
 * Um exercício de React é um componente em TSX. O caminho até a tela:
 *
 * 1. o compilador de TypeScript (o mesmo do motor 2, com `jsx` ligado)
 *    verifica os tipos e emite JavaScript com `React.createElement`;
 * 2. o JavaScript entra no documento do motor de página, junto com o React
 *    e o ReactDOM **embutidos** no `<script>` — a CSP do iframe não deixa
 *    carregar nada de fora, então o texto das duas bibliotecas vai dentro
 *    do documento (140 kB, uma vez por execução; a produção, não a de
 *    desenvolvimento, que tem 1 MB);
 * 3. o componente `App` do aluno é montado em `#root` com `flushSync`, para
 *    a primeira renderização estar no DOM antes de os testes rodarem;
 * 4. os testes são os mesmos do motor de página — enxergam `document` — e
 *    ganham ajudantes para interagir (`clicar`, `digitar`, `esperar`),
 *    porque um clique num componente só aparece no DOM depois que o React
 *    processa o evento.
 *
 * Nada aqui toca em DOM: o documento é texto, e roda no navegador ou no
 * jsdom do CI.
 */

/** Nome que o arquivo de declarações do React recebe nos dois compiladores. */
export const ARQUIVO_DE_DECLARACOES_DO_REACT = 'codeflow-react.d.ts';

/**
 * O React e o DOM que o compilador enxerga em aula de React.
 *
 * Não é o `@types/react` (300 kB, e um mundo de sobrecargas) nem a
 * `lib.dom` inteira: é o que as aulas usam, declarado à mão. Duas
 * consequências deliberadas:
 *
 * - os atributos de uma tag (`className`, `value`, `href`…) aceitam
 *   qualquer coisa, mas os manipuladores de evento têm tipo: `onChange={(e)
 *   => …}` deduz `e.target.value` como texto sem anotação;
 * - o que o iframe tem de fato (`document.title`, `fetch` de mentira,
 *   `FormData`) está aqui; o que ele não tem, não está. Em aula de
 *   TypeScript puro estas declarações nem entram — lá `document` continua
 *   recusado, porque o worker não o tem.
 *
 * Só entra em aula de React (o editor e o compilador as ligam para `.tsx`).
 */
export const DECLARACOES_DO_REACT = `
declare namespace React {
  type Key = string | number;
  type ReactNode = any;
  interface Element { type: any; props: any; key: Key | null }
  type FC<P = {}> = (props: P) => Element | null;
  type SetStateAction<S> = S | ((anterior: S) => S);
  type Dispatch<A> = (valor: A) => void;

  interface SyntheticEvent<T = HTMLElement> {
    target: T;
    currentTarget: T;
    type: string;
    preventDefault(): void;
    stopPropagation(): void;
  }
  interface ChangeEvent<T = HTMLInputElement> extends SyntheticEvent<T> {}
  interface FormEvent<T = HTMLFormElement> extends SyntheticEvent<T> {}
  interface MouseEvent<T = HTMLElement> extends SyntheticEvent<T> { clientX: number; clientY: number }
  interface KeyboardEvent<T = HTMLElement> extends SyntheticEvent<T> { key: string }
  interface FocusEvent<T = HTMLElement> extends SyntheticEvent<T> {}

  interface AtributosDeTag {
    [atributo: string]: any;
    children?: ReactNode;
    key?: Key | null;
    ref?: any;
    className?: string;
    style?: { [propriedade: string]: string | number | undefined };
    onClick?: (evento: MouseEvent<any>) => void;
    onChange?: (evento: ChangeEvent<any>) => void;
    onInput?: (evento: ChangeEvent<any>) => void;
    onSubmit?: (evento: FormEvent<any>) => void;
    onKeyDown?: (evento: KeyboardEvent<any>) => void;
    onKeyUp?: (evento: KeyboardEvent<any>) => void;
    onFocus?: (evento: FocusEvent<any>) => void;
    onBlur?: (evento: FocusEvent<any>) => void;
    onMouseEnter?: (evento: MouseEvent<any>) => void;
    onMouseLeave?: (evento: MouseEvent<any>) => void;
  }

  interface Context<T> {
    Provider: (props: { value: T; children?: ReactNode }) => Element;
  }
  interface RefObject<T> { current: T }

  function createElement(tipo: any, props?: any, ...filhos: any[]): Element;
  const Fragment: any;
  const StrictMode: any;

  function useState<S>(inicial: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
  function useEffect(efeito: () => void | (() => void), dependencias?: readonly any[]): void;
  function useLayoutEffect(efeito: () => void | (() => void), dependencias?: readonly any[]): void;
  function useRef<T>(inicial: T): RefObject<T>;
  function useRef<T>(inicial: T | null): RefObject<T | null>;
  function useRef<T = undefined>(): RefObject<T | undefined>;
  function useMemo<T>(calcular: () => T, dependencias: readonly any[]): T;
  function useCallback<F extends (...args: any[]) => any>(funcao: F, dependencias: readonly any[]): F;
  function createContext<T>(padrao: T): Context<T>;
  function useContext<T>(contexto: Context<T>): T;
  function useReducer<S, A>(redutor: (estado: S, acao: A) => S, inicial: S): [S, Dispatch<A>];
  function useId(): string;
  function memo<P>(componente: (props: P) => Element | null): (props: P) => Element | null;
}

declare namespace JSX {
  type Element = React.Element;
  interface ElementChildrenAttribute { children: {} }
  interface IntrinsicAttributes { key?: React.Key | null }
  interface IntrinsicElements { [tag: string]: React.AtributosDeTag }
}

interface HTMLElement {
  textContent: string | null;
  innerText: string;
  className: string;
  id: string;
  hidden: boolean;
  tagName: string;
  style: { [propriedade: string]: string };
  dataset: { [nome: string]: string | undefined };
  focus(): void;
  blur(): void;
  click(): void;
  scrollIntoView(opcoes?: any): void;
  getAttribute(nome: string): string | null;
  setAttribute(nome: string, valor: string): void;
  querySelector(seletor: string): HTMLElement | null;
  querySelectorAll(seletor: string): HTMLElement[];
  addEventListener(tipo: string, ouvinte: (evento: any) => void): void;
  removeEventListener(tipo: string, ouvinte: (evento: any) => void): void;
}
interface HTMLInputElement extends HTMLElement {
  value: string;
  checked: boolean;
  name: string;
  type: string;
  disabled: boolean;
  placeholder: string;
  select(): void;
}
interface HTMLTextAreaElement extends HTMLElement { value: string; name: string; disabled: boolean }
interface HTMLSelectElement extends HTMLElement { value: string; name: string; disabled: boolean }
interface HTMLButtonElement extends HTMLElement { disabled: boolean; type: string }
interface HTMLFormElement extends HTMLElement { reset(): void }
interface HTMLDivElement extends HTMLElement {}
interface HTMLSpanElement extends HTMLElement {}
interface HTMLParagraphElement extends HTMLElement {}
interface HTMLHeadingElement extends HTMLElement {}
interface HTMLUListElement extends HTMLElement {}
interface HTMLLIElement extends HTMLElement {}
interface HTMLLabelElement extends HTMLElement {}
interface HTMLAnchorElement extends HTMLElement { href: string }
interface HTMLImageElement extends HTMLElement { src: string; alt: string }

declare class FormData {
  constructor(formulario?: HTMLFormElement);
  get(nome: string): string | null;
  has(nome: string): boolean;
  entries(): IterableIterator<[string, string]>;
}

interface Resposta {
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<any>;
  text(): Promise<string>;
}
declare function fetch(
  url: string,
  opcoes?: { method?: string; headers?: { [nome: string]: string }; body?: string }
): Promise<Resposta>;

declare var document: {
  title: string;
  body: HTMLElement;
  getElementById(id: string): HTMLElement | null;
  querySelector(seletor: string): HTMLElement | null;
  querySelectorAll(seletor: string): HTMLElement[];
  addEventListener(tipo: string, ouvinte: (evento: any) => void): void;
  removeEventListener(tipo: string, ouvinte: (evento: any) => void): void;
};
declare var window: {
  addEventListener(tipo: string, ouvinte: (evento: any) => void): void;
  removeEventListener(tipo: string, ouvinte: (evento: any) => void): void;
  innerWidth: number;
  innerHeight: number;
  location: { hash: string; href: string };
  localStorage: { getItem(chave: string): string | null; setItem(chave: string, valor: string): void; removeItem(chave: string): void };
};
declare var localStorage: { getItem(chave: string): string | null; setItem(chave: string, valor: string): void; removeItem(chave: string): void };
declare var location: { hash: string; href: string };
`;

/** O nome do componente que o motor monta. Todo exercício de React o declara. */
export const COMPONENTE_RAIZ = 'App';

/**
 * Ajudantes que os testes de React ganham, como globais da página.
 *
 * Um clique num componente só aparece no DOM depois de o React processar o
 * evento, e o React 18 agenda isso — por isso cada ação espera um instante.
 * `digitar` usa o setter nativo de `value`: o React guarda o último valor
 * que ele mesmo escreveu e ignora um `input` cujo valor "não mudou"; o
 * setter do protótipo passa por fora dessa memória, como um teclado de
 * verdade. `botao` e `campo` acham pelo que a pessoa lê — o texto do botão,
 * o rótulo do campo —, para os testes cobrarem a tela que o aluno vê e não
 * um seletor que ele nunca escreveria.
 */
export const AJUDANTES_DO_REACT = `
function esperar(ms) {
  return new Promise(function (resolver) { setTimeout(resolver, ms == null ? 20 : ms); });
}
function __cfElemento(alvo, acao) {
  var el = typeof alvo === 'string' ? document.querySelector(alvo) : alvo;
  if (!el) throw new Error('Não encontrei o elemento ' + JSON.stringify(alvo) + ' para ' + acao + '.');
  return el;
}
async function clicar(alvo) {
  __cfElemento(alvo, 'clicar').click();
  await esperar();
}
async function digitar(alvo, texto) {
  var el = __cfElemento(alvo, 'digitar');
  var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
    : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype
    : HTMLInputElement.prototype;
  var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  setter.call(el, texto);
  el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
  await esperar();
}
async function enviar(alvo) {
  var el = __cfElemento(alvo, 'enviar');
  var form = el.tagName === 'FORM' ? el : el.closest('form');
  if (!form) throw new Error('O elemento ' + JSON.stringify(alvo) + ' não está dentro de um formulário.');
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await esperar();
}
function texto(alvo) {
  var el = typeof alvo === 'string' ? document.querySelector(alvo) : alvo;
  return el ? (el.textContent || '').replace(/\\s+/g, ' ').trim() : null;
}
function botao(rotulo) {
  var lista = Array.prototype.slice.call(document.querySelectorAll('button'));
  var achado = lista.find(function (b) {
    return (b.textContent || '').replace(/\\s+/g, ' ').trim() === rotulo || b.getAttribute('aria-label') === rotulo;
  });
  if (!achado) {
    throw new Error('Não encontrei um botão ' + JSON.stringify(rotulo) + '. Botões na tela: ' + JSON.stringify(lista.map(function (b) { return (b.textContent || '').trim(); })));
  }
  return achado;
}
function campo(rotulo) {
  var labels = Array.prototype.slice.call(document.querySelectorAll('label'));
  for (var i = 0; i < labels.length; i++) {
    var l = labels[i];
    var nome = (l.textContent || '').replace(/\\s+/g, ' ').trim().replace(/[:*]$/, '').trim();
    if (nome !== rotulo) continue;
    var dentro = l.querySelector('input, textarea, select');
    var porFor = l.htmlFor ? document.getElementById(l.htmlFor) : null;
    if (dentro || porFor) return dentro || porFor;
  }
  var porAria = document.querySelector('[aria-label=' + JSON.stringify(rotulo) + ']');
  if (porAria) return porAria;
  var porPlaceholder = document.querySelector('[placeholder=' + JSON.stringify(rotulo) + ']');
  if (porPlaceholder) return porPlaceholder;
  throw new Error('Não encontrei um campo com o rótulo ' + JSON.stringify(rotulo) + ' — um <label> com esse texto ligado ao campo, ou aria-label, ou placeholder.');
}
function textos(seletor) {
  return Array.prototype.map.call(document.querySelectorAll(seletor), function (el) {
    return (el.textContent || '').replace(/\\s+/g, ' ').trim();
  });
}
`;

/** Bibliotecas embutidas no documento. O texto vem de `react-umd.ts`. */
export interface BibliotecasDoReact {
  react: string;
  reactDom: string;
}

/**
 * O documento de um exercício de React, pronto para `srcdoc`.
 *
 * `js` é o JavaScript já compilado do TSX do aluno. Ele roda num `<script>`
 * clássico, então `function App()` e `const App = …` no topo ficam visíveis
 * para o script de montagem que vem depois. Se não houver `App`, a mensagem
 * diz o que declarar — é o erro mais provável na primeira vez.
 *
 * A montagem é `flushSync`: sem ela, `root.render` só agenda, e os testes
 * rodariam no `load` antes de a primeira renderização existir.
 */
export function montarDocumentoReact(
  js: string,
  tests: SandboxTest[],
  bibliotecas: BibliotecasDoReact
): string {
  const montagem = `
(function () {
  var raiz = document.getElementById('root');
  try {
    if (typeof ${COMPONENTE_RAIZ} !== 'function') {
      throw new Error('Nenhum componente ${COMPONENTE_RAIZ} encontrado. Declare function ${COMPONENTE_RAIZ}() { … } — é ele que o motor monta na página.');
    }
    var root = ReactDOM.createRoot(raiz);
    ReactDOM.flushSync(function () {
      root.render(React.createElement(${COMPONENTE_RAIZ}));
    });
    window.__raiz = root;
  } catch (e) {
    window.dispatchEvent(new ErrorEvent('error', { error: e, message: String(e && e.message ? e.message : e) }));
  }
})();
`;

  const corpo = [
    '<div id="root"></div>',
    `<script>${bibliotecas.react}</script>`,
    `<script>${bibliotecas.reactDom}</script>`,
    `<script>${AJUDANTES_DO_REACT}</script>`,
    `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>`,
    `<script>${montagem}</script>`,
  ].join('\n');

  return montarDocumento(corpo, tests);
}
