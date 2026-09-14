import type { Track } from '../types';

/**
 * A página: HTML, CSS e o DOM.
 *
 * É a primeira trilha que roda fora do sandbox de JavaScript puro. Cada
 * exercício de código aqui é uma página inteira, renderizada num iframe
 * isolado, e os testes olham para o DOM que o aluno produziu — não para a
 * saída de um console.
 */
export const trackPagina: Track = {
  id: 'track-pagina',
  title: 'A Página',
  description:
    'Do texto ao que aparece na tela: a estrutura de uma página, o estilo que a veste, e o JavaScript que a faz reagir.',
  language: 'html',
  status: 'published',
  // A ordem desta lista é a progressão da trilha: é daqui que sai "próxima aula".
  lessonIds: [
    'lesson-pagina-1',
    'lesson-pagina-2',
    'lesson-pagina-3',
    'lesson-pagina-4',
    'lesson-pagina-5',
    'lesson-pagina-6',
    'lesson-pagina-7',
  ],
};
