import type { Track } from '../types';

/**
 * SQL: dizer o que se quer, e o banco busca.
 *
 * A primeira trilha em que o aluno não escreve JavaScript. O código roda num
 * SQLite de verdade, dentro do navegador, sobre um banco de exemplo — uma
 * loja — que é recriado a cada execução. A correção compara as **linhas
 * devolvidas** com as da consulta de referência, e por isso aceita qualquer
 * SQL que chegue ao mesmo resultado: é a lição da linguagem inteira, que
 * descreve o resultado e não o caminho.
 */
export const trackSql: Track = {
  id: 'track-sql',
  title: 'SQL e Bancos de Dados',
  description:
    'Consultar, juntar, agregar e modelar dados num banco de verdade — e ler o que ele devolve.',
  language: 'sql',
  status: 'published',
  // A ordem desta lista é a progressão da trilha: é daqui que sai "próxima aula".
  lessonIds: ['lesson-sql-1', 'lesson-sql-2', 'lesson-sql-3', 'lesson-sql-4', 'lesson-sql-5', 'lesson-sql-6'],
  sections: [
    {
      title: 'Consultar',
      description: 'Tabelas, filtrar, ordenar, juntar tabelas, agregar e subconsultas: tudo que se pergunta a um banco.',
      lessonIds: ['lesson-sql-1', 'lesson-sql-2', 'lesson-sql-3', 'lesson-sql-4', 'lesson-sql-5', 'lesson-sql-6'],
    },
  ],
};
