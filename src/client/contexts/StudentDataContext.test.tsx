import { act, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StudentDataProvider, useStudentData } from './StudentDataContext';

/**
 * O contexto que lê o histórico e deriva o resto.
 *
 * O que se prova aqui é o contrato com as telas, não as contas (que têm os
 * próprios testes): uma leitura que falha não vira número falso nem compra
 * sobre saldo errado; dois toques não compram duas vezes; e um `user` novo
 * com o mesmo id — o que o supabase-js entrega a cada renovação do token —
 * não recarrega tudo.
 */

const banco = vi.hoisted(() => ({
  falharCompras: false,
  completedLessons: [] as string[],
  purchases: [] as Array<{ item: string; price: number; createdAt: string }>,
  leituras: 0,
  recordPurchase: vi.fn(),
}));

vi.mock('../lib/progress', () => ({
  fetchProgress: async () => {
    banco.leituras++;
    return { completedLessons: banco.completedLessons, completedProjects: [] };
  },
  fetchAttempts: async () => ({ dados: [] }),
  fetchFlashcardReviews: async () => ({ dados: [] }),
}));

vi.mock('../lib/perfil', () => ({
  fetchPerfil: async () => ({ displayName: null, avatar: null, theme: null, accent: null }),
  fetchPurchases: async () =>
    banco.falharCompras ? { dados: [], erro: 'Não foi possível carregar suas compras.' } : { dados: banco.purchases },
  recordPurchase: (...args: unknown[]) => banco.recordPurchase(...args),
  updatePerfil: async () => ({}),
}));

const sessao = vi.hoisted(() => ({ user: { id: 'aluno-1' } as { id: string } | null }));
vi.mock('./AuthContext', () => ({ useAuth: () => ({ user: sessao.user }) }));

/** Mostra o que as telas leem e deixa o teste comprar. */
function Painel({ aoComprar }: { aoComprar?: (r: { error?: string }) => void }) {
  const dados = useStudentData();
  const [ultimo, setUltimo] = useState('');
  if (dados.loading) return <p>carregando</p>;
  return (
    <div>
      <p data-testid="saldo">{dados.moedas.saldo}</p>
      <p data-testid="incompleto">{String(dados.incompleto)}</p>
      <p data-testid="erro">{dados.error ?? ''}</p>
      <p data-testid="compras">{dados.purchases.length}</p>
      <p data-testid="ultimo">{ultimo}</p>
      <button
        onClick={() =>
          void dados.comprar('congelar-sequencia').then((r) => {
            setUltimo(r.error ?? 'ok');
            aoComprar?.(r);
          })
        }
      >
        comprar
      </button>
      <button onClick={dados.reload}>recarregar</button>
    </div>
  );
}

beforeEach(() => {
  banco.falharCompras = false;
  banco.completedLessons = Array.from({ length: 10 }, (_, i) => `aula-${i}`); // 100 moedas
  banco.purchases = [];
  banco.leituras = 0;
  banco.recordPurchase.mockReset();
  sessao.user = { id: 'aluno-1' };
});

describe('o histórico que não chegou inteiro', () => {
  it('avisa, e a compra é recusada antes de chegar ao banco', async () => {
    // O defeito: compras não lidas viravam lista vazia, e o saldo — inflado —
    // liberava a compra.
    banco.falharCompras = true;
    render(
      <StudentDataProvider>
        <Painel />
      </StudentDataProvider>
    );

    await waitFor(() => expect(screen.getByTestId('incompleto')).toHaveTextContent('true'));
    expect(screen.getByTestId('erro')).toHaveTextContent(/Parte do seu histórico não carregou/);

    act(() => screen.getByText('comprar').click());

    await waitFor(() => expect(screen.getByTestId('ultimo')).toHaveTextContent(/não carregou inteiro/));
    expect(banco.recordPurchase).not.toHaveBeenCalled();
  });

  it('recarregar com a rede de volta tira o aviso', async () => {
    banco.falharCompras = true;
    render(
      <StudentDataProvider>
        <Painel />
      </StudentDataProvider>
    );
    await waitFor(() => expect(screen.getByTestId('incompleto')).toHaveTextContent('true'));

    banco.falharCompras = false;
    act(() => screen.getByText('recarregar').click());

    await waitFor(() => expect(screen.getByTestId('incompleto')).toHaveTextContent('false'));
    expect(screen.getByTestId('erro')).toHaveTextContent('');
  });
});

describe('comprar', () => {
  it('uma compra por vez: o segundo toque não chega ao banco', async () => {
    let concluir!: (r: unknown) => void;
    banco.recordPurchase.mockImplementation(() => new Promise((r) => (concluir = r)));
    render(
      <StudentDataProvider>
        <Painel />
      </StudentDataProvider>
    );
    await screen.findByTestId('saldo');

    act(() => {
      screen.getByText('comprar').click();
      screen.getByText('comprar').click();
    });

    await waitFor(() => expect(screen.getByTestId('ultimo')).toHaveTextContent(/em andamento/));
    expect(banco.recordPurchase).toHaveBeenCalledTimes(1);

    await act(async () => concluir({ purchase: { item: 'congelar-sequencia', price: 60, createdAt: new Date().toISOString() } }));
    await waitFor(() => expect(screen.getByTestId('saldo')).toHaveTextContent('40'));
    expect(screen.getByTestId('compras')).toHaveTextContent('1');
  });

  it('a recusa do banco chega à tela e não mexe no saldo', async () => {
    banco.recordPurchase.mockResolvedValue({ error: 'Moedas insuficientes para este item.' });
    render(
      <StudentDataProvider>
        <Painel />
      </StudentDataProvider>
    );
    await screen.findByTestId('saldo');

    act(() => screen.getByText('comprar').click());

    await waitFor(() => expect(screen.getByTestId('ultimo')).toHaveTextContent('Moedas insuficientes'));
    expect(screen.getByTestId('saldo')).toHaveTextContent('100');
  });
});

describe('a sessão renovada', () => {
  it('um `user` novo com o mesmo id não recarrega o histórico', async () => {
    const { rerender } = render(
      <StudentDataProvider>
        <Painel />
      </StudentDataProvider>
    );
    await screen.findByTestId('saldo');
    expect(banco.leituras).toBe(1);

    // O que a renovação do token faz: outro objeto, a mesma pessoa.
    sessao.user = { id: 'aluno-1' };
    rerender(
      <StudentDataProvider>
        <Painel />
      </StudentDataProvider>
    );
    await new Promise((r) => setTimeout(r, 20));

    expect(banco.leituras).toBe(1);
    expect(screen.queryByText('carregando')).not.toBeInTheDocument();
  });

  it('outra pessoa, sim, recarrega', async () => {
    const { rerender } = render(
      <StudentDataProvider>
        <Painel />
      </StudentDataProvider>
    );
    await screen.findByTestId('saldo');

    sessao.user = { id: 'aluno-2' };
    rerender(
      <StudentDataProvider>
        <Painel />
      </StudentDataProvider>
    );

    await waitFor(() => expect(banco.leituras).toBe(2));
  });
});
