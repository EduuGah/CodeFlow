import type { Track } from '../types';

/**
 * Projeto final: a aplicação inteira.
 *
 * O pedido central do dono do projeto: "ensinar desde o zero a criar uma
 * aplicação full stack com API integrada e banco de dados". A página que a
 * trilha da página ensinou a fazer, chamando a API que a trilha de Node
 * ensinou a escrever, sobre o banco que a trilha de SQL ensinou a consultar
 * — organizada como a trilha de engenharia pediu. Roda no motor 7: o
 * servidor simulado com o SQLite dentro do mesmo worker (`require('./banco')`),
 * e a página do motor 1 fazendo `fetch` para ele.
 */
export const trackProjeto: Track = {
  id: 'track-projeto',
  title: 'Projeto Final: A Aplicação Inteira',
  // Sem "a página" no texto: a suíte de navegador acha a trilha "A Página"
  // pelo nome, e um texto com as mesmas palavras a confundiria.
  description:
    'Do desenho à publicação: tela, API e banco de uma lista de tarefas com conta — as três camadas que você aprendeu, juntas.',
  language: 'node',
  status: 'published',
  lessonIds: ['lesson-proj-1', 'lesson-proj-2', 'lesson-proj-3', 'lesson-proj-4', 'lesson-proj-5'],
  sections: [
    {
      title: 'As camadas',
      description: 'O desenho, o banco com o repositório, e a API sobre ele.',
      lessonIds: ['lesson-proj-1', 'lesson-proj-2', 'lesson-proj-3'],
    },
    {
      title: 'Juntar e entregar',
      description: 'A tela que chama a API, e o que falta para publicar.',
      lessonIds: ['lesson-proj-4', 'lesson-proj-5'],
    },
  ],
};
