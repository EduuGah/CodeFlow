import type { ExecutionResult } from './sandbox';

/**
 * O que o aluno enviou numa tentativa — para o Caderno de Erros mostrar
 * "o que você respondeu", e não só "você errou".
 *
 * Um formato por tipo de exercício, sempre pequeno: o banco limita o tamanho
 * (0010), e aqui cada campo é cortado antes de sair. Nada disso é do catálogo:
 * é do aluno, e só ele lê (RLS; o admin só vê agregados desde a 0009).
 */
export type RespostaEnviada =
  /** Múltipla escolha: a alternativa marcada. */
  | { tipo: 'alternativa'; indice: number }
  /** Prever a saída: o que a pessoa escreveu. */
  | { tipo: 'previsao'; texto: string }
  /** Completar a lacuna: o que foi em cada uma. */
  | { tipo: 'lacunas'; valores: string[] }
  /** Encontrar o bug: a linha apontada. */
  | { tipo: 'linha'; linha: number }
  /** Ordenar os passos: a ordem enviada, pelos ids dos passos. */
  | { tipo: 'ordem'; ids: string[] }
  /** Código, SQL, servidor, teste, refatoração: o começo do que foi escrito. */
  | { tipo: 'codigo'; codigo: string };

/** A evidência de uma tentativa errada, como o Caderno de Erros a mostra. */
export interface EvidenciaDoErro {
  exerciseId: string;
  resposta: RespostaEnviada | null;
  feedback: string | null;
  createdAt: string;
}

/**
 * Teto de cada texto guardado. O começo basta para lembrar do que se tratava,
 * e o pior caso de todos juntos (acento, aspas, quebra de linha) cabe no teto
 * em bytes da 0010 — `migrations.test.ts` confere.
 */
export const LIMITE_DE_CODIGO = 4000;
export const LIMITE_DE_TEXTO = 500;
/** Uma lacuna é um trecho de linha; vinte delas cabem no teto do banco. */
export const LIMITE_DE_LACUNA = 200;
const MAXIMO_DE_LACUNAS = 20;
const MAXIMO_DE_PASSOS = 50;

function cortar(texto: string, limite: number): string {
  return texto.length <= limite ? texto : `${texto.slice(0, limite)}…`;
}

/** A resposta pronta para gravar: os textos cortados nos tetos. */
export function resumirResposta(resposta: RespostaEnviada): RespostaEnviada {
  switch (resposta.tipo) {
    case 'previsao':
      return { tipo: 'previsao', texto: cortar(resposta.texto, LIMITE_DE_TEXTO) };
    case 'lacunas':
      return {
        tipo: 'lacunas',
        valores: resposta.valores.slice(0, MAXIMO_DE_LACUNAS).map((v) => cortar(v, LIMITE_DE_LACUNA)),
      };
    case 'ordem':
      return { tipo: 'ordem', ids: resposta.ids.slice(0, MAXIMO_DE_PASSOS).map((id) => cortar(id, 100)) };
    case 'codigo':
      return { tipo: 'codigo', codigo: cortar(resposta.codigo, LIMITE_DE_CODIGO) };
    case 'alternativa':
    case 'linha':
      return resposta;
  }
}

/** O retorno que a pessoa leu, cortado: a primeira falha, como apareceu na tela. */
export function resumirFeedback(feedback: string | null | undefined): string | undefined {
  const limpo = feedback?.trim();
  return limpo ? cortar(limpo, LIMITE_DE_TEXTO) : undefined;
}

/** Lê uma resposta vinda do banco, recusando o que não tem o formato esperado. */
export function lerResposta(valor: unknown): RespostaEnviada | null {
  if (!valor || typeof valor !== 'object') return null;
  const r = valor as Record<string, unknown>;
  switch (r.tipo) {
    case 'alternativa':
      return typeof r.indice === 'number' ? { tipo: 'alternativa', indice: r.indice } : null;
    case 'previsao':
      return typeof r.texto === 'string' ? { tipo: 'previsao', texto: r.texto } : null;
    case 'lacunas':
      return Array.isArray(r.valores) && r.valores.every((v) => typeof v === 'string')
        ? { tipo: 'lacunas', valores: r.valores as string[] }
        : null;
    case 'linha':
      return typeof r.linha === 'number' ? { tipo: 'linha', linha: r.linha } : null;
    case 'ordem':
      return Array.isArray(r.ids) && r.ids.every((v) => typeof v === 'string') ? { tipo: 'ordem', ids: r.ids as string[] } : null;
    case 'codigo':
      return typeof r.codigo === 'string' ? { tipo: 'codigo', codigo: r.codigo } : null;
    default:
      return null;
  }
}

/** Uma lista sem nada dentro não é evidência: não há o que mostrar. */
export function respostaVazia(resposta: RespostaEnviada): boolean {
  return (
    (resposta.tipo === 'ordem' && resposta.ids.length === 0) ||
    (resposta.tipo === 'lacunas' && resposta.valores.length === 0)
  );
}

/** O primeiro problema de uma execução, como a tela mostra: o erro, ou a primeira verificação que falhou. */
export function primeiraFalha(execucao: Pick<ExecutionResult, 'error' | 'testResults'>): string | undefined {
  return execucao.error || execucao.testResults.find((t) => !t.passed)?.message;
}
