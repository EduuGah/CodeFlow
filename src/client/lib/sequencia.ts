import type { Attempt } from './mastery';

/**
 * A sequência de dias estudados, com congelamentos.
 *
 * `study.ts` tem a versão simples: dias consecutivos com tentativa, viva se a
 * última foi hoje ou ontem. Esta acrescenta o item da loja que a protege —
 * **congelar a sequência**: um dia sem estudar não a zera.
 *
 * O congelamento é consumido sozinho, no primeiro dia perdido depois da
 * compra, em ordem cronológica. Não é escolhido pela pessoa: quem compra três
 * e viaja cinco dias perde a sequência no quarto, e é isso que a descrição do
 * item diz. Como tudo aqui, é derivado — o histórico de tentativas e o de
 * compras bastam para recontar quantos foram usados e quantos sobram.
 */

/** Data local no formato AAAA-MM-DD. Usar UTC viraria erro de um dia no Brasil. */
export function diaLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function somarDias(dia: string, delta: number): string {
  const [ano, mes, d] = dia.split('-').map(Number);
  return diaLocal(new Date(ano, mes - 1, d + delta));
}

export interface Sequencia {
  /** Dias consecutivos até hoje (ou até ontem, se hoje ainda não estudou). */
  atual: number;
  /** A maior sequência da história, contando congelamentos. */
  recorde: number;
  /** Os dias que um congelamento cobriu, em ordem. */
  diasCongelados: string[];
  /** Congelamentos comprados e ainda não usados. */
  congelamentosRestantes: number;
  /** Hoje já tem tentativa? Muda a frase: "continue" contra "não perca". */
  estudouHoje: boolean;
}

/**
 * Reconta a sequência do começo.
 *
 * Anda dia a dia, do primeiro estudo até hoje. Um dia sem tentativa quebra a
 * corrente — a não ser que exista um congelamento comprado antes daquele dia
 * e ainda não gasto, que então é gasto ali. Hoje nunca é coberto: o dia não
 * acabou. Ontem sem estudo só quebra se não houver congelamento, porque a
 * regra de sempre (viva até ontem) continua valendo.
 */
export function calcularSequencia(
  attempts: Attempt[],
  congelamentos: Array<{ createdAt: string }> = [],
  hoje: Date = new Date()
): Sequencia {
  const dias = new Set(attempts.map((a) => diaLocal(new Date(a.createdAt))));
  const hojeStr = diaLocal(hoje);
  const ontemStr = somarDias(hojeStr, -1);

  const comprados = [...congelamentos]
    .map((c) => diaLocal(new Date(c.createdAt)))
    .sort();

  if (dias.size === 0) {
    return {
      atual: 0,
      recorde: 0,
      diasCongelados: [],
      congelamentosRestantes: comprados.length,
      estudouHoje: false,
    };
  }

  const primeiro = [...dias].sort()[0];
  const diasCongelados: string[] = [];
  let proximoCongelamento = 0;
  let corrente = 0;
  let recorde = 0;
  // A sequência que chega a ontem. Se hoje estudou, é ela mais um.
  let ateOntem = 0;

  for (let dia = primeiro; dia < hojeStr; dia = somarDias(dia, 1)) {
    if (dias.has(dia)) {
      corrente += 1;
    } else {
      // Um congelamento só cobre um dia posterior à compra, e só quando há
      // uma corrente para proteger — dias antes do primeiro estudo não contam.
      const disponivel = proximoCongelamento < comprados.length && comprados[proximoCongelamento] <= dia;
      if (corrente > 0 && disponivel) {
        proximoCongelamento += 1;
        diasCongelados.push(dia);
        corrente += 1;
      } else {
        corrente = 0;
      }
    }
    recorde = Math.max(recorde, corrente);
    if (dia === ontemStr) ateOntem = corrente;
  }

  const estudouHoje = dias.has(hojeStr);
  const atual = estudouHoje ? ateOntem + 1 : ateOntem;
  recorde = Math.max(recorde, atual);

  return {
    atual,
    recorde,
    diasCongelados,
    congelamentosRestantes: comprados.length - proximoCongelamento,
    estudouHoje,
  };
}

/**
 * Todas as correntes da história, para os marcos de sequência valerem uma
 * vez por corrente: sete dias seguidos em março e sete em julho são dois
 * marcos; sete dias que viraram oito não são.
 */
export function correntesDaHistoria(
  attempts: Attempt[],
  congelamentos: Array<{ createdAt: string }> = [],
  hoje: Date = new Date()
): number[] {
  return correntesComInicio(attempts, congelamentos, hoje).map((c) => c.dias);
}

/**
 * As mesmas correntes, com o dia em que cada uma começou — é o que data os
 * marcos (o de 7 dias caiu no sétimo dia da corrente), para o histórico da
 * loja saber quando as moedas deles entraram.
 */
export function correntesComInicio(
  attempts: Attempt[],
  congelamentos: Array<{ createdAt: string }> = [],
  hoje: Date = new Date()
): Array<{ inicio: string; dias: number }> {
  const { diasCongelados } = calcularSequencia(attempts, congelamentos, hoje);
  const dias = new Set([...attempts.map((a) => diaLocal(new Date(a.createdAt))), ...diasCongelados]);
  const ordenados = [...dias].sort();
  const correntes: Array<{ inicio: string; dias: number }> = [];
  let anterior: string | null = null;

  for (const dia of ordenados) {
    const atual = correntes[correntes.length - 1];
    if (atual && anterior !== null && somarDias(anterior, 1) === dia) atual.dias += 1;
    else correntes.push({ inicio: dia, dias: 1 });
    anterior = dia;
  }
  return correntes;
}
