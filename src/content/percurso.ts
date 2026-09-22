/**
 * O percurso: as trilhas em etapas, na ordem em que uma prepara a outra.
 *
 * Sete trilhas numa grade não dizem por onde começar nem o que vem depois —
 * e quem nunca programou não tem como saber que "A Página" supõe JavaScript.
 * A ordem já existia (é a de `listTracks()`); o que faltava era nomear os
 * degraus. Três etapas, cada uma com uma frase sobre o que ela entrega, são
 * o mapa que a tela inicial e a de trilhas mostram.
 *
 * A validação do catálogo confere que toda trilha publicada está em exatamente
 * uma etapa, e que a ordem aqui é a mesma da lista de trilhas.
 */
export interface EtapaDoPercurso {
  /** Nome curto, como um capítulo. */
  title: string;
  /** O que a pessoa consegue fazer ao terminar a etapa. */
  description: string;
  trackIds: string[];
}

export const ETAPAS_DO_PERCURSO: EtapaDoPercurso[] = [
  {
    title: 'A base',
    description: 'Escrever programas que decidem, repetem e resolvem problemas — e raciocinar antes de codar.',
    trackIds: ['track-js-fundamentos', 'track-logica'],
  },
  {
    title: 'A web',
    description: 'Entender o que acontece entre o clique e a tela, e construir a página que o navegador mostra.',
    trackIds: ['track-web', 'track-pagina'],
  },
  {
    title: 'As ferramentas do trabalho',
    description: 'O que se usa em equipe: tipos, componentes e o banco de dados por trás de tudo.',
    trackIds: ['track-typescript', 'track-react', 'track-sql'],
  },
  {
    title: 'A aplicação inteira',
    description: 'O servidor por trás da tela, e o que faz um projeto ser de gente grande.',
    trackIds: ['track-node'],
  },
  {
    title: 'O ofício',
    description: 'As práticas que fazem um projeto continuar entendível depois de funcionar: onde cada coisa mora, como se chama, como falha.',
    trackIds: ['track-engenharia'],
  },
  {
    title: 'O projeto final',
    description: 'Tela, API e banco de uma aplicação de verdade, juntos — do desenho à publicação.',
    trackIds: ['track-projeto'],
  },
  {
    title: 'A profissão',
    description: 'O que separa código que funciona de trabalho em equipe: testes que valem alguma coisa, Git e o fluxo de revisão, o terminal como ferramenta.',
    trackIds: ['track-testes', 'track-git', 'track-terminal'],
  },
  {
    title: 'Outra linguagem',
    description: 'Python, a primeira linguagem além da família JavaScript — o que muda de sintaxe, o que continua sendo o mesmo raciocínio.',
    trackIds: ['track-python'],
  },
];
