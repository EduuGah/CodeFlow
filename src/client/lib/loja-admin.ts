import { funcaoAusente } from './progress';
import { supabase } from './supabase';
import { PRECO_DO_NIVEL, raridadeDoNivel, type ItemDaLoja, type TipoDeItem } from './economia';

/**
 * A loja vista pela administração: o catálogo do banco ao lado do código, e o
 * gerador da linha de um item novo.
 *
 * Mesma decisão do conteúdo: o catálogo é código revisado em pull request —
 * `ITENS` e uma migração que o espelha. A tela não escreve item no banco; ela
 * **gera** as duas linhas para colar, e mostra onde o banco e o código
 * discordam (quase sempre: uma migração que ainda não rodou). O que ela faz
 * no banco é só ligar e desligar `ativo` (0017).
 */

export interface LinhaDoBanco {
  id: string;
  price: number;
  tipo: string;
  ativo: boolean;
  disponivel_de: string | null;
  disponivel_ate: string | null;
}

export type Divergencia =
  | { id: string; tipo: 'falta_no_banco' }
  | { id: string; tipo: 'so_no_banco' }
  | { id: string; tipo: 'preco'; codigo: number; banco: number }
  | { id: string; tipo: 'categoria'; codigo: string; banco: string }
  | { id: string; tipo: 'janela' };

const mesmoInstante = (a: string | null | undefined, b: string | null | undefined) =>
  (a ? Date.parse(a) : null) === (b ? Date.parse(b) : null);

/** Onde o banco e o código discordam, item por item. */
export function compararCatalogo(itens: readonly ItemDaLoja[], banco: readonly LinhaDoBanco[]): Divergencia[] {
  const porId = new Map(banco.map((l) => [l.id, l]));
  const noCodigo = new Set(itens.map((i) => i.id));
  const lista: Divergencia[] = [];
  for (const item of itens) {
    const linha = porId.get(item.id);
    if (!linha) {
      lista.push({ id: item.id, tipo: 'falta_no_banco' });
      continue;
    }
    if (linha.price !== item.price) lista.push({ id: item.id, tipo: 'preco', codigo: item.price, banco: linha.price });
    if (linha.tipo !== item.tipo) lista.push({ id: item.id, tipo: 'categoria', codigo: item.tipo, banco: linha.tipo });
    if (!mesmoInstante(item.disponivelDe, linha.disponivel_de) || !mesmoInstante(item.disponivelAte, linha.disponivel_ate)) {
      lista.push({ id: item.id, tipo: 'janela' });
    }
  }
  for (const linha of banco) if (!noCodigo.has(linha.id)) lista.push({ id: linha.id, tipo: 'so_no_banco' });
  return lista;
}

// ------------------------------------------------------------ gerador

export interface RascunhoDeItem {
  /** As categorias com lista de itens por nível em `economia.ts`. */
  tipo: Extract<TipoDeItem, 'avatar' | 'moldura' | 'fundo'>;
  /** O id curto (`capivara`); o completo é `${tipo}-${curto}`. */
  curto: string;
  titulo: string;
  descricao: string;
  nivel: number;
}

export interface LinhasGeradas {
  problemas: string[];
  /** A tupla para a lista da categoria em `ITENS` (`economia.ts`). */
  ts: string;
  /** A linha para o `insert into public.store_items` de uma migração nova. */
  sql: string;
}

const aspasTs = (texto: string) => `'${texto.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

export function gerarLinhas(rascunho: RascunhoDeItem, existentes: readonly ItemDaLoja[]): LinhasGeradas {
  const problemas: string[] = [];
  const id = `${rascunho.tipo}-${rascunho.curto}`;
  if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(rascunho.curto)) {
    problemas.push('O id curto usa só letras minúsculas, dígitos e hífen, e começa por letra ou dígito (até 40).');
  }
  if (existentes.some((i) => i.id === id)) problemas.push(`Já existe um item ${id}.`);
  if (!rascunho.titulo.trim()) problemas.push('Falta o título.');
  if (!rascunho.descricao.trim()) problemas.push('Falta a descrição.');
  const preco = PRECO_DO_NIVEL[rascunho.nivel];
  if (preco === undefined) {
    const niveis = Object.keys(PRECO_DO_NIVEL).join(', ');
    problemas.push(`Não há preço calibrado para o nível ${rascunho.nivel} (os que há: ${niveis}).`);
  }

  const ts = `['${rascunho.curto}', ${aspasTs(rascunho.titulo.trim())}, ${aspasTs(rascunho.descricao.trim())}, ${rascunho.nivel}],`;
  const sql = `('${id}', ${preco ?? 0}, '${rascunho.tipo}')`;
  return { problemas, ts, sql };
}

/** A raridade que o item vai ter, para a tela dizer antes de gerar. */
export const raridadeDoRascunho = (r: RascunhoDeItem) => raridadeDoNivel(r.nivel);

// ------------------------------------------------------------ banco

export async function fetchCatalogoDoBanco(): Promise<{ linhas: LinhaDoBanco[]; erro?: string }> {
  if (!supabase) return { linhas: [], erro: 'Supabase não configurado.' };
  const { data, error } = await supabase
    .from('store_items')
    .select('id, price, tipo, ativo, disponivel_de, disponivel_ate')
    .order('id');
  if (error) {
    console.error('Falha ao ler o catálogo do banco:', error.message);
    return { linhas: [], erro: 'Não foi possível ler o catálogo do banco.' };
  }
  return { linhas: (data ?? []) as LinhaDoBanco[] };
}

const RECUSAS: Record<string, string> = {
  apenas_admin: 'Só administradores mudam a loja.',
  conta_demo: 'A conta de demonstração não muda a loja de ninguém.',
  item_desconhecido: 'Este item não está no catálogo do banco — falta rodar a migração dele.',
};

export async function definirItemAtivo(id: string, ativo: boolean): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase não configurado.' };
  const { error } = await supabase.rpc('definir_item_ativo', { p_item: id, p_ativo: ativo });
  if (!error) return {};
  if (funcaoAusente(error)) {
    return { error: 'O banco ainda não tem esta função. Rode supabase/migrations/0017_admin_da_loja.sql no SQL Editor do Supabase.' };
  }
  const motivo = Object.keys(RECUSAS).find((codigo) => error.message?.includes(codigo));
  console.error('Falha ao mudar o item:', error.message);
  return { error: motivo ? RECUSAS[motivo] : 'Não foi possível mudar o item. Tente de novo.' };
}

/** Os ids que o banco tirou da venda, para a loja esconder. Falhou: nenhum. */
export async function fetchInativos(): Promise<Set<string>> {
  if (!supabase) return new Set();
  const { data, error } = await supabase.from('store_items').select('id').eq('ativo', false);
  if (error) return new Set();
  return new Set((data ?? []).map((l: { id: string }) => l.id));
}
