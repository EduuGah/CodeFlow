import type { Track } from '../types';

/**
 * Python: a primeira linguagem além da família JavaScript.
 *
 * Motor 6: Pyodide — CPython compilado para WebAssembly, ~13,5 MB, carregado só
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
  lessonIds: [
    'lesson-py-1',
    'lesson-py-2',
    'lesson-py-3',
    'lesson-py-4',
    'lesson-py-5',
    'lesson-py-6',
    'lesson-py-7',
    'lesson-py-8',
    'lesson-py-9',
    'lesson-py-10',
  ],
  sections: [
    {
      title: 'A base',
      description: 'A sintaxe que muda de JavaScript para Python, condições, laços e funções.',
      lessonIds: ['lesson-py-1', 'lesson-py-2', 'lesson-py-3'],
    },
    {
      title: 'Coleções',
      description: 'Listas, dicionários, conjuntos e strings — as estruturas de dados do dia a dia.',
      lessonIds: ['lesson-py-4', 'lesson-py-5', 'lesson-py-6'],
    },
    {
      title: 'Robustez e organização',
      description: 'Erros, classes e a biblioteca padrão.',
      lessonIds: ['lesson-py-7', 'lesson-py-8', 'lesson-py-9'],
    },
    {
      title: 'Projeto',
      description: 'Juntar tudo: ler dados, transformar, escrever um relatório.',
      lessonIds: ['lesson-py-10'],
    },
  ],
};
