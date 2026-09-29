import { describe, expect, it } from 'vitest';

import { getExercises, getLessonsOfTrack, listTracks } from '../../content/catalogo';
import type { Exercise, Lesson } from '../../content/types';
import type { Attempt } from './mastery';
import type { FlashcardReview } from './review';
import {
  DESAFIOS_DA_SEMANA,
  DESAFIOS_DO_DIA,
  desafiosAtuais,
  desafiosConcluidos,
  desafiosDaSemana,
  desafiosDoDia,
  ESTREIA_DAS_MISSOES,
  inicioDaSemana,
  POR_PERIODO,
  RECOMPENSA,
  RODIZIO,
  type ContextoDoPeriodo,
} from './desafios';
import { diaLocal, somarDias } from './sequencia';
import { fechamentoDasAulas } from './study';

const t = (dia: string, over: Partial<Attempt> = {}): Attempt => ({
  exerciseId: 'ex-1',
  lessonId: 'l-1',
  concepts: ['c'],
  correct: true,
  hintsUsed: 0,
  createdAt: new Date(`${dia}T10:00:00`).toISOString(),
  ...over,
});

const r = (dia: string, id: string): FlashcardReview => ({
  flashcardId: id,
  rating: 'facil',
  createdAt: new Date(`${dia}T10:00:00`).toISOString(),
});

// Uma terça-feira.
const HOJE = new Date('2026-03-10T15:00:00');

describe('o sorteio', () => {
  it('é o mesmo para a mesma data, e diferente da véspera', () => {
    const a = desafiosDoDia('2026-03-10').map((d) => d.id);
    const b = desafiosDoDia('2026-03-10').map((d) => d.id);
    expect(a).toEqual(b);
    expect(a).toHaveLength(POR_PERIODO.dia);

    // Trinta dias seguidos: nunca um desafio repetido de um dia para o outro.
    let anterior = new Set(desafiosDoDia('2026-02-28').map((d) => d.id));
    for (let i = 1; i <= 30; i++) {
      const dia = `2026-03-${String(i).padStart(2, '0')}`;
      const atual = desafiosDoDia(dia).map((d) => d.id);
      expect(new Set(atual).size, dia).toBe(atual.length);
      for (const id of atual) expect(anterior.has(id), `${dia}: ${id} repetiu a véspera`).toBe(false);
      anterior = new Set(atual);
    }
  });

  it('a semana começa na segunda', () => {
    expect(inicioDaSemana('2026-03-10')).toBe('2026-03-09');
    expect(inicioDaSemana('2026-03-09')).toBe('2026-03-09');
    expect(inicioDaSemana('2026-03-15')).toBe('2026-03-09');
    expect(desafiosDaSemana('2026-03-09')).toHaveLength(POR_PERIODO.semana);
  });

  it('toda definição tem meta e frase', () => {
    for (const d of [...DESAFIOS_DO_DIA, ...DESAFIOS_DA_SEMANA]) {
      expect(d.meta).toBeGreaterThan(0);
      expect(d.description).toContain(String(d.meta === 1 ? 'um' : ''));
    }
  });
});

describe('progresso e conclusão', () => {
  it('sem atividade, tudo em zero e nada concluído', () => {
    const { dia, semana } = desafiosAtuais({ attempts: [], reviews: [], completedLessons: [], hoje: HOJE });
    expect([...dia, ...semana].every((d) => d.progresso === 0 && !d.concluido)).toBe(true);
  });

  it('o progresso do dia só conta o de hoje, e exercícios distintos', () => {
    const attempts = [
      t('2026-03-10', { exerciseId: 'a' }),
      t('2026-03-10', { exerciseId: 'a' }),
      t('2026-03-10', { exerciseId: 'b' }),
      t('2026-03-09', { exerciseId: 'c' }),
    ];
    const ctxDia = DESAFIOS_DO_DIA.find((d) => d.id === 'dia-resolver-3')!;
    const { dia } = desafiosAtuais({ attempts, reviews: [], completedLessons: [], hoje: HOJE });
    // Independe do sorteio: avalia a definição direto.
    // O dia local, como o produto conta: a data da string ISO é a de Greenwich,
    // e em UTC+14 as 10h do dia 10 ainda são dia 9 nela.
    const tentativasDeHoje = attempts.filter((a) => diaLocal(new Date(a.createdAt)) === '2026-03-10');
    expect(ctxDia.progresso({ tentativas: tentativasDeHoje, jaErrados: new Set(), revisoes: [], aulasConcluidas: 0 })).toBe(2);
    expect(dia.every((d) => d.progresso <= d.desafio.meta)).toBe(true);
  });

  it('"voltar e resolver" exige um erro anterior no mesmo exercício', () => {
    const def = DESAFIOS_DO_DIA.find((d) => d.id === 'dia-insistir-1')!;
    const ontemErrou = t('2026-03-09', { exerciseId: 'a', correct: false });
    const hojeAcertou = t('2026-03-10', { exerciseId: 'a' });
    expect(def.progresso({ tentativas: [hojeAcertou], jaErrados: new Set([ontemErrou.exerciseId]), revisoes: [], aulasConcluidas: 0 })).toBe(1);
    expect(def.progresso({ tentativas: [hojeAcertou], jaErrados: new Set(), revisoes: [], aulasConcluidas: 0 })).toBe(0);
  });

  it('o desafio semanal de dias conta dias distintos da semana', () => {
    const def = DESAFIOS_DA_SEMANA.find((d) => d.id === 'semana-dias-4')!;
    const tentativas = ['2026-03-09', '2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12'].map((d) => t(d));
    expect(def.progresso({ tentativas, jaErrados: new Set(), revisoes: [], aulasConcluidas: 0 })).toBe(4);
  });

  it('refazer um exercício de uma aula antiga não a "conclui" de novo', () => {
    // Antes a aula era datada pela última tentativa certa: refazer um
    // exercício antigo mudava o dia da conclusão — cumpria "conclua uma aula
    // hoje" e, de quebra, desfazia o desafio do dia original.
    // Os dois dias têm "uma aula inteira" no sorteio; sem isso o teste seria vazio.
    for (const dia of ['2026-03-04', '2026-03-09']) {
      expect(desafiosDoDia(dia).map((d) => d.id), dia).toContain('dia-aula-1');
    }
    const attempts = [
      t('2026-03-04', { lessonId: 'l-1', exerciseId: 'a' }),
      t('2026-03-04', { lessonId: 'l-1', exerciseId: 'b' }),
      t('2026-03-09', { lessonId: 'l-1', exerciseId: 'a' }),
    ];
    const concluidos = desafiosConcluidos({ attempts, reviews: [], completedLessons: ['l-1'], hoje: HOJE });
    const aula = concluidos.filter((c) => c.id === 'dia-aula-1').map((c) => c.dia);
    expect(aula).toEqual(['2026-03-04']);
  });

  it('a conclusão de aula é datada pelo primeiro acerto do último exercício que faltava', () => {
    const attempts = [t('2026-03-08', { lessonId: 'l-1', exerciseId: 'a' }), t('2026-03-10', { lessonId: 'l-1', exerciseId: 'b' })];
    const def = DESAFIOS_DO_DIA.find((d) => d.id === 'dia-aula-1')!;
    // A função de contexto é interna; provamos pelo caminho público.
    const concluidos = desafiosConcluidos({ attempts, reviews: [], completedLessons: ['l-1'], hoje: HOJE });
    const hojeTem = desafiosDoDia('2026-03-10').some((d) => d.id === def.id);
    if (hojeTem) expect(concluidos.some((c) => c.id === def.id && c.dia === '2026-03-10')).toBe(true);
    expect(concluidos.some((c) => c.id === def.id && c.dia === '2026-03-08')).toBe(false);
  });
});

describe('o histórico de desafios cumpridos', () => {
  it('vasculha cada dia e cada semana com atividade', () => {
    // Cinco exercícios sem dica, em cinco dias seguidos: os desafios diários
    // de "sem dica" e os semanais de dias devem aparecer conforme o sorteio.
    const attempts = ['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06'].flatMap((d, i) => [
      t(d, { exerciseId: `a${i}` }),
      t(d, { exerciseId: `b${i}` }),
      t(d, { exerciseId: `c${i}` }),
    ]);
    const concluidos = desafiosConcluidos({ attempts, reviews: [], completedLessons: [], hoje: HOJE });

    const diarios = concluidos.filter((c) => c.periodo === 'dia');
    // Todo dia tem 3 exercícios sem dica: "três exercícios" e "sem abrir dica"
    // são cumpridos sempre que sorteados.
    for (const dia of ['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06']) {
      const sorteados = desafiosDoDia(dia).filter((d) => d.id === 'dia-resolver-3' || d.id === 'dia-sem-dica-2');
      expect(diarios.filter((c) => c.dia === dia).map((c) => c.id).sort()).toEqual(sorteados.map((d) => d.id).sort());
    }
    // A semana de 02/03 tem 5 dias e 15 exercícios: cumpre "quatro dias" e "quinze exercícios" se sorteados.
    const semanais = concluidos.filter((c) => c.periodo === 'semana');
    const sorteados = desafiosDaSemana('2026-03-02').filter((d) => d.id === 'semana-dias-4' || d.id === 'semana-exercicios-15');
    expect(semanais.map((c) => c.id).sort()).toEqual(sorteados.map((d) => d.id).sort());
    for (const c of concluidos) expect(c.recompensa).toEqual(RECOMPENSA[c.periodo]);
  });

  it('revisões sozinhas também contam como atividade', () => {
    const reviews = ['a', 'b', 'c', 'd', 'e'].map((id) => r('2026-03-10', id));
    const concluidos = desafiosConcluidos({ attempts: [], reviews, completedLessons: [], hoje: HOJE });
    const sorteado = desafiosDoDia('2026-03-10').some((d) => d.id === 'dia-revisar-5');
    expect(concluidos.some((c) => c.id === 'dia-revisar-5')).toBe(sorteado);
  });
});

describe('o índice por dia dá o mesmo resultado da conta ingênua', () => {
  /**
   * A versão antiga, escrita do jeito mais direto possível: para cada dia e
   * cada semana, filtra todas as tentativas. Era 70× mais lenta com um ano de
   * histórico, e é justamente por ser óbvia que serve de referência.
   */
  function referencia(entrada: { attempts: Attempt[]; reviews: FlashcardReview[]; completedLessons: string[]; hoje: Date }) {
    const hoje = diaLocal(entrada.hoje);
    const diaDe = (iso: string) => diaLocal(new Date(iso));
    const concluidas = new Set(entrada.completedLessons);
    const fechamento = [...fechamentoDasAulas(entrada.attempts)]
      .filter(([aula]) => concluidas.has(aula))
      .map(([, instante]) => diaDe(instante));
    const ctx = (de: string, ate: string) => ({
      tentativas: entrada.attempts.filter((a) => diaDe(a.createdAt) >= de && diaDe(a.createdAt) <= ate),
      jaErrados: new Set(entrada.attempts.filter((a) => !a.correct && diaDe(a.createdAt) <= ate).map((a) => a.exerciseId)),
      revisoes: entrada.reviews.filter((r) => diaDe(r.createdAt) >= de && diaDe(r.createdAt) <= ate),
      aulasConcluidas: fechamento.filter((d) => d >= de && d <= ate).length,
    });
    const dias = [...new Set([...entrada.attempts.map((a) => diaDe(a.createdAt)), ...entrada.reviews.map((r) => diaDe(r.createdAt))])]
      .filter((d) => d <= hoje)
      .sort();
    const saida: string[] = [];
    for (const dia of dias) {
      const c = ctx(dia, dia);
      for (const d of desafiosDoDia(dia)) if (Math.min(d.meta, d.progresso(c)) >= d.meta) saida.push(`dia ${dia} ${d.id}`);
    }
    if (dias.length === 0) return saida;
    for (let segunda = inicioDaSemana(dias[0]); segunda <= hoje; segunda = somarDias(segunda, 7)) {
      const fim = somarDias(segunda, 6);
      const ultimo = dias.filter((d) => d >= segunda && d <= fim).pop();
      if (!ultimo) continue;
      const c = ctx(segunda, fim);
      for (const d of desafiosDaSemana(segunda)) if (Math.min(d.meta, d.progresso(c)) >= d.meta) saida.push(`semana ${ultimo} ${d.id}`);
    }
    return saida;
  }

  /** Gerador pequeno e determinístico, para a falha ser reproduzível. */
  function sorteador(semente: number) {
    let x = semente;
    return (n: number) => {
      x = (x * 1103515245 + 12345) % 2147483648;
      return x % n;
    };
  }

  it.each([1, 2, 3, 4, 5, 6, 7, 8])('histórico sorteado %i', (semente) => {
    const sortear = sorteador(semente);
    const inicio = new Date(2026, 0, 5, 8).getTime();
    const attempts: Attempt[] = Array.from({ length: 150 + sortear(150) }, () => ({
      exerciseId: `ex-${sortear(40)}`,
      lessonId: `aula-${sortear(8)}`,
      concepts: [`c-${sortear(10)}`],
      correct: sortear(3) !== 0,
      hintsUsed: sortear(4) === 0 ? 1 : 0,
      createdAt: new Date(inicio + sortear(70) * 864e5 + sortear(24 * 60) * 6e4).toISOString(),
    }));
    const reviews: FlashcardReview[] = Array.from({ length: sortear(80) }, () => ({
      flashcardId: `card-${sortear(25)}`,
      rating: 'medio',
      createdAt: new Date(inicio + sortear(70) * 864e5 + sortear(24 * 60) * 6e4).toISOString(),
    }));
    const entrada = {
      attempts,
      reviews,
      completedLessons: ['aula-0', 'aula-2', 'aula-5', 'aula-7'],
      hoje: new Date(inicio + 60 * 864e5),
    };

    const rapido = desafiosConcluidos(entrada).map((c) => `${c.periodo} ${c.dia} ${c.id}`);
    expect(rapido.sort()).toEqual(referencia(entrada).sort());
  });
});

describe('as missões (Fase 7)', () => {
  /**
   * O rodízio como ele era antes das missões, copiado da saída do código
   * antigo **antes** da mudança — não recalculado por ele. É desse rodízio
   * que sai o histórico de moedas e XP de quem já estudou: se um dia vivido
   * trocasse de desafio, o saldo de alguém encolheria.
   */
  const DIAS_ANTES: Array<[string, string[]]> = [
    ['2026-09-14', ['dia-revisar-5', 'dia-insistir-1']],
    ['2026-09-15', ['dia-aula-1', 'dia-resolver-3']],
    ['2026-09-16', ['dia-sem-dica-2', 'dia-revisar-5']],
    ['2026-09-17', ['dia-insistir-1', 'dia-aula-1']],
    ['2026-09-18', ['dia-resolver-3', 'dia-sem-dica-2']],
    ['2026-09-19', ['dia-revisar-5', 'dia-insistir-1']],
    ['2026-09-20', ['dia-aula-1', 'dia-resolver-3']],
    ['2026-09-21', ['dia-sem-dica-2', 'dia-revisar-5']],
    ['2026-09-22', ['dia-insistir-1', 'dia-aula-1']],
    ['2026-09-23', ['dia-resolver-3', 'dia-sem-dica-2']],
    ['2026-09-24', ['dia-revisar-5', 'dia-insistir-1']],
    ['2026-09-25', ['dia-aula-1', 'dia-resolver-3']],
    ['2026-09-26', ['dia-sem-dica-2', 'dia-revisar-5']],
    ['2026-09-27', ['dia-insistir-1', 'dia-aula-1']],
    ['2026-09-28', ['dia-resolver-3', 'dia-sem-dica-2']],
    ['2026-09-29', ['dia-revisar-5', 'dia-insistir-1']],
    ['2026-09-30', ['dia-aula-1', 'dia-resolver-3']],
    ['2026-10-01', ['dia-sem-dica-2', 'dia-revisar-5']],
    ['2026-10-02', ['dia-insistir-1', 'dia-aula-1']],
    ['2026-10-03', ['dia-resolver-3', 'dia-sem-dica-2']],
    ['2026-10-04', ['dia-revisar-5', 'dia-insistir-1']],
  ];
  const SEMANAS_ANTES: Array<[string, string[]]> = [
    ['2026-08-24', ['semana-dias-4', 'semana-exercicios-15']],
    ['2026-08-31', ['semana-aulas-3', 'semana-sem-dica-8']],
    ['2026-09-07', ['semana-conceitos-5', 'semana-revisar-20']],
    ['2026-09-14', ['semana-dias-4', 'semana-exercicios-15']],
    ['2026-09-21', ['semana-aulas-3', 'semana-sem-dica-8']],
    ['2026-09-28', ['semana-conceitos-5', 'semana-revisar-20']],
  ];

  const ids = (lista: { id: string }[]) => lista.map((d) => d.id);
  const MISSOES_DO_DIA = ['dia-bug-1', 'dia-prever-2', 'dia-tipos-3'];
  const MISSOES_DA_SEMANA = ['semana-caderno-2', 'semana-trilhas-2'];

  it('não mudam o rodízio de nenhum dia nem semana antes da estreia', () => {
    for (const [dia, esperado] of DIAS_ANTES) expect(ids(desafiosDoDia(dia)), dia).toEqual(esperado);
    for (const [segunda, esperado] of SEMANAS_ANTES) expect(ids(desafiosDaSemana(segunda)), segunda).toEqual(esperado);
  });

  it('nenhuma missão aparece antes da estreia, que é uma segunda-feira', () => {
    expect(inicioDaSemana(ESTREIA_DAS_MISSOES)).toBe(ESTREIA_DAS_MISSOES);
    for (let dia = '2026-01-01'; dia < ESTREIA_DAS_MISSOES; dia = somarDias(dia, 1)) {
      for (const id of ids(desafiosDoDia(dia))) expect(MISSOES_DO_DIA, dia).not.toContain(id);
    }
    for (let segunda = '2025-12-29'; segunda < ESTREIA_DAS_MISSOES; segunda = somarDias(segunda, 7)) {
      for (const id of ids(desafiosDaSemana(segunda))) expect(MISSOES_DA_SEMANA, segunda).not.toContain(id);
    }
  });

  it('dois dias seguidos nunca repetem um desafio, inclusive na virada', () => {
    let anterior = new Set(ids(desafiosDoDia(somarDias(ESTREIA_DAS_MISSOES, -1))));
    for (let i = 0; i < 90; i++) {
      const dia = somarDias(ESTREIA_DAS_MISSOES, i);
      const atual = ids(desafiosDoDia(dia));
      expect(atual, dia).toHaveLength(POR_PERIODO.dia);
      expect(new Set(atual).size, dia).toBe(atual.length);
      for (const id of atual) expect(anterior.has(id), `${dia}: ${id} repetiu a véspera`).toBe(false);
      anterior = new Set(atual);
    }
  });

  it('duas semanas seguidas também não, inclusive na virada', () => {
    let anterior = new Set(ids(desafiosDaSemana(somarDias(ESTREIA_DAS_MISSOES, -7))));
    for (let i = 0; i < 20; i++) {
      const segunda = somarDias(ESTREIA_DAS_MISSOES, 7 * i);
      const atual = ids(desafiosDaSemana(segunda));
      expect(new Set(atual).size, segunda).toBe(POR_PERIODO.semana);
      for (const id of atual) expect(anterior.has(id), `${segunda}: ${id} repetiu a semana anterior`).toBe(false);
      anterior = new Set(atual);
    }
  });

  it('todo desafio entra no rodízio novo na primeira volta', () => {
    // Uma volta: o tamanho da lista dividido por quantos saem em cada período.
    const volta = (periodos: number, doPeriodo: (i: number) => string[]) =>
      new Set(Array.from({ length: periodos }, (_, i) => doPeriodo(i)).flat());
    const dias = volta(RODIZIO.dia.comMissoes.length / POR_PERIODO.dia, (i) =>
      ids(desafiosDoDia(somarDias(ESTREIA_DAS_MISSOES, i)))
    );
    const semanas = volta(RODIZIO.semana.comMissoes.length / POR_PERIODO.semana, (i) =>
      ids(desafiosDaSemana(somarDias(ESTREIA_DAS_MISSOES, 7 * i)))
    );
    expect([...dias].sort()).toEqual(ids(DESAFIOS_DO_DIA).sort());
    expect([...semanas].sort()).toEqual(ids(DESAFIOS_DA_SEMANA).sort());
  });

  describe('o progresso, com exercícios de verdade do catálogo', () => {
    const DIA = somarDias(ESTREIA_DAS_MISSOES, 1);
    const doCatalogo = listTracks().flatMap((trilha) =>
      getLessonsOfTrack(trilha.id).flatMap((aula) => getExercises(aula).map((exercicio) => ({ exercicio, aula })))
    );
    const doTipo = (tipo: Exercise['type']) => doCatalogo.filter((x) => x.exercicio.type === tipo);
    const tentativa = ({ exercicio, aula }: { exercicio: Exercise; aula: Lesson }, over: Partial<Attempt> = {}) =>
      t(DIA, { exerciseId: exercicio.id, lessonId: aula.id, concepts: exercicio.concepts, ...over });
    const ctx = (tentativas: Attempt[], jaErrados: string[] = []): ContextoDoPeriodo => ({
      tentativas,
      jaErrados: new Set(jaErrados),
      revisoes: [],
      aulasConcluidas: 0,
    });
    const definicao = (id: string) => [...DESAFIOS_DO_DIA, ...DESAFIOS_DA_SEMANA].find((d) => d.id === id)!;

    it('"caçar um bug" conta só acertos de encontrar o bug', () => {
      const [bug] = doTipo('find-bug');
      const [escolha] = doTipo('multiple-choice');
      const def = definicao('dia-bug-1');
      expect(def.progresso(ctx([tentativa(escolha)]))).toBe(0);
      expect(def.progresso(ctx([tentativa(bug, { correct: false })]))).toBe(0);
      expect(def.progresso(ctx([tentativa(bug)]))).toBe(1);
    });

    it('"prever antes de rodar" conta previsões distintas', () => {
      const [a, b] = doTipo('predict-output');
      const def = definicao('dia-prever-2');
      expect(def.progresso(ctx([tentativa(a), tentativa(a)]))).toBe(1);
      expect(def.progresso(ctx([tentativa(a), tentativa(b)]))).toBe(2);
    });

    it('"três jeitos" conta tipos distintos acertados, e ignora o que saiu do catálogo', () => {
      const [bug] = doTipo('find-bug');
      const [escolha] = doTipo('multiple-choice');
      const [lacuna] = doTipo('fill-blank');
      const def = definicao('dia-tipos-3');
      const errou = tentativa(lacuna, { correct: false });
      const saiu = t(DIA, { exerciseId: 'ex-que-saiu-do-catalogo' });
      expect(def.progresso(ctx([tentativa(bug), tentativa(escolha), errou, saiu]))).toBe(2);
      expect(def.progresso(ctx([tentativa(bug), tentativa(escolha), tentativa(lacuna)]))).toBe(3);
    });

    it('"consertar o caderno" conta só o que já tinha sido errado', () => {
      const [a, b] = doTipo('code');
      const def = definicao('semana-caderno-2');
      expect(def.progresso(ctx([tentativa(a), tentativa(b)], [a.exercicio.id]))).toBe(1);
      expect(def.progresso(ctx([tentativa(a), tentativa(b)], [a.exercicio.id, b.exercicio.id]))).toBe(2);
    });

    it('"duas trilhas" conta trilhas distintas, e ignora aula fora do catálogo', () => {
      const [primeira, segunda] = listTracks().map((trilha) => getLessonsOfTrack(trilha.id)[0]);
      const def = definicao('semana-trilhas-2');
      const em = (aula: Lesson) => t(DIA, { lessonId: aula.id, correct: false });
      expect(def.progresso(ctx([em(primeira), em(primeira), t(DIA, { lessonId: 'aula-que-saiu' })]))).toBe(1);
      expect(def.progresso(ctx([em(primeira), em(segunda)]))).toBe(2);
    });

    it('cumprida no dia em que está no rodízio, rende a recompensa de sempre', () => {
      expect(ids(desafiosDoDia(ESTREIA_DAS_MISSOES))).toContain('dia-bug-1');
      const [bug] = doTipo('find-bug');
      const acerto = { ...tentativa(bug), createdAt: new Date(`${ESTREIA_DAS_MISSOES}T10:00:00`).toISOString() };
      const concluidos = desafiosConcluidos({
        attempts: [acerto],
        reviews: [],
        completedLessons: [],
        hoje: new Date(`${ESTREIA_DAS_MISSOES}T22:00:00`),
      });
      const missao = concluidos.find((c) => c.id === 'dia-bug-1');
      expect(missao).toEqual({ id: 'dia-bug-1', periodo: 'dia', dia: ESTREIA_DAS_MISSOES, recompensa: RECOMPENSA.dia });
    });
  });
});
