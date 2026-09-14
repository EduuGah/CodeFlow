import ts from 'typescript';

import {
  ARQUIVO_DE_DECLARACOES,
  DECLARACOES_DO_SANDBOX,
  OPCOES_DO_COMPILADOR,
  montarErro,
  type Compilacao,
} from './typescript-core';

/**
 * O compilador de TypeScript no Node — o lado do CI.
 *
 * O navegador compila com o worker do Monaco; aqui é o pacote `typescript`,
 * a mesma versão (o Monaco embute a dela, e um teste confere que as duas
 * coincidem). Este módulo nunca entra no pacote do aplicativo: só a suíte de
 * conteúdo o importa, para provar que cada exercício de TypeScript compila
 * com a solução e é recusado sem ela.
 *
 * Usa o **serviço de linguagem**, e não `createProgram`, pelo mesmo motivo
 * que o Monaco: entre uma compilação e a seguinte só o arquivo do aluno
 * muda, e o serviço reaproveita tudo o que já verificou das bibliotecas. Com
 * `createProgram` cada exercício pagava a `lib.es2020` inteira de novo —
 * 200 ms por compilação, e o catálogo tem centenas.
 *
 * As opções, as declarações do sandbox e o formato dos erros vêm do
 * `typescript-core`, para os dois lados discordarem em nada.
 */

const ARQUIVO_DO_ALUNO = 'aluno.ts';

const opcoes: ts.CompilerOptions = { ...OPCOES_DO_COMPILADOR, lib: [...OPCOES_DO_COMPILADOR.lib] };

let codigoAtual = '';
let versao = 0;

const proprios = (): Record<string, string> => ({
  [ARQUIVO_DO_ALUNO]: codigoAtual,
  [ARQUIVO_DE_DECLARACOES]: DECLARACOES_DO_SANDBOX,
});

const host: ts.LanguageServiceHost = {
  getCompilationSettings: () => opcoes,
  getScriptFileNames: () => [ARQUIVO_DO_ALUNO, ARQUIVO_DE_DECLARACOES],
  // Só o arquivo do aluno muda; as declarações e as libs ficam na versão 0.
  getScriptVersion: (nome) => (nome === ARQUIVO_DO_ALUNO ? String(versao) : '0'),
  getScriptSnapshot(nome) {
    const texto = nome in proprios() ? proprios()[nome] : ts.sys.readFile(nome);
    return texto === undefined ? undefined : ts.ScriptSnapshot.fromString(texto);
  },
  getCurrentDirectory: () => '/',
  getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
  fileExists: (nome) => nome in proprios() || ts.sys.fileExists(nome),
  readFile: (nome) => (nome in proprios() ? proprios()[nome] : ts.sys.readFile(nome)),
  useCaseSensitiveFileNames: () => true,
};

const servico = ts.createLanguageService(host, ts.createDocumentRegistry());

export function compilarNoNode(codigo: string): Compilacao {
  codigoAtual = codigo;
  versao += 1;

  const erros = [
    ...servico.getSyntacticDiagnostics(ARQUIVO_DO_ALUNO),
    ...servico.getSemanticDiagnostics(ARQUIVO_DO_ALUNO),
  ]
    .filter((d) => d.category === ts.DiagnosticCategory.Error)
    .map((d) => montarErro(codigo, { code: d.code, start: d.start, messageText: d.messageText }));

  if (erros.length > 0) return { js: '', erros };

  const saida = servico.getEmitOutput(ARQUIVO_DO_ALUNO);
  const js = saida.outputFiles.find((a) => a.name.endsWith('.js'))?.text ?? '';

  return { js, erros: [] };
}

/** A versão do compilador, para o teste que a compara com a do Monaco. */
export const VERSAO_DO_TYPESCRIPT = ts.version;

/** As enumerações de verdade, para o teste que confere os números do contrato. */
export const ENUMS = { ScriptTarget: ts.ScriptTarget, ModuleKind: ts.ModuleKind };
