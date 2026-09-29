/**
 * Quando a previsão do aluno conta como igual à saída real.
 *
 * O que se compara é o **entendimento**, não a digitação: espaços nas pontas
 * de cada linha e linhas em branco no fim não contam.
 *
 * Uma lista ou objeto numa linha só também não cobra o espaço depois da
 * vírgula e dos dois-pontos. O `console.log` do sandbox mostra `[15,25,35]`,
 * e quem escreve `[15, 25, 35]` entendeu o `map` do mesmo jeito — recusar
 * isso ensinava a imitar o formato da saída, não a prever o valor. Só vale
 * para a linha que abre com `[` ou `{` e fecha com `]` ou `}`, e só depois de
 * `,` e `:`: o espaço de dentro dos colchetes continua contando, porque há
 * exercício que o imprime entre colchetes justamente para mostrá-lo (o
 * `trim` da aula de textos), e numa frase comum a vírgula seguida de espaço
 * é texto do aluno, não formatação.
 *
 * A comparação é simétrica: as duas saídas passam pela mesma normalização.
 */
export function normalizarSaida(texto: string): string {
  return texto
    .split('\n')
    .map((linha) => {
      const aparada = linha.trim();
      return /^[[{].*[\]}]$/.test(aparada) ? aparada.replace(/([,:])\s+/g, '$1') : aparada;
    })
    .join('\n')
    .trim();
}

export const previsaoConfere = (previsao: string, saida: string): boolean =>
  normalizarSaida(previsao) === normalizarSaida(saida);
