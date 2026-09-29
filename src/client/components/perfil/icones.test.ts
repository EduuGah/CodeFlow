import { describe, expect, it } from 'vitest';

import { DESAFIOS_DA_SEMANA, DESAFIOS_DO_DIA } from '../../lib/desafios';
import { IconBug, IconTarget } from '../ui/Icon';
import { iconeDoDesafio } from './icones';

describe('o ícone de cada desafio', () => {
  it('todo desafio tem o ícone do que ele pede, e não o genérico', () => {
    // O alvo é o que sobra quando nenhum nome casa: um desafio novo sem
    // ícone próprio apareceria igual a qualquer outro na tela.
    for (const desafio of [...DESAFIOS_DO_DIA, ...DESAFIOS_DA_SEMANA]) {
      expect(iconeDoDesafio(desafio.id), desafio.id).not.toBe(IconTarget);
    }
  });

  it('"caçar um bug" leva o inseto', () => {
    expect(iconeDoDesafio('dia-bug-1')).toBe(IconBug);
  });
});
