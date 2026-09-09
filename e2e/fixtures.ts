import { test as base, type Page } from '@playwright/test';

import type { Exercise } from '../src/content/types';

/**
 * Um aluno logado, sem Supabase de verdade.
 *
 * O login real é OAuth do Google: não há como automatizá-lo sem uma conta de
 * teste e credenciais no CI, e nem deveria — o que se quer testar é a aplicação
 * depois do login, não o consentimento do Google.
 *
 * Então a sessão é semeada no `localStorage` no formato que o supabase-js espera,
 * e toda chamada de rede ao projeto é interceptada. O efeito colateral bom é que
 * nenhum teste consegue escrever no banco de ninguém.
 */

const PROJETO = 'e2e-codeflow';
const CHAVE_DE_SESSAO = `sb-${PROJETO}-auth-token`;

export const ALUNO = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'aluno@e2e.local',
  nome: 'Aluno de Teste',
};

/** Estado do banco durante um teste. Cada teste começa com o seu. */
export interface BancoFalso {
  /** O papel do aluno. Trocar para 'admin' exercita a área de administração. */
  role: 'student' | 'admin';
  completed_lessons: string[];
  completed_projects: string[];
  /** Escritas registradas, para o teste conferir que o progresso foi salvo. */
  escritas: Array<{ tabela: string; corpo: unknown }>;
}

/**
 * O supabase-js decodifica o access_token para ler a expiração. Uma string
 * qualquer o faz descartar a sessão e redirecionar para o login — daí um JWT de
 * formato válido, sem assinatura verificável, que é tudo que o cliente precisa.
 */
function jwtFalso(expira: number): string {
  const b64 = (o: unknown) =>
    Buffer.from(JSON.stringify(o))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const cabecalho = b64({ alg: 'HS256', typ: 'JWT' });
  const conteudo = b64({
    sub: ALUNO.id,
    email: ALUNO.email,
    aud: 'authenticated',
    role: 'authenticated',
    iat: expira - 3600,
    exp: expira,
  });

  return `${cabecalho}.${conteudo}.assinatura-de-teste`;
}

function sessaoFalsa() {
  const expira = Math.floor(Date.now() / 1000) + 60 * 60;

  return {
    access_token: jwtFalso(expira),
    refresh_token: 'refresh-de-teste',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: expira,
    user: {
      id: ALUNO.id,
      aud: 'authenticated',
      role: 'authenticated',
      email: ALUNO.email,
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: { provider: 'google', providers: ['google'] },
      user_metadata: { full_name: ALUNO.nome, email: ALUNO.email },
      identities: [],
    },
  };
}

/**
 * Intercepta o projeto Supabase inteiro.
 *
 * Responde só o que a aplicação usa. Uma rota não prevista devolve 500 de
 * propósito: um teste que passa porque uma chamada silenciosamente virou `[]`
 * esconde exatamente o defeito que ele deveria pegar.
 */
async function dublarSupabase(page: Page, banco: BancoFalso) {
  await page.route(`https://${PROJETO}.supabase.co/**`, async (rota) => {
    const requisicao = rota.request();
    const url = new URL(requisicao.url());
    const caminho = url.pathname;
    const metodo = requisicao.method();

    const json = (corpo: unknown, status = 200) =>
      rota.fulfill({
        status,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(corpo),
      });

    if (metodo === 'OPTIONS') {
      return rota.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': '*',
          'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
        },
      });
    }

    if (caminho.startsWith('/auth/v1/user')) {
      return json(sessaoFalsa().user);
    }

    if (caminho.startsWith('/auth/v1/token')) {
      return json(sessaoFalsa());
    }

    if (caminho.startsWith('/auth/v1/logout')) {
      return json({});
    }

    if (caminho === '/rest/v1/users') {
      if (metodo === 'GET') {
        return json([
          {
            id: ALUNO.id,
            email: ALUNO.email,
            name: ALUNO.nome,
            role: banco.role,
            completed_lessons: banco.completed_lessons,
            completed_projects: banco.completed_projects,
          },
        ]);
      }

      // upsert de progresso
      const corpo = requisicao.postDataJSON();
      banco.escritas.push({ tabela: 'users', corpo });

      const linha = Array.isArray(corpo) ? corpo[0] : corpo;
      if (linha?.completed_lessons) banco.completed_lessons = linha.completed_lessons;
      if (linha?.completed_projects) banco.completed_projects = linha.completed_projects;

      return json([linha]);
    }

    if (caminho === '/rest/v1/exercise_attempts') {
      if (metodo === 'GET') return json([]);
      banco.escritas.push({ tabela: 'exercise_attempts', corpo: requisicao.postDataJSON() });
      return json([], 201);
    }

    if (caminho === '/rest/v1/flashcard_reviews') {
      if (metodo === 'GET') return json([]);
      banco.escritas.push({ tabela: 'flashcard_reviews', corpo: requisicao.postDataJSON() });
      return json([], 201);
    }

    if (caminho === '/rest/v1/exercise_performance') {
      return json([]);
    }

    // Rota não prevista: falha alto em vez de fingir que deu certo.
    return json({ message: `rota não dublada: ${metodo} ${caminho}` }, 500);
  });
}

export const test = base.extend<{ banco: BancoFalso; logado: Page }>({
  banco: async ({}, use) => {
    await use({ role: 'student', completed_lessons: [], completed_projects: [], escritas: [] });
  },

  logado: async ({ page, banco }, use) => {
    await dublarSupabase(page, banco);

    // A sessão precisa existir antes do primeiro script da página rodar, senão o
    // ProtectedRoute redireciona para /login antes de o Supabase responder.
    await page.addInitScript(
      ([chave, sessao]) => {
        window.localStorage.setItem(chave as string, JSON.stringify(sessao));
      },
      [CHAVE_DE_SESSAO, sessaoFalsa()] as const
    );

    await use(page);
  },
});

/**
 * Espera a tela sair do estado de carregamento.
 *
 * `main` existir não basta: as telas mostram esqueletos enquanto buscam o
 * progresso do aluno. Um teste que lê a página nesse instante encontra caixas
 * cinzas, não acha nada errado, e passa — que é o pior modo de falha.
 */
export async function esperarConteudo(page: Page): Promise<void> {
  await page.getByRole('main').waitFor();
  await page.locator('[data-carregando]').waitFor({ state: 'detached', timeout: 15_000 });
}

/**
 * Avança pelos passos de uma aula até o editor de código estar pronto para uso.
 *
 * O passo se reconhece pelo botão "Executar código", que renderiza junto com ele.
 * Usar `.monaco-editor` como marca faz o laço passar direto pelo exercício: o
 * editor só aparece segundos depois, quando o Monaco termina de carregar.
 */
export async function irAteOEditor(page: Page): Promise<void> {
  const executar = page.getByRole('button', { name: 'Executar código' });

  for (let i = 0; i < 12 && !(await executar.count()); i++) {
    const acao = page.getByRole('button', {
      name: /Continuar assim mesmo|Continuar|Pular por ora/,
    });
    if (!(await acao.count())) break;
    await acao.click();
  }

  await executar.waitFor({ timeout: 15_000 });
  await page.locator('.monaco-editor').first().waitFor({ timeout: 40_000 });

  // O elemento aparecer não basta: o `setValue` precisa de um modelo existente.
  await page.waitForFunction(
    () => {
      const m = (window as unknown as { monaco?: { editor: { getModels(): unknown[] } } }).monaco;
      return !!m && m.editor.getModels().length > 0;
    },
    undefined,
    { timeout: 40_000 }
  );
}

export { expect } from '@playwright/test';

/**
 * Aula curta, com um exercício de cada tipo que exige verificação.
 *
 * Serve de alvo para tudo que depende de a aula ser **concluída**, e não só de
 * um exercício ser resolvido: a comemoração e a gravação do progresso. Três
 * exercícios é o mínimo que ainda cobre prever-saída, lacuna e código.
 */
export const AULA_CURTA = 'lesson-js-11';

/**
 * Resolve todos os exercícios de uma aula, do jeito que um aluno resolveria.
 *
 * As respostas saem do próprio conteúdo: a alternativa certa vem de
 * `correctIndex`, a saída esperada vem de `expectedOutput`, e o código vem da
 * solução de referência — a mesma que o CI usa para provar que o exercício é
 * resolvível.
 *
 * Um tipo de exercício que este helper não saiba responder **lança**, em vez de
 * ser pulado em silêncio. A versão anterior pulava, e o efeito foi este: uma
 * aula ganhou exercícios de tipos novos, o helper deixou de concluí-la, e o
 * teste passou a falhar numa asserção sobre confete — três passos longe da
 * causa real.
 */
export async function concluirAula(page: Page, aulaId: string): Promise<void> {
  const { getLesson } = await import('../src/content');
  const { buildLessonSteps } = await import('../src/client/lib/lesson-steps');

  const passos = buildLessonSteps(getLesson(aulaId)!);
  await page.goto(`/lesson/${aulaId}`);

  for (const passo of passos) {
    if (passo.kind === 'exercise') {
      await resolverExercicio(page, passo.exercise);
    }

    const avancar = page.getByRole('button', {
      name: /Continuar assim mesmo|Continuar|Pular por ora/,
    });
    if (await avancar.count()) await avancar.click();
  }
}

/** Espera o Monaco existir e ter um modelo, e escreve o código nele. */
async function escreverNoEditor(page: Page, codigo: string): Promise<void> {
  await page.locator('.monaco-editor').first().waitFor({ timeout: 40_000 });
  await page.waitForFunction(
    () => {
      const m = (window as unknown as { monaco?: { editor: { getModels(): unknown[] } } }).monaco;
      return !!m && m.editor.getModels().length > 0;
    },
    undefined,
    { timeout: 40_000 }
  );

  await page.evaluate((valor) => {
    (
      window as unknown as {
        monaco: { editor: { getModels(): Array<{ setValue(v: string): void }> } };
      }
    ).monaco.editor.getModels()[0].setValue(valor);
  }, codigo);
}

async function resolverExercicio(page: Page, exercicio: Exercise): Promise<void> {
  switch (exercicio.type) {
    case 'multiple-choice': {
      await page.getByRole('radio').nth(exercicio.correctIndex).check();
      await page.getByRole('button', { name: 'Verificar resposta' }).click();
      await page.getByText('Resposta correta').waitFor({ timeout: 10_000 });
      return;
    }

    case 'predict-output': {
      await page
        .getByRole('textbox', { name: /O que você acha que será impresso/ })
        .fill(exercicio.expectedOutput);
      await page.getByRole('button', { name: /Executar e comparar/ }).click();
      await page.getByText('Previsão correta').waitFor({ timeout: 30_000 });
      return;
    }

    case 'fill-blank': {
      if (!exercicio.solution) {
        throw new Error(`${exercicio.id} não tem solução de referência`);
      }

      const campos = page.getByRole('textbox', { name: /Lacuna/ });
      for (let i = 0; i < exercicio.solution.length; i++) {
        await campos.nth(i).fill(exercicio.solution[i]);
      }

      await page.getByRole('button', { name: 'Verificar' }).click();
      await page.getByText('Resposta correta').waitFor({ timeout: 40_000 });
      return;
    }

    case 'code': {
      if (!exercicio.solution) {
        throw new Error(`${exercicio.id} não tem solução de referência`);
      }

      await escreverNoEditor(page, `${exercicio.initialCode}\n${exercicio.solution}`);
      await page.getByRole('button', { name: /Executar código|Executar de novo/ }).click();
      await page.getByText('Todos os testes passaram').waitFor({ timeout: 40_000 });
      return;
    }

    default: {
      // Tipo novo no conteúdo e desconhecido aqui: falha alto, com nome.
      const desconhecido = exercicio as { type: string; id: string };
      throw new Error(
        `concluirAula não sabe resolver exercício do tipo "${desconhecido.type}" (${desconhecido.id}). ` +
          'Ensine o helper antes de usar uma aula que contenha esse tipo.'
      );
    }
  }
}
