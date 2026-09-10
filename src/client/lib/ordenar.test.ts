import { describe, expect, it } from 'vitest';

import {
  embaralhar,
  estaOrdenado,
  mover,
  primeiroErro,
  problemasDaOrdenacao,
  type PassoOrdenavel,
} from './ordenar';

function passos(...ordens: number[]): PassoOrdenavel[] {
  return ordens.map((ordem, i) => ({ id: `p${i}`, text: `passo ${i}`, ordem }));
}

describe('ordem correta', () => {
  it('crescente está ordenado', () => {
    expect(estaOrdenado(passos(1, 2, 3))).toBe(true);
  });

  it('qualquer troca fora de lugar desordena', () => {
    expect(estaOrdenado(passos(2, 1, 3))).toBe(false);
    expect(estaOrdenado(passos(1, 3, 2))).toBe(false);
    expect(estaOrdenado(passos(3, 2, 1))).toBe(false);
  });

  /**
   * O que permite mais de uma resposta certa sem enumerar combinações: duas
   * leituras independentes antes de um cálculo não têm ordem obrigatória, e
   * cobrar uma delas ensinaria a adivinhar.
   */
  it('passos com a mesma posição trocam livremente', () => {
    expect(estaOrdenado(passos(1, 2, 2, 3))).toBe(true);

    // Os dois do meio invertidos continuam válidos: são a mesma posição.
    const invertido = passos(1, 2, 2, 3);
    const trocado = mover(invertido, 1, 'baixo');
    expect(estaOrdenado(trocado)).toBe(true);
  });

  it('lista de um passo já está ordenada', () => {
    expect(estaOrdenado(passos(1))).toBe(true);
  });

  it('lista vazia está ordenada', () => {
    expect(estaOrdenado([])).toBe(true);
  });
});

describe('onde a ordem quebra', () => {
  it('aponta a primeira posição fora de lugar', () => {
    expect(primeiroErro(passos(1, 3, 2))).toBe(2);
    expect(primeiroErro(passos(2, 1, 3))).toBe(1);
  });

  it('devolve -1 quando está tudo certo', () => {
    expect(primeiroErro(passos(1, 2, 3))).toBe(-1);
  });

  it('aponta a primeira quebra, não a última', () => {
    // Duas quebras: nas posições 1 e 3. Só a primeira interessa ao aluno.
    expect(primeiroErro(passos(2, 1, 4, 3))).toBe(1);
  });
});

describe('embaralhamento', () => {
  const alvo = passos(1, 2, 3, 4, 5);

  it('mantém todos os passos, sem perder nem duplicar', () => {
    const misturado = embaralhar(alvo, 'ex-teste');
    expect(misturado).toHaveLength(alvo.length);
    expect(new Set(misturado.map((p) => p.id))).toEqual(new Set(alvo.map((p) => p.id)));
  });

  /**
   * Um exercício que abre já resolvido é pior do que um difícil demais: o aluno
   * passa sem fazer nada e sem perceber.
   */
  it('nunca entrega o exercício já resolvido', () => {
    for (let i = 0; i < 200; i++) {
      expect(estaOrdenado(embaralhar(alvo, `semente-${i}`))).toBe(false);
    }
  });

  it('é determinístico: a mesma semente dá a mesma ordem', () => {
    const a = embaralhar(alvo, 'mesma');
    const b = embaralhar(alvo, 'mesma');
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
  });

  it('sementes diferentes costumam dar ordens diferentes', () => {
    const ordens = new Set(
      Array.from({ length: 20 }, (_, i) => embaralhar(alvo, `s${i}`).map((p) => p.id).join(','))
    );
    expect(ordens.size).toBeGreaterThan(1);
  });

  it('lista de um passo passa sem mexer', () => {
    expect(embaralhar(passos(1), 'x').map((p) => p.id)).toEqual(['p0']);
  });

  /**
   * Todas as posições iguais significa que qualquer arrumação está certa;
   * insistir em embaralhar até "errar" seria um laço sem fim.
   */
  it('não trava quando todos os passos são intercambiáveis', () => {
    const todosIguais = passos(1, 1, 1);
    const resultado = embaralhar(todosIguais, 'x');
    expect(resultado).toHaveLength(3);
  });
});

describe('mover um passo', () => {
  it('sobe uma casa', () => {
    const antes = passos(1, 2, 3);
    const depois = mover(antes, 2, 'cima');
    expect(depois.map((p) => p.id)).toEqual(['p0', 'p2', 'p1']);
  });

  it('desce uma casa', () => {
    const depois = mover(passos(1, 2, 3), 0, 'baixo');
    expect(depois.map((p) => p.id)).toEqual(['p1', 'p0', 'p2']);
  });

  it('não deixa sair pela borda de cima', () => {
    const antes = passos(1, 2, 3);
    expect(mover(antes, 0, 'cima')).toBe(antes);
  });

  it('não deixa sair pela borda de baixo', () => {
    const antes = passos(1, 2, 3);
    expect(mover(antes, 2, 'baixo')).toBe(antes);
  });

  it('não altera a lista recebida', () => {
    const antes = passos(1, 2, 3);
    const copia = antes.map((p) => p.id);
    mover(antes, 0, 'baixo');
    expect(antes.map((p) => p.id)).toEqual(copia);
  });
});

describe('validação do conteúdo', () => {
  it('aceita um exercício bem formado', () => {
    expect(problemasDaOrdenacao(passos(1, 2, 3))).toEqual([]);
  });

  it('recusa passo repetido', () => {
    const repetido: PassoOrdenavel[] = [
      { id: 'a', text: 'x', ordem: 1 },
      { id: 'a', text: 'y', ordem: 2 },
    ];
    expect(problemasDaOrdenacao(repetido).join(' ')).toContain('duas vezes');
  });

  /**
   * Um exercício em que qualquer ordem passa não cobra nada — e ele passaria
   * despercebido, porque todo teste que o aluno fizer dá verde.
   */
  it('recusa exercício em que qualquer ordem seria aceita', () => {
    expect(problemasDaOrdenacao(passos(1, 1, 1)).join(' ')).toContain('qualquer ordem');
    expect(problemasDaOrdenacao(passos(1)).join(' ')).toContain('qualquer ordem');
  });
});
