/**
 * O estado de uma atividade, único para os quatro tipos de exercício.
 *
 * Antes não existia essa noção. Cada componente inventava a própria ideia de
 * acerto — `passouTudo` num, `acertou` noutro, nada nos outros dois — e a
 * página da aula tentava adivinhar por fora, através de uma prop opcional que
 * dois dos quatro nem recebiam.
 *
 * O resultado era visível na tela: múltipla escolha e prever-saída nunca
 * conseguiam avisar que tinham sido resolvidas, então o botão do rodapé
 * continuava dizendo "Pular por ora" para quem tinha acabado de acertar. Eram
 * 36 dos 78 exercícios publicados.
 *
 * Aqui o estado é um só, e é o componente que o declara. A aula não adivinha
 * nada: ela lê.
 */
export type ExerciseState =
  /** Aberto, intocado. */
  | 'inicial'
  /** O aluno mexeu — escreveu, escolheu, preencheu — e ainda não verificou. */
  | 'respondendo'
  /** Verificação em andamento. O sandbox está rodando. */
  | 'verificando'
  /** Verificou e não passou. */
  | 'errou'
  /** Verificou e passou. É o único estado que conta como resolvido. */
  | 'acertou';

/** Reportado pelo componente de exercício sempre que o estado muda. */
export type OnExerciseState = (estado: ExerciseState) => void;

export function estaResolvido(estado: ExerciseState | undefined): boolean {
  return estado === 'acertou';
}

/**
 * Avançar pede uma resposta.
 *
 * Qualquer resposta **verificada** libera o passo seguinte — errar não
 * tranca ninguém, e a pessoa que não sabe pode chutar, ver a correção e
 * seguir. O que não libera é não responder: o botão "Pular por ora" existiu
 * e foi retirado a pedido do dono do projeto (2026-09-17), porque convidava
 * a passar reto pelo exercício, que é onde a aula acontece.
 */
export function avancoLiberado(estado: ExerciseState | undefined): boolean {
  return estado === 'acertou' || estado === 'errou';
}

/**
 * O texto do botão que leva ao próximo passo.
 *
 * A regra: o botão diz o que o clique significa **agora**. Para quem errou,
 * "assim mesmo" é honesto — o avanço está liberado, mas a frase não finge
 * que o exercício ficou resolvido. Para quem ainda não respondeu, o botão
 * fica desabilitado e diz o que falta.
 */
export function rotuloDeAvanco(estado: ExerciseState | undefined): string {
  switch (estado) {
    case 'acertou':
      return 'Continuar';
    case 'errou':
      return 'Continuar assim mesmo';
    case 'verificando':
    case 'respondendo':
    case 'inicial':
    case undefined:
      return 'Responda para continuar';
  }
}

/**
 * Quantos exercícios da aula ainda não foram resolvidos.
 *
 * Alimenta tanto a conclusão da aula quanto o que o resumo tem direito de
 * afirmar. Antes o resumo dizia "Aula concluída — seu progresso foi salvo" sem
 * consultar nada, inclusive para quem tinha pulado todos os exercícios.
 */
export function pendentes(
  exerciseIds: string[],
  estados: ReadonlyMap<string, ExerciseState>
): string[] {
  return exerciseIds.filter((id) => !estaResolvido(estados.get(id)));
}
