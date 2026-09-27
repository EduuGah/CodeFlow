/**
 * Os temas do editor de código: as cores do código nas aulas e nos projetos.
 *
 * Cada tema é uma paleta própria — nada copiado de tema de terceiros — e o
 * teste de contraste (`temas-do-editor.test.ts`) confere cada cor de token
 * contra o fundo: quem está aprendendo precisa ler o comentário tão bem quanto
 * a palavra-chave. O alto contraste é de todo mundo, de graça: acessibilidade
 * não se vende.
 *
 * O Monaco recebe estas paletas em `monaco.ts`; o esqueleto que aparece antes
 * dele, e a miniatura da loja, usam as mesmas cores.
 */

export interface TemaDoEditor {
  /** O id curto, o que o perfil guarda (`noturno`). */
  id: string;
  title: string;
  description: string;
  escuro: boolean;
  /** O item da loja que o vende; sem ele, é de todo mundo. */
  item?: string;
  fundo: string;
  texto: string;
  /** A linha do cursor, por cima do fundo (com transparência). */
  linhaAtual: string;
  numeros: string;
  cores: {
    palavraChave: string;
    textoLiteral: string;
    numero: string;
    comentario: string;
    tipo: string;
  };
}

export const TEMAS_DO_EDITOR: readonly TemaDoEditor[] = [
  {
    id: 'padrao',
    title: 'Padrão',
    description: 'O verde-escuro dos blocos de código das aulas.',
    escuro: true,
    fundo: '#17211f',
    texto: '#d4d4d4',
    linhaAtual: '#ffffff0a',
    numeros: '#8a9a96',
    cores: { palavraChave: '#6fb3f2', textoLiteral: '#dca183', numero: '#b5cea8', comentario: '#7fae6b', tipo: '#4ec9b0' },
  },
  {
    id: 'alto-contraste',
    title: 'Alto contraste',
    description: 'Preto puro e cores fortes, para ler sem esforço.',
    escuro: true,
    fundo: '#000000',
    texto: '#ffffff',
    linhaAtual: '#ffffff1f',
    numeros: '#c8c8c8',
    cores: { palavraChave: '#8fd6ff', textoLiteral: '#ffd98a', numero: '#ffb3d6', comentario: '#b8f2b8', tipo: '#d6c8ff' },
  },
  {
    id: 'noturno',
    title: 'Noturno',
    description: 'Azul de madrugada, com as palavras-chave em lilás.',
    escuro: true,
    item: 'editor-noturno',
    fundo: '#141a2e',
    texto: '#d9e0f0',
    linhaAtual: '#ffffff0d',
    numeros: '#8b95b5',
    cores: { palavraChave: '#b4a6ff', textoLiteral: '#f2c48d', numero: '#f59ab5', comentario: '#9aa6c9', tipo: '#7fd6c8' },
  },
  {
    id: 'papel',
    title: 'Papel',
    description: 'Fundo claro de caderno, tinta escura — para estudar de dia.',
    escuro: false,
    item: 'editor-papel',
    fundo: '#f6f1e7',
    texto: '#2b2622',
    linhaAtual: '#0000000a',
    numeros: '#6f675c',
    cores: { palavraChave: '#8a3b12', textoLiteral: '#2c6a38', numero: '#7a3fa0', comentario: '#5f5a50', tipo: '#1c5b78' },
  },
  {
    id: 'floresta',
    title: 'Floresta à noite',
    description: 'Verde fundo de mata, com o texto em tons de musgo e mel.',
    escuro: true,
    item: 'editor-floresta',
    fundo: '#0f1f19',
    texto: '#d8efe2',
    linhaAtual: '#ffffff0b',
    numeros: '#8fb3a3',
    cores: { palavraChave: '#7fe0a8', textoLiteral: '#f0c987', numero: '#ffb3a1', comentario: '#9dbfb0', tipo: '#9fd4ff' },
  },
  {
    id: 'giz',
    title: 'Giz',
    description: 'O quadro-negro da sala de aula, escrito a giz colorido.',
    escuro: true,
    item: 'editor-giz',
    fundo: '#22302a',
    texto: '#eef0e6',
    linhaAtual: '#ffffff0f',
    numeros: '#a9b8ad',
    cores: { palavraChave: '#ffd98a', textoLiteral: '#b9e6ff', numero: '#ffb8c6', comentario: '#b3c2b7', tipo: '#c8f0a0' },
  },
  {
    id: 'neon',
    title: 'Neon',
    description: 'Roxo de fliperama, com as cores acesas.',
    escuro: true,
    item: 'editor-neon',
    fundo: '#1a1030',
    texto: '#f1e9ff',
    linhaAtual: '#ffffff0d',
    numeros: '#a99bd1',
    cores: { palavraChave: '#ff7cc0', textoLiteral: '#7ff0ff', numero: '#ffd166', comentario: '#b3a6dc', tipo: '#9af0c0' },
  },
];

export const TEMA_DO_EDITOR_PADRAO = TEMAS_DO_EDITOR[0];

export function temaDoEditor(id: string | null | undefined): TemaDoEditor {
  return TEMAS_DO_EDITOR.find((t) => t.id === id) ?? TEMA_DO_EDITOR_PADRAO;
}

/** O nome do tema no Monaco: um por paleta. */
export const nomeNoMonaco = (id: string) => `codeflow-${id}`;
