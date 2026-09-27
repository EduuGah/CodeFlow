import { supabase } from './supabase';

/**
 * O registro de eventos: o que quebrou, onde, e com que frequência — sem PII.
 *
 * Até aqui o único registro era o `console.error` no navegador de quem
 * estudava: um motor que não carregava ou uma leitura que estourava o tempo
 * toda noite não chegava a ninguém (P2-18).
 *
 * A regra que não se dobra: **só passa o que está na lista branca**, cortado
 * no formato. A mensagem de um erro nunca vai — ela carrega o que o aluno
 * escreveu, às vezes um e-mail ou um trecho de código. Vai o nome do erro
 * (`TypeError`), o código do Postgres, a operação, o motor. O banco confere
 * de novo (0019) e recusa chave fora da lista.
 *
 * Registrar nunca lança e nunca registra a própria falha: um erro no registro
 * que gerasse outro registro viraria enxurrada. Por página aberta vão no
 * máximo `LIMITE_POR_PAGINA`, e o mesmo evento repetido em um minuto vai uma
 * vez só.
 */

/** Espelho de `eventos_tipo_check` (0019) — o teste de migrações confere. */
export const TIPOS_DE_EVENTO = [
  'erro_de_tela',
  'erro_nao_tratado',
  'promessa_rejeitada',
  'falha_de_leitura',
  'falha_de_escrita',
  'consulta_lenta',
  'falha_do_motor',
] as const;
export type TipoDeEvento = (typeof TIPOS_DE_EVENTO)[number];

export const MOTORES = ['javascript', 'servidor', 'sql', 'python', 'editor'] as const;
export const ETAPAS = ['criacao', 'partida', 'carga', 'erro'] as const;

/** Espelho da lista de `dados_de_evento_validos` (0019). */
export const CHAVES_DE_EVENTO = ['rota', 'operacao', 'motor', 'etapa', 'nome', 'codigo', 'duracao_ms', 'exercicio'] as const;

export interface DadosDoEvento {
  /** Sem ela, a rota atual (só o caminho: sem busca nem âncora). */
  rota?: string;
  /** O nome da função que falhou (`fetchAttempts`). */
  operacao?: string;
  motor?: (typeof MOTORES)[number];
  etapa?: (typeof ETAPAS)[number];
  /** O nome do erro (`TypeError`), nunca a mensagem. */
  nome?: string;
  /** O código do Postgres ou do PostgREST (`42703`, `PGRST204`). */
  codigo?: string;
  duracaoMs?: number;
  exercicio?: string;
}

export interface Evento {
  tipo: TipoDeEvento;
  dados: Partial<Record<(typeof CHAVES_DE_EVENTO)[number], string | number>>;
}

const casa = (valor: unknown, formato: RegExp): valor is string => typeof valor === 'string' && formato.test(valor);

/** A rota sem busca, âncora nem caractere fora do formato dos ids do catálogo. */
function rotaLimpa(rota: string): string | undefined {
  const caminho = rota.split(/[?#]/)[0];
  return /^\/[a-z0-9/_-]{0,119}$/.test(caminho) ? caminho : undefined;
}

/**
 * O evento como vai para o banco: só o que passa na lista branca, cada campo
 * no formato dele. O resto some — inclusive o que viesse por engano.
 */
export function montarEvento(tipo: TipoDeEvento, dados: DadosDoEvento = {}, rotaAtual?: string): Evento | null {
  if (!(TIPOS_DE_EVENTO as readonly string[]).includes(tipo)) return null;
  const limpo: Evento['dados'] = {};

  const rota = rotaLimpa(dados.rota ?? rotaAtual ?? '');
  if (rota) limpo.rota = rota;
  if (casa(dados.operacao, /^[a-zA-Z_]{1,40}$/)) limpo.operacao = dados.operacao;
  if (dados.motor && (MOTORES as readonly string[]).includes(dados.motor)) limpo.motor = dados.motor;
  if (dados.etapa && (ETAPAS as readonly string[]).includes(dados.etapa)) limpo.etapa = dados.etapa;
  if (casa(dados.nome, /^[A-Za-z][A-Za-z0-9_]{0,39}$/)) limpo.nome = dados.nome;
  if (casa(dados.codigo, /^[A-Z0-9_]{1,12}$/)) limpo.codigo = dados.codigo;
  if (typeof dados.duracaoMs === 'number' && Number.isFinite(dados.duracaoMs)) {
    limpo.duracao_ms = Math.min(600_000, Math.max(0, Math.round(dados.duracaoMs)));
  }
  if (casa(dados.exercicio, /^[a-z0-9][a-z0-9-]{0,99}$/)) limpo.exercicio = dados.exercicio;

  return { tipo, dados: limpo };
}

/** O código de um erro do Supabase, se houver — nunca a mensagem. */
export function codigoDoErro(erro: unknown): string | undefined {
  const codigo = (erro as { code?: unknown } | null)?.code;
  return typeof codigo === 'string' ? codigo : undefined;
}

export const LIMITE_POR_PAGINA = 30;
const JANELA_DE_REPETICAO_MS = 60_000;

let enviados = 0;
const ultimaVez = new Map<string, number>();

/** Só para os testes: esquece o que foi enviado nesta página. */
export function reiniciarRegistro(): void {
  enviados = 0;
  ultimaVez.clear();
}

export function registrar(tipo: TipoDeEvento, dados: DadosDoEvento = {}): void {
  const rotaAtual = typeof window !== 'undefined' ? window.location.pathname : undefined;
  const evento = montarEvento(tipo, dados, rotaAtual);
  if (!evento || !supabase) return;

  const chave = `${evento.tipo}|${JSON.stringify(evento.dados)}`;
  const agora = Date.now();
  const anterior = ultimaVez.get(chave);
  if (anterior !== undefined && agora - anterior < JANELA_DE_REPETICAO_MS) return;
  if (enviados >= LIMITE_POR_PAGINA) return;
  ultimaVez.set(chave, agora);
  enviados += 1;

  // Sem sessão, o banco recusa (só `authenticated` insere); falha de envio
  // não vira outro registro. Em desenvolvimento, aparece no console.
  void supabase
    .from('eventos')
    .insert(evento)
    .then(({ error }) => {
      if (error && import.meta.env.DEV) console.warn('[CodeFlow] evento não registrado:', codigoDoErro(error) ?? 'sem código');
    });
}

/**
 * Os erros que nenhuma tela pegou: `error` e `unhandledrejection` da janela.
 * Só os deste site — extensões do navegador jogam erro na mesma janela, e
 * não são nossos.
 */
export function instalarRegistroGlobal(): void {
  window.addEventListener('error', (evento) => {
    const arquivo = evento.filename ?? '';
    if (arquivo && !arquivo.startsWith(window.location.origin)) return;
    const nome = evento.error instanceof Error ? evento.error.name : undefined;
    registrar('erro_nao_tratado', { nome });
  });
  window.addEventListener('unhandledrejection', (evento) => {
    const motivo: unknown = evento.reason;
    registrar('promessa_rejeitada', {
      nome: motivo instanceof Error ? motivo.name : undefined,
      codigo: codigoDoErro(motivo),
    });
  });
}
