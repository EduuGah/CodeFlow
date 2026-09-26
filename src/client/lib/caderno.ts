import type { Concept } from '../../content/types';
import type { Attempt } from './mastery';
import type { EvidenciaDoErro } from './resposta';
import { diaLocal, somarDias } from './sequencia';

/**
 * O Caderno de Erros e a fila de revisão que sai dele.
 *
 * Cada exercício que a pessoa já errou entra no caderno, com quantas vezes
 * errou e quando — e, lida à parte (`fetchEvidencias`), a evidência: o que ela
 * respondeu da última vez, o retorno que leu. E o caderno alimenta a revisão,
 * inspirada na repetição espaçada dos cartões (`review.ts`):
 *
 * - **pendente**: errou e ainda não acertou depois — volta já;
 * - acertou depois do erro: a próxima revisão vem em 3 dias; acertou de novo
 *   nessa data (ou depois), em 7; de novo, em 21;
 * - **dominado**: passou pelas três revisões espaçadas sem errar.
 *
 * Um erro novo recomeça a contagem. Acertar duas vezes no mesmo dia não
 * adianta nada: só conta o acerto que chega na data (ou depois dela) — é o
 * espaçamento que prova que ficou, não a repetição.
 *
 * Como tudo aqui, é derivado das tentativas: não há tabela de caderno.
 */

/** Dias até cada revisão, depois de cada acerto que conta. */
export const INTERVALOS_DO_CADERNO = [3, 7, 21] as const;

export type EstadoNoCaderno = 'pendente' | 'revisar' | 'em-dia' | 'dominado';

export interface EntradaDoCaderno {
  exerciseId: string;
  lessonId: string;
  concepts: string[];
  /** Quantas tentativas erradas, na história toda. */
  vezesErrado: number;
  primeiroErro: string;
  /** A tentativa errada mais recente. */
  ultimoErro: Attempt;
  /** Acertos que contaram desde o último erro (o primeiro, e os que vieram na data). */
  acertosEspacados: number;
  ultimoAcerto: string | null;
  estado: EstadoNoCaderno;
  /** Dia (AAAA-MM-DD) em que volta à fila; `null` para pendente e dominado. */
  proximaRevisao: string | null;
  /** Quantos conceitos dependem direto dos conceitos deste exercício. */
  importancia: number;
}

/** Quantos conceitos têm cada conceito como pré-requisito direto. */
export function dependentesPorConceito(conceitos: Pick<Concept, 'id' | 'prerequisites'>[]): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const c of conceitos) {
    for (const pre of c.prerequisites) mapa.set(pre, (mapa.get(pre) ?? 0) + 1);
  }
  return mapa;
}

/**
 * O caderno inteiro: um item por exercício que já teve alguma tentativa
 * errada. `hoje` decide o que está vencido.
 */
export function montarCaderno(
  attempts: Attempt[],
  dependentes: ReadonlyMap<string, number> = new Map(),
  hoje: Date = new Date()
): EntradaDoCaderno[] {
  const hojeStr = diaLocal(hoje);
  const porExercicio = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const lista = porExercicio.get(a.exerciseId);
    if (lista) lista.push(a);
    else porExercicio.set(a.exerciseId, [a]);
  }

  const entradas: EntradaDoCaderno[] = [];
  for (const [exerciseId, todas] of porExercicio) {
    const ordenadas = [...todas].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const erros = ordenadas.filter((a) => !a.correct);
    if (erros.length === 0) continue;

    const ultimoErro = erros[erros.length - 1];
    const depois = ordenadas.filter((a) => a.correct && a.createdAt > ultimoErro.createdAt);

    // Os acertos que contam: o primeiro depois do erro, e cada um que chega
    // na data marcada (ou depois dela).
    let acertosEspacados = 0;
    let proxima: string | null = null;
    let ultimoAcerto: string | null = null;
    for (const acerto of depois) {
      const dia = diaLocal(new Date(acerto.createdAt));
      if (acertosEspacados > 0 && proxima !== null && dia < proxima) continue;
      acertosEspacados += 1;
      ultimoAcerto = acerto.createdAt;
      const intervalo = INTERVALOS_DO_CADERNO[acertosEspacados - 1];
      proxima = intervalo === undefined ? null : somarDias(dia, intervalo);
    }

    const estado: EstadoNoCaderno =
      acertosEspacados === 0
        ? 'pendente'
        : proxima === null
          ? 'dominado'
          : proxima <= hojeStr
            ? 'revisar'
            : 'em-dia';

    const importancia = ultimoErro.concepts.reduce((soma, c) => soma + (dependentes.get(c) ?? 0), 0);

    entradas.push({
      exerciseId,
      lessonId: ultimoErro.lessonId,
      concepts: ultimoErro.concepts,
      vezesErrado: erros.length,
      primeiroErro: erros[0].createdAt,
      ultimoErro,
      acertosEspacados,
      ultimoAcerto,
      estado,
      proximaRevisao: estado === 'pendente' || estado === 'dominado' ? null : proxima,
      importancia,
    });
  }

  // O mais recente primeiro: é o que a pessoa ainda lembra de ter errado.
  return entradas.sort((a, b) => b.ultimoErro.createdAt.localeCompare(a.ultimoErro.createdAt));
}

/**
 * A fila de revisão: o que está pendente ou vencido, na ordem em que vale
 * rever.
 *
 * Pendentes antes dos vencidos (um erro sem conserto pesa mais que uma
 * revisão de rotina). Entre pendentes, quem errou mais vezes, depois o
 * conceito que sustenta mais conceitos (errar a base custa mais adiante),
 * depois o erro mais antigo. Entre vencidos, o mais atrasado primeiro.
 */
export function filaDeRevisao(caderno: EntradaDoCaderno[]): EntradaDoCaderno[] {
  const pendentes = caderno
    .filter((e) => e.estado === 'pendente')
    .sort(
      (a, b) =>
        b.vezesErrado - a.vezesErrado ||
        b.importancia - a.importancia ||
        a.ultimoErro.createdAt.localeCompare(b.ultimoErro.createdAt)
    );
  const vencidos = caderno
    .filter((e) => e.estado === 'revisar')
    .sort((a, b) => (a.proximaRevisao ?? '').localeCompare(b.proximaRevisao ?? ''));
  return [...pendentes, ...vencidos];
}

/** Os números do caderno, para o resumo em Praticar. */
export function resumoDoCaderno(caderno: EntradaDoCaderno[]): Record<EstadoNoCaderno, number> {
  const resumo: Record<EstadoNoCaderno, number> = { pendente: 0, revisar: 0, 'em-dia': 0, dominado: 0 };
  for (const e of caderno) resumo[e.estado] += 1;
  return resumo;
}

/**
 * A evidência mais recente de cada exercício. A leitura já vem da mais nova
 * para a mais antiga, mas a conta não depende disso.
 */
export function evidenciaPorExercicio(evidencias: EvidenciaDoErro[]): Map<string, EvidenciaDoErro> {
  const mapa = new Map<string, EvidenciaDoErro>();
  for (const e of evidencias) {
    const atual = mapa.get(e.exerciseId);
    if (!atual || e.createdAt > atual.createdAt) mapa.set(e.exerciseId, e);
  }
  return mapa;
}
