import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { aulaCarregada, carregarAula, listTracks, getLessonsOfTrack } from '../../content';
import { registrar } from '../lib/registro';
import { useAula, useAulas } from './useConteudo';

/**
 * O corpo da aula que vem por `import()` (P2-1b), visto da tela: o que ela
 * recebe em cada momento. O arquivo que não chega é simulado aqui, com a
 * mesma mensagem que o navegador dá quando um deploy novo trocou os nomes.
 */

const falhas = vi.hoisted(() => ({ restantes: 0 }));

vi.mock('../../content', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../content')>();
  return {
    ...real,
    carregarAula: vi.fn((id: string) =>
      falhas.restantes-- > 0
        ? Promise.reject(new TypeError('Failed to fetch dynamically imported module: https://codeflow.app/assets/aula-x.js'))
        : real.carregarAula(id)
    ),
  };
});

vi.mock('../lib/registro', () => ({ registrar: vi.fn() }));

/** Aulas que nenhum teste pediu ainda: cada teste usa as suas. */
const aulas = listTracks()
  .flatMap((t) => getLessonsOfTrack(t.id))
  .map((a) => a.id);
let proxima = 0;
function aulaNova(): string {
  const id = aulas[proxima++];
  expect(aulaCarregada(id), `${id} já tinha vindo`).toBeUndefined();
  return id;
}

beforeEach(() => {
  falhas.restantes = 0;
  vi.mocked(registrar).mockClear();
});

describe('useAula', () => {
  it('uma aula que ainda não veio: carregando, depois pronta', async () => {
    const id = aulaNova();
    const { result } = renderHook(() => useAula(id));

    expect(result.current.estado).toBe('carregando');
    await waitFor(() => expect(result.current.estado).toBe('pronto'));
    expect(result.current.estado === 'pronto' && result.current.valor.id).toBe(id);
  });

  it('uma aula que já veio sai pronta no primeiro render, sem esqueleto', async () => {
    const id = aulaNova();
    await carregarAula(id);

    const { result } = renderHook(() => useAula(id));
    expect(result.current.estado).toBe('pronto');
  });

  it('um id fora do índice é ausente já no primeiro render, sem baixar nada', () => {
    vi.mocked(carregarAula).mockClear();
    const { result } = renderHook(() => useAula('aula-que-nao-existe'));

    expect(result.current.estado).toBe('ausente');
    expect(carregarAula).not.toHaveBeenCalled();
  });

  it('o arquivo que não chega vira falha com "tentar de novo", e o registro leva só o nome do erro', async () => {
    const id = aulaNova();
    falhas.restantes = 1;
    const { result } = renderHook(() => useAula(id));

    await waitFor(() => expect(result.current.estado).toBe('falhou'));
    expect(registrar).toHaveBeenCalledWith('falha_de_leitura', { operacao: 'carregarAula', nome: 'TypeError' });

    act(() => {
      if (result.current.estado === 'falhou') result.current.tentarDeNovo();
    });
    expect(result.current.estado).toBe('carregando');
    await waitFor(() => expect(result.current.estado).toBe('pronto'));
  });

  it('trocar de aula nunca mostra o corpo da anterior sob o id da nova', async () => {
    const primeira = aulaNova();
    const segunda = aulaNova();
    const { result, rerender } = renderHook(({ id }) => useAula(id), { initialProps: { id: primeira } });
    await waitFor(() => expect(result.current.estado).toBe('pronto'));

    rerender({ id: segunda });
    expect(result.current.estado).toBe('carregando');
    await waitFor(() => expect(result.current.estado === 'pronto' && result.current.valor.id).toBe(segunda));
  });
});

describe('useAulas', () => {
  it('sem aulas, pronta com o mapa vazio', () => {
    const { result } = renderHook(() => useAulas([]));
    expect(result.current.estado === 'pronto' && result.current.valor.size).toBe(0);
  });

  it('várias aulas: espera todas, ignora id fora do índice e repetido', async () => {
    const a = aulaNova();
    const b = aulaNova();
    const { result } = renderHook(() => useAulas([b, 'aula-que-nao-existe', a, b]));

    expect(result.current.estado).toBe('carregando');
    await waitFor(() => expect(result.current.estado).toBe('pronto'));
    expect(result.current.estado === 'pronto' && [...result.current.valor.keys()].sort()).toEqual([a, b].sort());
  });
});
