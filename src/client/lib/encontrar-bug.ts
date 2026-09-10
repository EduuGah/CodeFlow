/**
 * Exercício de encontrar o bug.
 *
 * Já existe exercício de **consertar** — um `code` com o esqueleto quebrado. O
 * que faltava era separar as duas metades do trabalho, porque elas são
 * habilidades diferentes: localizar e corrigir. Quem já sabe corrigir mas ainda
 * não sabe localizar passa horas mexendo na linha errada.
 *
 * E o tipo existe principalmente por causa de uma distinção que a aula de erros
 * ensina e nenhum exercício cobrava: **a linha onde o erro aparece quase nunca é
 * a linha onde o defeito está**. Por isso o exercício declara, além da causa, a
 * linha do sintoma — a resposta que quase todo mundo dá primeiro — e responde a
 * ela com um retorno próprio, em vez de um "errado" sem explicação.
 */

export interface LinhaNumerada {
  /** 1-indexada, como o aluno lê e como o erro do JavaScript reporta. */
  numero: number;
  texto: string;
}

export function linhasNumeradas(codigo: string): LinhaNumerada[] {
  return codigo.split('\n').map((texto, i) => ({ numero: i + 1, texto }));
}

/** Uma linha em branco ou só com comentário não pode ser a resposta. */
export function podeSerResposta(texto: string): boolean {
  const limpo = texto.trim();
  return limpo !== '' && !limpo.startsWith('//');
}

/** Troca uma linha pelo texto corrigido, preservando o resto do programa. */
export function corrigirLinha(codigo: string, numero: number, correcao: string): string {
  const linhas = codigo.split('\n');
  if (numero < 1 || numero > linhas.length) return codigo;

  linhas[numero - 1] = correcao;
  return linhas.join('\n');
}

export interface ExercicioDeBug {
  code: string;
  buggyLine: number;
  symptomLine?: number;
}

/**
 * Problemas que impedem um exercício de encontrar-o-bug de funcionar.
 *
 * Lido pelo schema na carga. A prova de que o número da linha está certo não
 * mora aqui — ela é feita rodando o programa corrigido, no teste de conteúdo,
 * porque é a única forma de pegar um erro de contagem de uma linha.
 */
export function problemasDoBug(exercicio: ExercicioDeBug): string[] {
  const problemas: string[] = [];
  const linhas = linhasNumeradas(exercicio.code);

  const conferir = (numero: number, papel: string) => {
    if (numero < 1 || numero > linhas.length) {
      problemas.push(`a linha ${papel} (${numero}) está fora do programa, que tem ${linhas.length}`);
      return;
    }

    if (!podeSerResposta(linhas[numero - 1].texto)) {
      problemas.push(`a linha ${papel} (${numero}) está em branco ou é só comentário`);
    }
  };

  conferir(exercicio.buggyLine, 'do defeito');

  if (exercicio.symptomLine !== undefined) {
    conferir(exercicio.symptomLine, 'do sintoma');

    // Se as duas fossem a mesma, o exercício não teria o que ensinar: a graça
    // é justamente o erro aparecer num lugar e nascer em outro.
    if (exercicio.symptomLine === exercicio.buggyLine) {
      problemas.push('a linha do sintoma é a mesma do defeito, e o exercício perde o sentido');
    }
  }

  return problemas;
}
