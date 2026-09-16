import { LOJA } from './loja';
import type { BancoDeExemplo } from './tipos';

export type { BancoDeExemplo, ColunaDeExemplo, TabelaDeExemplo } from './tipos';

/**
 * Os bancos de exemplo, por id. Um exercício de SQL aponta para um deles em
 * `database`; o validador do catálogo recusa um id que não esteja aqui.
 */
export const BANCOS: Record<string, BancoDeExemplo> = {
  [LOJA.id]: LOJA,
};

export function getBanco(id: string): BancoDeExemplo | undefined {
  return BANCOS[id];
}
