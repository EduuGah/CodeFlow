/**
 * Exercício de ordenar passos.
 *
 * Os quatro tipos que existiam pedem a mesma coisa de formas diferentes:
 * escrever algo, ou escolher algo. Nenhum deles cobra **sequência** — e
 * sequência é metade do que separa quem sabe a sintaxe de quem resolve o
 * problema. Um aluno pode conhecer `trim`, `split` e `filter` e ainda assim não
 * saber em que ordem aplicá-los.
 *
 * Aqui os passos chegam embaralhados e o aluno os coloca na ordem certa. Não há
 * o que digitar, então o exercício isola o raciocínio de sequência de qualquer
 * dificuldade de escrita.
 */

/** Um passo da sequência, como o conteúdo o declara. */
export interface PassoOrdenavel {
  id: string;
  text: string;
  /**
   * Posição na sequência.
   *
   * Passos com o **mesmo** número podem trocar de lugar entre si: é assim que o
   * exercício aceita mais de uma resposta certa sem precisar enumerar todas as
   * combinações. Duas leituras independentes antes de um cálculo não têm ordem
   * obrigatória, e cobrar uma delas ensinaria a adivinhar.
   */
  ordem: number;
}

/**
 * Gerador determinístico, semeado pelo texto.
 *
 * O embaralhamento precisa ser o mesmo toda vez que o aluno abre o exercício:
 * uma ordem inicial diferente a cada visita tornaria impossível voltar de onde
 * se parou, e faria o mesmo exercício ter dificuldades diferentes. É o mesmo
 * mulberry32 que os testes por propriedade usam.
 */
function semear(texto: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Verdadeiro quando os passos, lidos de cima para baixo, estão em ordem. */
export function estaOrdenado(passos: PassoOrdenavel[]): boolean {
  return primeiroErro(passos) === -1;
}

/**
 * Posição do primeiro passo que quebra a ordem, ou `-1` quando está tudo certo.
 *
 * É a informação que o retorno mostra ao aluno: apontar **onde** a sequência
 * deixa de fazer sentido é uma pista, enquanto dizer quais passos estão errados
 * entregaria o gabarito por eliminação.
 */
export function primeiroErro(passos: PassoOrdenavel[]): number {
  for (let i = 1; i < passos.length; i++) {
    if (passos[i].ordem < passos[i - 1].ordem) return i;
  }
  return -1;
}

/**
 * Ordem inicial embaralhada, garantidamente diferente da resposta.
 *
 * Um embaralhamento que por acaso saísse na ordem certa daria um exercício já
 * resolvido — e o aluno passaria sem fazer nada, o que é pior do que um
 * exercício difícil demais.
 */
export function embaralhar(passos: PassoOrdenavel[], semente: string): PassoOrdenavel[] {
  if (passos.length < 2) return [...passos];

  // Se todos os passos são intercambiáveis, qualquer ordem serve — e insistir
  // em embaralhar até "errar" nunca terminaria.
  if (passos.every((p) => p.ordem === passos[0].ordem)) return [...passos];

  const rnd = semear(semente);

  for (let tentativa = 0; tentativa < 20; tentativa++) {
    const copia = [...passos];

    // Fisher-Yates, com o sorteio semeado.
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const troca = copia[i];
      copia[i] = copia[j];
      copia[j] = troca;
    }

    if (!estaOrdenado(copia)) return copia;
  }

  // Saída de emergência: inverter garante desordem em qualquer lista que tenha
  // ao menos duas posições distintas.
  return [...passos].reverse();
}

/** Move um passo uma casa para cima ou para baixo, sem sair da lista. */
export function mover(
  passos: PassoOrdenavel[],
  de: number,
  direcao: 'cima' | 'baixo'
): PassoOrdenavel[] {
  const para = direcao === 'cima' ? de - 1 : de + 1;
  if (de < 0 || de >= passos.length || para < 0 || para >= passos.length) return passos;

  const copia = [...passos];
  const guardado = copia[de];
  copia[de] = copia[para];
  copia[para] = guardado;
  return copia;
}

/**
 * Problemas que impedem um exercício de ordenação de funcionar.
 *
 * Lido pelo schema na carga do conteúdo, para um exercício quebrado falhar no
 * CI em vez de chegar ao aluno.
 */
export function problemasDaOrdenacao(passos: PassoOrdenavel[]): string[] {
  const problemas: string[] = [];

  const ids = new Set<string>();
  for (const passo of passos) {
    if (ids.has(passo.id)) problemas.push(`o passo "${passo.id}" aparece duas vezes`);
    ids.add(passo.id);
  }

  // Com todas as posições iguais, qualquer arrumação passa: o exercício não
  // cobra nada e o aluno "acerta" sem ler.
  const distintas = new Set(passos.map((p) => p.ordem));
  if (distintas.size < 2) {
    problemas.push('todos os passos têm a mesma posição: qualquer ordem seria aceita');
  }

  return problemas;
}
