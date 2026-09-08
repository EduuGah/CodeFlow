/**
 * Exercício de lacuna.
 *
 * Existe para preencher um degrau que faltava. Entre "escolher a alternativa
 * certa" e "escrever a função do zero" há uma distância grande, e é nela que o
 * aluno iniciante trava: ele entende o que precisa acontecer, mas ainda não
 * consegue montar a estrutura inteira. A lacuna dá a estrutura e cobra a parte
 * que carrega a ideia.
 *
 * A correção é a mesma do exercício de código: o texto preenchido entra no
 * lugar da lacuna e o programa roda contra os testes. Isso importa — comparar o
 * texto digitado com uma resposta esperada recusaria `n * 2` porque o gabarito
 * dizia `2 * n`, que é a forma mais rápida de ensinar o aluno a adivinhar o que
 * o professor quer em vez de resolver o problema.
 */

/** Um pedaço do molde: texto fixo, ou uma lacuna a preencher. */
export type Segmento =
  | { tipo: 'texto'; conteudo: string }
  | { tipo: 'lacuna'; indice: number };

/** Marcação das lacunas no molde: `{{1}}`, `{{2}}`… numeradas a partir de 1. */
const MARCA = /\{\{(\d+)\}\}/g;

/**
 * Divide o molde em texto e lacunas.
 *
 * Devolve os segmentos na ordem em que aparecem, para o componente conseguir
 * desenhar o código com os campos no meio sem reconstruir posições.
 */
export function dividirMolde(molde: string): Segmento[] {
  const segmentos: Segmento[] = [];
  let ultimoFim = 0;

  for (const achado of molde.matchAll(MARCA)) {
    const inicio = achado.index!;

    if (inicio > ultimoFim) {
      segmentos.push({ tipo: 'texto', conteudo: molde.slice(ultimoFim, inicio) });
    }

    // A numeração é 1 na escrita e 0 no código: o autor conta como pessoa.
    segmentos.push({ tipo: 'lacuna', indice: Number(achado[1]) - 1 });
    ultimoFim = inicio + achado[0].length;
  }

  if (ultimoFim < molde.length) {
    segmentos.push({ tipo: 'texto', conteudo: molde.slice(ultimoFim) });
  }

  return segmentos;
}

/** Quantas lacunas distintas o molde declara. */
export function contarLacunas(molde: string): number {
  const indices = new Set<number>();
  for (const achado of molde.matchAll(MARCA)) indices.add(Number(achado[1]));
  return indices.size;
}

/**
 * Substitui cada lacuna pela resposta do aluno.
 *
 * Lacuna vazia vira um espaço, e não uma string vazia: colar os dois lados
 * produziria `returnn` a partir de `return {{1}}n`, e o erro de sintaxe
 * resultante não teria nada a ver com o que o aluno fez.
 */
export function preencher(molde: string, respostas: string[]): string {
  return dividirMolde(molde)
    .map((s) => {
      if (s.tipo === 'texto') return s.conteudo;
      const resposta = respostas[s.indice] ?? '';
      return resposta.trim() === '' ? ' ' : resposta;
    })
    .join('');
}

/** Nenhuma lacuna em branco. Não diz se está certo — só se dá para verificar. */
export function estaCompleto(molde: string, respostas: string[]): boolean {
  return dividirMolde(molde)
    .filter((s): s is Extract<Segmento, { tipo: 'lacuna' }> => s.tipo === 'lacuna')
    .every((s) => (respostas[s.indice] ?? '').trim() !== '');
}

/**
 * Problemas do molde que só apareceriam para o aluno.
 *
 * Um molde com `{{1}}` e `{{3}}` deixa a segunda lacuna sem campo na tela, e o
 * aluno vê um exercício que não tem como resolver. É erro de autoria, e o lugar
 * de descobrir isso é o CI.
 */
export function problemasDoMolde(molde: string, totalDeLacunas: number): string[] {
  const problemas: string[] = [];
  const indices = [...molde.matchAll(MARCA)].map((a) => Number(a[1]));
  const distintos = [...new Set(indices)].sort((a, b) => a - b);

  if (distintos.length === 0) {
    problemas.push('o molde não tem nenhuma lacuna: use {{1}}, {{2}}…');
    return problemas;
  }

  for (let esperado = 1; esperado <= distintos.length; esperado++) {
    if (!distintos.includes(esperado)) {
      problemas.push(`a lacuna {{${esperado}}} está faltando: a numeração precisa ser contínua`);
    }
  }

  if (distintos.length !== totalDeLacunas) {
    problemas.push(
      `o molde tem ${distintos.length} lacunas, mas foram declaradas ${totalDeLacunas}`
    );
  }

  return problemas;
}
