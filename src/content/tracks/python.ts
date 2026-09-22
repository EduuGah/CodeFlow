import type { Track } from '../types';

/**
 * Python: a primeira linguagem além da família JavaScript.
 *
 * Motor 6: Pyodide — CPython compilado para WebAssembly, ~10 MB, carregado só
 * quando uma aula desta trilha abre (`prepararMotorPython`, chamado ao montar
 * o exercício). A correção continua sendo por comportamento: os testes são
 * `assert` em Python de verdade, rodando no mesmo intérprete que o aluno usa.
 *
 * A trilha pressupõe JavaScript (Fase 1): cada aula compara com o que o
 * aluno já sabe, em vez de ensinar programação do zero de novo.
 */
export const trackPython: Track = {
  id: 'track-python',
  title: 'Python',
  description:
    'A primeira linguagem além do JavaScript: o que muda (indentação, tipos, listas) e o que é o mesmo raciocínio de sempre, num intérprete de verdade rodando no navegador.',
  language: 'python',
  status: 'published',
  lessonIds: ['lesson-py-1'],
  sections: [
    {
      title: 'Python depois de JavaScript',
      description: 'Onde a sintaxe muda e onde o raciocínio é o mesmo de sempre.',
      lessonIds: ['lesson-py-1'],
    },
  ],
};
