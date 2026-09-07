import type { Track } from '../types';

export const trackJsFundamentos: Track = {
  id: 'track-js-fundamentos',
  title: 'Fundamentos de JavaScript',
  description:
    'Do primeiro valor guardado na memória até escrever funções que resolvem problemas reais.',
  language: 'javascript',
  status: 'published',
  // A ordem desta lista é a progressão da trilha: é daqui que sai "próxima aula".
  lessonIds: [
    'lesson-js-1',
    'lesson-js-2',
    'lesson-js-3',
    'lesson-js-4',
    'lesson-js-5',
    'lesson-js-6',
  ],
};
