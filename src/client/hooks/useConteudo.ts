import { useEffect, useState } from 'react';

import { aulaCarregada, carregarAula, carregarProjeto, getLesson, getProject, projetoCarregado } from '../../content';
import type { Lesson, Project } from '../../content/types';
import { registrar } from '../lib/registro';

/**
 * O corpo de uma aula ou projeto, que vem por `import()` quando a tela abre
 * (P2-1b: o pacote principal só tem o índice).
 *
 * - Já veio antes? Sai pronto no primeiro render: voltar a uma aula aberta
 *   não pisca o esqueleto.
 * - Não existe no índice: `ausente` já no primeiro render, sem esqueleto —
 *   a tela faz o que fazia com um id inválido.
 * - O arquivo não chegou (rede, ou um deploy novo que trocou os nomes):
 *   `falhou`, com `tentarDeNovo`. Vai para o registro de eventos só com o
 *   nome do erro.
 *
 * O estado é guardado junto do id que o produziu: trocar de aula nunca mostra
 * o corpo da anterior sob o id da nova.
 */
export type Carregamento<T> =
  | { estado: 'pronto'; valor: T }
  | { estado: 'carregando' }
  | { estado: 'ausente' }
  | { estado: 'falhou'; tentarDeNovo: () => void };

type Guardado<T> = { id: string | undefined; valor?: T; estado: 'pronto' | 'ausente' | 'falhou' };

function useCarregar<T>(
  id: string | undefined,
  existe: (id: string) => boolean,
  jaVeio: (id: string) => T | undefined,
  carregar: (id: string) => Promise<T | undefined>,
  operacao: string
): Carregamento<T> {
  const [guardado, setGuardado] = useState<Guardado<T> | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const pronto = id ? jaVeio(id) : undefined;

  useEffect(() => {
    if (!id || !existe(id) || jaVeio(id)) return;
    let ativo = true;
    carregar(id).then(
      (valor) => {
        if (ativo) setGuardado({ id, valor, estado: valor ? 'pronto' : 'ausente' });
      },
      (erro: unknown) => {
        registrar('falha_de_leitura', { operacao, nome: erro instanceof Error ? erro.name : undefined });
        if (ativo) setGuardado({ id, estado: 'falhou' });
      }
    );
    return () => {
      ativo = false;
    };
  }, [id, tentativa, existe, jaVeio, carregar, operacao]);

  if (!id || !existe(id)) return { estado: 'ausente' };
  if (pronto) return { estado: 'pronto', valor: pronto };
  if (guardado?.id !== id) return { estado: 'carregando' };
  if (guardado.estado === 'pronto' && guardado.valor) return { estado: 'pronto', valor: guardado.valor };
  if (guardado.estado === 'falhou') {
    return {
      estado: 'falhou',
      tentarDeNovo: () => {
        setGuardado(null);
        setTentativa((n) => n + 1);
      },
    };
  }
  return { estado: 'ausente' };
}

const aulaExiste = (id: string) => getLesson(id) !== undefined;
const projetoExiste = (id: string) => getProject(id) !== undefined;

export const useAula = (id: string | undefined): Carregamento<Lesson> =>
  useCarregar(id, aulaExiste, aulaCarregada, carregarAula, 'carregarAula');

/**
 * Várias aulas de uma vez (o Caderno de Erros mostra exercícios de aulas
 * diferentes). A chave é a lista de ids unida, então a mesma lista em outra
 * ordem ou num array novo não recarrega nada.
 */
function aulasJaVieram(chave: string): Map<string, Lesson> | undefined {
  const aulas = new Map<string, Lesson>();
  for (const id of chave ? chave.split(',') : []) {
    const aula = aulaCarregada(id);
    if (!aula) return undefined;
    aulas.set(id, aula);
  }
  return aulas;
}

async function carregarAulas(chave: string): Promise<Map<string, Lesson>> {
  const ids = chave ? chave.split(',') : [];
  const aulas = await Promise.all(ids.map((id) => carregarAula(id)));
  return new Map(aulas.flatMap((aula) => (aula ? [[aula.id, aula] as const] : [])));
}

/** Lista vazia não tem o que esperar: sai pronta, com o mapa vazio. */
const listaExiste = () => true;

export const useAulas = (ids: readonly string[]): Carregamento<Map<string, Lesson>> => {
  const chave = [...new Set(ids.filter(aulaExiste))].sort().join(',');
  const carregamento = useCarregar(chave || undefined, listaExiste, aulasJaVieram, carregarAulas, 'carregarAulas');
  return chave ? carregamento : { estado: 'pronto', valor: new Map() };
};

export const useProjeto = (id: string | undefined): Carregamento<Project> =>
  useCarregar(id, projetoExiste, projetoCarregado, carregarProjeto, 'carregarProjeto');
