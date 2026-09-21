import type { Track } from '../types';

/**
 * Engenharia: organizar um projeto.
 *
 * As outras trilhas ensinam a fazer o código funcionar. Esta ensina o que
 * vem depois de funcionar: onde cada coisa mora, como se chama, que tamanho
 * tem, como falha e como outra pessoa a lê. Foi pedida pelo dono do projeto
 * — "uma área que explica engenharia, como dividir os arquivos em pastas,
 * boas práticas". Roda no motor 4 (linguagem `node`): os exercícios são
 * projetos pequenos de vários arquivos, com `require` entre eles, e o aluno
 * escreve ou reescreve um arquivo por vez. A correção continua sendo por
 * comportamento, mais as restrições de forma do exercício de refatorar.
 */
export const trackEngenharia: Track = {
  id: 'track-engenharia',
  title: 'Engenharia: Organizar um Projeto',
  description:
    'Onde cada coisa mora, como se chama, que tamanho tem e como falha — as práticas que fazem um projeto continuar entendível depois de funcionar.',
  language: 'node',
  status: 'published',
  lessonIds: ['lesson-eng-1', 'lesson-eng-2', 'lesson-eng-3', 'lesson-eng-4', 'lesson-eng-5', 'lesson-eng-6', 'lesson-eng-7', 'lesson-eng-8'],
  sections: [
    {
      title: 'Dividir',
      description: 'Por que separar, o que um módulo esconde, e onde cada arquivo mora.',
      lessonIds: ['lesson-eng-1', 'lesson-eng-2', 'lesson-eng-3'],
    },
    {
      title: 'Escrever',
      description: 'Nomes que dizem a verdade, funções que cabem na tela, erros que explicam.',
      lessonIds: ['lesson-eng-4', 'lesson-eng-5', 'lesson-eng-6'],
    },
    {
      title: 'Entregar',
      description: 'O que o projeto depende, e o que outra pessoa encontra ao abri-lo.',
      lessonIds: ['lesson-eng-7', 'lesson-eng-8'],
    },
  ],
};
