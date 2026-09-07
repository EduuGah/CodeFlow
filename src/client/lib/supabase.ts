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

  // NUNCA deixar uma chave de servidor chegar ao bundle do cliente: qualquer
  // visitante consegue lê-la no JavaScript servido e ela ignora as políticas de RLS.
  if (rawAnonKey.startsWith('sb_secret_') || rawAnonKey.startsWith('service_role')) {
    return 'VITE_SUPABASE_ANON_KEY contém uma chave secreta (de servidor). Ela seria exposta a qualquer visitante e ignora o RLS. Use a chave publishable/anon.';
  }

  // O Supabase tem dois formatos válidos em circulação: a chave publishable nova
  // (sb_publishable_…) e a anon key legada, que é um JWT de três blocos.
  const isPublishable = rawAnonKey.startsWith('sb_publishable_');
  const isLegacyJwt = rawAnonKey.startsWith('eyJ') && rawAnonKey.split('.').length === 3;

  if (!isPublishable && !isLegacyJwt) {
    return 'VITE_SUPABASE_ANON_KEY não parece uma chave válida. Copie a chave publishable (ou a anon legada) em Project Settings › API Keys.';
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
