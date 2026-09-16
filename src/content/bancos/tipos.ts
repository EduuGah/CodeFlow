/**
 * Um banco de exemplo: o SQL que o cria, e a descrição que o aluno lê.
 *
 * As duas metades precisam contar a mesma história. O painel de tabelas ao
 * lado do editor vem de `tabelas`, e o CI confere cada coluna declarada aqui
 * contra o que o SQL de fato cria — uma coluna a mais na descrição seria um
 * recurso falso: o aluno a consultaria e leria "a coluna não existe".
 */
export interface ColunaDeExemplo {
  nome: string;
  /** Tipo declarado no `CREATE TABLE`, como o aluno vai escrevê-lo. */
  tipo: string;
  /** O que a coluna guarda, quando o nome não basta. */
  descricao?: string;
}

export interface TabelaDeExemplo {
  nome: string;
  descricao: string;
  colunas: ColunaDeExemplo[];
}

export interface BancoDeExemplo {
  id: string;
  title: string;
  description: string;
  /** `CREATE TABLE`s e `INSERT`s. Roda inteiro antes de cada execução do aluno. */
  sql: string;
  tabelas: TabelaDeExemplo[];
}
