import type { Lesson } from '../types';

const CALCULAR_DESCONTO = `function calcularDescontoTotal(pedido) {
  let desconto = 0;
  if (pedido.cupom === 'PROMO10') desconto = desconto + 0.25;
  if (pedido.itens.length >= 5) desconto = desconto + 0.1;
  return Math.min(desconto, 0.3);
}`;

export const lessonTestesRegressao: Lesson = {
  id: 'lesson-testes-8',
  trackId: 'track-testes',
  title: 'O Teste que Pega o Bug de Ontem',
  language: 'javascript',
  objective:
    'Escrever um teste de regressão: reproduzir um bug corrigido antes de consertá-lo, para que ele nunca mais volte sem ninguém perceber — e reconhecer o padrão em bugs que já aconteceram.',
  concepts: ['testes-regressao'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um bug apareceu em produção, alguém consertou, e três meses depois o **mesmo bug** volta — porque uma mudança sem querer desfez o conserto, e nada avisou. Isso se chama **regressão**, e o teste que evita é um dos mais valiosos que existem.

## O ritual: reproduzir antes de consertar

Quando um bug é relatado, a ordem certa não é "consertar e seguir":

1. **Escreva um teste que reproduz o bug** — ele deve **falhar**, provando que o defeito existe de verdade e que você entendeu a causa.
2. **Conserte o código.**
3. **O teste passa** — prova que o conserto funcionou.
4. **O teste fica na suíte para sempre** — se algum dia alguém desfizer o conserto sem querer, esse teste falha na hora, não três meses depois em produção.

~~~js
// O bug relatado: cupom e quantidade juntos passam do desconto máximo.
function calcularDescontoTotal(pedido) {
  let desconto = 0;
  if (pedido.cupom === 'PROMO10') desconto = desconto + 0.1;
  if (pedido.itens.length >= 5) desconto = desconto + 0.05;
  return desconto; // faltava limitar — o bug
}

// O teste de regressão: reproduz exatamente o caso relatado.
const pedidoComOsDois = { cupom: 'PROMO10', itens: [1, 2, 3, 4, 5] };
assert(calcularDescontoTotal(pedidoComOsDois) <= 0.3, 'o desconto nunca passa de 30%, mesmo somando cupom e quantidade');
~~~

Sem o \`Math.min(desconto, 0.3)\`, esse teste falharia (\`0.15 <= 0.3\` é verdade, então na verdade esse exemplo específico passaria — o bug de verdade precisa de um caso que **de fato** ultrapasse o limite, como cupom mais um terceiro desconto). É por isso que o primeiro passo do ritual — escrever o teste **e vê-lo falhar** contra o código com o bug — importa tanto: prova que o teste testa a coisa certa, e não passa por acaso.

## Por que "consertar e seguir" não basta

Sem o teste, o conserto vive só na cabeça de quem o fez (e na mensagem do commit, se alguém for ler). A próxima pessoa que mexer naquela função não tem como saber que aquele caso específico já quebrou uma vez — e pode desfazer o conserto sem perceber, especialmente numa refatoração ampla. O teste é a memória do bug, guardada em código.

## O padrão se repete

Bugs de regressão tendem a vir dos mesmos lugares: um limite (\`<\` que devia ser \`<=\`), um caso extremo esquecido (lista vazia, \`null\`), uma condição que devia estar combinada com outra e não estava. Um teste de regressão bem escrito costuma nomear **a combinação** que causou o bug — não só um valor isolado:

~~~js
// Ruim: só testa um valor, sem explicar por que ele importava.
assert(calcularDescontoTotal({ cupom: 'PROMO10', itens: [1,2,3,4,5] }) <= 0.3, 'teste do bug #482');

// Bom: nomeia a combinação que causou o problema.
assert(
  calcularDescontoTotal({ cupom: 'PROMO10', itens: [1,2,3,4,5] }) <= 0.3,
  'cupom PROMO10 combinado com 5+ itens não pode passar do desconto máximo de 30%'
);
~~~

"Teste do bug #482" não ajuda ninguém daqui a um ano, que não tem como saber o que era o bug 482. A mensagem que explica a combinação continua útil mesmo sem o número do chamado.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// O bug relatado: buscarPorNome quebra quando o nome tem espaços nas pontas.
function buscarPorNome(pessoas, nome) {
  return pessoas.find((p) => p.nome === nome);
}

const pessoas = [{ nome: 'Ana Silva' }];

// Teste de regressão: reproduz exatamente o caso relatado (espaço extra).
const encontrada = buscarPorNome(pessoas, '  Ana Silva  ');
assert(encontrada !== undefined, 'busca com espaços nas pontas encontra a pessoa mesmo assim (bug relatado em 2026-08-02)');

// Depois do conserto (comparando com .trim() nos dois lados), este teste passa
// e continua na suíte — se alguém tirar o trim(), ele volta a falhar na hora.`,
      caption:
        'O teste nomeia a combinação exata que causou o bug (espaços nas pontas) e a data, não um número de chamado que ninguém mais vai lembrar o que significava.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-8-ordem',
        type: 'order-steps',
        prompt: 'Coloque na ordem os passos do ritual de corrigir um bug relatado.',
        concepts: ['testes-regressao'],
        difficulty: 'iniciante',
        tags: ['testes', 'regressao'],
        steps: [
          { id: 'reproduzir', text: 'Escrever um teste que reproduz o bug — e vê-lo FALHAR contra o código com o defeito', ordem: 1 },
          { id: 'consertar', text: 'Consertar o código', ordem: 2 },
          { id: 'confirmar', text: 'Rodar o teste de novo e vê-lo passar', ordem: 3 },
          { id: 'manter', text: 'Manter o teste na suíte para sempre, como proteção contra o bug voltar', ordem: 4 },
        ],
        explanation:
          'Ver o teste falhar **antes** do conserto é o que prova que ele de fato testa o bug relatado, e não passa por acaso. Sem esse passo, um teste que "passa" desde o início não prova nada — é a mesma lição da primeira aula da trilha, aplicada a um bug de verdade.',
        hints: ['O que prova que o teste realmente testa o bug, e não passaria de qualquer jeito?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-8-por-que-falhar-primeiro',
        type: 'multiple-choice',
        prompt:
          'Por que é importante ver o teste de regressão FALHAR contra o código com o bug, antes de consertar?',
        concepts: ['testes-regressao'],
        difficulty: 'intermediario',
        tags: ['testes', 'regressao'],
        options: [
          'Porque prova que o teste de fato testa o bug relatado — um teste que "passa" desde o início pode estar testando a coisa errada',
          'Porque é uma formalidade sem efeito prático',
          'Porque o Vitest exige que todo teste falhe pelo menos uma vez antes de ser aceito',
          'Porque isso deixa o histórico do Git mais bonito',
        ],
        correctIndex: 0,
        explanation:
          'Um teste que nunca foi visto falhando é uma incógnita: pode estar testando algo que sempre foi verdade, sem relação real com o bug. Ver a falha primeiro — contra o código com o defeito — é a única prova de que aquele teste específico captura aquele bug específico.',
        hints: ['Se um teste "passa" sem nunca ter sido visto falhar, como saber se ele testa alguma coisa de verdade?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-8-encontrar',
        type: 'find-bug',
        prompt:
          'Um bug foi relatado: pedidos com cupom E cinco ou mais itens recebem mais de 30% de desconto. O teste no fim do arquivo reproduz o caso e falha. Aponte a linha que precisa mudar para corrigir o bug.',
        concepts: ['testes-regressao'],
        difficulty: 'intermediario',
        tags: ['testes', 'regressao', 'bug'],
        code: `function calcularDescontoTotal(pedido) {
  let desconto = 0;
  if (pedido.cupom === 'PROMO10') desconto = desconto + 0.1;
  if (pedido.itens.length >= 5) desconto = desconto + 0.05;
  if (pedido.cliente && pedido.cliente.vip) desconto = desconto + 0.2;
  return desconto;
}

const pedidoRelatado = { cupom: 'PROMO10', itens: [1, 2, 3, 4, 5], cliente: { vip: true } };
if (calcularDescontoTotal(pedidoRelatado) > 0.3) {
  throw new Error('desconto passou de 30%: cupom + quantidade + vip somam ' + calcularDescontoTotal(pedidoRelatado));
}`,
        buggyLine: 6,
        fix: '  return Math.min(desconto, 0.3);',
        symptomLine: 10,
        symptomFeedback:
          'É aqui que o teste aponta o problema — o desconto passou de 30% —, mas a linha em si só está reportando o que já aconteceu antes dela. O defeito é a função nunca ter um teto.',
        explanation:
          'A função soma três descontos possíveis (cupom, quantidade, cliente vip) e nunca limita o total: com os três juntos, dá `0.1 + 0.05 + 0.2 = 0.35`, acima do máximo de 30% prometido. O conserto é o mesmo `Math.min(desconto, 0.3)` do exemplo da aula — e o teste que reproduziu o bug fica na suíte, para pegar a próxima vez que alguém acrescentar um quarto desconto e esquecer o teto de novo.',
        hints: [
          'A mensagem de erro diz que o desconto passou de 30%. Onde a função deveria impedir isso, e não impede?',
          'Compare com `calcularDescontoTotal` do início da aula: o que ela tinha que esta versão não tem?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-8-testar-regressao',
        type: 'write-test',
        prompt:
          '`calcularDescontoTotal(pedido)` abaixo já está **corrigida** (com o teto de 30%). Escreva o teste de regressão que prova o conserto: um pedido com cupom **e** cinco ou mais itens não pode passar de 30% de desconto. Nomeie a combinação na mensagem, não um número de chamado.',
        concepts: ['testes-regressao'],
        difficulty: 'intermediario',
        tags: ['testes', 'regressao', 'assert'],
        subject: CALCULAR_DESCONTO,
        initialCode: `// O bug: cupom + quantidade juntos não podem passar de 30%.
// Escreva o teste de regressão.

`,
        mutants: [
          {
            description: 'o bug original volta: sem o teto de 30%',
            code: `function calcularDescontoTotal(pedido) {
  let desconto = 0;
  if (pedido.cupom === 'PROMO10') desconto = desconto + 0.25;
  if (pedido.itens.length >= 5) desconto = desconto + 0.1;
  return desconto;
}`,
          },
          {
            description: 'o teto virou 50% em vez de 30% (alguém mudou o número por engano)',
            code: `function calcularDescontoTotal(pedido) {
  let desconto = 0;
  if (pedido.cupom === 'PROMO10') desconto = desconto + 0.25;
  if (pedido.itens.length >= 5) desconto = desconto + 0.1;
  return Math.min(desconto, 0.5);
}`,
          },
        ],
        hints: [
          'Monte um pedido que tenha os dois: `{ cupom: "PROMO10", itens: [1,2,3,4,5] }` (cinco itens, cupom válido).',
          'A afirmação é sobre o teto: o resultado precisa ser exatamente `0.3`, não só "menor que algo".',
          'assert(calcularDescontoTotal({ cupom: "PROMO10", itens: [1,2,3,4,5] }) === 0.3, "cupom com 5+ itens não passa do teto de 30%");',
        ],
        solution: `assert(
  calcularDescontoTotal({ cupom: 'PROMO10', itens: [1,2,3,4,5] }) === 0.3,
  'cupom PROMO10 com 5+ itens fica no teto de 30%, nao passa disso'
);`,
        explanation:
          'Testar que o resultado é exatamente `0.3` (e não só "menor que 1", por exemplo) é o que pega as duas sabotagens: cupom (0.25) mais cinco ou mais itens (0.1) somam 0.35 — sem o teto, o resultado seria `0.35`, diferente do `0.3` esperado; com o teto errado em `0.5`, o resultado continua sendo `0.35` (ainda abaixo de 0.5, mas nada perto do 0.3 que a regra promete).',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-8-nomear-a-combinacao',
        type: 'multiple-choice',
        prompt: 'Qual destes nomes de teste de regressão é o MAIS útil daqui a um ano?',
        concepts: ['testes-regressao'],
        difficulty: 'iniciante',
        tags: ['testes', 'regressao', 'nomes'],
        options: [
          '"cupom PROMO10 combinado com 5+ itens não pode passar do desconto máximo de 30%"',
          '"teste do bug #482"',
          '"regressão"',
          '"não quebrar de novo"',
        ],
        correctIndex: 0,
        explanation:
          '"Teste do bug #482" (ou "regressão", ou "não quebrar de novo") só faz sentido para quem já sabia o que era o bug 482 — e daqui a um ano, ninguém lembra. Nomear a **combinação** que causou o problema (cupom + quantidade, no exemplo) explica a regra sozinho, sem precisar consultar um chamado antigo.',
        hints: ['Imagine ler esse nome de teste daqui a um ano, sem lembrar de nada sobre o bug original.'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um bug relatado merece um **teste de regressão**: escrito antes do conserto, visto **falhando** contra o código com o defeito (prova que testa a coisa certa), e mantido na suíte para sempre depois de consertado.

O nome do teste nomeia a **combinação** que causou o bug — não um número de chamado que ninguém mais vai lembrar o que significava.

**Você fechou a trilha de testes.** Testes que provam o que dizem provar, na forma certa, um comportamento por vez, isolando dependências, testando o que importa e guardando a memória de cada bug corrigido — é o que separa "os testes passam" de "o código está protegido".
`.trim(),
    },
  ],
};
