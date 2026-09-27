import { describe, expect, it } from 'vitest';

import { getExercises, getLessonsOfTrack, listTracks } from '../../content';
import { desafiosConcluidos } from './desafios';
import { ITENS, moedasGanhas, PRECO_DO_NIVEL, RARIDADES, raridadeDoNivel } from './economia';
import { computeXp, levelFromXp } from './gamification';
import type { Attempt } from './mastery';

/**
 * A economia medida, não estimada.
 *
 * O aluno-modelo da auditoria: uma aula por dia, de segunda a sexta, na ordem
 * do percurso, tudo de primeira e sem dica, sem revisar cartões. Nada aqui é
 * fórmula de planilha: cada dia roda as contas de verdade (`computeXp`,
 * `desafiosConcluidos`, `moedasGanhas`) sobre o catálogo de verdade — então um
 * catálogo que cresce, um desafio novo ou uma recompensa trocada movem a curva,
 * e este teste diz se os preços ainda fazem sentido.
 *
 * Os desafios giram com o calendário, então o aluno começa em cinco datas
 * diferentes, e cada regra vale no pior caso entre elas.
 */

interface Dia {
  nivel: number;
  moedas: number;
}

function simular(inicio: Date, dias: number): Dia[] {
  const aulas = listTracks().flatMap((t) => getLessonsOfTrack(t.id));
  const attempts: Attempt[] = [];
  const completedLessons: string[] = [];
  const curva: Dia[] = [];
  let proxima = 0;

  for (let d = 0; d < dias; d++) {
    const data = new Date(inicio);
    data.setDate(inicio.getDate() + d);
    const diaDaSemana = data.getDay();
    if (diaDaSemana !== 0 && diaDaSemana !== 6 && proxima < aulas.length) {
      const aula = aulas[proxima++];
      getExercises(aula).forEach((exercicio, minuto) => {
        const quando = new Date(data);
        quando.setMinutes(minuto);
        attempts.push({
          exerciseId: exercicio.id,
          lessonId: aula.id,
          concepts: exercicio.concepts,
          correct: true,
          hintsUsed: 0,
          createdAt: quando.toISOString(),
        });
      });
      completedLessons.push(aula.id);
    }

    const noFimDoDia = new Date(data);
    noFimDoDia.setHours(23, 0, 0, 0);
    const desafios = desafiosConcluidos({ attempts, reviews: [], completedLessons, hoje: noFimDoDia });
    const entrada = { attempts, completedLessons, completedProjects: [], reviews: [], purchases: [], hoje: noFimDoDia };
    const moedas = moedasGanhas({
      ...entrada,
      moedasDeDesafios: desafios.reduce((soma, c) => soma + c.recompensa.moedas, 0),
    });
    curva.push({ nivel: levelFromXp(computeXp(entrada, desafios).total).level, moedas: moedas.total });
  }
  return curva;
}

// Segunda, quarta e sexta de janeiro, e duas datas longe dali.
const INICIOS = [
  new Date(2026, 0, 5, 10),
  new Date(2026, 0, 7, 10),
  new Date(2026, 0, 9, 10),
  new Date(2026, 1, 11, 10),
  new Date(2026, 2, 21, 10),
];
const MAIOR_NIVEL = Math.max(...ITENS.map((i) => i.nivelQueLibera ?? 0));
// Dias bastantes para todos chegarem ao maior nível à venda, com folga.
const CURVAS = INICIOS.map((inicio) => simular(inicio, 140));

/** O primeiro dia (a partir de 0) em que a curva chega ao nível. */
const diaDoNivel = (curva: Dia[], nivel: number) => curva.findIndex((d) => d.nivel >= nivel);
/** O primeiro dia em que o saldo, sem gastar nada, cobre o preço. */
const diaQueCabe = (curva: Dia[], preco: number) => curva.findIndex((d) => d.moedas >= preco);

describe('o aluno-modelo', () => {
  it('chega ao maior nível à venda dentro da simulação', () => {
    for (const curva of CURVAS) expect(diaDoNivel(curva, MAIOR_NIVEL)).toBeGreaterThan(0);
  });

  it('ganha na faixa de 200 a 260 moedas por semana depois do começo', () => {
    // Um número para o texto da loja e do relatório poder citar; se sair da
    // faixa, a calibragem inteira precisa ser revista.
    for (const curva of CURVAS) {
      const porSemana = (curva[69].moedas - curva[13].moedas) / 8;
      expect(porSemana).toBeGreaterThanOrEqual(200);
      expect(porSemana).toBeLessThanOrEqual(260);
    }
  });
});

describe('os preços', () => {
  const cosmeticos = ITENS.filter((i) => i.nivelQueLibera !== undefined);

  it.each(cosmeticos.map((i) => [i.id, i.price, i.nivelQueLibera!] as const))(
    '%s (%i moedas, nível %i) cabe no saldo antes de o nível abrir',
    (_id, preco, nivel) => {
      // Senão comprar é jogar moeda fora: o nível daria o item antes.
      for (const curva of CURVAS) expect(diaQueCabe(curva, preco)).toBeLessThan(diaDoNivel(curva, nivel));
    }
  );

  it.each(cosmeticos.filter((i) => i.nivelQueLibera! >= 6).map((i) => [i.id, i.price, i.nivelQueLibera!] as const))(
    '%s (%i moedas, nível %i): comprar encurta a espera, sem ser de graça',
    (_id, preco, nivel) => {
      for (const curva of CURVAS) {
        const abre = diaDoNivel(curva, nivel);
        const cabe = diaQueCabe(curva, preco);
        // Entre um quarto e dois terços do caminho até o nível: nem tão
        // barato que as moedas sobrem, nem tão caro que a compra não adiante.
        expect(cabe, `cabe no dia ${cabe}, abre no ${abre}`).toBeLessThanOrEqual(Math.ceil((2 / 3) * abre));
        expect(cabe, `cabe no dia ${cabe}, abre no ${abre}`).toBeGreaterThanOrEqual(Math.floor(0.25 * abre));
      }
    }
  );

  it('o preço sobe com o nível', () => {
    const niveis = Object.keys(PRECO_DO_NIVEL).map(Number).sort((a, b) => a - b);
    for (let i = 1; i < niveis.length; i++) {
      expect(PRECO_DO_NIVEL[niveis[i]], `nível ${niveis[i]}`).toBeGreaterThan(PRECO_DO_NIVEL[niveis[i - 1]]);
    }
  });

  it('todo cosmético à venda tem o preço e a raridade do nível dele', () => {
    for (const item of cosmeticos) {
      expect(item.price, item.id).toBe(PRECO_DO_NIVEL[item.nivelQueLibera!]);
      expect(item.raridade, item.id).toBe(raridadeDoNivel(item.nivelQueLibera!));
    }
  });

  it('os épicos custam de cinco a sete semanas do aluno-modelo', () => {
    // O que a auditoria pedia: algo para as moedas depois dos primeiros meses.
    const porSemana = (CURVAS[0][69].moedas - CURVAS[0][13].moedas) / 8;
    const epicos = ITENS.filter((i) => i.raridade === 'epico');
    expect(epicos.length).toBeGreaterThan(0);
    for (const item of epicos) {
      const semanas = item.price / porSemana;
      expect(semanas, item.id).toBeGreaterThanOrEqual(4.5);
      expect(semanas, item.id).toBeLessThanOrEqual(7);
    }
  });

  it('consumível custa menos de meia semana: gastar não pode ser caro', () => {
    const porSemana = (CURVAS[0][69].moedas - CURVAS[0][13].moedas) / 8;
    for (const item of ITENS.filter((i) => i.tipo === 'consumivel')) {
      expect(item.price, item.id).toBeLessThan(porSemana / 2);
      expect(item.raridade, item.id).toBe('comum');
    }
  });

  it('nada à venda é lendário: lendário é de conquista ou de evento', () => {
    for (const item of ITENS) expect(RARIDADES[item.raridade].ordem, item.id).toBeLessThan(RARIDADES.lendario.ordem);
  });
});
