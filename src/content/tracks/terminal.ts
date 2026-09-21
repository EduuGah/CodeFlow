import type { Track } from '../types';

/**
 * Terminal e Ferramentas.
 *
 * A última trilha da Fase 5. Como Git, não existe um terminal de verdade no
 * sandbox — não há como rodar `cd`, `export` ou `npm run` de fato. Os
 * exercícios simulam o raciocínio em JavaScript comum: caminhos como texto,
 * variáveis de ambiente como um objeto, scripts do `package.json` como um
 * mapa de nome para comando, uma saída de erro como um array de linhas. O
 * `package.json`, o semver e o lockfile já são a aula 7 de Engenharia; esta
 * trilha cobre o que falta — navegar, configurar pelo ambiente, rodar os
 * scripts do dia a dia, e ler o que o terminal diz quando algo quebra.
 */
export const trackTerminal: Track = {
  id: 'track-terminal',
  title: 'Terminal e Ferramentas',
  description:
    'O shell e o caminho, variáveis de ambiente, os scripts do package.json na prática, e o que uma saída de erro está tentando dizer — as ferramentas por trás de todo projeto.',
  language: 'javascript',
  status: 'published',
  lessonIds: [
    'lesson-terminal-1',
    'lesson-terminal-2',
    'lesson-terminal-3',
    'lesson-terminal-4',
    'lesson-terminal-5',
  ],
  sections: [
    {
      title: 'Se localizar',
      description: 'Onde você está, para onde um comando olha, e o que configura sem mexer no código.',
      lessonIds: ['lesson-terminal-1', 'lesson-terminal-2'],
    },
    {
      title: 'Rodar e entender o que deu errado',
      description: 'Os atalhos que o projeto já guarda, e o que uma saída de erro está tentando dizer.',
      lessonIds: ['lesson-terminal-3', 'lesson-terminal-4', 'lesson-terminal-5'],
    },
  ],
};
