import {
  typescriptDefaults,
  typescriptVersion,
  type TypeScriptWorker,
} from 'monaco-editor/languages/features/typescript/register';
import TsWorker from 'monaco-editor/languages/features/typescript/ts.worker?worker';

import { monaco } from './monaco';
import { ARQUIVO_DE_DECLARACOES_DO_REACT, DECLARACOES_DO_REACT } from './react-core';
import {
  ARQUIVO_DE_DECLARACOES,
  DECLARACOES_DO_SANDBOX,
  OPCOES_DO_COMPILADOR,
  montarErro,
  type Compilacao,
  type OpcoesDeCompilacao,
} from './typescript-core';

/**
 * O compilador de TypeScript no navegador.
 *
 * É o mesmo worker que o Monaco usa para sublinhar erros no editor — o
 * arquivo já está baixado e em cache —, numa **segunda instância**, só para
 * compilar. Não há download a mais: o pacote `typescript` inteiro são 9 MB,
 * e é por isso que o motor mora aqui e não num worker próprio.
 *
 * Por que uma instância à parte, e não o serviço do editor: o serviço de
 * linguagem enxerga todos os modelos sincronizados como **um programa só**,
 * no mesmo escopo global. O modelo do editor e o modelo temporário da
 * compilação — com o mesmo código — viravam "Cannot redeclare block-scoped
 * variable" um contra o outro. A instância de compilação só recebe os
 * modelos que este módulo cria e descarta, um de cada vez.
 *
 * O editor e o compilador usam **as mesmas opções**: o sublinhado vermelho
 * que o aluno vê enquanto digita é exatamente o erro que vai recusar o
 * programa ao executar. Um corretor com regras próprias ensinaria a ignorar
 * o editor.
 *
 * Este módulo depende do Monaco. Quando o editor não carrega (a contingência
 * do `<textarea>`), o TypeScript não compila, e o exercício diz isso em vez
 * de fingir que rodou.
 */

typescriptDefaults.setCompilerOptions({
  ...OPCOES_DO_COMPILADOR,
  lib: [...OPCOES_DO_COMPILADOR.lib],
  // Os modelos do editor têm URIs sem `.ts` no fim; sem isto o serviço os ignora.
  allowNonTsExtensions: true,
});
typescriptDefaults.addExtraLib(DECLARACOES_DO_SANDBOX, `file:///${ARQUIVO_DE_DECLARACOES}`);

const URI_DAS_DECLARACOES_DO_REACT = `file:///${ARQUIVO_DE_DECLARACOES_DO_REACT}`;

let usosDoReact = 0;
let declaracoesDoReact: { dispose(): void } | null = null;

/**
 * Liga as declarações do React no serviço do editor enquanto uma aula de
 * React estiver aberta, e devolve a função que as desliga.
 *
 * O editor sublinha com o mesmo serviço para todos os modelos, então as
 * declarações são globais nele: com elas sempre ligadas, `document` deixaria
 * de ser sublinhado em aula de TypeScript puro — onde o corretor o recusa.
 * Ligar e desligar por aula mantém o editor e o corretor dizendo a mesma
 * coisa nos dois tipos de aula. Conta usos, porque uma tela pode ter dois
 * editores.
 */
export function ativarReact(): () => void {
  usosDoReact += 1;
  declaracoesDoReact ??= typescriptDefaults.addExtraLib(
    DECLARACOES_DO_REACT,
    URI_DAS_DECLARACOES_DO_REACT
  );
  return () => {
    usosDoReact -= 1;
    if (usosDoReact === 0) {
      declaracoesDoReact?.dispose();
      declaracoesDoReact = null;
    }
  };
}

const clientes: Record<'ts' | 'react', monaco.editor.MonacoWebWorker<TypeScriptWorker> | null> = {
  ts: null,
  react: null,
};

/**
 * A instância de compilação, criada na primeira vez e mantida.
 *
 * São duas: a de TypeScript puro e a de React, que tem as declarações do
 * React e do DOM do iframe a mais. Num só worker as declarações valeriam
 * para os dois, e `document` compilaria em aula de TypeScript.
 *
 * A dança de mensagens ("ignore", depois os dados de criação) é a que o
 * próprio Monaco faz em `WorkerManager` — o worker de TypeScript espera
 * exatamente isso antes de responder ao protocolo do `createWebWorker`.
 */
function compilador(comReact: boolean): monaco.editor.MonacoWebWorker<TypeScriptWorker> {
  const chave = comReact ? 'react' : 'ts';
  const existente = clientes[chave];
  if (existente) return existente;

  const extraLibs: Record<string, { content: string; version: number }> = {
    [`file:///${ARQUIVO_DE_DECLARACOES}`]: { content: DECLARACOES_DO_SANDBOX, version: 1 },
  };
  if (comReact) {
    extraLibs[URI_DAS_DECLARACOES_DO_REACT] = { content: DECLARACOES_DO_REACT, version: 1 };
  }

  const worker = new TsWorker();
  worker.postMessage('ignore');
  worker.postMessage({
    compilerOptions: typescriptDefaults.getCompilerOptions(),
    extraLibs,
    customWorkerPath: undefined,
    inlayHintsOptions: {},
  });

  const cliente = monaco.editor.createWebWorker<TypeScriptWorker>({ worker, keepIdleModels: true });
  clientes[chave] = cliente;
  return cliente;
}

let contador = 0;

/**
 * Compila um programa: erros de sintaxe e de tipo, e o JavaScript quando não
 * há nenhum.
 *
 * O código vira um modelo temporário — o worker só enxerga modelos — e o
 * modelo é descartado no fim, mesmo quando o worker falha. Descartar é o que
 * o tira do programa do worker, então a compilação seguinte começa limpa.
 *
 * O modelo é criado como `plaintext`, e não como `typescript`, de propósito:
 * o serviço do editor valida **todo** modelo TypeScript que aparece, e o
 * sincronizava para o worker dele — onde a função do aluno passava a existir
 * duas vezes, e o editor sublinhava "Duplicate function implementation" num
 * código certo. O worker de compilação não olha a linguagem do modelo: decide
 * pelo `.ts` no fim da URI.
 */
export async function compilarNoNavegador(
  codigo: string,
  { jsx = false }: OpcoesDeCompilacao = {}
): Promise<Compilacao> {
  contador += 1;
  const uri = monaco.Uri.parse(`inmemory://codeflow/compilacao-${contador}.${jsx ? 'tsx' : 'ts'}`);
  const modelo = monaco.editor.createModel(codigo, 'plaintext', uri);

  try {
    const worker = await compilador(jsx).withSyncedResources([uri]);
    const nome = uri.toString();

    const [sintaxe, semantica] = await Promise.all([
      worker.getSyntacticDiagnostics(nome),
      worker.getSemanticDiagnostics(nome),
    ]);

    const erros = [...sintaxe, ...semantica]
      .filter((d) => d.category === 1 /* erro */)
      .map((d) => montarErro(codigo, { code: d.code, start: d.start, messageText: d.messageText }));

    if (erros.length > 0) return { js: '', erros };

    const saida = await worker.getEmitOutput(nome);
    const js = saida.outputFiles.find((a) => a.name.endsWith('.js'))?.text ?? '';
    return { js, erros: [] };
  } finally {
    modelo.dispose();
  }
}

/** A versão que o Monaco embute — a suíte a compara com a do pacote `typescript`. */
export const VERSAO_DO_TYPESCRIPT_NO_NAVEGADOR = typescriptVersion;
