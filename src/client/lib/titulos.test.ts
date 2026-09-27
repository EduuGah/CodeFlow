import { describe, expect, it } from 'vitest';

import { getExercises, getLessonsOfTrack, listTracks } from '../../content';
import { ETAPAS_DO_PERCURSO } from '../../content/percurso';
import { ITENS } from './economia';
import { computeAchievements, type GamificationInput } from './gamification';
import type { Attempt } from './mastery';
import { estadoDosTitulos, tituloParaMostrar, TITULOS_DE_CONQUISTA } from './titulos';

function entrada(attempts: Attempt[] = []): GamificationInput {
  return { attempts, completedLessons: [], completedProjects: [], reviews: [], hoje: new Date('2026-03-10T15:00:00') };
}

/** Acertos em exercícios reais do catálogo, do tipo pedido. */
function acertosDoTipo(tipo: string, quantos: number, conceitos: string[] = []): Attempt[] {
  const ids = listTracks()
    .flatMap((t) => getLessonsOfTrack(t.id))
    .flatMap((l) => getExercises(l).map((e) => ({ e, l })))
    .filter(({ e }) => e.type === tipo)
    .slice(0, quantos);
  expect(ids.length, `o catálogo tem ${quantos} exercícios de ${tipo}`).toBe(quantos);
  return ids.map(({ e, l }) => ({
    exerciseId: e.id,
    lessonId: l.id,
    concepts: conceitos,
    correct: true,
    hintsUsed: 1,
    createdAt: '2026-03-10T10:00:00.000Z',
  }));
}

const titulosDe = (attempts: Attempt[]) =>
  estadoDosTitulos(computeAchievements(entrada(attempts)))
    .filter((e) => e.tem)
    .map((e) => e.titulo.id);

describe('o catálogo de títulos', () => {
  it('toda conquista citada existe — um nome trocado não abre nem fecha nada em silêncio', () => {
    const ids = new Set(computeAchievements(entrada()).map((c) => c.id));
    for (const titulo of TITULOS_DE_CONQUISTA) {
      for (const conquista of titulo.conquistas) expect(ids.has(conquista), `${titulo.id} → ${conquista}`).toBe(true);
    }
  });

  it('ids e nomes únicos, no formato que o banco aceita', () => {
    expect(new Set(TITULOS_DE_CONQUISTA.map((t) => t.id)).size).toBe(TITULOS_DE_CONQUISTA.length);
    expect(new Set(TITULOS_DE_CONQUISTA.map((t) => t.nome)).size).toBe(TITULOS_DE_CONQUISTA.length);
    for (const { id } of TITULOS_DE_CONQUISTA) {
      // O mesmo formato de `users_titulo_formato` (0012).
      expect(id, id).toMatch(/^[a-z0-9-]{1,40}$/);
    }
  });

  it('nenhum título está à venda', () => {
    const vendidos = new Set(ITENS.map((i) => i.id));
    for (const { id } of TITULOS_DE_CONQUISTA) {
      expect(vendidos.has(id) || vendidos.has(`titulo-${id}`), id).toBe(false);
    }
  });

  it('o catálogo de exercícios tem o bastante para cada título de contagem', () => {
    const exercicios = listTracks()
      .flatMap((t) => getLessonsOfTrack(t.id))
      .flatMap((l) => getExercises(l));
    // Um título que pede mais do que existe nunca abriria, e ninguém notaria.
    expect(exercicios.filter((e) => e.type === 'find-bug').length).toBeGreaterThanOrEqual(25);
    expect(exercicios.filter((e) => e.type === 'write-test').length).toBeGreaterThanOrEqual(10);
    expect(exercicios.filter((e) => e.concepts.includes('loops')).length).toBeGreaterThanOrEqual(15);
  });

  it('"Aprendiz Full Stack" pede a página, o banco e o servidor', () => {
    const titulo = TITULOS_DE_CONQUISTA.find((t) => t.id === 'aprendiz-full-stack')!;
    const trilhas = titulo.conquistas.flatMap((id) => ETAPAS_DO_PERCURSO[Number(id.replace('etapa-', ''))].trackIds);
    // Pelas trilhas, não pelo índice: reordenar as etapas não pode trocar o sentido do título.
    expect(trilhas).toEqual(expect.arrayContaining(['track-pagina', 'track-react', 'track-sql', 'track-node']));
  });
});

describe('a posse vem das conquistas', () => {
  it('sem atividade, nenhum título', () => {
    expect(titulosDe([])).toEqual([]);
  });

  it('vinte e cinco bugs achados dão "Detetive de Bugs"; vinte e quatro, não', () => {
    expect(titulosDe(acertosDoTipo('find-bug', 24))).not.toContain('detetive-de-bugs');
    expect(titulosDe(acertosDoTipo('find-bug', 25))).toContain('detetive-de-bugs');
  });

  it('dez testes escritos dão "Sentinela dos Testes"', () => {
    expect(titulosDe(acertosDoTipo('write-test', 9))).not.toContain('sentinela-dos-testes');
    expect(titulosDe(acertosDoTipo('write-test', 10))).toContain('sentinela-dos-testes');
  });

  it('"Mestre dos Laços" conta exercícios de laço diferentes, não tentativas', () => {
    const quinze = acertosDoTipo('code', 15, ['loops']);
    expect(titulosDe(quinze)).toContain('mestre-dos-lacos');
    // O mesmo exercício quinze vezes é um exercício só.
    const repetido = Array.from({ length: 15 }, () => quinze[0]);
    expect(titulosDe(repetido)).not.toContain('mestre-dos-lacos');
    // E exercício sem o conceito não conta.
    expect(titulosDe(acertosDoTipo('code', 15, ['strings']))).not.toContain('mestre-dos-lacos');
  });

  it('um título de várias conquistas diz quais faltam', () => {
    const estado = estadoDosTitulos(computeAchievements(entrada())).find((e) => e.titulo.id === 'aprendiz-full-stack')!;
    expect(estado.tem).toBe(false);
    expect(estado.faltam.map((c) => c.id)).toEqual(['etapa-2', 'etapa-3', 'etapa-4']);
  });

  it('uma conquista ausente deixa o título trancado, em vez de abrir por engano', () => {
    const semAConquista = computeAchievements(entrada(acertosDoTipo('find-bug', 25))).filter(
      (c) => c.id !== 'vinte-e-cinco-bugs'
    );
    const estado = estadoDosTitulos(semAConquista).find((e) => e.titulo.id === 'detetive-de-bugs')!;
    expect(estado.tem).toBe(false);
  });
});

describe('o título ao lado do nome', () => {
  const conquistas = computeAchievements(entrada(acertosDoTipo('find-bug', 25)));

  it('mostra o escolhido quando é da pessoa', () => {
    expect(tituloParaMostrar('detetive-de-bugs', conquistas)).toBe('Detetive de Bugs');
  });

  it('não mostra um título que a pessoa não tem, nem um que não existe', () => {
    expect(tituloParaMostrar('lenda-do-percurso', conquistas)).toBeNull();
    expect(tituloParaMostrar('rei-do-universo', conquistas)).toBeNull();
    expect(tituloParaMostrar(null, conquistas)).toBeNull();
  });
});
