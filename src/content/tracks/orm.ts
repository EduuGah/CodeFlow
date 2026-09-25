import type { Track } from '../types';

/**
 * ORM: o SQL por trás dos métodos.
 *
 * A trilha de SQL ensina a escrever a consulta; a de Node, a construir a
 * API. Esta trilha entra depois das duas, e ensina o que a maioria das
 * vagas júnior encontra no trabalho real: um ORM (Prisma é a referência
 * usada aqui) entre o código e o banco. Como Git e Terminal, não há um
 * ORM de verdade rodando no sandbox — os exercícios simulam o
 * raciocínio, comparando cada método com o SQL equivalente, porque a
 * habilidade central é saber o que roda por baixo, não decorar uma API.
 */
export const trackOrm: Track = {
  id: 'track-orm',
  title: 'ORM',
  description:
    'O que um ORM resolve e o que ele esconde, schema e migrations, e os métodos mais comuns traduzidos para o SQL que rodam por baixo.',
  language: 'javascript',
  status: 'published',
  lessonIds: ['lesson-orm-1', 'lesson-orm-2', 'lesson-orm-3'],
};
