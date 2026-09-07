import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

/**
 * Valida a configuração ANTES de instanciar o client.
 *
 * `createClient('', '')` lança "supabaseUrl is required" durante o import do módulo,
 * o que derruba a aplicação inteira antes do React montar — a tela fica branca e o
 * botão de login não reage. Preferimos detectar o problema e exibir uma instrução.
 */
function validateConfig(): string | null {
  if (!rawUrl && !rawAnonKey) {
    return 'Supabase não configurado: crie um arquivo .env na raiz do projeto com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY, depois reinicie o servidor.';
  }

  if (!rawUrl) {
    return 'VITE_SUPABASE_URL não está definida no .env.';
  }

  if (!rawAnonKey) {
    return 'VITE_SUPABASE_ANON_KEY não está definida no .env.';
  }

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') {
      return `VITE_SUPABASE_URL deve começar com https:// (recebido: ${parsed.protocol}//).`;
    }
  } catch {
    return `VITE_SUPABASE_URL não é uma URL válida (recebido: "${rawUrl}"). Use o formato https://SEU-REF.supabase.co`;
  }

  // A anon key é um JWT: três blocos separados por ponto. Pegar a chave errada
  // (ex.: copiar o Project ID) é um erro silencioso difícil de diagnosticar depois.
  if (rawAnonKey.split('.').length !== 3) {
    return 'VITE_SUPABASE_ANON_KEY não parece uma chave válida. Copie a chave "anon public" em Project Settings › API.';
  }

  return null;
}

export const supabaseConfigError = validateConfig();
export const isSupabaseConfigured = supabaseConfigError === null;

/** `null` quando a configuração está ausente ou inválida. Acesse via os serviços em `lib/`. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawAnonKey)
  : null;

if (supabaseConfigError) {
  console.error(`[CodeFlow] ${supabaseConfigError}`);
}
