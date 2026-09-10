import type { Track } from '../types';

export const trackWeb: Track = {
  id: 'track-web',
  title: 'Como a Web Funciona',
  description:
    'O que acontece entre clicar num botão e ver a tela mudar: quem pede, quem responde, o que trafega no meio e por que o navegador às vezes recusa.',
  language: 'javascript',
  status: 'published',
  // A ordem desta lista é a progressão da trilha: é daqui que sai "próxima aula".
  lessonIds: [
    'lesson-web-1',
    'lesson-web-2',
    'lesson-web-3',
  ],
};
