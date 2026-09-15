import type { Track } from '../types';

/**
 * React: a interface como função dos dados.
 *
 * Cada exercício de código é um componente em TSX, compilado pelo mesmo
 * compilador da trilha de TypeScript e montado, com o React embutido, no
 * iframe do motor de página. Os testes olham o DOM que o componente
 * produziu e interagem com ele — clicam, digitam, enviam — como a pessoa
 * faria; o que se verifica é o comportamento na tela, nunca o texto do
 * código.
 */
export const trackReact: Track = {
  id: 'track-react',
  title: 'React',
  description:
    'A tela como função dos dados: componentes, estado, listas, formulários, efeitos, dados de fora e a composição que mantém tudo pequeno.',
  language: 'react',
  status: 'published',
  // A ordem desta lista é a progressão da trilha: é daqui que sai "próxima aula".
  lessonIds: ['lesson-react-1', 'lesson-react-2', 'lesson-react-3', 'lesson-react-4', 'lesson-react-5', 'lesson-react-6', 'lesson-react-7'],
  sections: [
    {
      title: 'Fundamentos',
      description: 'Componentes, estado, listas, formulários e efeitos — o que toda tela em React usa.',
      lessonIds: ['lesson-react-1', 'lesson-react-2', 'lesson-react-3', 'lesson-react-4', 'lesson-react-5'],
    },
    {
      title: 'Dados e composição',
      description: 'Dados de fora, os estados da tela, componentes que se encaixam, contexto e hooks próprios.',
      lessonIds: ['lesson-react-6', 'lesson-react-7'],
    },
  ],
};
