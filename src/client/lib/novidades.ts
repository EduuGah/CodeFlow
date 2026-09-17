import type { EstadoDoDesafio } from './desafios';
import type { Achievement } from './gamification';

/**
 * Novidades: o que mudou desde a última vez que a pessoa olhou.
 *
 * Conquistas, níveis e desafios são derivados do histórico — não há um
 * evento "conquista aberta" gravado em lugar nenhum. Para avisar a pessoa,
 * compara-se o estado atual com o que ela já viu, guardado neste aparelho.
 * A comparação é pura e testável; guardar e mostrar é de quem chama.
 *
 * Na primeira vez (nada guardado) não há novidade: tudo o que já existia
 * seria "novo", e trinta avisos de uma vez é ruído, não notícia.
 */

export interface EstadoVisto {
  nivel: number;
  /** Ids das conquistas abertas. */
  conquistas: string[];
  /** `${dia}:${id}` dos desafios cumpridos nos períodos atuais. */
  desafios: string[];
}

export type Novidade =
  | { tipo: 'nivel'; nivel: number; titulo: string }
  | { tipo: 'conquista'; conquista: Achievement }
  | { tipo: 'desafio'; estado: EstadoDoDesafio };

export function estadoAtual(entrada: {
  nivel: number;
  achievements: Achievement[];
  desafios: { dia: EstadoDoDesafio[]; semana: EstadoDoDesafio[] };
  hoje: string;
  segunda: string;
}): EstadoVisto {
  return {
    nivel: entrada.nivel,
    conquistas: entrada.achievements.filter((c) => c.unlocked).map((c) => c.id),
    desafios: [
      ...entrada.desafios.dia.filter((d) => d.concluido).map((d) => `${entrada.hoje}:${d.desafio.id}`),
      ...entrada.desafios.semana.filter((d) => d.concluido).map((d) => `${entrada.segunda}:${d.desafio.id}`),
    ],
  };
}

/**
 * O que apareceu entre `visto` e `atual`, na ordem em que vale contar: o
 * nível (a maior notícia), depois as conquistas, depois os desafios.
 */
export function novidades(
  visto: EstadoVisto | null,
  atual: EstadoVisto,
  contexto: { achievements: Achievement[]; desafios: EstadoDoDesafio[]; tituloDoNivel: string }
): Novidade[] {
  if (!visto) return [];
  const lista: Novidade[] = [];

  if (atual.nivel > visto.nivel) {
    lista.push({ tipo: 'nivel', nivel: atual.nivel, titulo: contexto.tituloDoNivel });
  }

  const conquistasVistas = new Set(visto.conquistas);
  for (const id of atual.conquistas) {
    if (conquistasVistas.has(id)) continue;
    const conquista = contexto.achievements.find((c) => c.id === id);
    if (conquista) lista.push({ tipo: 'conquista', conquista });
  }

  const desafiosVistos = new Set(visto.desafios);
  for (const chave of atual.desafios) {
    if (desafiosVistos.has(chave)) continue;
    const id = chave.slice(chave.indexOf(':') + 1);
    const estado = contexto.desafios.find((d) => d.desafio.id === id);
    if (estado) lista.push({ tipo: 'desafio', estado });
  }

  return lista;
}

const PREFIXO = 'codeflow:visto:';

export function lerVisto(userId: string): EstadoVisto | null {
  try {
    const bruto = localStorage.getItem(PREFIXO + userId);
    if (!bruto) return null;
    const dado = JSON.parse(bruto) as Partial<EstadoVisto>;
    return {
      nivel: typeof dado.nivel === 'number' ? dado.nivel : 1,
      conquistas: Array.isArray(dado.conquistas) ? dado.conquistas : [],
      desafios: Array.isArray(dado.desafios) ? dado.desafios : [],
    };
  } catch {
    return null;
  }
}

export function guardarVisto(userId: string, estado: EstadoVisto): void {
  try {
    localStorage.setItem(PREFIXO + userId, JSON.stringify(estado));
  } catch {
    // Sem armazenamento: a pessoa vê a novidade de novo na próxima vez. Melhor
    // que não ver.
  }
}
