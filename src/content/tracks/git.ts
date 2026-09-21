import type { Track } from '../types';

/**
 * Git e Equipe.
 *
 * Não existe um motor de Git de verdade no sandbox — não há como executar
 * `git commit` ou `git merge`. O que a trilha ensina é o raciocínio por trás
 * dos comandos: o que um commit atômico é, por que isolar trabalho numa
 * branch, o que uma revisão de verdade cobra, como um conflito nasce e se
 * resolve, e o que faz um histórico útil. Os exercícios de código simulam
 * esse raciocínio em JavaScript comum — mensagens como texto, branches como
 * listas, conflitos como marcadores num arquivo — porque a habilidade
 * ensinada é a decisão, não a sintaxe do comando.
 */
export const trackGit: Track = {
  id: 'track-git',
  title: 'Git e Equipe',
  description:
    'O que separa "funciona no meu computador" de trabalhar em equipe: commits que contam o que mudou e por quê, branches por assunto, revisão de verdade e conflitos sem pânico.',
  language: 'javascript',
  status: 'published',
  lessonIds: [
    'lesson-git-1',
    'lesson-git-2',
    'lesson-git-3',
    'lesson-git-4',
    'lesson-git-5',
    'lesson-git-6',
  ],
  sections: [
    {
      title: 'Registrar o trabalho',
      description: 'O commit como frase, e a branch como o lugar onde uma ideia amadurece sozinha.',
      lessonIds: ['lesson-git-1', 'lesson-git-2'],
    },
    {
      title: 'Trabalhar com outra pessoa',
      description: 'A revisão que pega o que ninguém vê sozinho, e o conflito que ela às vezes revela.',
      lessonIds: ['lesson-git-3', 'lesson-git-4'],
    },
    {
      title: 'Deixar organizado',
      description: 'Um histórico que outra pessoa consegue ler, e o que nunca devia ter entrado nele.',
      lessonIds: ['lesson-git-5', 'lesson-git-6'],
    },
  ],
};
