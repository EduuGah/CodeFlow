import type { Track } from '../types';

/**
 * TypeScript: o erro que aparece antes de rodar.
 *
 * A primeira trilha com um compilador na frente do sandbox. Cada exercício é
 * verificado duas vezes: pelo compilador, que recusa o programa quando um
 * tipo não bate, e pelos testes de sempre, sobre o JavaScript que sobra
 * quando as anotações são apagadas. Há um teste que só existe aqui — o
 * trecho que o compilador precisa **recusar** —, porque um tipo bom se prova
 * pelo que ele impede.
 */
export const trackTypescript: Track = {
  id: 'track-typescript',
  title: 'TypeScript',
  description:
    'JavaScript com o erro apontado antes de rodar: anotar, deduzir, estreitar e descrever tipos — e ler o que o compilador diz.',
  language: 'typescript',
  status: 'published',
  // A ordem desta lista é a progressão da trilha: é daqui que sai "próxima aula".
  lessonIds: ['lesson-ts-1', 'lesson-ts-2', 'lesson-ts-3'],
};
