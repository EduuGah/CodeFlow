import { supabase } from './supabase';
import type { Purchase } from './economia';

/**
 * Perfil editável, compras e foto.
 *
 * Mesmas regras de `progress.ts`: nada aqui lança para a tela; uma leitura
 * que falha devolve vazio com `error` preenchido, e uma escrita que falha
 * devolve a mensagem. O saldo de moedas não é lido de lugar nenhum — é
 * derivado (`economia.ts`); o que se lê e grava aqui são as **compras**.
 */

/**
 * O banco ainda não tem a migração 0007: a tabela `purchases` ou as colunas
 * de perfil não existem. É o erro mais provável na primeira vez que alguém
 * abre a loja num projeto novo — e "tente de novo" não resolve, então a
 * mensagem diz o que rodar.
 */
function semMigracao(error: { code?: string; message: string }): boolean {
  return (
    error.code === 'PGRST205' || // tabela não encontrada no schema cache
    error.code === 'PGRST204' || // coluna não encontrada
    error.code === '42P01' || // relation does not exist
    error.code === '42703' || // column does not exist
    /schema cache|does not exist/i.test(error.message)
  );
}

const AVISO_DA_MIGRACAO =
  'O banco ainda não tem a tabela da loja e do perfil. Rode supabase/migrations/0007_perfil_e_loja.sql no SQL Editor do Supabase.';

export type Tema = 'sistema' | 'claro' | 'escuro';
export type Acento = 'floresta' | 'oceano' | 'brasa' | 'ameixa';

export interface Perfil {
  /** O nome que a pessoa escolheu; `null` cai no nome do Google. */
  displayName: string | null;
  /** `preset:<id>` ou a URL da foto enviada; `null` cai na foto do Google. */
  avatar: string | null;
  theme: Tema | null;
  accent: Acento | null;
  error?: string;
}

const VAZIO: Perfil = { displayName: null, avatar: null, theme: null, accent: null };

export async function fetchPerfil(userId: string): Promise<Perfil> {
  if (!supabase) return { ...VAZIO, error: 'Supabase não configurado.' };

  const { data, error } = await supabase
    .from('users')
    .select('display_name, avatar, theme, accent')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Falha ao buscar o perfil:', error.message);
    return { ...VAZIO, error: 'Não foi possível carregar seu perfil.' };
  }

  return {
    displayName: data?.display_name ?? null,
    avatar: data?.avatar ?? null,
    theme: (data?.theme as Tema | null) ?? null,
    accent: (data?.accent as Acento | null) ?? null,
  };
}

/** Grava só o que veio: `undefined` deixa a coluna como está. */
export async function updatePerfil(
  userId: string,
  mudancas: Partial<{ displayName: string | null; avatar: string | null; theme: Tema; accent: Acento }>
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase não configurado.' };

  const linha: Record<string, unknown> = { id: userId };
  if (mudancas.displayName !== undefined) linha.display_name = mudancas.displayName;
  if (mudancas.avatar !== undefined) linha.avatar = mudancas.avatar;
  if (mudancas.theme !== undefined) linha.theme = mudancas.theme;
  if (mudancas.accent !== undefined) linha.accent = mudancas.accent;

  const { error } = await supabase.from('users').upsert(linha, { onConflict: 'id' });
  if (error) {
    console.error('Falha ao salvar o perfil:', error.message);
    return { error: semMigracao(error) ? AVISO_DA_MIGRACAO : 'Não foi possível salvar. Tente de novo.' };
  }
  return {};
}

/** O nome como o aluno o vê: o escolhido, senão o do Google, senão o e-mail. */
export function nomeParaMostrar(
  perfil: Pick<Perfil, 'displayName'>,
  user: { user_metadata?: Record<string, unknown>; email?: string } | null
): string {
  const escolhido = perfil.displayName?.trim();
  if (escolhido) return escolhido;
  const doGoogle = user?.user_metadata?.full_name;
  if (typeof doGoogle === 'string' && doGoogle.trim()) return doGoogle.trim();
  return user?.email ?? 'Estudante';
}

// ------------------------------------------------------------ compras

export async function fetchPurchases(userId: string): Promise<Purchase[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('purchases')
    .select('item, price, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Falha ao buscar compras:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({ item: row.item, price: row.price, createdAt: row.created_at }));
}

/**
 * Registra uma compra. Quem chama já conferiu o saldo; o banco guarda o fato
 * e a hora — que é o que o dobro de XP e o congelamento usam.
 */
export async function recordPurchase(
  userId: string,
  item: string,
  price: number
): Promise<{ purchase?: Purchase; error?: string }> {
  if (!supabase) return { error: 'Supabase não configurado.' };

  const { data, error } = await supabase
    .from('purchases')
    .insert({ user_id: userId, item, price })
    .select('item, price, created_at')
    .single();

  if (error) {
    console.error('Falha ao registrar compra:', error.message);
    return { error: semMigracao(error) ? AVISO_DA_MIGRACAO : 'A compra não foi registrada. Tente de novo.' };
  }
  return { purchase: { item: data.item, price: data.price, createdAt: data.created_at } };
}

// ------------------------------------------------------------ foto

/** Lado da foto guardada, em pixels. Um avatar nunca aparece maior que 128 na tela. */
export const LADO_DA_FOTO = 256;

/**
 * Reduz a imagem escolhida a um quadrado de `LADO_DA_FOTO` px, cortando o
 * centro. Feito no navegador, antes do envio: uma foto de celular tem 4 MB,
 * e o bucket aceita 1 — e ninguém precisa da foto inteira para um círculo de
 * 56 px.
 */
export async function reduzirFoto(arquivo: Blob, lado = LADO_DA_FOTO): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const menor = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = lado;
  canvas.height = lado;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('O navegador não conseguiu processar a imagem.');
  ctx.drawImage(bitmap, (bitmap.width - menor) / 2, (bitmap.height - menor) / 2, menor, menor, 0, 0, lado, lado);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar a imagem.'))), 'image/jpeg', 0.86);
  });
}

/** Envia a foto para a pasta da pessoa no bucket e devolve a URL pública. */
export async function uploadFoto(userId: string, foto: Blob): Promise<{ url?: string; error?: string }> {
  if (!supabase) return { error: 'Supabase não configurado.' };

  // Um nome novo a cada envio: a URL antiga pode estar em cache no navegador,
  // e a foto trocada precisa aparecer na hora.
  const caminho = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('avatars').upload(caminho, foto, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) {
    console.error('Falha ao enviar a foto:', error.message);
    return { error: 'Não foi possível enviar a foto. Confira o tamanho e tente de novo.' };
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(caminho);
  return { url: data.publicUrl };
}
