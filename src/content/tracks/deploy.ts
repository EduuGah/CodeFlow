import type { Track } from '../types';

/**
 * Deploy: publicar de verdade.
 *
 * Todas as outras trilhas terminam com o código rodando no sandbox do
 * navegador. Esta ensina o que falta depois disso: o que muda entre rodar no
 * seu computador e rodar em produção, onde um segredo mora quando não pode
 * morar no código, como o frontend e o backend chegam ao ar, e o que existe
 * por trás de um domínio com HTTPS. Como Git e Terminal, não há uma
 * plataforma de deploy de verdade no sandbox — os exercícios simulam o
 * raciocínio em JavaScript comum, porque a habilidade que importa aqui é a
 * decisão, não o clique num painel específico.
 */
export const trackDeploy: Track = {
  id: 'track-deploy',
  title: 'Deploy',
  description:
    'O que muda entre o seu computador e produção, onde um segredo mora, como o frontend e o backend chegam ao ar, e o que existe por trás de um domínio com HTTPS.',
  language: 'javascript',
  status: 'published',
  lessonIds: ['lesson-deploy-1', 'lesson-deploy-2', 'lesson-deploy-3', 'lesson-deploy-4'],
};
