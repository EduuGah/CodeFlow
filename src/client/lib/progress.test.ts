import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * A camada que grava e lê o progresso no Supabase.
 *
 * Não havia teste nenhum aqui, e foi aqui que moravam os dois defeitos mais
 * caros da auditoria de 2026-09-26: concluir uma aula depois de uma leitura
 * que falhou apagava todas as aulas concluídas, e o histórico parava na
 * milésima tentativa porque o Supabase corta a resposta em silêncio.
 *
 * O cliente é um dublê que registra cada chamada e responde o que o teste
 * mandar — o mesmo formato `{ data, error, count }` do supabase-js.
 */

interface Chamada {
  tabela?: string;
  rpc?: string;
  args?: unknown;
  op?: 'select' | 'upsert' | 'insert';
  corpo?: unknown;
  faixa?: [number, number];
  contar?: boolean;
}

type Resposta = { data: unknown; error: { code?: string; message: string } | null; count?: number | null };

const dublê = vi.hoisted(() => {
  const estado = {
    chamadas: [] as Chamada[],
    responder: (_c: Chamada): Resposta => ({ data: [], error: null }),
  };

  function consulta(tabela: string) {
    const c: Chamada = { tabela, op: 'select' };
    const construtor = {
      select(_colunas?: string, opcoes?: { count?: string }) {
        if (c.op === 'select') c.contar = opcoes?.count === 'exact';
        return construtor;
      },
      eq: () => construtor,
      not: () => construtor,
      order: () => construtor,
      range(de: number, ate: number) {
        c.faixa = [de, ate];
        return construtor;
      },
      maybeSingle: () => construtor,
      single: () => construtor,
      upsert(corpo: unknown) {
        c.op = 'upsert';
        c.corpo = corpo;
        return construtor;
      },
      insert(corpo: unknown) {
        c.op = 'insert';
        c.corpo = corpo;
        return construtor;
      },
      then(resolver: (r: Resposta) => unknown, rejeitar?: (e: unknown) => unknown) {
        estado.chamadas.push(c);
        return Promise.resolve(estado.responder(c)).then(resolver, rejeitar);
      },
    };
    return construtor;
  }

  const cliente = {
    from: (tabela: string) => consulta(tabela),
    rpc: (nome: string, args?: unknown) => {
      const c: Chamada = { rpc: nome, args };
      estado.chamadas.push(c);
      return Promise.resolve(estado.responder(c));
    },
  };

  return { estado, cliente };
});

vi.mock('./supabase', () => ({ supabase: dublê.cliente }));

const { fetchAttempts, fetchEvidencias, fetchExercisePerformance, LINHAS_POR_PAGINA, markLessonCompleted, recordAttempt } =
  await import('./progress');
const { fetchPurchases, recordPurchase } = await import('./perfil');

const SEM_FUNCAO = { code: 'PGRST202', message: 'Could not find the function public.concluir in the schema cache' };

beforeEach(() => {
  // As falhas simuladas aqui são registradas no console de propósito; no
  // teste, isso é ruído que ensinaria a ignorar o stderr.
  vi.spyOn(console, 'error').mockImplementation(() => {});
  dublê.estado.chamadas = [];
  dublê.estado.responder = () => ({ data: [], error: null });
});

describe('concluir uma aula', () => {
  it('pede ao banco para acrescentar, sem ler nem regravar a lista', async () => {
    await markLessonCompleted('u1', 'lesson-js-2');

    expect(dublê.estado.chamadas).toEqual([
      { rpc: 'concluir', args: { p_coluna: 'completed_lessons', p_id: 'lesson-js-2' } },
    ]);
  });

  it('num banco sem a 0009, uma leitura que falha NÃO vira lista vazia regravada', async () => {
    // O defeito: a leitura falhava, voltava `[]`, e o upsert gravava só a aula
    // nova — apagando todas as concluídas antes dela.
    dublê.estado.responder = (c) => {
      if (c.rpc === 'concluir') return { data: null, error: SEM_FUNCAO };
      if (c.tabela === 'users' && c.op === 'select') return { data: null, error: { message: 'Failed to fetch' } };
      return { data: null, error: null };
    };

    await expect(markLessonCompleted('u1', 'lesson-js-2')).rejects.toThrow(/não foi lido/);
    expect(dublê.estado.chamadas.some((c) => c.op === 'upsert')).toBe(false);
  });

  it('num banco sem a 0009, com a leitura certa, acrescenta ao que já existia', async () => {
    dublê.estado.responder = (c) => {
      if (c.rpc === 'concluir') return { data: null, error: SEM_FUNCAO };
      if (c.tabela === 'users' && c.op === 'select') {
        return { data: { completed_lessons: ['lesson-js-1'], completed_projects: [] }, error: null };
      }
      return { data: null, error: null };
    };

    await markLessonCompleted('u1', 'lesson-js-2');

    const escrita = dublê.estado.chamadas.find((c) => c.op === 'upsert');
    expect(escrita?.corpo).toEqual({ id: 'u1', completed_lessons: ['lesson-js-1', 'lesson-js-2'] });
  });

  it('um erro do banco que não é "função ausente" chega a quem chamou', async () => {
    dublê.estado.responder = () => ({ data: null, error: { code: '42501', message: 'permission denied' } });

    await expect(markLessonCompleted('u1', 'lesson-js-2')).rejects.toThrow(/permission denied/);
    expect(dublê.estado.chamadas.some((c) => c.op === 'upsert')).toBe(false);
  });
});

describe('ler o histórico inteiro', () => {
  const tentativa = (i: number) => ({
    exercise_id: `ex-${i}`,
    lesson_id: 'lesson-js-1',
    concepts: null,
    correct: true,
    hints_used: null,
    created_at: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(),
  });

  it('passa da milésima tentativa, página por página', async () => {
    const total = LINHAS_POR_PAGINA * 2 + 37;
    const todas = Array.from({ length: total }, (_, i) => tentativa(i));
    dublê.estado.responder = (c) => {
      const [de, ate] = c.faixa!;
      // Sem contagem: a leitura precisa parar na primeira página incompleta.
      return { data: todas.slice(de, ate + 1), error: null, count: null };
    };

    const { dados, erro } = await fetchAttempts('u1');

    expect(erro).toBeUndefined();
    expect(dados).toHaveLength(total);
    expect(dados[total - 1].exerciseId).toBe(`ex-${total - 1}`);
    expect(dublê.estado.chamadas.map((c) => c.faixa)).toEqual([
      [0, LINHAS_POR_PAGINA - 1],
      [LINHAS_POR_PAGINA, LINHAS_POR_PAGINA * 2 - 1],
      [LINHAS_POR_PAGINA * 2, LINHAS_POR_PAGINA * 3 - 1],
    ]);
  });

  it('com a contagem, para assim que juntou tudo — mesmo num número redondo', async () => {
    const todas = Array.from({ length: LINHAS_POR_PAGINA }, (_, i) => tentativa(i));
    dublê.estado.responder = (c) => {
      const [de, ate] = c.faixa!;
      return { data: todas.slice(de, ate + 1), error: null, count: c.contar ? todas.length : null };
    };

    const { dados } = await fetchAttempts('u1');

    expect(dados).toHaveLength(LINHAS_POR_PAGINA);
    expect(dublê.estado.chamadas).toHaveLength(1);
  });

  it('preenche os padrões de campos nulos', async () => {
    dublê.estado.responder = () => ({ data: [tentativa(0)], error: null });

    const { dados } = await fetchAttempts('u1');

    expect(dados[0]).toMatchObject({ concepts: [], hintsUsed: 0 });
  });

  it('uma página que falha devolve o que chegou E o aviso de incompleto', async () => {
    dublê.estado.responder = (c) =>
      c.faixa![0] === 0
        ? { data: Array.from({ length: LINHAS_POR_PAGINA }, (_, i) => tentativa(i)), error: null }
        : { data: null, error: { message: 'timeout' } };

    const { dados, erro } = await fetchAttempts('u1');

    expect(dados).toHaveLength(LINHAS_POR_PAGINA);
    expect(erro).toMatch(/tentativas/);
  });

  it('as compras também paginam e avisam a falha', async () => {
    dublê.estado.responder = () => ({ data: null, error: { message: 'Failed to fetch' } });

    const leitura = await fetchPurchases('u1');

    expect(leitura.dados).toEqual([]);
    expect(leitura.erro).toMatch(/compras/);
  });
});

describe('comprar', () => {
  it('passa pela função do banco, que decide o preço', async () => {
    dublê.estado.responder = () => ({
      data: { item: 'tema-oceano', price: 120, created_at: '2026-09-26T12:00:00Z' },
      error: null,
    });

    const resultado = await recordPurchase('u1', 'tema-oceano', 0);

    expect(dublê.estado.chamadas).toEqual([{ rpc: 'comprar_item', args: { p_item: 'tema-oceano' } }]);
    expect(resultado.purchase).toEqual({ item: 'tema-oceano', price: 120, createdAt: '2026-09-26T12:00:00Z' });
  });

  it.each([
    ['saldo_insuficiente', /Moedas insuficientes/],
    ['item_ja_possuido', /já é seu/],
    ['item_indisponivel', /não está disponível/],
  ])('a recusa %s vira uma frase, e nada é inserido por fora', async (codigo, frase) => {
    dublê.estado.responder = () => ({ data: null, error: { code: 'P0001', message: codigo } });

    const resultado = await recordPurchase('u1', 'tema-oceano', 120);

    expect(resultado.error).toMatch(frase);
    expect(dublê.estado.chamadas.some((c) => c.op === 'insert')).toBe(false);
  });

  it('num banco sem a 0009, cai no INSERT antigo', async () => {
    dublê.estado.responder = (c) =>
      c.rpc
        ? { data: null, error: SEM_FUNCAO }
        : { data: { item: 'dobro-de-xp', price: 80, created_at: '2026-09-26T12:00:00Z' }, error: null };

    const resultado = await recordPurchase('u1', 'dobro-de-xp', 80);

    expect(dublê.estado.chamadas.find((c) => c.op === 'insert')?.corpo).toEqual({
      user_id: 'u1',
      item: 'dobro-de-xp',
      price: 80,
    });
    expect(resultado.purchase?.price).toBe(80);
  });
});

describe('o desempenho do painel de administração', () => {
  it('vem do agregado do banco, não das linhas dos alunos', async () => {
    dublê.estado.responder = () => ({
      data: [{ exercise_id: 'e1', lesson_id: 'l1', attempts: 4, correct_attempts: 2, students: 2, students_solved: 1, accuracy_percent: '50.0', avg_hints_used: '0.5', attempts_per_student: '2.00' }],
      error: null,
    });

    const linhas = await fetchExercisePerformance();

    expect(dublê.estado.chamadas).toEqual([{ rpc: 'desempenho_por_exercicio', args: undefined }]);
    expect(linhas[0]).toMatchObject({ exerciseId: 'e1', accuracyPercent: 50, avgHintsUsed: 0.5 });
  });

  it('num banco sem a 0009, lê a view antiga', async () => {
    dublê.estado.responder = (c) => (c.rpc ? { data: null, error: SEM_FUNCAO } : { data: [], error: null });

    await fetchExercisePerformance();

    expect(dublê.estado.chamadas.map((c) => c.rpc ?? c.tabela)).toEqual(['desempenho_por_exercicio', 'exercise_performance']);
  });
});

describe('a tentativa e o que foi respondido (Caderno de Erros)', () => {
  const base = { exerciseId: 'ex-1', lessonId: 'aula-1', concepts: ['laços'], hintsUsed: 0 };
  const inserts = () => dublê.estado.chamadas.filter((c) => c.op === 'insert').map((c) => c.corpo as Record<string, unknown>);

  it('errou: a resposta e o retorno vão junto, já cortados', async () => {
    await recordAttempt('u1', {
      ...base,
      correct: false,
      resposta: { tipo: 'codigo', codigo: 'x'.repeat(10_000) },
      feedback: '  Esperado 2, recebido 1.  ',
    });

    const [corpo] = inserts();
    expect((corpo.resposta as { codigo: string }).codigo.length).toBeLessThan(10_000);
    expect(corpo.feedback).toBe('Esperado 2, recebido 1.');
  });

  it('acertou: só o fato — o caderno só mostra erro', async () => {
    await recordAttempt('u1', { ...base, correct: true, resposta: { tipo: 'alternativa', indice: 1 }, feedback: 'ok' });

    const [corpo] = inserts();
    expect(corpo).not.toHaveProperty('resposta');
    expect(corpo).not.toHaveProperty('feedback');
  });

  it('banco sem a 0010: grava a tentativa de novo, sem a resposta', async () => {
    // A tentativa conta para sequência, XP e domínio; perder a evidência não
    // pode levar o fato junto.
    dublê.estado.responder = (c) =>
      c.op === 'insert' && (c.corpo as Record<string, unknown>).resposta
        ? { data: null, error: { code: 'PGRST204', message: "Could not find the 'resposta' column of 'exercise_attempts'" } }
        : { data: null, error: null };

    await recordAttempt('u1', { ...base, correct: false, resposta: { tipo: 'alternativa', indice: 1 } });

    const feitos = inserts();
    expect(feitos).toHaveLength(2);
    expect(feitos[1]).not.toHaveProperty('resposta');
    expect(feitos[1]).toMatchObject({ exercise_id: 'ex-1', correct: false });
  });

  it('resposta acima do teto do banco: também grava sem ela', async () => {
    dublê.estado.responder = (c) =>
      c.op === 'insert' && (c.corpo as Record<string, unknown>).resposta
        ? { data: null, error: { code: '23514', message: 'new row violates check constraint "exercise_attempts_resposta_formato"' } }
        : { data: null, error: null };

    await recordAttempt('u1', { ...base, correct: false, resposta: { tipo: 'codigo', codigo: '\u0001'.repeat(4000) } });

    expect(inserts()).toHaveLength(2);
  });

  it('qualquer outra recusa não vira segunda gravação', async () => {
    // O ritmo estourado, a rede: tentar de novo sem a resposta não resolveria,
    // e dobraria a escrita.
    dublê.estado.responder = () => ({ data: null, error: { code: '54000', message: 'ritmo_excedido' } });

    await recordAttempt('u1', { ...base, correct: false, resposta: { tipo: 'alternativa', indice: 1 } });

    expect(inserts()).toHaveLength(1);
  });

  it('a leitura traz o que foi respondido e recusa o que não tem formato', async () => {
    dublê.estado.responder = () => ({
      data: [
        { exercise_id: 'ex-1', resposta: { tipo: 'linha', linha: 3 }, feedback: 'O sintoma.', created_at: '2026-03-02' },
        { exercise_id: 'ex-2', resposta: { tipo: 'inventado' }, feedback: null, created_at: '2026-03-01' },
      ],
      error: null,
      count: 2,
    });

    const { dados, erro } = await fetchEvidencias('u1');

    expect(erro).toBeUndefined();
    expect(dados.map((d) => d.resposta)).toEqual([{ tipo: 'linha', linha: 3 }, null]);
    expect(dados[0].feedback).toBe('O sintoma.');
  });

  it('banco sem a 0010: a leitura volta vazia e sem erro — não há o que mostrar, e isso não é falha', async () => {
    dublê.estado.responder = () => ({
      data: null,
      error: { code: '42703', message: 'column exercise_attempts.resposta does not exist' },
    });

    expect(await fetchEvidencias('u1')).toEqual({ dados: [] });
  });

  it('uma falha de rede, sim, é dita', async () => {
    dublê.estado.responder = () => ({ data: null, error: { message: 'Failed to fetch' } });

    expect((await fetchEvidencias('u1')).erro).toMatch(/Não foi possível/);
  });
});
