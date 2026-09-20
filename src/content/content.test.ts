import { beforeAll, describe, expect, it } from 'vitest';

import {
  runProgram,
  TEST_TIMEOUT_MS,
  type SandboxProperty,
  type SandboxTest,
} from '../client/lib/sandbox-core';
import { rodarPaginaNoJsdom } from '../client/lib/pagina-jsdom';
import { compilarNoNode } from '../client/lib/typescript-node';
import { executarSql, type AbrirBanco } from '../client/lib/sql-core';
import { abrirBancoNoNode } from '../client/lib/sql-node';
import { montarCodigoDoServidor } from '../client/lib/servidor-core';
import { BANCOS } from './bancos';
import { ETAPAS_DO_PERCURSO } from './percurso';
import { formatarErros, verificarTrechos, type TrechoDeTipo } from '../client/lib/typescript-core';
import {
  getExercises,
  getLessonsOfTrack,
  getNextLesson,
  getTrackProgress,
  listFlashcards,
  listProjects,
  listTracks,
} from './index';
import { preencher } from '../client/lib/fill-blank';
import { embaralhar, estaOrdenado } from '../client/lib/ordenar';
import { avaliarTestes } from '../client/lib/escrever-teste';
import { corrigirLinha, linhasNumeradas } from '../client/lib/encontrar-bug';
import { avaliarRestricoes, todasCumpridas } from '../client/lib/refatorar';
import type { CodeExercise, Exercise, FillBlankExercise, LanguageId, Lesson, ServerExercise, SqlExercise } from './types';

/**
 * Suíte de integridade do conteúdo.
 *
 * O risco que ela cobre é específico do produto: um exercício com teste errado
 * não quebra a aplicação, ele ensina errado. O aluno escreve a resposta certa e
 * a plataforma diz que está errada — ou pior, aceita uma resposta incorreta.
 * Nada disso aparece num typecheck nem num build.
 *
 * Roda o mesmo `runProgram` que o Web Worker usa em produção, então o que passa
 * aqui é o que vai acontecer no navegador do aluno.
 */

const allLessons: Lesson[] = listTracks().flatMap((track) => getLessonsOfTrack(track.id));
const allExercises: Array<{ lesson: Lesson; exercise: Exercise }> = allLessons.flatMap((lesson) =>
  getExercises(lesson).map((exercise) => ({ lesson, exercise }))
);

/** A linguagem da aula de cada exercício — o exercício em si não a carrega. */
const linguagemDe = new Map<Exercise, LanguageId>(
  allExercises.map(({ lesson, exercise }) => [exercise, lesson.language])
);

const compilar = async (codigo: string) => compilarNoNode(codigo);

/**
 * Roda o código no motor que o exercício declara, na linguagem da aula.
 *
 * `worker` é o sandbox de JavaScript, aqui direto no Node. `iframe` é o motor
 * de página, aqui no jsdom — o mesmo documento que o navegador do aluno
 * recebe, sem layout. Um exercício de página que dependa de layout ou de cor
 * normalizada precisa do E2E, que roda no Chromium.
 *
 * Em aula de TypeScript o código passa antes pelo compilador — o do pacote
 * `typescript`, a mesma versão que o Monaco embute. Recusa vira `error`, como
 * no navegador; aceite vira o JavaScript que entra no sandbox. Os trechos de
 * tipo do exercício entram na mesma lista de resultados.
 */
async function executar(
  exercise: Exercise | { runtime?: 'worker' | 'iframe'; typeTests?: TrechoDeTipo[] },
  codigo: string,
  tests: SandboxTest[],
  properties: SandboxProperty[] = []
) {
  const motor = exercise as { runtime?: 'worker' | 'iframe'; typeTests?: TrechoDeTipo[] };
  const linguagem = linguagemDe.get(exercise as Exercise);

  // React: o TSX compila e o componente é montado no jsdom, com o React
  // embutido — o mesmo documento que o iframe do aluno recebe.
  if (linguagem === 'react') {
    const { js, erros } = compilarNoNode(codigo, { jsx: true });
    if (erros.length > 0) return { logs: [], testResults: [], error: formatarErros(erros) };
    const r = await rodarPaginaNoJsdom(js, tests, 8000, { react: true });
    return { logs: r.logs, testResults: r.testResults, error: r.error };
  }

  if (motor.runtime === 'iframe') {
    const r = await rodarPaginaNoJsdom(codigo, tests);
    return { logs: r.logs, testResults: r.testResults, error: r.error };
  }

  // Node: o mesmo sandbox, com o Node de mentira na frente — `require`,
  // `process`, `module.exports` — e os testes em série.
  if (linguagem === 'node') {
    return runProgram(montarCodigoDoServidor(codigo), tests, properties, { sequencial: true });
  }

  if (linguagem !== 'typescript') {
    return runProgram(codigo, tests, properties);
  }

  const { js, erros } = compilarNoNode(codigo);
  if (erros.length > 0) return { logs: [], testResults: [], error: formatarErros(erros) };

  const resultado = await runProgram(js, tests, properties);
  if (!motor.typeTests?.length || resultado.error) return resultado;

  const trechos = await verificarTrechos(compilar, codigo, motor.typeTests);
  return { ...resultado, testResults: [...resultado.testResults, ...trechos] };
}

/**
 * O programa que a solução de referência forma.
 *
 * No Worker de JavaScript a solução é acrescentada ao esqueleto — ela
 * redefine as funções. Numa página isso duplicaria os elementos (dois
 * `<h1>`), e em TypeScript o compilador recusa a função declarada duas vezes;
 * nos dois casos a solução é o programa inteiro e substitui o esqueleto.
 */
function programaDaSolucao(exercise: CodeExercise): string {
  const linguagem = linguagemDe.get(exercise);
  return exercise.runtime === 'iframe' || linguagem === 'typescript' || linguagem === 'react'
    ? (exercise.solution ?? '')
    : exercise.initialCode + '\n' + exercise.solution;
}

const codeExercises = allExercises.filter(
  (item): item is { lesson: Lesson; exercise: CodeExercise } => item.exercise.type === 'code'
);

const fillBlankExercises = allExercises.filter(
  (item): item is { lesson: Lesson; exercise: FillBlankExercise } =>
    item.exercise.type === 'fill-blank'
);

it('o catálogo não está vazio', async () => {
  expect(allLessons.length).toBeGreaterThan(0);
  expect(codeExercises.length).toBeGreaterThan(0);
});

describe.skipIf(process.env.CI)('nenhum exercício chega perto do prazo', () => {
  // O prazo por teste é de 2000ms. A máquina de quem escreve é mais rápida que o
  // runner do CI, então um exercício que leva 1400ms aqui estoura lá — e foi
  // exatamente o que aconteceu: sete commits seguidos com o CI vermelho enquanto
  // a suíte local passava.
  //
  // Não roda no CI de propósito. Medir tempo de parede num runner compartilhado
  // produz falha sem defeito, que é o tipo de teste que ensina a ignorar o
  // vermelho. Aqui isto é aviso durante o desenvolvimento; o portão de verdade é
  // o prazo do próprio sandbox, que o CI exercita ao rodar cada exercício.
  // Metade do prazo, e não um quarto. O quarto era arbitrário e disparava com a
  // máquina apenas ocupada — um exercício de 264ms virou 686ms sob carga. Metade
  // continua pegando a regressão que originou esta guarda (1372ms) sem reclamar
  // de variação normal.
  const TETO = TEST_TIMEOUT_MS / 2;

  const comPropriedade = codeExercises.filter(({ exercise }) => exercise.properties?.length);

  it.each(comPropriedade.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: as propriedades cabem com folga',
    async (_id, exercise) => {
      const inicio = Date.now();
      await runProgram(
        `${exercise.initialCode}
${exercise.solution}`,
        [],
        exercise.properties
      );
      const gasto = Date.now() - inicio;

      expect(
        gasto,
        `levou ${gasto}ms, e o prazo por teste é ${TEST_TIMEOUT_MS}ms. Uma propriedade que espera temporizador não precisa de 50 casos: reduza com o campo runs.`
      ).toBeLessThan(TETO);
    }
  );
});

describe('markdown chega limpo ao aluno', () => {
  const CRASE = String.fromCharCode(96);
  const BARRA = String.fromCharCode(92);

  const textos = allLessons.flatMap((lesson) =>
    lesson.blocks
      .filter((b): b is Extract<typeof b, { markdown: string }> => 'markdown' in b)
      .map((b) => ({ id: lesson.id, texto: b.markdown }))
  );

  it('nenhuma barra invertida sobrou antes de crase', () => {
    // Escrever `\\`` no fonte em vez de `\`` produz uma barra invertida na
    // string, e o aluno vê o caractere no lugar da formatação de código. Passa
    // pelo typecheck e pelos testes de execução: só aparece na tela.
    const ruins = textos.filter(({ texto }) => texto.includes(BARRA + CRASE));

    expect(ruins.map((r) => r.id)).toEqual([]);
  });

  it('nenhum bloco de código ficou aberto', () => {
    for (const { id, texto } of textos) {
      const cercas = (texto.match(/^~~~/gm) ?? []).length;
      // Cerca ímpar significa bloco não fechado: daí em diante a aula inteira
      // vira código na tela.
      expect(cercas % 2, `${id}: bloco de código sem fechar`).toBe(0);
    }
  });
});

describe('armadilha do assíncrono', () => {
  const todasAsAssercoes = allExercises.flatMap(({ exercise }) => {
    if (exercise.type !== 'code' && exercise.type !== 'fill-blank') return [];

    return [
      ...exercise.tests.map((t) => ({ id: exercise.id, texto: t.assertion, onde: t.description })),
      ...(exercise.properties ?? []).map((p) => ({
        id: exercise.id,
        texto: p.check,
        onde: p.description,
      })),
    ];
  });

  it('nenhuma asserção usa .then() sem esperar o resultado', () => {
    const suspeitas = todasAsAssercoes.filter(({ texto }) => {
      const usaThen = /\.then\s*\(/.test(texto);
      if (!usaThen) return false;

      // `await algo.then(...)` e `return algo.then(...)` são seguros; o problema
      // é a chamada solta.
      return !/(await|return)\s+[^;]*\.then\s*\(/.test(texto);
    });

    // Uma promise não esperada reporta sucesso antes de resolver: o aluno vê
    // "correto" para uma resposta errada. É o pior defeito possível num
    // exercício, porque é silencioso e verde.
    expect(
      suspeitas.map((s) => `${s.id} — ${s.onde}`),
      'asserção com .then() sem await: passaria antes de a promise resolver'
    ).toEqual([]);
  });
});

describe('exercícios de lacuna', () => {
  it.each(fillBlankExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a solução declarada preenche e passa',
    async (_id, exercise) => {
      // Sem solução declarada não há como provar que o exercício é resolvível —
      // e um molde impossível só apareceria para o aluno.
      expect(exercise.solution, 'exercício de lacuna precisa declarar uma solução').toBeDefined();

      const resultado = await executar(
        exercise,
        preencher(exercise.template, exercise.solution!),
        exercise.tests,
        exercise.properties
      );

      expect(resultado.error, 'a solução não deveria lançar erro').toBeUndefined();

      const falhas = resultado.testResults.filter((t) => !t.passed).map((t) => t.message);
      expect(falhas, 'a solução deveria passar em tudo').toEqual([]);
    }
  );

  it.each(fillBlankExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: com as lacunas vazias NÃO passa',
    async (_id, exercise) => {
      const vazio = exercise.blanks.map(() => '');
      const resultado = await executar(
        exercise,
        preencher(exercise.template, vazio),
        exercise.tests,
        exercise.properties
      );

      const todosPassaram =
        resultado.testResults.length > 0 && resultado.testResults.every((t) => t.passed);

      expect(todosPassaram, 'o exercício passa sem o aluno preencher nada').toBe(false);
    }
  );

  it.each(fillBlankExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a dica não entrega a resposta',
    async (_id, exercise) => {
      // Uma dica que contém a resposta literal transforma o exercício em cópia.
      for (const dica of exercise.hints) {
        for (const resposta of exercise.solution ?? []) {
          if (resposta.length < 3) continue;
          expect(
            dica.includes(resposta),
            `a dica "${dica}" contém a resposta "${resposta}"`
          ).toBe(false);
        }
      }
    }
  );
});

describe('exercícios de código', () => {
  it.each(codeExercises.map(({ lesson, exercise }) => [exercise.id, lesson.id, exercise] as const))(
    '%s: a solução de referência passa em todos os testes',
    async (_id, _lessonId, exercise) => {
      // Sem solução declarada, não há como garantir que o exercício é resolvível.
      expect(exercise.solution, 'exercício de código precisa declarar uma solução').toBeDefined();

      const resultado = await executar(exercise, programaDaSolucao(exercise), exercise.tests);

      expect(resultado.error, 'a solução não deveria lançar erro').toBeUndefined();

      const falhas = resultado.testResults.filter((t) => !t.passed).map((t) => t.message);
      expect(falhas, 'a solução deveria passar em todos os testes').toEqual([]);
      // Os trechos de tipo entram na mesma lista, depois dos testes.
      expect(resultado.testResults).toHaveLength(
        exercise.tests.length + (exercise.typeTests?.length ?? 0)
      );
    }
  );

  it.each(codeExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: o código inicial NÃO passa (o exercício exige trabalho do aluno)',
    async (_id, exercise) => {
      const resultado = await executar(
        exercise,
        exercise.initialCode,
        exercise.tests,
        exercise.properties
      );
      const todosPassaram =
        resultado.testResults.length > 0 && resultado.testResults.every((t) => t.passed);

      expect(todosPassaram, 'o exercício está passando sem o aluno escrever nada').toBe(false);
    }
  );

  const comPropriedades = codeExercises.filter(({ exercise }) => exercise.properties?.length);

  it.each(comPropriedades.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: cada propriedade reprova o código inicial',
    async (_id, exercise) => {
      // Uma propriedade que passa com o esqueleto não está verificando nada — e
      // seria pior que a ausência dela, porque parece cobertura.
      for (const propriedade of exercise.properties!) {
        const resultado = await executar(exercise, exercise.initialCode, [], [propriedade]);
        const passou = resultado.testResults[0]?.passed === true;

        expect(passou, `a propriedade "${propriedade.description}" passa sem o aluno escrever nada`).toBe(
          false
        );
      }
    }
  );

  it.each(codeExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: toda mensagem de falha é escrita para o aluno',
    async (_id, exercise) => {
      const resultado = await executar(
        exercise,
        exercise.initialCode,
        exercise.tests,
        exercise.properties
      );

      for (const teste of resultado.testResults) {
        if (teste.passed) continue;

        // Mensagem crua do motor JavaScript não ensina nada a quem está começando.
        expect(
          teste.message,
          `mensagem pouco didática: "${teste.message}"`
        ).not.toMatch(/is not defined$/);
        expect(teste.message.length, 'mensagem curta demais para orientar').toBeGreaterThan(15);
      }
    }
  );
});

describe('exercícios de previsão de saída', () => {
  const previsoes = allExercises.filter(({ exercise }) => exercise.type === 'predict-output');

  it.each(previsoes.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a saída declarada confere com a execução real',
    async (_id, exercise) => {
      if (exercise.type !== 'predict-output') throw new Error('filtro inconsistente');

      const resultado = await executar(exercise, exercise.code, []);

      expect(resultado.error, 'o código do enunciado não deveria lançar erro').toBeUndefined();
      // Declarar uma saída errada aqui ensinaria algo falso ao aluno.
      expect(resultado.logs.join('\n')).toBe(exercise.expectedOutput);
    }
  );
});

describe('exercícios de múltipla escolha', () => {
  const multiplas = allExercises.filter(({ exercise }) => exercise.type === 'multiple-choice');

  it.each(multiplas.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a alternativa correta existe na lista',
    async (_id, exercise) => {
      if (exercise.type !== 'multiple-choice') throw new Error('filtro inconsistente');

      // correctIndex fora da lista tornaria a resposta certa `undefined`:
      // o aluno nunca conseguiria acertar e nada denunciaria o erro.
      expect(exercise.correctIndex).toBeLessThan(exercise.options.length);
      expect(exercise.options[exercise.correctIndex]).toBeTruthy();
    }
  );
});

describe('exercícios de ordenar passos', () => {
  const ordenacoes = allExercises.filter(({ exercise }) => exercise.type === 'order-steps');

  it.each(ordenacoes.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a ordem inicial não é a resposta',
    async (_id, exercise) => {
      if (exercise.type !== 'order-steps') throw new Error('filtro inconsistente');

      // Um exercício que abre já resolvido é pior do que um difícil demais: o
      // aluno passa sem fazer nada e sem perceber que passou.
      expect(estaOrdenado(embaralhar(exercise.steps, exercise.id))).toBe(false);
    }
  );

  it.each(ordenacoes.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a ordem declarada é resolvível',
    async (_id, exercise) => {
      if (exercise.type !== 'order-steps') throw new Error('filtro inconsistente');

      // Arrumar pelo campo `ordem` tem que produzir uma sequência aceita — é o
      // equivalente à solução de referência dos outros tipos.
      const arrumado = [...exercise.steps].sort((a, b) => a.ordem - b.ordem);
      expect(estaOrdenado(arrumado)).toBe(true);
    }
  );

  it.each(ordenacoes.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: nenhum passo repete texto',
    async (_id, exercise) => {
      if (exercise.type !== 'order-steps') throw new Error('filtro inconsistente');

      // Dois passos com o mesmo texto são indistinguíveis na tela, e o aluno
      // não teria como saber qual mover.
      const textos = exercise.steps.map((p) => p.text.trim());
      expect(new Set(textos).size, `textos repetidos em ${exercise.id}`).toBe(textos.length);
    }
  );

  it.each(ordenacoes.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: toda crase num passo tem par',
    async (_id, exercise) => {
      if (exercise.type !== 'order-steps') throw new Error('filtro inconsistente');

      // O passo mostra `assim` em monoespaçada. Uma crase sem par engole o
      // resto da frase como código — e ninguém vê, porque o texto continua lá.
      for (const passo of exercise.steps) {
        const crases = (passo.text.match(/`/g) ?? []).length;
        expect(crases % 2, `crase sem par em "${passo.text}"`).toBe(0);
      }
    }
  );

  it.each(ordenacoes.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a dica não entrega a ordem',
    async (_id, exercise) => {
      if (exercise.type !== 'order-steps') throw new Error('filtro inconsistente');

      // Uma dica que enumera os passos na ordem certa não é dica, é gabarito.
      const arrumado = [...exercise.steps].sort((a, b) => a.ordem - b.ordem);

      for (const dica of exercise.hints) {
        const posicoes = arrumado
          .map((passo) => dica.toLowerCase().indexOf(passo.text.toLowerCase().slice(0, 20)))
          .filter((i) => i !== -1);

        expect(
          posicoes.length,
          `a dica "${dica}" cita ${posicoes.length} passos na ordem da resposta`
        ).toBeLessThan(arrumado.length);
      }
    }
  );
});

describe('exercícios de escrever o teste', () => {
  const escritas = allExercises.filter(({ exercise }) => exercise.type === 'write-test');

  /** Roda o programa no mesmo sandbox que o navegador do aluno usa, na linguagem da aula. */
  const rodar = (exercise: Exercise) => (programa: string) => executar(exercise, programa, []);

  it.each(escritas.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: o teste de referência aceita a implementação correta e pega todas as sabotagens',
    async (_id, exercise) => {
      if (exercise.type !== 'write-test') throw new Error('filtro inconsistente');

      // Sem solução declarada, o CI não consegue provar que o exercício é
      // resolvível — e um exercício impossível só aparece quando um aluno trava.
      expect(exercise.solution, `${exercise.id} não tem teste de referência`).toBeTruthy();

      const veredito = await avaliarTestes(
        exercise.subject,
        exercise.mutants,
        exercise.solution ?? '',
        rodar(exercise)
      );

      expect(
        veredito.referenciaPassou,
        `o teste de referência recusa a implementação correta: ${veredito.erroNaReferencia}`
      ).toBe(true);

      const escaparam = veredito.sabotagens.filter((s) => !s.pego).map((s) => s.description);
      expect(escaparam, `sabotagens que o teste de referência não pega`).toEqual([]);
    },
    TEST_TIMEOUT_MS * 8
  );

  it.each(escritas.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: o esqueleto NÃO resolve o exercício',
    async (_id, exercise) => {
      if (exercise.type !== 'write-test') throw new Error('filtro inconsistente');

      // Se o ponto de partida já passasse, o aluno resolveria sem escrever nada
      // — que é exatamente o hábito que este tipo de exercício combate.
      const veredito = await avaliarTestes(
        exercise.subject,
        exercise.mutants,
        exercise.initialCode,
        rodar(exercise)
      );

      expect(veredito.aprovado, 'o código inicial já resolve o exercício').toBe(false);
    },
    TEST_TIMEOUT_MS * 8
  );

  it.each(escritas.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: cada sabotagem é código que roda',
    async (_id, exercise) => {
      if (exercise.type !== 'write-test') throw new Error('filtro inconsistente');

      // A sabotagem precisa ser código válido. Uma que nem chega a rodar seria
      // "pega" por qualquer teste, inclusive por um arquivo vazio — e o
      // exercício passaria a aprovar quem não escreveu nada.
      for (const mutante of exercise.mutants) {
        const sozinha = await rodar(exercise)(mutante.code);
        expect(
          sozinha.error,
          `a sabotagem "${mutante.description}" nem chega a rodar`
        ).toBeUndefined();
      }
    },
    TEST_TIMEOUT_MS * 8
  );

  it.each(escritas.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a dica não entrega o teste pronto antes da última',
    async (_id, exercise) => {
      if (exercise.type !== 'write-test') throw new Error('filtro inconsistente');

      // A última dica pode entregar a solução — é o combinado das outras aulas.
      // As anteriores, não.
      for (const dica of exercise.hints.slice(0, -1)) {
        expect(
          dica.split('assert(').length - 1,
          `a dica "${dica}" já traz as asserções prontas`
        ).toBeLessThan(2);
      }
    }
  );
});

describe('exercícios de encontrar o bug', () => {
  const comBug = allExercises.filter(({ exercise }) => exercise.type === 'find-bug');

  it.each(comBug.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: o programa como está de fato quebra',
    async (_id, exercise) => {
      if (exercise.type !== 'find-bug') throw new Error('filtro inconsistente');

      // Um "exercício de bug" cujo programa roda liso não tem o que encontrar,
      // e o aluno procuraria um defeito que não está lá.
      const resultado = await executar(exercise, exercise.code, []);
      expect(resultado.error, 'o programa roda sem erro nenhum').toBeDefined();
    },
    TEST_TIMEOUT_MS * 4
  );

  it.each(comBug.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: trocar a linha declarada pela correção resolve',
    async (_id, exercise) => {
      if (exercise.type !== 'find-bug') throw new Error('filtro inconsistente');

      // Esta é a prova de que o NÚMERO da linha está certo. Um engano de uma
      // linha tornaria o exercício impossível sem nada denunciar — e foi
      // exatamente o engano que cometi escrevendo o teste desta biblioteca.
      const corrigido = corrigirLinha(exercise.code, exercise.buggyLine, exercise.fix);

      expect(corrigido, 'a correção é idêntica à linha original').not.toBe(exercise.code);

      const resultado = await executar(exercise, corrigido, []);
      expect(
        resultado.error,
        `com a linha ${exercise.buggyLine} corrigida o programa ainda quebra`
      ).toBeUndefined();
    },
    TEST_TIMEOUT_MS * 4
  );

  it.each(comBug.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a linha do sintoma é onde o erro realmente aparece',
    async (_id, exercise) => {
      if (exercise.type !== 'find-bug') throw new Error('filtro inconsistente');
      if (exercise.symptomLine === undefined) return;

      // Se a linha do sintoma estivesse errada, o retorno específico dela
      // apareceria para quem apontou outra coisa — e o exercício ensinaria a
      // distinção com o exemplo trocado.
      const linhas = linhasNumeradas(exercise.code);
      const doSintoma = linhas[exercise.symptomLine - 1].texto.trim();

      expect(doSintoma.length, 'a linha do sintoma está vazia').toBeGreaterThan(0);
      expect(exercise.symptomFeedback, 'a linha do sintoma precisa de retorno próprio').toBeTruthy();
    }
  );

  it.each(comBug.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: o enunciado faz a mesma pergunta de sempre, e não entrega a correção',
    async (_id, exercise) => {
      if (exercise.type !== 'find-bug') throw new Error('filtro inconsistente');

      // "Onde o erro aparece" e "onde ele começa" são linhas diferentes, e o
      // aluno reclamou, com razão, de exercícios que pediam ora uma ora
      // outra. A pergunta é uma só: a linha que precisa mudar — a que a
      // correção troca. E o enunciado descreve o sintoma; o diagnóstico é
      // da explicação, senão o exercício vira leitura.
      expect(exercise.prompt, 'o enunciado precisa pedir "a linha que precisa mudar"').toContain(
        'Aponte a linha que precisa mudar'
      );
      const correcao = exercise.fix.trim();
      if (correcao.length > 8) {
        expect(exercise.prompt.includes(correcao), 'o enunciado traz a linha corrigida').toBe(false);
        for (const dica of exercise.hints) {
          expect(dica.includes(correcao), `a dica "${dica}" traz a linha corrigida`).toBe(false);
        }
      }
    }
  );

  it.each(comBug.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a dica não entrega o número da linha',
    async (_id, exercise) => {
      if (exercise.type !== 'find-bug') throw new Error('filtro inconsistente');

      // "O defeito está na linha 2" não é dica, é gabarito.
      for (const dica of exercise.hints) {
        expect(
          new RegExp(`linha ${exercise.buggyLine}\\b`).test(dica),
          `a dica "${dica}" cita a linha da resposta`
        ).toBe(false);
      }
    }
  );
});

describe('exercícios de refatorar', () => {
  const refatoracoes = allExercises.filter(({ exercise }) => exercise.type === 'refactor');

  it.each(refatoracoes.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: o código de partida JÁ passa nos testes',
    async (_id, exercise) => {
      if (exercise.type !== 'refactor') throw new Error('filtro inconsistente');

      // É o que separa refatorar de consertar. Se o ponto de partida estivesse
      // quebrado, o exercício seria um `code` disfarçado — e a lição de que o
      // comportamento é o contrato se perderia.
      const resultado = await executar(exercise, exercise.initialCode, exercise.tests, exercise.properties);

      expect(resultado.error, 'o código de partida lança').toBeUndefined();

      const falhas = resultado.testResults.filter((t) => !t.passed).map((t) => t.message);
      expect(falhas, 'o código de partida já deveria funcionar').toEqual([]);
    },
    TEST_TIMEOUT_MS * 8
  );

  it.each(refatoracoes.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: o código de partida NÃO cumpre a forma',
    async (_id, exercise) => {
      if (exercise.type !== 'refactor') throw new Error('filtro inconsistente');

      // Se já cumprisse, o aluno apertaria "verificar" e passaria sem tocar em
      // nada — um exercício que aprova quem não fez.
      const forma = avaliarRestricoes(exercise.initialCode, exercise.constraints);
      expect(todasCumpridas(forma), 'não há nada a refatorar').toBe(false);
    }
  );

  it.each(refatoracoes.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a solução passa nos testes e cumpre a forma',
    async (_id, exercise) => {
      if (exercise.type !== 'refactor') throw new Error('filtro inconsistente');

      expect(exercise.solution, 'exercício de refatoração precisa declarar uma solução').toBeTruthy();

      const resultado = await executar(
        exercise,
        exercise.solution ?? '',
        exercise.tests,
        exercise.properties
      );

      expect(resultado.error, 'a solução lança').toBeUndefined();

      const falhas = resultado.testResults.filter((t) => !t.passed).map((t) => t.message);
      expect(falhas, 'a solução deveria passar em tudo').toEqual([]);

      const forma = avaliarRestricoes(exercise.solution ?? '', exercise.constraints);
      const naoCumpridas = forma.filter((r) => !r.cumprida).map((r) => r.motivo);
      expect(naoCumpridas, 'a solução não cumpre as próprias restrições').toEqual([]);
    },
    TEST_TIMEOUT_MS * 8
  );

  it.each(refatoracoes.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a dica não entrega a solução antes da última',
    async (_id, exercise) => {
      if (exercise.type !== 'refactor') throw new Error('filtro inconsistente');

      // A última dica pode entregar; é o combinado dos outros tipos. As
      // anteriores, não — e o sinal aqui é a dica trazer o corpo pronto.
      const corpo = (exercise.solution ?? '')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l !== '' && !l.startsWith('function') && l !== '}');

      for (const dica of exercise.hints.slice(0, -1)) {
        for (const linha of corpo) {
          expect(
            dica.includes(linha),
            `a dica "${dica}" já traz a linha da solução`
          ).toBe(false);
        }
      }
    }
  );
});

describe('aulas de TypeScript', () => {
  const aulasTS = allLessons.filter(
    (lesson) => lesson.language === 'typescript' || lesson.language === 'react'
  );
  const exerciciosTS = allExercises.filter(({ lesson }) => lesson.language === 'typescript');

  it('aula de React só usa os tipos de exercício que o motor de componente roda', () => {
    // Prever a saída, refatorar e escrever o teste rodam no sandbox de Worker,
    // que não tem DOM nem React. Um exercício desses numa aula de React
    // compilaria o TSX e quebraria ao rodar — no aluno, não no CI.
    const permitidos = new Set(['code', 'fill-blank', 'multiple-choice', 'order-steps', 'find-bug']);
    for (const { lesson, exercise } of allExercises) {
      if (lesson.language !== 'react') continue;
      expect(permitidos.has(exercise.type), `${exercise.id} é do tipo ${exercise.type}, que o motor de React não roda`).toBe(true);
      if (exercise.type === 'code' || exercise.type === 'fill-blank') {
        expect(exercise.runtime, `${exercise.id}: em aula de React o motor é implícito; não declare runtime`).toBeUndefined();
      }
    }
  });

  it('trecho de tipo só existe em aula de TypeScript', () => {
    // Em JavaScript o compilador não roda, e o trecho seria ignorado em
    // silêncio — um teste que parece existir e não verifica nada.
    for (const { lesson, exercise } of allExercises) {
      if (lesson.language === 'typescript') continue;
      if (exercise.type !== 'code' && exercise.type !== 'fill-blank') continue;
      expect(exercise.typeTests ?? [], `${exercise.id} tem typeTests numa aula de ${lesson.language}`).toEqual([]);
    }
  });

  it.each(exerciciosTS
    .filter(({ exercise }) => exercise.type === 'code' || exercise.type === 'fill-blank')
    .map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: todo trecho que precisa ser recusado é aceito sem o trabalho do aluno',
    async (_id, exercise) => {
      if (exercise.type !== 'code' && exercise.type !== 'fill-blank') throw new Error('filtro inconsistente');

      // Um trecho `rejects` prova que o tipo do aluno impede um uso errado. Se
      // o esqueleto já o recusasse, a recusa não teria vindo do trabalho do
      // aluno — e o trecho estaria testando outra coisa (um erro de sintaxe do
      // próprio trecho, por exemplo).
      const inicial =
        exercise.type === 'code'
          ? exercise.initialCode
          : preencher(exercise.template, exercise.blanks.map(() => 'any'));
      const { erros: doInicial } = compilarNoNode(inicial);
      if (doInicial.length > 0) return; // o esqueleto nem compila: não há como isolar

      for (const trecho of exercise.typeTests ?? []) {
        if (!trecho.rejects) continue;
        const { erros } = compilarNoNode(`${inicial}\n${trecho.code}`);
        expect(
          erros.map((e) => e.mensagem),
          `o trecho "${trecho.description}" já é recusado com o esqueleto — a recusa não depende do aluno`
        ).toEqual([]);
      }
    }
  );

  it.each(aulasTS.map((lesson) => [lesson.id, lesson] as const))(
    '%s: todo exemplo compila — ou declara que o compilador o recusa',
    (_id, lesson) => {
      // Um exemplo com erro de tipo ensinaria o erro como se fosse o certo. Os
      // exemplos que mostram uma recusa de propósito dizem isso com a marca
      // `// @recusado` na primeira linha, e aí o CI cobra o contrário: que o
      // compilador de fato recuse.
      for (const bloco of lesson.blocks) {
        if (bloco.kind !== 'example') continue;
        if (bloco.language !== 'typescript' && bloco.language !== 'tsx') continue;

        const recusadoDeProposito = bloco.code.startsWith('// @recusado');
        const { erros } = compilarNoNode(bloco.code, { jsx: bloco.language === 'tsx' });

        if (recusadoDeProposito) {
          expect(erros.length, `o exemplo marcado como recusado compila:\n${bloco.code}`).toBeGreaterThan(0);
        } else {
          expect(
            erros.map((e) => `linha ${e.linha}: ${e.mensagem}`),
            `o exemplo não compila:\n${bloco.code}`
          ).toEqual([]);
        }
      }
    }
  );
});

describe('bancos de exemplo', () => {
  let abrir: AbrirBanco;
  beforeAll(async () => {
    abrir = await abrirBancoNoNode();
  });

  it.each(Object.values(BANCOS).map((banco) => [banco.id, banco] as const))(
    '%s: o painel de tabelas descreve exatamente o que o SQL cria',
    (_id, banco) => {
      // O painel que o aluno lê vem de `tabelas`; o banco vem de `sql`. Uma
      // coluna descrita e não criada seria um recurso falso: a pessoa a
      // consultaria e leria "a coluna não existe".
      const db = abrir();
      db.rodar(banco.sql);
      const criadas = db.rodar("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name");
      const nomes = (criadas[0]?.tipo === 'tabela' ? criadas[0].values : []).map((l) => String(l[0]));
      expect([...banco.tabelas.map((t) => t.nome)].sort()).toEqual(nomes);

      for (const tabela of banco.tabelas) {
        const info = db.rodar(`PRAGMA table_info(${tabela.nome})`);
        const colunas = (info[0]?.tipo === 'tabela' ? info[0].values : []).map((l) => ({
          nome: String(l[1]),
          tipo: String(l[2]).toUpperCase(),
        }));
        expect(
          tabela.colunas.map((c) => ({ nome: c.nome, tipo: c.tipo.toUpperCase() })),
          `as colunas descritas de ${tabela.nome} não são as criadas`
        ).toEqual(colunas);
      }
      db.fechar();
    }
  );
});

describe('exercícios de SQL', () => {
  const sqlExercises = allExercises.filter(
    (item): item is { lesson: Lesson; exercise: SqlExercise } => item.exercise.type === 'sql'
  );

  let abrir: AbrirBanco;
  beforeAll(async () => {
    abrir = await abrirBancoNoNode();
  });

  const setupDe = (exercise: SqlExercise) => `${BANCOS[exercise.database].sql}\n${exercise.setup ?? ''}`;

  it('aula de SQL só usa os tipos de exercício que o motor de banco roda', () => {
    // Os outros tipos rodam JavaScript num sandbox; um `code` numa aula de
    // SQL mandaria o SELECT do aluno para o `new Function`.
    const permitidos = new Set(['sql', 'multiple-choice', 'order-steps']);
    for (const { lesson, exercise } of allExercises) {
      if (lesson.language !== 'sql') continue;
      expect(permitidos.has(exercise.type), `${exercise.id} é do tipo ${exercise.type}, que o motor de SQL não roda`).toBe(true);
    }
    for (const { lesson, exercise } of sqlExercises) {
      expect(lesson.language, `${exercise.id} é de SQL numa aula de ${lesson.language}`).toBe('sql');
    }
  });

  it.each(sqlExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a solução de referência passa em todas as verificações',
    (_id, exercise) => {
      const resultado = executarSql(abrir, {
        setup: setupDe(exercise),
        code: exercise.solution,
        solution: exercise.solution,
        tests: exercise.tests,
      });
      expect(resultado.error, 'a solução não deveria falhar').toBeUndefined();
      expect(resultado.testResults.filter((t) => !t.passed).map((t) => t.message)).toEqual([]);
      expect(resultado.testResults).toHaveLength(exercise.tests.length);

      // Uma verificação sem consulta própria compara o SELECT do aluno com o
      // da referência: a referência precisa devolver uma tabela, senão a
      // comparação é entre dois nadas e passa com qualquer coisa.
      const ultima = [...resultado.saidas].reverse().find((s) => s.tipo === 'tabela');
      if (exercise.tests.some((t) => t.query === undefined)) {
        expect(ultima, 'a referência não devolve tabela, e há verificação sem query').toBeDefined();
        expect(ultima?.tipo === 'tabela' && ultima.values.length, 'a referência devolve uma tabela vazia').toBeGreaterThan(0);
      }
    }
  );

  it.each(sqlExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: o SQL inicial NÃO passa (o exercício exige trabalho do aluno)',
    (_id, exercise) => {
      const resultado = executarSql(abrir, {
        setup: setupDe(exercise),
        code: exercise.initialCode,
        solution: exercise.solution,
        tests: exercise.tests,
      });
      const todosPassaram =
        resultado.testResults.length > 0 && resultado.testResults.every((t) => t.passed);
      expect(todosPassaram, 'o exercício está passando sem o aluno escrever nada').toBe(false);
    }
  );

  it.each(sqlExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: uma verificação com ordem só existe quando a referência ordena',
    (_id, exercise) => {
      // `ordered` sem ORDER BY na referência cobraria do aluno uma ordem que
      // nem o SQLite garante.
      for (const teste of exercise.tests) {
        if (!teste.ordered) continue;
        const sql = (teste.query ?? exercise.solution).toUpperCase();
        expect(sql, `"${teste.description}" cobra ordem sem ORDER BY`).toContain('ORDER BY');
      }
    }
  );

  it.each(sqlExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: toda mensagem de falha é escrita para o aluno',
    (_id, exercise) => {
      const resultado = executarSql(abrir, {
        setup: setupDe(exercise),
        code: exercise.initialCode,
        solution: exercise.solution,
        tests: exercise.tests,
      });
      for (const teste of resultado.testResults) {
        if (teste.passed) continue;
        expect(teste.message.length, 'mensagem curta demais para orientar').toBeGreaterThan(15);
      }
      if (resultado.error) {
        expect(resultado.error, 'erro cru do SQLite chegando ao aluno').not.toMatch(/^near |^no such /);
      }
    }
  );
});

describe('estrutura do catálogo', () => {
  it('ids de aula, exercício, projeto e flashcard são únicos', async () => {
    const coletar = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);

    expect(coletar(allLessons.map((l) => l.id))).toEqual([]);
    expect(coletar(allExercises.map(({ exercise }) => exercise.id))).toEqual([]);
    expect(coletar(listProjects().map((p) => p.id))).toEqual([]);
    expect(coletar(listFlashcards().map((f) => f.id))).toEqual([]);
  });

  it('toda aula tem pelo menos um exercício', async () => {
    const semExercicio = allLessons.filter((l) => getExercises(l).length === 0).map((l) => l.id);
    expect(semExercicio).toEqual([]);
  });

  it('toda aula pertence à trilha que a lista', async () => {
    for (const track of listTracks()) {
      for (const lesson of getLessonsOfTrack(track.id)) {
        expect(lesson.trackId).toBe(track.id);
      }
    }
  });

  it('as dicas vão do geral ao específico, sem repetir', async () => {
    for (const { exercise } of allExercises) {
      const unicas = new Set(exercise.hints);
      expect(unicas.size, `dicas repetidas em ${exercise.id}`).toBe(exercise.hints.length);
    }
  });
});

describe('blocos das trilhas', () => {
  it('as seções de uma trilha cobrem exatamente as aulas dela, na ordem', () => {
    // A tela da trilha lista as aulas pelas seções. Uma aula fora de todas
    // elas sumiria da tela; uma em duas apareceria duas vezes.
    for (const track of listTracks()) {
      if (!track.sections) continue;
      const emSecoes = track.sections.flatMap((s) => s.lessonIds);
      expect(emSecoes, `${track.id}: seções × lessonIds`).toEqual(track.lessonIds);
      for (const secao of track.sections) {
        expect(secao.title.length, `${track.id}: seção sem título`).toBeGreaterThan(0);
        expect(secao.description.length, `${track.id}: seção "${secao.title}" sem descrição`).toBeGreaterThan(0);
      }
    }
  });

  it('toda trilha com mais de oito aulas está dividida em blocos', () => {
    // Oito aulas cabem numa tela; mais que isso, sem cabeçalhos, é a parede
    // que a tela de trilhas tinha.
    for (const track of listTracks()) {
      if (track.lessonIds.length <= 8) continue;
      expect(track.sections?.length ?? 0, `${track.id} tem ${track.lessonIds.length} aulas e nenhum bloco`).toBeGreaterThan(1);
    }
  });
});

describe('etapas do percurso', () => {
  it('toda trilha publicada está em exatamente uma etapa, na ordem da lista de trilhas', () => {
    // A tela inicial e a de trilhas mostram o percurso por etapas. Uma trilha
    // fora delas sumiria das duas telas; em duas etapas, apareceria duas vezes.
    const noPercurso = ETAPAS_DO_PERCURSO.flatMap((e) => e.trackIds);
    expect(noPercurso).toEqual(listTracks().map((t) => t.id));
  });

  it('cada etapa tem título e o que ela entrega', () => {
    for (const etapa of ETAPAS_DO_PERCURSO) {
      expect(etapa.title.length).toBeGreaterThan(2);
      expect(etapa.description.length).toBeGreaterThan(20);
      expect(etapa.trackIds.length).toBeGreaterThan(0);
    }
  });
});

describe('progressão da trilha', () => {
  const track = listTracks()[0];
  const lessons = getLessonsOfTrack(track.id);

  it('sem nada concluído, a próxima aula é a primeira', async () => {
    expect(getNextLesson(track.id, [])?.id).toBe(lessons[0].id);
  });

  it('a próxima aula pula as já concluídas', async () => {
    expect(getNextLesson(track.id, [lessons[0].id])?.id).toBe(lessons[1].id);
  });

  it('com a trilha inteira concluída, não aponta de volta para o início', async () => {
    const todas = lessons.map((l) => l.id);
    expect(getNextLesson(track.id, todas)?.id).toBe(lessons[lessons.length - 1].id);
  });

  it('o percentual acompanha as aulas concluídas', async () => {
    expect(getTrackProgress(track.id, []).percentage).toBe(0);
    expect(getTrackProgress(track.id, lessons.map((l) => l.id)).percentage).toBe(100);
  });

  it('aulas concluídas de outra trilha não contam no percentual', async () => {
    const outra = listTracks()[1];
    if (!outra) return;

    const idsDaOutra = getLessonsOfTrack(outra.id).map((l) => l.id);
    expect(getTrackProgress(track.id, idsDaOutra).completed).toBe(0);
  });
});

describe('projetos', () => {
  const projetos = listProjects();

  it.each(projetos.map((p) => [p.id, p] as const))(
    '%s: a solução de referência fecha todos os checkpoints',
    async (_id, project) => {
      // Sem isso, eu poderia publicar um critério de aceitação impossível de
      // satisfazer — e o aluno tentaria para sempre sem nunca conseguir entregar.
      expect(project.referenceSolution, 'projeto precisa de solução de referência').toBeDefined();

      for (const checkpoint of project.checkpoints) {
        const resultado = await runProgram(
          `${project.initialCode}
${project.referenceSolution}`,
          checkpoint.tests
        );

        expect(resultado.error, `${checkpoint.id} lançou erro`).toBeUndefined();

        const falhas = resultado.testResults.filter((t) => !t.passed).map((t) => t.message);
        expect(falhas, `${checkpoint.id} não fechou`).toEqual([]);
      }
    }
  );

  it.each(projetos.map((p) => [p.id, p] as const))(
    '%s: o código inicial NÃO fecha todos os checkpoints',
    async (_id, project) => {
      // Laço, e não `every`: uma função assíncrona dentro de `every` devolveria
      // uma promessa — que é sempre verdadeira, e o teste passaria sempre.
      let todosFecham = true;
      for (const checkpoint of project.checkpoints) {
        const r = await runProgram(project.initialCode, checkpoint.tests);
        const fechou = r.testResults.length > 0 && r.testResults.every((t) => t.passed);
        if (!fechou) {
          todosFecham = false;
          break;
        }
      }

      // Um projeto que já vem pronto daria o troféu sem trabalho nenhum.
      expect(todosFecham, 'o projeto está completo antes de o aluno escrever algo').toBe(false);
    }
  );

  it('ids de checkpoint são únicos dentro de cada projeto', async () => {
    for (const project of projetos) {
      const ids = project.checkpoints.map((c) => c.id);
      expect(new Set(ids).size, `checkpoints repetidos em ${project.id}`).toBe(ids.length);
    }
  });

  it('todo projeto declara ao menos um checkpoint', () => {
    const semCheckpoint = projetos.filter((p) => p.checkpoints.length === 0).map((p) => p.id);
    expect(semCheckpoint).toEqual([]);
  });
});

describe('exercícios de servidor', () => {
  const serverExercises = allExercises.filter(
    (item): item is { lesson: Lesson; exercise: ServerExercise } => item.exercise.type === 'server'
  );

  const rodar = (exercise: ServerExercise, codigo: string) =>
    runProgram(
      montarCodigoDoServidor(codigo, { env: exercise.env, arquivos: exercise.arquivos }),
      exercise.tests,
      [],
      { sequencial: true }
    );

  it('exercício de servidor só existe em aula de Node, e aula de Node não tem SQL', () => {
    // Fora de uma aula de Node o editor e o motor seriam outros; e o SQL tem
    // o motor próprio.
    for (const { lesson, exercise } of allExercises) {
      if (lesson.language !== 'node') continue;
      expect(exercise.type, `${exercise.id} é de SQL numa aula de Node`).not.toBe('sql');
    }
    for (const { lesson, exercise } of serverExercises) {
      expect(lesson.language, `${exercise.id} é de servidor numa aula de ${lesson.language}`).toBe('node');
    }
  });

  it.each(serverExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a solução de referência responde tudo como esperado',
    async (_id, exercise) => {
      const resultado = await rodar(exercise, exercise.solution);
      expect(resultado.error, 'a solução não deveria falhar').toBeUndefined();
      expect(resultado.testResults.filter((t) => !t.passed).map((t) => t.message)).toEqual([]);
      expect(resultado.testResults).toHaveLength(exercise.tests.length);
      // Uma verificação que chama `pedir` precisa ter feito o pedido de fato:
      // se nenhum pedido saiu, ela passou sem olhar o servidor.
      const pedem = exercise.tests.filter((t) => t.assertion.includes('pedir(')).length;
      expect((resultado.trocas ?? []).length, 'as verificações não fizeram os pedidos que dizem fazer').toBeGreaterThanOrEqual(pedem);
    }
  );

  it.each(serverExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: o código inicial NÃO passa (o exercício exige trabalho do aluno)',
    async (_id, exercise) => {
      const resultado = await rodar(exercise, exercise.initialCode);
      const todosPassaram = resultado.testResults.length > 0 && resultado.testResults.every((t) => t.passed);
      expect(todosPassaram, 'o exercício está passando sem o aluno escrever nada').toBe(false);
    }
  );

  it.each(serverExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: toda mensagem de falha diz o que era esperado',
    async (_id, exercise) => {
      const resultado = await rodar(exercise, exercise.initialCode);
      for (const teste of resultado.testResults) {
        if (teste.passed) continue;
        expect(teste.message.length, `"${teste.message}" é curta demais para orientar`).toBeGreaterThan(15);
      }
    }
  );
});
