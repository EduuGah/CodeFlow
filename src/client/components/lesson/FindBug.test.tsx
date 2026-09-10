import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { FindBugExercise } from '../../../content/types';
import { FindBug } from './FindBug';

vi.mock('../../hooks/useRecordAttempt', () => ({ useRecordAttempt: () => () => {} }));

const EXERCICIO: FindBugExercise = {
  id: 'ex-teste-bug',
  type: 'find-bug',
  prompt: 'Aponte o defeito.',
  concepts: ['depuracao'],
  difficulty: 'intermediario',
  hints: ['leia a mensagem'],
  tags: ['teste'],
  // 1: function  2: const itens  3: (vazia)  4: for  5: uso  6: }  7: }  8: // comentário
  code: `function total(carrinho) {
  const itens = carrinho.produtos;

  for (const item of itens) {
    return item.preco;
  }
}
// fim`,
  buggyLine: 2,
  fix: '  const itens = carrinho.itens;',
  symptomLine: 4,
  symptomFeedback: 'É onde o erro aparece, e não onde ele nasce.',
  explanation: 'A propriedade lida não existe.',
};

/** A alternativa correspondente a uma linha, pelo rótulo acessível. */
function linha(numero: number) {
  return screen.getByRole('radio', { name: new RegExp(`^Linha ${numero}:`) });
}

async function apontar(user: ReturnType<typeof userEvent.setup>, numero: number) {
  await user.click(linha(numero));
  await user.click(screen.getByRole('button', { name: /Apontar a linha|Verificar de novo/ }));
}

describe('as linhas', () => {
  it('todas aparecem, numeradas a partir de 1', () => {
    render(<FindBug exercise={EXERCICIO} lessonId="aula" />);
    expect(screen.getByText('function total(carrinho) {')).toBeInTheDocument();
  });

  /**
   * Elas continuam visíveis porque fazem parte da leitura — mas oferecê-las
   * como resposta seria ruído, e apontar para uma delas é quase sempre um erro
   * de contagem, não uma hipótese.
   */
  it('linha em branco e comentário não são selecionáveis', () => {
    render(<FindBug exercise={EXERCICIO} lessonId="aula" />);

    expect(screen.queryByRole('radio', { name: /^Linha 3:/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /^Linha 8:/ })).not.toBeInTheDocument();
    expect(screen.getByText('// fim')).toBeInTheDocument();
  });

  it('cada linha de código é uma alternativa com nome acessível', () => {
    render(<FindBug exercise={EXERCICIO} lessonId="aula" />);
    expect(linha(2)).toBeInTheDocument();
    expect(linha(4)).toBeInTheDocument();
  });
});

describe('verificação', () => {
  it('sem escolher nada, o botão não deixa verificar', () => {
    render(<FindBug exercise={EXERCICIO} lessonId="aula" />);
    expect(screen.getByRole('button', { name: 'Escolha uma linha' })).toBeDisabled();
  });

  it('a linha do defeito é aceita, e a explicação aparece', async () => {
    const user = userEvent.setup();
    render(<FindBug exercise={EXERCICIO} lessonId="aula" />);

    await apontar(user, 2);

    expect(screen.getByText('A linha 2 é onde o defeito está')).toBeInTheDocument();
    expect(screen.getByText(EXERCICIO.explanation)).toBeInTheDocument();
  });

  /**
   * O caso que dá sentido ao tipo. Quem aponta a linha do sintoma não chutou:
   * leu a mensagem de erro e acreditou nela.
   */
  it('a linha do sintoma recebe um retorno próprio', async () => {
    const user = userEvent.setup();
    render(<FindBug exercise={EXERCICIO} lessonId="aula" />);

    await apontar(user, 4);

    expect(
      screen.getByText('A linha 4 é onde o erro aparece — não onde ele nasce')
    ).toBeInTheDocument();
    expect(screen.getByText(EXERCICIO.symptomFeedback!)).toBeInTheDocument();
  });

  it('outra linha qualquer recebe o retorno genérico', async () => {
    const user = userEvent.setup();
    render(<FindBug exercise={EXERCICIO} lessonId="aula" />);

    await apontar(user, 5);

    expect(screen.getByText('Não é essa linha')).toBeInTheDocument();
    expect(screen.queryByText(EXERCICIO.symptomFeedback!)).not.toBeInTheDocument();
  });

  it('mudar de linha depois de verificar descarta o retorno', async () => {
    const user = userEvent.setup();
    render(<FindBug exercise={EXERCICIO} lessonId="aula" />);

    await apontar(user, 5);
    expect(screen.getByText('Não é essa linha')).toBeInTheDocument();

    await user.click(linha(4));
    expect(screen.queryByText('Não é essa linha')).not.toBeInTheDocument();
  });

  it('depois de acertar, as alternativas travam', async () => {
    const user = userEvent.setup();
    render(<FindBug exercise={EXERCICIO} lessonId="aula" />);

    await apontar(user, 2);

    expect(linha(4)).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: /Apontar a linha|Verificar de novo/ })
    ).not.toBeInTheDocument();
  });
});

describe('estado reportado à aula', () => {
  it('vai de inicial a acertou', async () => {
    const user = userEvent.setup();
    const vistos: string[] = [];

    render(<FindBug exercise={EXERCICIO} lessonId="aula" onEstado={(e) => vistos.push(e)} />);
    expect(vistos).toEqual(['inicial']);

    await user.click(linha(2));
    expect(vistos).toContain('respondendo');

    await user.click(screen.getByRole('button', { name: /Apontar a linha/ }));
    expect(vistos[vistos.length - 1]).toBe('acertou');
  });

  it('a linha do sintoma reporta errou, e não acertou', async () => {
    const user = userEvent.setup();
    const vistos: string[] = [];

    render(<FindBug exercise={EXERCICIO} lessonId="aula" onEstado={(e) => vistos.push(e)} />);

    await apontar(user, 4);

    expect(vistos[vistos.length - 1]).toBe('errou');
    expect(vistos).not.toContain('acertou');
  });
});
