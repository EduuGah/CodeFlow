/**
 * Exercício de escrever o teste.
 *
 * Todos os outros tipos verificam o aluno. Este verifica **a verificação dele**
 * — e é a única forma honesta de ensinar teste, porque a lição central não é a
 * sintaxe: é que um teste que aceita tudo não vale nada.
 *
 * O aluno recebe uma função pronta e correta, e escreve asserções sobre ela. A
 * plataforma então roda essas mesmas asserções contra versões **sabotadas** da
 * função. Passar na correta prova que o teste é justo; reprovar cada sabotagem
 * prova que ele verifica alguma coisa.
 *
 * É por isso que "meus testes passaram" não basta como resultado: um arquivo de
 * teste vazio passa em tudo. Aqui, um teste vazio falha o exercício — e a
 * mensagem diz exatamente qual defeito passou despercebido.
 */

/**
 * `assert` entra no escopo do aluno.
 *
 * Deliberadamente com o nome que ele vai encontrar em Node, em Python e na
 * maioria das linguagens — em vez de uma API inventada que só existe aqui.
 */
export const PREAMBULO = `
function assert(condicao, mensagem) {
  if (!condicao) throw new Error(mensagem || 'a verificação falhou');
}
`.trim();

/** Uma implementação quebrada de propósito, que o teste do aluno deve reprovar. */
export interface Sabotagem {
  /** O defeito, em uma frase. É o que o aluno lê quando o teste dele não pega. */
  description: string;
  code: string;
}

export interface ResultadoDeSabotagem {
  description: string;
  /** O teste do aluno reprovou esta versão, como deveria? */
  pego: boolean;
}

export interface VereditoDeTeste {
  /** O teste do aluno aceita a implementação correta? */
  referenciaPassou: boolean;
  /** Por que ele recusou a implementação correta, quando recusou. */
  erroNaReferencia?: string;
  sabotagens: ResultadoDeSabotagem[];
  /** Aprovado quando aceita a correta **e** pega todas as sabotagens. */
  aprovado: boolean;
}

/** Junta implementação, auxiliares e o teste do aluno num programa só. */
export function montarPrograma(implementacao: string, codigoDoAluno: string): string {
  return `${implementacao}\n\n${PREAMBULO}\n\n${codigoDoAluno}`;
}

/**
 * Roda o teste do aluno contra a versão correta e contra cada sabotagem.
 *
 * O executor entra por parâmetro para esta função ser pura e testável: o
 * componente passa o sandbox de verdade, o teste de conteúdo passa o mesmo
 * `runProgram` que roda no navegador, e o teste desta lógica passa um dublê.
 */
export async function avaliarTestes(
  referencia: string,
  sabotagens: Sabotagem[],
  codigoDoAluno: string,
  executar: (programa: string) => Promise<{ error?: string }>
): Promise<VereditoDeTeste> {
  const naReferencia = await executar(montarPrograma(referencia, codigoDoAluno));
  const referenciaPassou = !naReferencia.error;

  const resultados: ResultadoDeSabotagem[] = [];
  for (const sabotagem of sabotagens) {
    const resultado = await executar(montarPrograma(sabotagem.code, codigoDoAluno));
    // Reprovar a versão quebrada é o comportamento certo: o erro aqui é sinal
    // de que o teste funciona.
    resultados.push({ description: sabotagem.description, pego: Boolean(resultado.error) });
  }

  return {
    referenciaPassou,
    erroNaReferencia: naReferencia.error,
    sabotagens: resultados,
    aprovado: referenciaPassou && resultados.every((r) => r.pego),
  };
}

/**
 * Problemas que impedem um exercício de escrita de teste de funcionar.
 *
 * Lido pelo schema na carga, para um exercício quebrado falhar no CI em vez de
 * chegar ao aluno.
 */
export function problemasDaEscritaDeTeste(exercicio: {
  subject: string;
  mutants: Sabotagem[];
}): string[] {
  const problemas: string[] = [];

  // Sem sabotagem, qualquer teste passa — inclusive o arquivo vazio, que é
  // exatamente o hábito que este exercício existe para combater.
  if (exercicio.mutants.length === 0) {
    problemas.push('sem nenhuma sabotagem, um teste vazio passaria no exercício');
  }

  const descricoes = new Set<string>();
  for (const mutante of exercicio.mutants) {
    if (descricoes.has(mutante.description)) {
      problemas.push(`a sabotagem "${mutante.description}" aparece duas vezes`);
    }
    descricoes.add(mutante.description);

    // Uma sabotagem idêntica à referência não quebra nada, e nenhum teste
    // conseguiria pegá-la: o exercício ficaria impossível.
    if (mutante.code.trim() === exercicio.subject.trim()) {
      problemas.push(`a sabotagem "${mutante.description}" é igual à implementação correta`);
    }
  }

  return problemas;
}
