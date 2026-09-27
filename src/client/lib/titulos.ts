import type { Achievement } from './gamification';

/**
 * Títulos: o que aparece ao lado do nome, ganho por conquista.
 *
 * Um título nunca se compra — nem com moeda, nem com nada. Ele diz o que a
 * pessoa fez ("Detetive de Bugs" é quem resolveu vinte e cinco exercícios de
 * achar o bug), e comprado não diria nada. Por isso cada título aponta para
 * as conquistas que o abrem, e a posse é derivada delas, como o resto.
 *
 * Os nomes são substantivos que servem a qualquer pessoa — "Sentinela",
 * "Maratonista", "Aprendiz" — em vez de uma forma no masculino que metade de
 * quem estuda teria que aceitar ao lado do próprio nome.
 */

export interface TituloDeConquista {
  id: string;
  nome: string;
  /** As conquistas que abrem o título — todas elas. */
  conquistas: string[];
}

export const TITULOS_DE_CONQUISTA: readonly TituloDeConquista[] = [
  { id: 'persistente', nome: 'Persistente', conquistas: ['insistente'] },
  { id: 'coruja', nome: 'Coruja', conquistas: ['coruja'] },
  { id: 'cotovia', nome: 'Cotovia', conquistas: ['cedo-da-manha'] },
  { id: 'detetive-de-bugs', nome: 'Detetive de Bugs', conquistas: ['vinte-e-cinco-bugs'] },
  { id: 'mestre-dos-lacos', nome: 'Mestre dos Laços', conquistas: ['quinze-lacos'] },
  { id: 'sentinela-dos-testes', nome: 'Sentinela dos Testes', conquistas: ['dez-testes'] },
  { id: 'autodidata', nome: 'Autodidata', conquistas: ['trilha-sem-dica'] },
  { id: 'poliglota', nome: 'Poliglota', conquistas: ['poliglota'] },
  { id: 'maratonista', nome: 'Maratonista', conquistas: ['cem'] },
  { id: 'incansavel', nome: 'Incansável', conquistas: ['mes-inteiro'] },
  // As três etapas da web ao servidor: a página, as ferramentas e a aplicação.
  { id: 'aprendiz-full-stack', nome: 'Aprendiz Full Stack', conquistas: ['etapa-2', 'etapa-3', 'etapa-4'] },
  { id: 'lenda-do-percurso', nome: 'Lenda do Percurso', conquistas: ['percurso-inteiro'] },
];

export function tituloDeConquista(id: string | null | undefined): TituloDeConquista | undefined {
  return id ? TITULOS_DE_CONQUISTA.find((t) => t.id === id) : undefined;
}

export interface EstadoDoTitulo {
  titulo: TituloDeConquista;
  tem: boolean;
  /** As conquistas que ainda faltam, na ordem do título. */
  faltam: Achievement[];
}

/** Cada título com a posse — derivada das conquistas, nunca guardada. */
export function estadoDosTitulos(conquistas: Achievement[]): EstadoDoTitulo[] {
  const porId = new Map(conquistas.map((c) => [c.id, c]));
  return TITULOS_DE_CONQUISTA.map((titulo) => {
    const exigidas = titulo.conquistas.map((id) => porId.get(id));
    // Uma conquista que sumiu do catálogo não abre nada: o título fica trancado
    // em vez de abrir por engano (o teste confere que todas existem).
    const faltam = exigidas.filter((c): c is Achievement => c !== undefined && !c.unlocked);
    const tem = exigidas.every((c) => c?.unlocked === true);
    return { titulo, tem, faltam };
  });
}

/**
 * O título para mostrar ao lado do nome: o escolhido, se ainda for da pessoa.
 *
 * Algumas conquistas voltam a fechar quando o catálogo cresce — "o percurso
 * inteiro" ganha uma trilha nova — e o título acompanha: o que a pessoa não
 * tem mais não aparece, e volta sozinho quando ela fechar a trilha nova.
 */
export function tituloParaMostrar(escolhido: string | null | undefined, conquistas: Achievement[]): string | null {
  const titulo = tituloDeConquista(escolhido);
  if (!titulo) return null;
  const estado = estadoDosTitulos(conquistas).find((e) => e.titulo.id === titulo.id);
  return estado?.tem ? titulo.nome : null;
}
