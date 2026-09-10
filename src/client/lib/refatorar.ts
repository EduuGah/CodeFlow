/**
 * Exercício de refatorar.
 *
 * O exercício de código pergunta "funciona?". Este pergunta a seguinte:
 * **continua funcionando depois de você melhorar a forma?**
 *
 * É a única maneira de ensinar que código que funciona não é código pronto — e,
 * mais importante, de ensinar a **disciplina** do refatoramento: os testes são o
 * contrato do comportamento, e mexer na forma não pode mudar nenhum deles. O
 * aluno recebe código que já passa em tudo, e precisa continuar passando.
 *
 * ## Sobre checar a forma por texto
 *
 * As restrições são conferidas por busca literal no código. Isso é aproximado, e
 * de propósito: analisar a árvore sintática para responder "isto ainda é um laço
 * manual?" custaria um analisador inteiro para ganhar pouco, e a aproximação
 * erra sempre para o mesmo lado — ela aceita um truque deliberado, e não recusa
 * uma solução honesta. Um aluno que escreve `for` dentro de uma string para
 * enganar a checagem já entendeu o assunto.
 */

/** Uma exigência sobre a forma do código, não sobre o que ele faz. */
export interface Restricao {
  /** O que se pede, em uma frase. É o que o aluno lê na lista. */
  description: string;
  /** Trecho que o código **não** pode conter. Busca literal. */
  forbidden?: string;
  /** Trecho que o código **precisa** conter. Busca literal. */
  required?: string;
  /** Teto de linhas de código, sem contar brancos nem comentários. */
  maxLines?: number;
}

export interface ResultadoDeRestricao {
  description: string;
  cumprida: boolean;
  /** Por que não passou, quando não passou. */
  motivo?: string;
}

/**
 * Linhas que contam para o limite.
 *
 * Branco e comentário ficam de fora: um teto que contasse comentário puniria
 * quem explica o próprio código, que é o contrário do que se quer ensinar.
 */
export function linhasDeCodigo(codigo: string): string[] {
  return codigo
    .split('\n')
    .map((linha) => linha.trim())
    .filter((linha) => linha !== '' && !linha.startsWith('//'));
}

export function avaliarRestricoes(codigo: string, restricoes: Restricao[]): ResultadoDeRestricao[] {
  return restricoes.map((restricao) => {
    if (restricao.forbidden !== undefined && codigo.includes(restricao.forbidden)) {
      return {
        description: restricao.description,
        cumprida: false,
        motivo: `o código ainda tem ${restricao.forbidden.trim()}`,
      };
    }

    if (restricao.required !== undefined && !codigo.includes(restricao.required)) {
      return {
        description: restricao.description,
        cumprida: false,
        motivo: `o código ainda não usa ${restricao.required.trim()}`,
      };
    }

    if (restricao.maxLines !== undefined) {
      const quantas = linhasDeCodigo(codigo).length;
      if (quantas > restricao.maxLines) {
        return {
          description: restricao.description,
          cumprida: false,
          motivo: `são ${quantas} linhas de código, e o limite é ${restricao.maxLines}`,
        };
      }
    }

    return { description: restricao.description, cumprida: true };
  });
}

export function todasCumpridas(resultados: ResultadoDeRestricao[]): boolean {
  return resultados.every((r) => r.cumprida);
}

/**
 * Problemas que impedem um exercício de refatoração de funcionar.
 *
 * A prova de que o exercício é resolvível — e de que ele tem o que fazer — mora
 * no teste de conteúdo, que roda os testes contra a solução e contra o ponto de
 * partida. Aqui ficam só os defeitos que dá para ver sem executar nada.
 */
export function problemasDaRefatoracao(exercicio: {
  initialCode: string;
  constraints: Restricao[];
}): string[] {
  const problemas: string[] = [];

  if (exercicio.constraints.length === 0) {
    problemas.push('sem restrição nenhuma, o código de partida já estaria pronto');
  }

  for (const restricao of exercicio.constraints) {
    const tem =
      restricao.forbidden !== undefined ||
      restricao.required !== undefined ||
      restricao.maxLines !== undefined;

    if (!tem) {
      problemas.push(`a restrição "${restricao.description}" não verifica nada`);
    }
  }

  // Se o ponto de partida já cumpre tudo, não há refatoração a fazer: o aluno
  // apertaria "verificar" e passaria sem tocar no código.
  if (
    exercicio.constraints.length > 0 &&
    todasCumpridas(avaliarRestricoes(exercicio.initialCode, exercicio.constraints))
  ) {
    problemas.push('o código de partida já cumpre todas as restrições');
  }

  return problemas;
}
