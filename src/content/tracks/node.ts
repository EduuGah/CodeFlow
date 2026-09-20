import type { Track } from '../types';

/**
 * Node e APIs: o servidor que a página chama.
 *
 * O aluno já sabe fazer a página (Fase 2) e consultar o banco (SQL). O que
 * falta para uma aplicação inteira é o meio: o servidor que recebe o pedido
 * da página, decide, fala com os dados e responde. Aqui ele é escrito como
 * no Node de verdade — `require('express')`, `app.get`, `res.json` — e roda
 * no motor 4, um Node de mentira dentro do navegador: nenhuma porta abre,
 * mas cada pedido dos testes passa pelas rotas do aluno e volta com status
 * e corpo, mostrados como um cliente de API mostraria.
 */
export const trackNode: Track = {
  id: 'track-node',
  title: 'Node e APIs',
  description:
    'Escrever o servidor por trás da tela: rotas, JSON, erros, autenticação e uma API inteira — no Node, aqui mesmo.',
  language: 'node',
  status: 'published',
  lessonIds: [
    'lesson-node-1',
    'lesson-node-2',
    'lesson-node-3',
    'lesson-node-4',
    'lesson-node-5',
    'lesson-node-6',
    'lesson-node-7',
    'lesson-node-8',
    'lesson-node-9',
    'lesson-node-10',
  ],
  sections: [
    {
      title: 'O servidor',
      description: 'O Node fora do navegador, o primeiro servidor, as rotas e o que elas respondem.',
      lessonIds: ['lesson-node-1', 'lesson-node-2', 'lesson-node-3'],
    },
    {
      title: 'Escrever e falhar bem',
      description: 'Dados que chegam no corpo, a validação, e o que responder quando algo dá errado.',
      lessonIds: ['lesson-node-4', 'lesson-node-5'],
    },
    {
      title: 'Proteger e completar',
      description: 'A corrente de middlewares, quem está pedindo, e o CRUD inteiro.',
      lessonIds: ['lesson-node-6', 'lesson-node-7'],
    },
    {
      title: 'Do protótipo ao real',
      description: 'Dados que chegam de um banco, a configuração que muda entre máquinas, e a API inteira.',
      lessonIds: ['lesson-node-8', 'lesson-node-9', 'lesson-node-10'],
    },
  ],
};
