import type { Track } from '../types';

/**
 * Testes e Qualidade: escrever testes que valem alguma coisa.
 *
 * A plataforma testou o código do aluno a aula inteira. Esta trilha vira a
 * mesa: o aluno escreve os testes, e os testes dele são testados — contra
 * uma implementação correta (que precisam aceitar) e contra versões
 * sabotadas (que precisam reprovar). É o exercício `write-test`, que já
 * existe desde a trilha de arrays; aqui ele é o assunto, não uma variação.
 *
 * Roda no motor 1 (sandbox) na maioria das aulas; a de testar o servidor
 * usa o motor 4, com `pedir()` fazendo o papel de cliente HTTP dos testes.
 */
export const trackTestes: Track = {
  id: 'track-testes',
  title: 'Testes e Qualidade',
  description:
    'Escrever testes que valem alguma coisa: a forma de um teste, um comportamento por vez, dublês, o que não testar, e o teste que pega o bug de ontem.',
  language: 'javascript',
  status: 'published',
  lessonIds: [
    'lesson-testes-1',
    'lesson-testes-2',
    'lesson-testes-3',
    'lesson-testes-4',
    'lesson-testes-5',
    'lesson-testes-6',
    'lesson-testes-7',
    'lesson-testes-8',
  ],
  sections: [
    {
      title: 'A forma de um teste',
      description: 'Por que testar, arrange/act/assert, um comportamento por vez, nomes que documentam.',
      lessonIds: ['lesson-testes-1', 'lesson-testes-2', 'lesson-testes-3'],
    },
    {
      title: 'Testar sem travar',
      description: 'Dublês, o servidor, o que não testar, testes frágeis, o teste de ontem.',
      lessonIds: ['lesson-testes-4', 'lesson-testes-5', 'lesson-testes-6', 'lesson-testes-7', 'lesson-testes-8'],
    },
  ],
};
