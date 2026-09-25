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
    trackIds: ['track-js-fundamentos', 'track-logica', 'track-estruturas'],
  },
  {
    title: 'Registrar o trabalho',
    description: 'Um commit como frase, uma branch por assunto, revisão de verdade e conflito sem pânico — o hábito de versionar, cedo, antes de qualquer projeto grande o exigir.',
    trackIds: ['track-git'],
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
    title: 'Testes que valem alguma coisa',
    description: 'A forma de um teste, um comportamento por vez, dublês, testar o servidor — antes do projeto final, para escrevê-lo com essa rede de segurança, não depois dele.',
    trackIds: ['track-testes'],
  },
  {
    title: 'O projeto final',
    description: 'Tela, API e banco de uma aplicação de verdade, juntos — do desenho à publicação.',
    trackIds: ['track-projeto'],
  },
  {
    title: 'Publicar',
    description: 'O que muda entre o seu computador e produção, onde um segredo mora, e como a aplicação inteira chega a uma URL de verdade.',
    trackIds: ['track-deploy'],
  },
  {
    title: 'A profissão',
    description: 'O terminal como ferramenta do dia a dia: se localizar, configurar pelo ambiente, rodar os scripts do projeto e entender o que deu errado.',
    trackIds: ['track-terminal'],
  },
  {
    title: 'Outra linguagem',
    description: 'Python, a primeira linguagem além da família JavaScript — o que muda de sintaxe, o que continua sendo o mesmo raciocínio.',
    trackIds: ['track-python'],
  },
];
