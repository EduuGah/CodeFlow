import { expect, test as base, type Page } from '@playwright/test';

import type { Exercise, LanguageId } from '../src/content/types';
import { ITENS } from '../src/client/lib/economia';

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
  /** Tentativas já registradas, para semear histórico (moedas, desafios, sequência). */
  attempts: Array<{
    exercise_id: string;
    lesson_id: string;
    concepts: string[];
    correct: boolean;
    hints_used: number;
    created_at: string;
  }>;
  /** Compras já feitas na loja. */
  purchases: Array<{ item: string; price: number; created_at: string }>;
  /** O perfil editável. */
  perfil: { display_name: string | null; avatar: string | null; theme: string | null; accent: string | null };
  /** Escritas registradas, para o teste conferir que o progresso foi salvo. */
  escritas: Array<{ tabela: string; corpo: unknown }>;
  /** Caminhos cuja leitura falha (500), para os testes de rede ruim. */
  falhas: string[];
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

    if (metodo === 'GET' && banco.falhas.includes(caminho)) {
      return json({ message: 'falha simulada' }, 500);
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
            ...banco.perfil,
          },
        ]);
      }

      // upsert de progresso ou de perfil
      const corpo = requisicao.postDataJSON();
      banco.escritas.push({ tabela: 'users', corpo });

      const linha = Array.isArray(corpo) ? corpo[0] : corpo;
      if (linha?.completed_lessons) banco.completed_lessons = linha.completed_lessons;
      if (linha?.completed_projects) banco.completed_projects = linha.completed_projects;
      for (const campo of ['display_name', 'avatar', 'theme', 'accent'] as const) {
        if (campo in (linha ?? {})) banco.perfil[campo] = linha[campo];
      }

      return json([linha]);
    }

    if (caminho === '/rest/v1/exercise_attempts') {
      if (metodo === 'GET') return json(banco.attempts);
      banco.escritas.push({ tabela: 'exercise_attempts', corpo: requisicao.postDataJSON() });
      return json([], 201);
    }

    if (caminho === '/rest/v1/purchases') {
      if (metodo === 'GET') return json(banco.purchases);
      const corpo = requisicao.postDataJSON();
      const linha = { ...(Array.isArray(corpo) ? corpo[0] : corpo), created_at: new Date().toISOString() };
      banco.purchases.push({ item: linha.item, price: linha.price, created_at: linha.created_at });
      banco.escritas.push({ tabela: 'purchases', corpo: linha });
      return json(linha, 201);
    }

    // O envio da foto: o Storage responde o caminho, e a URL pública é montada
    // no cliente sem requisição.
    if (caminho.startsWith('/storage/v1/object/avatars/')) {
      banco.escritas.push({ tabela: 'storage:avatars', corpo: { caminho, bytes: requisicao.postDataBuffer()?.length ?? 0 } });
      return json({ Key: caminho.replace('/storage/v1/object/', '') });
    }

    if (caminho === '/rest/v1/flashcard_reviews') {
      if (metodo === 'GET') return json([]);
      banco.escritas.push({ tabela: 'flashcard_reviews', corpo: requisicao.postDataJSON() });
      return json([], 201);
    }

    if (caminho === '/rest/v1/exercise_performance') {
      return json([]);
    }

    // As funções da 0009, com a mesma regra do banco: concluir acrescenta sem
    // duplicar; comprar lê o preço do catálogo e recusa cosmético repetido.
    if (caminho === '/rest/v1/rpc/concluir') {
      const { p_coluna, p_id } = requisicao.postDataJSON() as { p_coluna: string; p_id: string };
      const lista = p_coluna === 'completed_projects' ? banco.completed_projects : banco.completed_lessons;
      if (!lista.includes(p_id)) lista.push(p_id);
      // Registrada como a linha de `users` fica depois dela: é isso que os
      // testes conferem ("a aula chegou ao banco"), seja qual for o caminho.
      banco.escritas.push({ tabela: 'users', corpo: { [p_coluna]: [...lista] } });
      return json(lista);
    }

    if (caminho === '/rest/v1/rpc/comprar_item') {
      const { p_item } = requisicao.postDataJSON() as { p_item: string };
      const item = ITENS.find((i) => i.id === p_item);
      if (!item) return json({ code: 'P0001', message: 'item_indisponivel' }, 400);
      if (item.tipo !== 'consumivel' && banco.purchases.some((p) => p.item === p_item)) {
        return json({ code: 'P0001', message: 'item_ja_possuido' }, 400);
      }
      const linha = { item: item.id, price: item.price, created_at: new Date().toISOString() };
      banco.purchases.push(linha);
      banco.escritas.push({ tabela: 'purchases', corpo: linha });
      return json(linha);
    }

    if (caminho === '/rest/v1/rpc/desempenho_por_exercicio') {
      return json([]);
    }

    // Rota não prevista: falha alto em vez de fingir que deu certo.
    return json({ message: `rota não dublada: ${metodo} ${caminho}` }, 500);
  });
}

export const test = base.extend<{ banco: BancoFalso; logado: Page }>({
  banco: async ({}, use) => {
    await use({
      role: 'student',
      completed_lessons: [],
      completed_projects: [],
      attempts: [],
      purchases: [],
      perfil: { display_name: null, avatar: null, theme: null, accent: null },
      escritas: [],
      falhas: [],
    });
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
  // Desde que "Pular por ora" saiu, os exercícios do caminho precisam ser
  // respondidos: o helper resolve cada um até chegar ao primeiro que abre o
  // editor. A aula vem da URL, para quem chama não precisar repeti-la.
  await irAteOExercicio(page, (e) => e.type === 'code' || e.type === 'sql' || e.type === 'refactor' || e.type === 'write-test');

  // "Executar código" no sandbox de JavaScript; "Rodar a página" no motor de
  // página. Os dois são o mesmo passo para quem navega.
  const executar = page.getByRole('button', {
    name: /^(Executar código|Rodar a página|Rodar o componente|Executar consulta|Rodar os testes|Rodar meus testes)$/,
  });
  await executar.waitFor({ timeout: 15_000 });
  // Em desenvolvimento o Monaco são centenas de módulos servidos pelo Vite, e
  // o outro worker do Playwright disputa o mesmo servidor — com a trilha da
  // página inteira na suíte, 40s já não bastaram numa máquina ocupada. O
  // limite real é o `setTimeout` de cada teste; este só existe para a falha
  // dizer "o editor não montou" em vez de estourar o teste sem explicação.
  await page.locator('.monaco-editor').first().waitFor({ timeout: 90_000 });

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

export { expect };

/** O botão do rodapé que leva ao passo seguinte — liberado ou não. */
export function botaoDeAvanco(page: Page) {
  return page.getByRole('button', { name: /^(Continuar|Continuar assim mesmo|Responda para continuar)$/ });
}

/** A aula que está aberta, pela URL. */
function aulaAberta(page: Page): string {
  const id = new URL(page.url()).pathname.match(/\/lesson\/([^/]+)/)?.[1];
  if (!id) throw new Error(`não há aula aberta em ${page.url()}`);
  return id;
}

/**
 * Anda pela aula aberta até o primeiro exercício que satisfaz `alvo`,
 * resolvendo os exercícios do caminho — sem "Pular por ora", é assim que se
 * chega a um passo no meio da aula. Para na tela do exercício alvo, sem
 * respondê-lo.
 */
export async function irAteOExercicio(page: Page, alvo: (e: Exercise) => boolean): Promise<void> {
  const { getLesson } = await import('../src/content');
  const { buildLessonSteps } = await import('../src/client/lib/lesson-steps');
  const aula = getLesson(aulaAberta(page))!;
  const passos = buildLessonSteps(aula);
  await page.getByText(/Passo 1 de/).waitFor();

  for (const passo of passos) {
    if (passo.kind === 'exercise') {
      if (alvo(passo.exercise)) return;
      await resolverExercicio(page, passo.exercise, aula.language);
    }
    await botaoDeAvanco(page).click();
  }
  throw new Error(`${aula.id} não tem o exercício pedido`);
}

/**
 * Responde o exercício da tela errado, de propósito — o que um aluno que
 * não sabe faria — para o avanço liberar sem o exercício contar como
 * resolvido. É o oposto de `resolverExercicio`, e serve aos testes que
 * provam que passar não é resolver.
 */
export async function responderErrado(page: Page, exercicio: Exercise): Promise<void> {
  switch (exercicio.type) {
    case 'multiple-choice': {
      await page.getByRole('radio').nth(exercicio.correctIndex === 0 ? 1 : 0).check();
      await page.getByRole('button', { name: 'Verificar resposta' }).click();
      break;
    }
    case 'predict-output': {
      await page.getByRole('textbox', { name: /O que você acha que será impresso/ }).fill('errado de propósito');
      await page.getByRole('button', { name: /Executar e comparar/ }).click();
      break;
    }
    case 'fill-blank': {
      for (const campo of await page.getByRole('textbox', { name: /^Lacuna \d+ de / }).all()) {
        await campo.fill('x');
      }
      await page.getByRole('button', { name: 'Verificar' }).click();
      break;
    }
    case 'order-steps': {
      await page.getByRole('button', { name: /Verificar ordem/ }).click();
      break;
    }
    case 'find-bug': {
      const linhaErrada = exercicio.buggyLine === 1 ? 2 : 1;
      const radio = page.getByRole('radio', { name: new RegExp(`^Linha ${linhaErrada}:`) });
      await page.locator('label').filter({ has: radio }).click();
      await page.getByRole('button', { name: /Apontar a linha|Verificar de novo/ }).click();
      break;
    }
    case 'code':
    case 'sql':
    case 'refactor':
    case 'write-test':
    case 'server': {
      await escreverNoEditor(page, '// errado de propósito');
      await page
        .getByRole('button', {
          name: /Executar código|Rodar a página|Rodar o componente|Executar consulta|Rodar os testes|Rodar meus testes|Rodar o servidor/,
        })
        .click();
      break;
    }
    default: {
      const tipo: never = exercicio;
      throw new Error(`responderErrado não sabe o tipo ${(tipo as { type: string }).type}`);
    }
  }
  // Errou, e o rodapé diz isso.
  await page.getByRole('button', { name: 'Continuar assim mesmo' }).waitFor({ timeout: 90_000 });
}

/** Passa pela aula aberta inteira sem resolver nada: responde errado e segue. */
export async function passarPelaAula(page: Page): Promise<void> {
  const { getLesson } = await import('../src/content');
  const { buildLessonSteps } = await import('../src/client/lib/lesson-steps');
  const passos = buildLessonSteps(getLesson(aulaAberta(page))!);
  await page.getByText(/Passo 1 de/).waitFor();

  for (let i = 0; i < passos.length - 1; i++) {
    const passo = passos[i];
    if (passo.kind === 'exercise') await responderErrado(page, passo.exercise);
    await botaoDeAvanco(page).click();
  }
}

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

  const aula = getLesson(aulaId)!;
  const passos = buildLessonSteps(aula);
  await page.goto(`/lesson/${aulaId}`);

  for (const passo of passos) {
    if (passo.kind === 'exercise') {
      await resolverExercicio(page, passo.exercise, aula.language);
    }

    const avancar = botaoDeAvanco(page);
    if (await avancar.count()) await avancar.click();
  }
}

/** Espera o Monaco existir e ter um modelo, e escreve o código nele. */
export async function escreverNoEditor(page: Page, codigo: string): Promise<void> {
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

export async function resolverExercicio(
  page: Page,
  exercicio: Exercise,
  linguagem: LanguageId = 'javascript'
): Promise<void> {
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
      // Em TypeScript a primeira previsão da aula ainda carrega o compilador.
      await page.getByText('Previsão correta').waitFor({ timeout: 60_000 });
      return;
    }

    case 'fill-blank': {
      if (!exercicio.solution) {
        throw new Error(`${exercicio.id} não tem solução de referência`);
      }

      // Uma lacuna pode aparecer duas vezes no molde (a tag que abre e a que
      // fecha): os dois campos espelham a mesma resposta, e preencher o
      // primeiro de cada número basta.
      for (let i = 0; i < exercicio.solution.length; i++) {
        await page
          .getByRole('textbox', { name: new RegExp(`^Lacuna ${i + 1} de `) })
          .first()
          .fill(exercicio.solution[i]);
      }

      await page.getByRole('button', { name: 'Verificar' }).click();
      await page.getByText('Resposta correta').waitFor({ timeout: 40_000 });
      return;
    }

    case 'order-steps': {
      // Sobe cada passo até a posição dele, um de cada vez — que é exatamente o
      // que o aluno faz. A ordem certa vem do próprio conteúdo.
      // Sem as crases: a tela mostra os nomes de código em monoespaçada, e o
      // texto que se lê de volta é o texto limpo.
      const certa = [...exercicio.steps]
        .sort((a, b) => a.ordem - b.ordem)
        .map((p) => p.text.replace(/`/g, ''));

      const naTela = () =>
        page.locator('ol li span.flex-1').allTextContents().then((t) => t.map((x) => x.trim()));

      for (let alvo = 0; alvo < certa.length; alvo++) {
        for (let guarda = 0; guarda < certa.length + 1; guarda++) {
          const atual = await naTela();
          const onde = atual.indexOf(certa[alvo]);
          if (onde <= alvo) break;

          await page.getByRole('button', { name: `Mover "${certa[alvo]}" para cima` }).click();
        }
      }

      await page.getByRole('button', { name: /Verificar ordem/ }).click();
      await page.getByText('Sequência correta').waitFor({ timeout: 10_000 });
      return;
    }

    case 'code': {
      if (!exercicio.solution) {
        throw new Error(`${exercicio.id} não tem solução de referência`);
      }

      if (exercicio.runtime === 'iframe') {
        // A solução de página é o documento inteiro: somá-la ao esqueleto
        // duplicaria os elementos.
        await escreverNoEditor(page, exercicio.solution);
        await page.getByRole('button', { name: /Rodar a página|Rodar de novo/ }).click();
      } else if (linguagem === 'react') {
        // Um componente também é o programa inteiro.
        await escreverNoEditor(page, exercicio.solution);
        await page.getByRole('button', { name: /Rodar o componente|Rodar de novo/ }).click();
      } else if (linguagem === 'typescript') {
        // Em TypeScript a solução também é o programa inteiro: o compilador
        // recusa a mesma função declarada duas vezes.
        await escreverNoEditor(page, exercicio.solution);
        await page.getByRole('button', { name: /Executar código|Executar de novo/ }).click();
      } else {
        await escreverNoEditor(page, `${exercicio.initialCode}\n${exercicio.solution}`);
        await page.getByRole('button', { name: /Executar código|Executar de novo/ }).click();
      }
      // Na primeira execução da aula o compilador e o React embutido ainda estão chegando.
      await page.getByText('Todos os testes passaram').waitFor({ timeout: 90_000 });
      return;
    }

    case 'sql': {
      await escreverNoEditor(page, exercicio.solution);
      await page.getByRole('button', { name: /Executar consulta|Executar de novo/ }).click();
      // Na primeira execução da aula o SQLite em WebAssembly ainda está chegando.
      await page.getByText('As linhas são as esperadas').waitFor({ timeout: 90_000 });
      return;
    }

    case 'server': {
      await escreverNoEditor(page, exercicio.solution);
      await page.getByRole('button', { name: /Rodar o servidor|Executar código|Rodar de novo|Executar de novo/ }).click();
      await page
        .getByText(/O servidor respondeu tudo como esperado|Todos os testes passaram/)
        .waitFor({ timeout: 40_000 });
      return;
    }

    case 'refactor': {
      if (!exercicio.solution) {
        throw new Error(`${exercicio.id} não tem solução de referência`);
      }

      await escreverNoEditor(page, exercicio.solution);
      await page.getByRole('button', { name: /Rodar os testes|Rodar de novo/ }).click();
      await page.getByText('Mesma coisa, escrita melhor').waitFor({ timeout: 40_000 });
      return;
    }

    case 'find-bug': {
      // Clica na linha inteira (o <label>), como o aluno faz — e não no rádio,
      // que é `sr-only`: um ponto de 1px em cima do número da linha, onde o
      // Playwright encontra o número interceptando o clique e tenta para sempre.
      const radio = page.getByRole('radio', { name: new RegExp(`^Linha ${exercicio.buggyLine}:`) });
      await page.locator('label').filter({ has: radio }).click();
      await expect(radio).toBeChecked();
      await page.getByRole('button', { name: /Apontar a linha|Verificar de novo/ }).click();
      await page
        .getByText(`A linha ${exercicio.buggyLine} é a que precisa mudar`)
        .waitFor({ timeout: 10_000 });
      return;
    }

    case 'write-test': {
      if (!exercicio.solution) {
        throw new Error(`${exercicio.id} não tem teste de referência`);
      }

      await escreverNoEditor(page, exercicio.solution);
      await page.getByRole('button', { name: /Rodar meus testes|Rodar de novo/ }).click();
      await page.getByText('Seus testes pegam todos os defeitos').waitFor({ timeout: 40_000 });
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
