import { describe, expect, it } from 'vitest';

import type { Concept, Lesson, Track } from '../../content/types';
import { formatarDuracao, montarPercurso, trilhaDaVez } from './percurso';

const aula = (id: string, trackId: string, minutos = 10): Lesson => ({
  id,
  trackId,
  title: id,
  language: 'javascript',
  objective: '',
  concepts: ['c'],
  blocks: [{ kind: 'prose', markdown: 'x' }],
  status: 'published',
  estimatedMinutes: minutos,
});

const AULAS: Record<string, Lesson[]> = {
  js: [aula('js1', 'js'), aula('js2', 'js', 20)],
  web: [aula('web1', 'web')],
  ts: [aula('ts1', 'ts'), aula('ts2', 'ts')],
};

const trilha = (id: string): Track => ({
  id,
  title: id.toUpperCase(),
  description: '',
  language: 'javascript',
  lessonIds: AULAS[id].map((l) => l.id),
  status: 'published',
});

const TRILHAS: Record<string, Track> = { js: trilha('js'), web: trilha('web'), ts: trilha('ts') };
const CONCEITOS: Concept[] = [{ id: 'c', title: 'c', summary: '', prerequisites: [], tags: [] }];
const ETAPAS = [
  { title: 'Base', description: '', trackIds: ['js'] },
  { title: 'Web', description: '', trackIds: ['web', 'ts'] },
];

const montar = (concluidas: string[]) =>
  montarPercurso(ETAPAS, (id) => TRILHAS[id], (id) => AULAS[id], concluidas, CONCEITOS, []);

describe('montarPercurso', () => {
  it('numera as trilhas de ponta a ponta, atravessando as etapas', () => {
    const p = montar([]);
    expect(p.map((e) => e.numero)).toEqual([1, 2]);
    expect(p.flatMap((e) => e.trilhas.map((t) => t.posicao))).toEqual([1, 2, 3]);
  });

  it('classifica cada trilha pelo que já foi feito nela', () => {
    const p = montar(['js1', 'web1']);
    const estados = Object.fromEntries(p.flatMap((e) => e.trilhas.map((t) => [t.track.id, t.estado])));
    expect(estados).toEqual({ js: 'em-andamento', web: 'concluida', ts: 'nao-iniciada' });
  });

  it('soma os minutos das aulas', () => {
    const js = montar([])[0].trilhas[0];
    expect(js.minutos).toBe(30);
  });

  it('ignora um id de trilha que não existe, em vez de quebrar a tela', () => {
    const p = montarPercurso([{ title: 'x', description: '', trackIds: ['js', 'nada'] }], (id) => TRILHAS[id], (id) => AULAS[id] ?? [], [], CONCEITOS, []);
    expect(p[0].trilhas.map((t) => t.track.id)).toEqual(['js']);
  });
});

describe('trilhaDaVez', () => {
  it('para quem nunca fez nada, é a primeira do percurso', () => {
    expect(trilhaDaVez(montar([]))?.track.id).toBe('js');
  });

  it('é a trilha da última atividade, se ela não acabou', () => {
    expect(trilhaDaVez(montar(['js1']), 'ts1')?.track.id).toBe('ts');
  });

  it('a última atividade numa trilha concluída não prende a pessoa lá', () => {
    // Terminou web (a última coisa que fez) e já tinha começado js.
    expect(trilhaDaVez(montar(['web1', 'js1']), 'web1')?.track.id).toBe('js');
  });

  it('sem última atividade, é a primeira começada e não terminada', () => {
    expect(trilhaDaVez(montar(['ts1']))?.track.id).toBe('ts');
  });

  it('com tudo começado e terminado, não há trilha da vez', () => {
    expect(trilhaDaVez(montar(['js1', 'js2', 'web1', 'ts1', 'ts2']))).toBeUndefined();
  });
});

describe('formatarDuracao', () => {
  it.each([
    [20, '20 min'],
    [60, '1 h'],
    [90, '1 h 30 min'],
    [180, '~3 h'],
    [455, '~8 h'],
  ])('%i minutos → %s', (minutos, esperado) => {
    expect(formatarDuracao(minutos)).toBe(esperado);
  });
});
