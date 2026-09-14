import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/editor';

// Recursos do editor. A lista completa (`features/register.all`) traz também
// diff, lentes, renomear símbolo, busca de referências, sugestões em linha —
// coisas de IDE que um aluno escrevendo trinta linhas nunca vai acionar, e
// que pesam no chunk. O que fica aqui é o que se usa para escrever e ler
// código: parênteses, comentar, desfazer, achar, dobrar, dicas ao passar o
// mouse, indentação, mover linhas, vários cursores, assinatura de função,
// seleção inteligente, trechos, autocompletar, destaque da palavra.
import 'monaco-editor/features/bracketMatching/register';
import 'monaco-editor/features/caretOperations/register';
import 'monaco-editor/features/clipboard/register';
import 'monaco-editor/features/comment/register';
import 'monaco-editor/features/contextmenu/register';
import 'monaco-editor/features/cursorUndo/register';
import 'monaco-editor/features/find/register';
import 'monaco-editor/features/folding/register';
import 'monaco-editor/features/gotoError/register';
import 'monaco-editor/features/hover/register';
import 'monaco-editor/features/indentation/register';
import 'monaco-editor/features/inPlaceReplace/register';
import 'monaco-editor/features/lineSelection/register';
import 'monaco-editor/features/linesOperations/register';
import 'monaco-editor/features/multicursor/register';
import 'monaco-editor/features/parameterHints/register';
import 'monaco-editor/features/placeholderText/register';
import 'monaco-editor/features/smartSelect/register';
import 'monaco-editor/features/snippet/register';
import 'monaco-editor/features/suggest/register';
import 'monaco-editor/features/tokenization/register';
import 'monaco-editor/features/wordHighlighter/register';
import 'monaco-editor/features/wordOperations/register';
import 'monaco-editor/features/wordPartOperations/register';
// O teclado virtual do iPad só aparece se alguém pedir.
import 'monaco-editor/features/iPadShowKeyboard/register';

// As quatro linguagens do catálogo (`LanguageId`). Só a sintaxe: colorir e
// fechar parênteses. As outras oitenta linguagens que o pacote traz não
// entram no chunk.
import 'monaco-editor/languages/definitions/javascript/register';
import 'monaco-editor/languages/definitions/typescript/register';
import 'monaco-editor/languages/definitions/python/register';
import 'monaco-editor/languages/definitions/sql/register';

// O serviço de linguagem de JavaScript e TypeScript: é ele que sublinha o
// erro de sintaxe antes de rodar e completa `console.` com `log`. Roda num
// worker próprio, carregado só quando o primeiro modelo JS ou TS abre.
import 'monaco-editor/languages/features/typescript/register';

import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/languages/features/typescript/ts.worker?worker';

/**
 * O Monaco servido do próprio domínio.
 *
 * Antes ele vinha de `cdn.jsdelivr.net` em tempo de execução — uns quinze
 * arquivos por aluno, buscados quando o primeiro editor montava. Rede de
 * escola que bloqueia CDN deixava o aluno sem editor, e nada funcionava
 * offline. Agora o Vite empacota o editor num chunk próprio e os workers em
 * arquivos próprios, todos servidos junto com o resto do aplicativo.
 *
 * O chunk continua sendo carregado **sob demanda**: este módulo só entra pela
 * `import()` dinâmica do `CodeEditor`, e por isso o pacote inicial não cresce.
 * Uma aula de leitura, o painel e o perfil nunca baixam o editor.
 *
 * O módulo tem efeito colateral de propósito — registrar os recursos, apontar
 * os workers e entregar a instância ao `@monaco-editor/react` — e é
 * idempotente: importá-lo duas vezes é o mesmo módulo.
 */

declare global {
  interface Window {
    /**
     * A instância, exposta para os testes de navegador lerem os modelos
     * (`window.monaco.editor.getModels()`) — é como o E2E escreve no editor
     * sem digitar caractere por caractere. Com o carregador da CDN isso vinha
     * de graça; servindo do próprio domínio, precisa ser explícito.
     */
    monaco?: typeof monaco;
  }
}

self.MonacoEnvironment = {
  getWorker(_id: string, label: string) {
    if (label === 'typescript' || label === 'javascript') return new TsWorker();
    return new EditorWorker();
  },
};

// O tema do produto: o `vs-dark` com o fundo dos blocos de código da aula
// (`--color-editor`), para o editor e o `<pre>` ao lado dele serem a mesma
// superfície — e para o esqueleto que aparece antes do editor ser idêntico.
monaco.editor.defineTheme('codeflow', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#17211f',
    'editor.lineHighlightBackground': '#ffffff0a',
    'editorLineNumber.foreground': '#ffffff59',
    'editorLineNumber.activeForeground': '#ffffffb3',
    'editorGutter.background': '#17211f',
  },
});

// O carregador do `@monaco-editor/react` tem dois caminhos: a instância
// configurada aqui, ou `window.monaco` já existente. Os dois apontam para o
// mesmo objeto, então nenhuma versão dele tenta baixar coisa alguma da CDN.
loader.config({ monaco });
window.monaco = monaco;

export { monaco };
