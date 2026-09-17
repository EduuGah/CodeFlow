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
  lessonIds: ['lesson-node-1', 'lesson-node-2', 'lesson-node-3'],
  sections: [
    {
      title: 'O servidor',
      description: 'O Node fora do navegador, o primeiro servidor, as rotas e o que elas respondem.',
      lessonIds: ['lesson-node-1', 'lesson-node-2', 'lesson-node-3'],
    },
  ],
};
