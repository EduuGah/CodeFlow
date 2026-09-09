import type { Page } from '@playwright/test';

import { getLesson } from '../src/content';
import { buildLessonSteps } from '../src/client/lib/lesson-steps';
import { AULA_CURTA, concluirAula, expect, irAteOEditor, test } from './fixtures';

/**
 * Do aluno logado até a lição concluída, na aplicação de verdade.
 *
 * É o percurso que nenhum teste anterior cobria de ponta a ponta: o código do
 * aluno roda no Web Worker de verdade, os testes do exercício rodam de verdade, e
 * o progresso vai de verdade para a camada de persistência — que aqui é o dublê,
 * onde dá para inspecionar exatamente o que foi gravado.
 *
 * A solução é escrita no modelo do Monaco em vez de digitada. Digitar disputaria
 * com a indentação automática e o fechamento de parênteses do editor, e o que
 * está sob teste é o caminho do exercício, não a mecânica de digitação.
 */

const AULA = 'lesson-js-4';

// O Monaco vem do CDN em tempo de execução; o padrão de 30s não cobre a primeira
// carga somada à execução do worker.
test.setTimeout(120_000);

/**
 * Em série, e não em paralelo.
 *
 * Os testes deste arquivo executam código no sandbox, que tem limite de 3
 * segundos. As soluções de referência levam algumas dezenas de milissegundos —
 * medido: 54ms a mais lenta —, então o limite não é apertado para o aluno. Mas
 * dois destes rodando ao mesmo tempo na mesma máquina, somados ao Monaco
 * carregando do CDN, chegavam a estourar os 3s e reprovar por contenção de CPU,
 * não por defeito. O relatório dizia "laço que nunca termina" para uma solução
 * correta.
 */
test.describe.configure({ mode: 'serial' });

/**
 * O exercício de código da aula, tirado do próprio conteúdo.
 *
 * Lança em vez de pular o teste: se a aula deixar de ter exercício de código, o
 * percurso mais importante do produto passaria a não ser testado em silêncio.
 */
function exercicioDeCodigo(aula: string) {
  for (const passo of buildLessonSteps(getLesson(aula)!)) {
    if (passo.kind === 'exercise' && passo.exercise.type === 'code') return passo.exercise;
  }

  throw new Error(`${aula} não tem exercício de código; escolha outra aula para este teste`);
}

/** Quantos exercícios a aula tem — a conta que decide se ela foi concluída. */
function quantosExercicios(aula: string): number {
  return buildLessonSteps(getLesson(aula)!).filter((p) => p.kind === 'exercise').length;
}

async function escreverNoEditor(page: Page, codigo: string) {
  await page.evaluate((valor) => {
    const monaco = (
      window as unknown as {
        monaco?: { editor: { getModels(): Array<{ setValue(v: string): void }> } };
      }
    ).monaco;
    if (!monaco) throw new Error('monaco não exposto na window');
    monaco.editor.getModels()[0].setValue(valor);
  }, codigo);
}

test('resolver um exercício grava a tentativa e libera o avanço', async ({
  logado: page,
  banco,
}) => {
  const exercicio = exercicioDeCodigo(AULA);

  await page.goto(`/lesson/${AULA}`);
  await irAteOEditor(page);

  // A solução de referência do próprio conteúdo, a mesma que o CI usa para provar
  // que o exercício é resolvível.
  await escreverNoEditor(page, `${exercicio.initialCode}\n${exercicio.solution}`);
  await page.getByRole('button', { name: 'Executar código' }).click();

  // Cada teste e cada propriedade viram um item; o Web Worker é o de verdade.
  const itens = page.locator('ul li');
  await expect(itens.first()).toBeVisible({ timeout: 20_000 });
  await expect(itens).toHaveCount(exercicio.tests.length + (exercicio.properties?.length ?? 0));

  await expect(page.getByText('Todos os testes passaram')).toBeVisible();

  // A dica sai de cena quando o exercício é resolvido — consequência observável
  // de `passouTudo`, e sinal de que a execução foi lida como acerto.
  await expect(page.getByRole('button', { name: /Precisa de uma dica/ })).toHaveCount(0);

  // O rodapé para de oferecer "pular" a quem acabou de acertar. Era este o
  // defeito: dois dos quatro tipos de exercício nunca chegavam aqui.
  await expect(page.getByRole('button', { name: 'Continuar', exact: true })).toBeVisible();

  // Confetes e um selo verde não são progresso: o que conta é o que chegou ao
  // banco. Foi exatamente esse tipo de "conclusão" falsa que já apareceu aqui.
  await expect
    .poll(
      () =>
        banco.escritas.filter(
          (e) =>
            e.tabela === 'exercise_attempts' &&
            (e.corpo as { correct?: boolean })?.correct === true
        ).length,
      { timeout: 15_000, message: 'nenhuma tentativa correta registrada' }
    )
    .toBeGreaterThan(0);

  // E a aula NÃO é dada por concluída: ela tem outros exercícios em aberto.
  // Antes bastava o primeiro acerto para marcar a aula inteira como feita.
  expect(quantosExercicios(AULA)).toBeGreaterThan(1);
  expect(
    banco.escritas.filter((e) => e.tabela === 'users'),
    'aula concluída com apenas um exercício resolvido'
  ).toEqual([]);
});

test('resolver todos os exercícios conclui a aula e grava o progresso', async ({
  logado: page,
  banco,
}) => {
  const total = quantosExercicios(AULA_CURTA);

  // O percurso vive no fixtures, e não aqui, porque três specs precisam dele.
  // A cópia local que existia antes ficou para trás quando a aula alvo ganhou
  // exercícios de tipos novos, e o teste passou a falhar longe da causa.
  await concluirAula(page, AULA_CURTA);

  // O contador do cabeçalho fecha.
  await expect(page.getByLabel(`${total} de ${total} exercícios resolvidos`)).toBeVisible();

  // E a conclusão chega ao banco — não só à tela.
  await expect
    .poll(
      () =>
        banco.escritas.some(
          (e) =>
            e.tabela === 'users' &&
            ((e.corpo as { completed_lessons?: string[] })?.completed_lessons ?? []).includes(
              AULA_CURTA
            )
        ),
      { timeout: 15_000, message: `escritas: ${JSON.stringify(banco.escritas)}` }
    )
    .toBe(true);

  await expect(page.getByText('Aula concluída')).toBeVisible();
});

test('errar registra a tentativa e não conclui a aula', async ({ logado: page, banco }) => {
  await page.goto(`/lesson/${AULA}`);
  await irAteOEditor(page);

  await escreverNoEditor(page, '// nada que resolva\n');

  await page.getByRole('button', { name: /Executar código|Executar de novo/ }).click();
  await expect(page.getByRole('button', { name: /Executar de novo/ })).toBeEnabled({
    timeout: 10_000,
  });

  await expect(page.getByText('Aula concluída')).toHaveCount(0);

  // O avanço continua liberado, e a frase não finge que o exercício fechou.
  await expect(page.getByRole('button', { name: 'Continuar assim mesmo' })).toBeVisible();

  // A tentativa errada é evidência tão útil quanto a certa: é dela que sai o
  // sinal de exercício com enunciado confuso.
  await expect
    .poll(() => banco.escritas.filter((e) => e.tabela === 'exercise_attempts').length, {
      timeout: 10_000,
    })
    .toBeGreaterThan(0);

  const escritasDeAula = banco.escritas.filter((e) => e.tabela === 'users');
  expect(escritasDeAula, 'aula marcada como concluída sem resolver nada').toEqual([]);
});

test('o resumo não afirma conclusão de quem pulou os exercícios', async ({
  logado: page,
  banco,
}) => {
  const passos = buildLessonSteps(getLesson(AULA)!);

  await page.goto(`/lesson/${AULA}`);

  for (let i = 1; i < passos.length; i++) {
    await page
      .getByRole('button', { name: /Continuar assim mesmo|Continuar|Pular por ora/ })
      .click();
  }

  await expect(page.getByText('Aula concluída')).toHaveCount(0);
  await expect(
    page.getByText(`Faltam ${quantosExercicios(AULA)} exercícios para fechar esta aula`)
  ).toBeVisible();

  expect(banco.escritas.filter((e) => e.tabela === 'users')).toEqual([]);
});
