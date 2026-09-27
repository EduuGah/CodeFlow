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
 *
 * O outro item é **recuperar a sequência**, para quem não comprou antes: a
 * compra feita no dia seguinte a um dia perdido (ou no outro, se entre eles
 * houve estudo) cobre aquele dia. Uma por semana — sem o limite, a sequência
 * viraria coisa que se compra, e não que se faz.
 */

/** O item que recupera um dia perdido, depois do fato. */
export const RECUPERAR_SEQUENCIA = 'recuperar-sequencia';

/** Dias entre duas recuperações usadas: uma por semana. */
export const DIAS_ENTRE_RECUPERACOES = 7;

/** As compras que protegem a sequência: o congelamento (antes) e a recuperação (depois). */
export function protecoesDaSequencia<T extends { item: string }>(purchases: T[]): T[] {
  return purchases.filter((p) => p.item === 'congelar-sequencia' || p.item === RECUPERAR_SEQUENCIA);
}

/** Uma proteção comprada; sem `item`, é um congelamento. */
export interface Protecao {
  createdAt: string;
  item?: string;
}

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
  /** Os dias que uma recuperação cobriu, em ordem. */
  diasRecuperados: string[];
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
  protecoes: Protecao[] = [],
  hoje: Date = new Date()
): Sequencia {
  const dias = new Set(attempts.map((a) => diaLocal(new Date(a.createdAt))));
  const hojeStr = diaLocal(hoje);
  const ontemStr = somarDias(hojeStr, -1);

  const diaDaCompra = (p: Protecao) => diaLocal(new Date(p.createdAt));
  const comprados = protecoes
    .filter((p) => p.item !== RECUPERAR_SEQUENCIA)
    .map(diaDaCompra)
    .sort();
  const recuperacoes = protecoes
    .filter((p) => p.item === RECUPERAR_SEQUENCIA)
    .map(diaDaCompra)
    .sort();

  if (dias.size === 0) {
    return {
      atual: 0,
      recorde: 0,
      diasCongelados: [],
      diasRecuperados: [],
      congelamentosRestantes: comprados.length,
      estudouHoje: false,
    };
  }

  // Recuperações já gastas, e o dia da compra da última: a próxima só vale
  // uma semana depois dela.
  const usadas = new Set<number>();
  let ultimaUsada: string | null = null;
  /** A recuperação que cobre `dia`: comprada no dia seguinte, ou no outro se entre eles houve estudo. */
  const recuperacaoPara = (dia: string): number => {
    const amanha = somarDias(dia, 1);
    const depois = somarDias(dia, 2);
    return recuperacoes.findIndex(
      (compra, i) =>
        !usadas.has(i) &&
        (compra === amanha || (compra === depois && dias.has(amanha))) &&
        (ultimaUsada === null || compra >= somarDias(ultimaUsada, DIAS_ENTRE_RECUPERACOES))
    );
  };

  const primeiro = [...dias].sort()[0];
  const diasCongelados: string[] = [];
  const diasRecuperados: string[] = [];
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
      // O congelamento, comprado antes, vem primeiro; a recuperação só cobre
      // o que ele não cobriu.
      const recuperacao = corrente > 0 && !disponivel ? recuperacaoPara(dia) : -1;
      if (corrente > 0 && disponivel) {
        proximoCongelamento += 1;
        diasCongelados.push(dia);
        corrente += 1;
      } else if (recuperacao !== -1) {
        usadas.add(recuperacao);
        ultimaUsada = recuperacoes[recuperacao];
        diasRecuperados.push(dia);
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
    diasRecuperados,
    congelamentosRestantes: comprados.length - proximoCongelamento,
    estudouHoje,
  };
}

/** O que comprar uma recuperação agora faria. */
export interface EfeitoDeRecuperar {
  /** O dia perdido que ela cobriria. */
  dia: string;
  /** A sequência sem ela, e com ela. */
  de: number;
  para: number;
}

/**
 * Se uma recuperação comprada agora salvaria a sequência — calculado pela
 * mesma conta que depois vai contá-la, com a compra de mentira acrescentada.
 * `null` quando não há o que recuperar (nenhum dia perdido que ela cubra, ou
 * a última recuperação foi há menos de uma semana): a loja não vende.
 */
export function efeitoDeRecuperar(
  attempts: Attempt[],
  protecoes: Protecao[] = [],
  hoje: Date = new Date()
): EfeitoDeRecuperar | null {
  const antes = calcularSequencia(attempts, protecoes, hoje);
  const depois = calcularSequencia(
    attempts,
    [...protecoes, { item: RECUPERAR_SEQUENCIA, createdAt: hoje.toISOString() }],
    hoje
  );
  const dia = depois.diasRecuperados.find((d) => !antes.diasRecuperados.includes(d));
  if (!dia || depois.atual <= antes.atual) return null;
  return { dia, de: antes.atual, para: depois.atual };
}

/**
 * Todas as correntes da história, para os marcos de sequência valerem uma
 * vez por corrente: sete dias seguidos em março e sete em julho são dois
 * marcos; sete dias que viraram oito não são.
 */
export function correntesDaHistoria(
  attempts: Attempt[],
  protecoes: Protecao[] = [],
  hoje: Date = new Date()
): number[] {
  return correntesComInicio(attempts, protecoes, hoje).map((c) => c.dias);
}

/**
 * As mesmas correntes, com o dia em que cada uma começou — é o que data os
 * marcos (o de 7 dias caiu no sétimo dia da corrente), para o histórico da
 * loja saber quando as moedas deles entraram.
 */
export function correntesComInicio(
  attempts: Attempt[],
  protecoes: Protecao[] = [],
  hoje: Date = new Date()
): Array<{ inicio: string; dias: number }> {
  const { diasCongelados, diasRecuperados } = calcularSequencia(attempts, protecoes, hoje);
  const dias = new Set([
    ...attempts.map((a) => diaLocal(new Date(a.createdAt))),
    ...diasCongelados,
    ...diasRecuperados,
  ]);
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
