import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { SqlExercise } from '../../../content/types';
import { executarSql, type ExecucaoSql } from '../../lib/sql-core';
import { abrirBancoNoNode } from '../../lib/sql-node';
import { SqlExerciseStep } from './SqlExerciseStep';

vi.mock('../../hooks/useRecordAttempt', () => ({ useRecordAttempt: () => () => {} }));

vi.mock('../ui/CodeEditor', () => ({
  CodeEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="Editor de código" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

// O motor de verdade, sem o worker: o mesmo `executarSql` do navegador,
// com o SQLite do Node. O que está sob teste é a tela lendo o resultado.
vi.mock('../../lib/sql', () => ({
  prepararMotorSql: () => Promise.resolve(),
  executarSqlNoNavegador: async (execucao: ExecucaoSql) => executarSql(await abrirBancoNoNode(), execucao),
}));

const EXERCICIO: SqlExercise = {
  id: 'ex-teste-sql',
  type: 'sql',
  database: 'loja',
  prompt: 'Os produtos da categoria livros.',
  concepts: ['sql-tabelas'],
  difficulty: 'iniciante',
  hints: ['use WHERE'],
  tags: ['teste'],
  initialCode: '-- escreva aqui\n',
  tests: [{ description: 'Devolve nome e preço dos dois livros' }],
  solution: "SELECT nome, preco FROM produtos WHERE categoria = 'livros'",
};

async function escrever(user: ReturnType<typeof userEvent.setup>, sql: string) {
  const editor = screen.getByRole('textbox', { name: 'Editor de código' });
  await user.clear(editor);
  await user.click(editor);
  await user.paste(sql);
}

async function executar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Executar consulta|Executar de novo/ }));
}

describe('SqlExerciseStep', () => {
  it('mostra as tabelas do banco antes de qualquer execução, com os tipos ao abrir', async () => {
    render(<SqlExerciseStep exercise={EXERCICIO} lessonId="l" />);

    expect(screen.getByText('Tabelas do banco')).toBeInTheDocument();
    // Fechada: nome e colunas numa linha.
    const produtos = screen.getByText('produtos').closest('details')!;
    expect(produtos).toHaveTextContent('id · nome · categoria · preco · estoque');
    expect(produtos.open).toBe(false);

    const user = userEvent.setup();
    await user.click(within(produtos).getByText('produtos'));
    expect(produtos.open).toBe(true);
    expect(within(produtos).getByText('REAL')).toBeInTheDocument();
    expect(within(produtos).getByText('preço atual, em reais')).toBeInTheDocument();
  });

  it('a consulta certa passa, e a aula fica sabendo', async () => {
    const onEstado = vi.fn();
    render(<SqlExerciseStep exercise={EXERCICIO} lessonId="l" onEstado={onEstado} />);
    const user = userEvent.setup();

    // Outro texto, as mesmas linhas: é isso que a correção compara.
    await escrever(user, "select nome, preco from produtos where 'livros' = categoria");
    await executar(user);

    await screen.findByText('As linhas são as esperadas');
    expect(onEstado).toHaveBeenLastCalledWith('acertou');
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
  });

  it('a consulta errada mostra a tabela devolvida e diz o que faltou', async () => {
    const onEstado = vi.fn();
    render(<SqlExerciseStep exercise={EXERCICIO} lessonId="l" onEstado={onEstado} />);
    const user = userEvent.setup();

    await escrever(user, "SELECT nome, preco FROM produtos WHERE categoria = 'casa'");
    await executar(user);

    await screen.findByText('1 de 1 verificação falhou');
    expect(onEstado).toHaveBeenLastCalledWith('errou');

    // O resultado é uma tabela de verdade: cabeçalho e as duas linhas de "casa".
    const tabela = screen.getByRole('table');
    expect(within(tabela).getByRole('columnheader', { name: 'preco' })).toBeInTheDocument();
    expect(within(tabela).getAllByRole('row')).toHaveLength(3);
    expect(within(tabela).getByText('Luminária de mesa')).toBeInTheDocument();

    expect(
      screen.getByText(/Devolve nome e preço dos dois livros — O número de linhas está certo, mas o conteúdo não/)
    ).toBeInTheDocument();
  });

  it('um erro de SQL chega traduzido, e nada é verificado', async () => {
    render(<SqlExerciseStep exercise={EXERCICIO} lessonId="l" />);
    const user = userEvent.setup();

    await escrever(user, 'SELECT nome FROM produto');
    await executar(user);

    await screen.findByText(/A tabela "produto" não existe/);
    expect(screen.queryByText(/verificação falhou/)).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('NULL aparece como NULL, e um comando de escrita como o verbo e as linhas', async () => {
    render(<SqlExerciseStep exercise={EXERCICIO} lessonId="l" />);
    const user = userEvent.setup();

    await escrever(user, "UPDATE clientes SET email = NULL WHERE estado = 'SP'; SELECT nome, email FROM clientes WHERE id <= 2");
    await executar(user);

    await screen.findByText(/verificação falhou/);
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
    expect(screen.getByText('— 4 linhas')).toBeInTheDocument();
    const tabela = screen.getByRole('table');
    expect(within(tabela).getByText('NULL')).toBeInTheDocument();
    expect(within(tabela).getByText('bruno@exemplo.com')).toBeInTheDocument();
  });

  it('mudar o SQL depois de acertar tira o veredito da tela', async () => {
    const onEstado = vi.fn();
    render(<SqlExerciseStep exercise={EXERCICIO} lessonId="l" onEstado={onEstado} />);
    const user = userEvent.setup();

    await escrever(user, EXERCICIO.solution);
    await executar(user);
    await screen.findByText('As linhas são as esperadas');

    await user.type(screen.getByRole('textbox', { name: 'Editor de código' }), ' ');
    expect(screen.getByText(/O SQL mudou depois desta execução/)).toBeInTheDocument();
    expect(screen.queryByText('As linhas são as esperadas')).not.toBeInTheDocument();
    expect(onEstado).toHaveBeenLastCalledWith('respondendo');
  });
});
