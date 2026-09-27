import { describe, expect, it } from 'vitest';

import type { Attempt } from './mastery';
import {
  calcularSequencia,
  correntesDaHistoria,
  efeitoDeRecuperar,
  protecoesDaSequencia,
  RECUPERAR_SEQUENCIA,
} from './sequencia';

const em = (dia: string, hora = '10:00'): Attempt => ({
  exerciseId: 'ex',
  lessonId: 'l',
  concepts: [],
  correct: true,
  hintsUsed: 0,
  createdAt: new Date(`${dia}T${hora}:00`).toISOString(),
});

const compra = (dia: string) => ({ createdAt: new Date(`${dia}T09:00:00`).toISOString() });
const hoje = new Date('2026-03-10T15:00:00');

describe('sem congelamentos, é a sequência de sempre', () => {
  it('vazia', () => {
    expect(calcularSequencia([], [], hoje).atual).toBe(0);
  });

  it('dias seguidos até hoje', () => {
    const s = calcularSequencia([em('2026-03-08'), em('2026-03-09'), em('2026-03-10')], [], hoje);
    expect(s.atual).toBe(3);
    expect(s.estudouHoje).toBe(true);
    expect(s.recorde).toBe(3);
  });

  it('viva até ontem, mesmo sem estudar hoje', () => {
    const s = calcularSequencia([em('2026-03-08'), em('2026-03-09')], [], hoje);
    expect(s.atual).toBe(2);
    expect(s.estudouHoje).toBe(false);
  });

  it('um buraco quebra', () => {
    expect(calcularSequencia([em('2026-03-07'), em('2026-03-09')], [], hoje).atual).toBe(1);
    expect(calcularSequencia([em('2026-03-07'), em('2026-03-08')], [], hoje).atual).toBe(0);
  });
});

describe('congelar a sequência', () => {
  it('um dia perdido é coberto por um congelamento comprado antes', () => {
    const s = calcularSequencia([em('2026-03-07'), em('2026-03-09'), em('2026-03-10')], [compra('2026-03-07')], hoje);
    expect(s.atual).toBe(4);
    expect(s.diasCongelados).toEqual(['2026-03-08']);
    expect(s.congelamentosRestantes).toBe(0);
  });

  it('cobre o primeiro dia perdido depois da compra, não o que a pessoa escolher', () => {
    // Dois buracos, um congelamento: o primeiro é coberto, o segundo quebra.
    const s = calcularSequencia([em('2026-03-05'), em('2026-03-07'), em('2026-03-09'), em('2026-03-10')], [compra('2026-03-05')], hoje);
    expect(s.diasCongelados).toEqual(['2026-03-06']);
    expect(s.atual).toBe(2);
  });

  it('um congelamento comprado depois do buraco não volta no tempo', () => {
    const s = calcularSequencia([em('2026-03-07'), em('2026-03-09'), em('2026-03-10')], [compra('2026-03-09')], hoje);
    expect(s.diasCongelados).toEqual([]);
    expect(s.atual).toBe(2);
    expect(s.congelamentosRestantes).toBe(1);
  });

  it('não cobre ontem à toa: só se houver corrente para proteger', () => {
    // Nunca estudou antes de hoje: o congelamento fica guardado.
    const s = calcularSequencia([em('2026-03-10')], [compra('2026-03-01')], hoje);
    expect(s.atual).toBe(1);
    expect(s.congelamentosRestantes).toBe(1);
  });

  it('mantém a sequência viva por ontem, quando hoje ainda não estudou', () => {
    const s = calcularSequencia([em('2026-03-07'), em('2026-03-08')], [compra('2026-03-08')], hoje);
    // Ontem (09) foi congelado; hoje está em aberto.
    expect(s.diasCongelados).toEqual(['2026-03-09']);
    expect(s.atual).toBe(3);
    expect(s.estudouHoje).toBe(false);
  });

  it('hoje nunca é congelado', () => {
    const s = calcularSequencia([em('2026-03-09')], [compra('2026-03-01')], hoje);
    expect(s.diasCongelados).toEqual([]);
    expect(s.congelamentosRestantes).toBe(1);
  });

  it('dois congelamentos cobrem dois dias, em ordem', () => {
    const s = calcularSequencia([em('2026-03-06'), em('2026-03-09'), em('2026-03-10')], [compra('2026-03-01'), compra('2026-03-02')], hoje);
    expect(s.diasCongelados).toEqual(['2026-03-07', '2026-03-08']);
    expect(s.atual).toBe(5);
    expect(s.congelamentosRestantes).toBe(0);
  });
});

describe('recuperar a sequência', () => {
  // Hoje é 10/03. Estudou de 05 a 08, perdeu o 09.
  const semana = ['2026-03-05', '2026-03-06', '2026-03-07', '2026-03-08'].map((d) => em(d));
  const recuperar = (dia: string, hora = '09:00') => ({
    item: RECUPERAR_SEQUENCIA,
    createdAt: new Date(`${dia}T${hora}:00`).toISOString(),
  });

  it('comprada no dia seguinte, cobre o dia perdido', () => {
    const s = calcularSequencia(semana, [recuperar('2026-03-10')], hoje);
    expect(s.diasRecuperados).toEqual(['2026-03-09']);
    expect(s.atual).toBe(5);
    expect(s.diasCongelados).toEqual([]);
    // E não é contada como congelamento guardado.
    expect(s.congelamentosRestantes).toBe(0);
  });

  it('comprada dois dias depois, só cobre se o dia do meio teve estudo', () => {
    // Perdeu o 08, estudou o 09, compra no 10: une as duas correntes.
    const comMeio = [em('2026-03-05'), em('2026-03-06'), em('2026-03-07'), em('2026-03-09')];
    const s = calcularSequencia(comMeio, [recuperar('2026-03-10')], hoje);
    expect(s.diasRecuperados).toEqual(['2026-03-08']);
    expect(s.atual).toBe(5);
    // Sem estudo no meio, são dois dias perdidos: uma recuperação não salva, e não é gasta.
    const semMeio = calcularSequencia([em('2026-03-05'), em('2026-03-06'), em('2026-03-07')], [recuperar('2026-03-10')], hoje);
    expect(semMeio.diasRecuperados).toEqual([]);
    expect(semMeio.atual).toBe(0);
  });

  it('não volta mais que isso no tempo', () => {
    // Perdeu o 07; comprar no 10 é tarde demais, mesmo tendo estudado 08 e 09.
    const s = calcularSequencia(
      [em('2026-03-05'), em('2026-03-06'), em('2026-03-08'), em('2026-03-09')],
      [recuperar('2026-03-10')],
      hoje
    );
    expect(s.diasRecuperados).toEqual([]);
    expect(s.atual).toBe(2);
  });

  it('comprada antes do buraco não serve: para isso existe o congelamento', () => {
    const s = calcularSequencia(semana, [recuperar('2026-03-08')], hoje);
    expect(s.diasRecuperados).toEqual([]);
    expect(s.atual).toBe(0);
  });

  it('uma por semana: a segunda, em menos de sete dias, não cobre nada', () => {
    // Perdeu o 03 e o 07; recuperou o 03 comprando no 04, e tenta o 07 comprando no 08.
    const dias = ['2026-03-01', '2026-03-02', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-08', '2026-03-09'].map((d) =>
      em(d)
    );
    const s = calcularSequencia(dias, [recuperar('2026-03-04'), recuperar('2026-03-08')], hoje);
    expect(s.diasRecuperados).toEqual(['2026-03-03']);
    expect(s.atual).toBe(2);
  });

  it('com sete dias entre as compras, as duas valem', () => {
    // Perdeu o 03 (compra no 04) e o 10 (compra no 11, sete dias depois).
    const dias = ['2026-03-01', '2026-03-02', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07', '2026-03-08', '2026-03-09'].map(
      (d) => em(d)
    );
    const s = calcularSequencia(dias, [recuperar('2026-03-04'), recuperar('2026-03-11')], new Date('2026-03-11T15:00:00'));
    expect(s.diasRecuperados).toEqual(['2026-03-03', '2026-03-10']);
    expect(s.atual).toBe(10);
    // Seis dias depois, a segunda ainda não vale.
    const cedo = calcularSequencia(
      [...dias.filter((a) => a.createdAt !== em('2026-03-09').createdAt)],
      [recuperar('2026-03-04'), recuperar('2026-03-10')],
      hoje
    );
    expect(cedo.diasRecuperados).toEqual(['2026-03-03']);
  });

  it('o congelamento vem primeiro: a recuperação só cobre o que ele não cobriu', () => {
    const s = calcularSequencia(semana, [compra('2026-03-01'), recuperar('2026-03-10')], hoje);
    expect(s.diasCongelados).toEqual(['2026-03-09']);
    expect(s.diasRecuperados).toEqual([]);
  });

  it('o dia recuperado une as correntes da história (os marcos de sequência contam com ele)', () => {
    const quatroETres = [
      ...['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04'].map((d) => em(d)),
      ...['2026-03-06', '2026-03-07', '2026-03-08'].map((d) => em(d)),
    ];
    expect(correntesDaHistoria(quatroETres, [], hoje)).toEqual([4, 3]);
    expect(correntesDaHistoria(quatroETres, [recuperar('2026-03-06')], hoje)).toEqual([8]);
  });

  it('as proteções da sequência são o congelamento e a recuperação — nada mais', () => {
    const compras = [
      { item: 'congelar-sequencia', createdAt: '' },
      { item: RECUPERAR_SEQUENCIA, createdAt: '' },
      { item: 'dobro-de-xp', createdAt: '' },
      { item: 'tema-oceano', createdAt: '' },
    ];
    expect(protecoesDaSequencia(compras).map((c) => c.item)).toEqual(['congelar-sequencia', RECUPERAR_SEQUENCIA]);
  });
});

describe('o que uma recuperação comprada agora faria', () => {
  const recuperar = (dia: string) => ({ item: RECUPERAR_SEQUENCIA, createdAt: new Date(`${dia}T09:00:00`).toISOString() });

  it('perdeu ontem: salva, e diz de quanto para quanto', () => {
    const efeito = efeitoDeRecuperar([em('2026-03-07'), em('2026-03-08')], [], hoje);
    expect(efeito).toEqual({ dia: '2026-03-09', de: 0, para: 3 });
  });

  it('nada perdido, nada a recuperar', () => {
    expect(efeitoDeRecuperar([em('2026-03-08'), em('2026-03-09')], [], hoje)).toBeNull();
  });

  it('sem corrente antes do buraco, não há o que salvar', () => {
    expect(efeitoDeRecuperar([], [], hoje)).toBeNull();
    // Primeiro estudo foi hoje: o dia de ontem não protege nada.
    expect(efeitoDeRecuperar([em('2026-03-10')], [], hoje)).toBeNull();
  });

  it('já recuperou nesta semana: a loja não vende outra', () => {
    const dias = ['2026-03-04', '2026-03-06', '2026-03-07', '2026-03-08'].map((d) => em(d));
    expect(efeitoDeRecuperar(dias, [recuperar('2026-03-06')], hoje)).toBeNull();
  });

  it('já recuperado, não se vende de novo para o mesmo dia', () => {
    expect(efeitoDeRecuperar([em('2026-03-07'), em('2026-03-08')], [recuperar('2026-03-10')], hoje)).toBeNull();
  });
});

describe('correntes da história', () => {
  it('separa as correntes pelos buracos', () => {
    const correntes = correntesDaHistoria(
      ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-10', '2026-03-09', '2026-03-10'].map((d) => em(d)),
      [],
      hoje
    );
    expect(correntes).toEqual([3, 1, 2]);
  });

  it('um dia congelado une as duas metades numa corrente só', () => {
    const correntes = correntesDaHistoria(['2026-03-07', '2026-03-09'].map((d) => em(d)), [compra('2026-03-07')], hoje);
    expect(correntes).toEqual([3]);
  });
});

const atual = (attempts: Attempt[], dia: Date) => calcularSequencia(attempts, [], dia).atual;

describe('sequência de estudos sem congelamento (a antiga `currentStreak`, que era uma segunda cópia desta conta)', () => {
  it('sem histórico, a sequência é zero', () => {
    expect(atual([], hoje)).toBe(0);
  });

  it('estudando hoje, a sequência começa em um', () => {
    expect(atual([em('2026-03-10')], hoje)).toBe(1);
  });

  it('conta dias consecutivos terminando hoje', () => {
    const attempts = [em('2026-03-08'), em('2026-03-09'), em('2026-03-10')];
    expect(atual(attempts, hoje)).toBe(3);
  });

  it('várias tentativas no mesmo dia contam como um dia só', () => {
    const attempts = [em('2026-03-10', '08:00'), em('2026-03-10', '14:00'), em('2026-03-10', '22:00')];
    expect(atual(attempts, hoje)).toBe(1);
  });

  it('a sequência sobrevive se a última atividade foi ontem', () => {
    // Quem estudou ontem à noite e ainda não abriu hoje não perde a sequência.
    const attempts = [em('2026-03-08'), em('2026-03-09')];
    expect(atual(attempts, hoje)).toBe(2);
  });

  it('dois dias sem estudar quebram a sequência', () => {
    expect(atual([em('2026-03-07'), em('2026-03-08')], hoje)).toBe(0);
  });

  it('conta apenas o trecho consecutivo mais recente', () => {
    const attempts = [
      em('2026-03-01'), // bloco antigo, interrompido
      em('2026-03-02'),
      em('2026-03-09'), // bloco atual
      em('2026-03-10'),
    ];
    expect(atual(attempts, hoje)).toBe(2);
  });

  it('atravessa a virada de mês', () => {
    const fimDeMes = new Date('2026-03-02T12:00:00');
    const attempts = [em('2026-02-28'), em('2026-03-01'), em('2026-03-02')];
    expect(atual(attempts, fimDeMes)).toBe(3);
  });
});

