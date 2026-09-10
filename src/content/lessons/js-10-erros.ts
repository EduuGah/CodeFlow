import type { Lesson } from '../types';

export const lessonErros: Lesson = {
  id: 'lesson-js-10',
  trackId: 'track-js-fundamentos',
  title: 'Erros: Ler a Mensagem Antes de Chutar',
  language: 'javascript',
  objective:
    'Interpretar uma mensagem de erro, usar try/catch onde ele serve, e lançar erros que ajudem quem ler.',
  concepts: ['depuracao', 'objetos', 'variaveis'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Errar não é o problema — programar é errar o tempo todo. O que separa quem avança de quem trava é **ler a mensagem** em vez de mudar coisas ao acaso até funcionar.

Toda mensagem tem duas partes úteis: o **tipo** do erro e o **detalhe**. O tipo já reduz muito o campo de busca:

| Tipo | O que aconteceu | Onde olhar |
|---|---|---|
| \`SyntaxError\` | o código nem chegou a rodar | parêntese, chave ou aspas não fechados |
| \`ReferenceError\` | usou um nome que não existe | erro de digitação, ou variável fora de escopo |
| \`TypeError\` | o valor não é do tipo que você supôs | algo é \`undefined\` quando você esperava um objeto |
| \`RangeError\` | o valor é do tipo certo, mas fora da faixa | índice negativo, número onde só cabe positivo |

Repare na diferença entre o segundo e o terceiro. \`ReferenceError: x is not defined\` significa que **o nome** não existe. \`TypeError: Cannot read properties of undefined\` significa que o nome existe, mas **o valor dentro dele** é \`undefined\`.

## A causa está antes de onde o erro estoura

Esta é a ideia mais útil da aula. O erro aparece na linha em que o programa não conseguiu continuar — mas a linha que **criou** o problema quase sempre é anterior.

~~~javascript
const pedido = buscarPedido(id);
const cidade = pedido.cliente.endereco.cidade;
// TypeError: Cannot read properties of undefined (reading 'cidade')
~~~

A mensagem cita \`cidade\`, mas o culpado não é \`cidade\`: é \`endereco\`, que era \`undefined\`. E \`endereco\` estar vazio provavelmente vem de \`cliente\`, que veio de \`buscarPedido\`. A frase "Cannot read properties **of undefined**" está falando de quem tentou fornecer a propriedade, não da propriedade.

O método é mecânico: **imprima os valores intermediários até achar o primeiro que não é o que você esperava.**
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const dados = {};

// O método de investigação: quebre em pedaços e imprima cada um
console.log(dados);          // {}
console.log(dados.usuario);  // undefined  <- a causa está aqui
// console.log(dados.usuario.nome);  <- o erro estouraria aqui

// Quando a ausência é esperada, o encadeamento opcional evita a queda
console.log(dados.usuario?.nome);        // undefined, sem erro
console.log(dados.usuario?.nome ?? "—"); // "—"

// Cuidado: ?. resolve o sintoma. Se o usuário DEVERIA existir,
// esconder a ausência só adia a descoberta do bug de verdade.`,
      caption:
        'O `?.` interrompe a leitura e devolve `undefined` em vez de quebrar. Use quando a ausência é um caso legítimo — não para calar um erro que você ainda não entendeu.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-10-tipo',
        type: 'multiple-choice',
        prompt:
          'Seu código exibe `TypeError: pedidos.filtrar is not a function`. Qual é a causa mais provável?',
        concepts: ['depuracao'],
        difficulty: 'iniciante',
        tags: ['javascript', 'erros'],
        options: [
          'A variável pedidos não foi declarada em lugar nenhum',
          'O método se chama filter, não filtrar — o nome digitado não existe nos arrays',
          'Falta um ponto e vírgula na linha anterior',
          'O array pedidos está vazio',
        ],
        correctIndex: 1,
        explanation:
          'O tipo do erro entrega a resposta. Se `pedidos` não existisse, seria `ReferenceError`. Como é `TypeError` dizendo que **não é uma função**, o objeto existe — o que não existe é a propriedade `filtrar`. Acessar uma propriedade inexistente devolve `undefined`, e tentar chamar `undefined()` dá exatamente essa mensagem. Um array vazio também não causaria isso: `[].filter()` funciona normalmente.',
        hints: [
          'Compare: ReferenceError é sobre o nome não existir; TypeError é sobre o valor não ser o esperado.',
          'A mensagem diz "is not a function". O que acontece se você acessa uma propriedade que não existe e tenta chamá-la?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-10-ler-mensagem',
        type: 'multiple-choice',
        prompt:
          "Seu programa parou com `TypeError: Cannot read properties of undefined (reading 'nome')`. O que isso diz?",
        concepts: ['depuracao'],
        difficulty: 'iniciante',
        tags: ['javascript', 'erros'],
        options: [
          'A propriedade `nome` está com valor `undefined`',
          'O valor de onde você tentou ler `nome` é que era `undefined`',
          'A variável `nome` não foi declarada',
          'O tipo de `nome` está errado',
        ],
        correctIndex: 1,
        explanation:
          'A mensagem descreve **quem não tinha a propriedade**, não a propriedade em si. Em `pedido.cliente.nome`, se o erro fala de `nome`, então `pedido.cliente` já era `undefined`. Procurar o defeito um passo antes do que a mensagem cita é o que resolve esse erro rápido.',
        hints: [
          '"Cannot read properties **of undefined**" — de quem a frase está falando?',
          'Se `nome` estivesse undefined, ler seria possível. O problema é ler DE alguém que não existe.',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## \`try/catch\`: para o que você não controla

\`try/catch\` existe para lidar com o que pode falhar **por motivos fora do seu código**: uma rede que caiu, um arquivo que não está lá, um texto que o usuário digitou e que deveria ser JSON.

~~~javascript
try {
  const config = JSON.parse(texto);
  aplicar(config);
} catch (erro) {
  console.warn("Configuração inválida, usando a padrão:", erro.message);
  aplicar(CONFIG_PADRAO);
}
~~~

O que ele **não** é: um jeito de fazer o programa parar de reclamar.

~~~javascript
try {
  salvar(pedido);
} catch (e) {}          // nunca faça isso
~~~

Esse \`catch\` vazio é pior do que a queda que ele evita. O pedido não foi salvo, ninguém ficou sabendo, e o programa segue como se tudo tivesse dado certo. O usuário só descobre dias depois, quando o pedido não aparece — e aí não há nenhum rastro de quando falhou nem por quê.

A regra prática: **um \`catch\` precisa fazer alguma coisa.** Registrar, avisar quem está usando, tentar um caminho alternativo, ou relançar. Se você não sabe o que fazer com o erro ali, deixe-o subir: quebrar alto e cedo é melhor que corromper dados em silêncio.

E existe o \`finally\`, que roda sempre — deu certo, deu errado, teve \`return\` no meio. É onde vai o que precisa acontecer de qualquer jeito: fechar a conexão, esconder o "carregando".
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-10-catch-silencioso',
        type: 'multiple-choice',
        prompt:
          'Um colega envolveu uma chamada que estava quebrando assim:\n\n```javascript\ntry {\n  salvar(pedido);\n} catch (e) {}\n```\n\nA tela parou de mostrar erro. Qual é o problema?',
        concepts: ['depuracao'],
        difficulty: 'intermediario',
        tags: ['javascript', 'erros'],
        options: [
          'Nenhum: capturar o erro é justamente o que impede o programa de quebrar',
          'O pedido continua não sendo salvo, e agora ninguém fica sabendo disso',
          'O `catch` precisa declarar o parâmetro `e` para funcionar',
          'Faltou um `finally` para fechar o bloco corretamente',
        ],
        correctIndex: 1,
        explanation:
          'O erro não foi corrigido — foi escondido. A falha continua acontecendo, o pedido continua não sendo salvo, e agora não sobrou nem a mensagem que apontava a causa. O programa segue adiante como se tivesse dado certo, e o problema reaparece dias depois, sem rastro, na forma de um pedido que sumiu. Um `catch` precisa fazer alguma coisa: registrar, avisar, tentar outro caminho ou relançar.',
        hints: [
          'A chamada `salvar(pedido)` passou a funcionar, ou só parou de avisar que não funcionou?',
          'Quem vai descobrir esse problema, e quando?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-10-prever-finally',
        type: 'predict-output',
        prompt: 'O que este programa imprime, e em que ordem?',
        concepts: ['depuracao'],
        difficulty: 'intermediario',
        tags: ['javascript', 'erros'],
        code: `function tentar() {
  try {
    console.log('A');
    throw new Error('falhou');
  } catch (e) {
    console.log('B');
    return 'do catch';
  } finally {
    console.log('C');
  }
}

console.log(tentar());`,
        expectedOutput: 'A\nB\nC\ndo catch',
        explanation:
          'O `finally` roda **mesmo quando há `return` no `catch`** — o valor fica reservado, o `finally` executa, e só então a função devolve. É por isso que ele é o lugar certo para fechar o que precisa ser fechado, independentemente do desfecho.',
        hints: [
          'O `return` dentro do `catch` impede o `finally` de rodar?',
          'Em que momento o valor do `return` chega a quem chamou?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Lançar um erro é prestar um serviço

A outra metade do assunto é **produzir** erros, não só consumi-los. Uma função que recebe algo impossível tem duas saídas: devolver um resultado sem sentido, ou parar e dizer o que houve.

~~~javascript
function dividir(a, b) {
  if (b === 0) {
    throw new RangeError("Não dá para dividir por zero.");
  }
  return a / b;
}
~~~

Sem o \`throw\`, \`dividir(10, 0)\` devolveria \`Infinity\`, que viajaria pelo programa e explodiria muito longe dali, num lugar sem nenhuma pista da origem. Com o \`throw\`, o problema aparece exatamente onde nasceu.

Verificações desse tipo, no começo da função, se chamam **guardas**. Elas mantêm o corpo da função limpo — depois delas, o resto do código pode confiar nos valores.

Escolha o tipo pelo que aconteceu: \`TypeError\` quando o valor é da espécie errada, \`RangeError\` quando é da espécie certa mas fora da faixa aceitável.

E a mensagem é para uma pessoa ler:

~~~javascript
throw new Error("erro");                                   // inútil
throw new RangeError("desconto deve ficar entre 0 e 1.");  // útil
~~~

A segunda diz o que era esperado. Quem receber essa mensagem às duas da manhã vai saber o que fazer.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-10-lacuna-guarda',
        type: 'fill-blank',
        prompt:
          'Complete as guardas desta função. A primeira recusa valores que **não são números**; a segunda recusa um número **fora da faixa** aceitável.',
        concepts: ['depuracao', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'erros'],
        template: `function aplicarDesconto(preco, desconto) {
  if (typeof desconto !== 'number') {
    {{1}} new TypeError('desconto deve ser um número.');
  }

  if (desconto < 0 || desconto > 1) {
    throw new {{2}}('desconto deve ficar entre 0 e 1.');
  }

  return preco - preco * desconto;
}`,
        blanks: [
          { placeholder: 'lança', size: 7 },
          { placeholder: 'fora da faixa', size: 12 },
        ],
        tests: [
          {
            description: 'um desconto válido é aplicado',
            assertion: `const r = aplicarDesconto(200, 0.1); if (r !== 180) throw new Error("Esperava 180, veio " + r + ".");`,
          },
          {
            description: 'texto no lugar do desconto é recusado como TypeError',
            assertion: `
              let capturado = null;
              try { aplicarDesconto(200, 'dez por cento'); } catch (e) { capturado = e; }
              if (capturado === null) throw new Error("Passar um texto deveria lançar um erro, e não lançou.");
              if (capturado.name !== 'TypeError') throw new Error("Esperava TypeError, veio " + capturado.name + ".");
            `,
          },
          {
            description: 'desconto acima de 1 é recusado como RangeError',
            assertion: `
              let capturado = null;
              try { aplicarDesconto(200, 1.5); } catch (e) { capturado = e; }
              if (capturado === null) throw new Error("Um desconto de 150% deveria lançar um erro.");
              if (capturado.name !== 'RangeError') throw new Error("O valor é um número, mas está fora da faixa: existe um tipo de erro específico para isso. Veio " + capturado.name + ".");
            `,
          },
          {
            description: 'desconto negativo também é recusado',
            assertion: `
              let capturado = null;
              try { aplicarDesconto(200, -0.2); } catch (e) { capturado = e; }
              if (capturado === null) throw new Error("Desconto negativo aumentaria o preço; deveria ser recusado.");
            `,
            hidden: true,
          },
          {
            description: 'os extremos 0 e 1 são aceitos',
            assertion: `
              if (aplicarDesconto(200, 0) !== 200) throw new Error("Desconto 0 é válido e não deveria mudar o preço.");
              if (aplicarDesconto(200, 1) !== 0) throw new Error("Desconto 1 é válido e zera o preço.");
            `,
            hidden: true,
          },
        ],
        explanation:
          'As duas guardas separam problemas diferentes, e o tipo do erro comunica qual é qual. `TypeError` diz "isso nem é da espécie que eu aceito"; `RangeError` diz "é da espécie certa, mas fora da faixa". Quem lê o erro num relatório de produção economiza minutos só com essa distinção.',
        hints: [
          'A palavra que dispara um erro é a mesma que já aparece na segunda guarda.',
          'O valor é um número, então não é problema de tipo. Qual dos erros da tabela cobre "fora da faixa"?',
        ],
        solution: ['throw', 'RangeError'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-10-ler-config',
        type: 'code',
        prompt: `Crie \`lerConfig(texto, padrao)\`, que **retorna** o objeto guardado num texto JSON.\n\nEste é o caso legítimo de \`try/catch\`: o texto vem de fora e pode ser qualquer coisa.\n\n- Se o texto for um JSON válido **de objeto**, devolve o objeto.\n- Em qualquer outro caso — texto quebrado, vazio, ou um JSON que não é objeto — devolve \`padrao\`.\n- A função **nunca** pode lançar erro.`,
        concepts: ['depuracao', 'objetos'],
        difficulty: 'intermediario',
        tags: ['javascript', 'erros', 'json'],
        initialCode: `function lerConfig(texto, padrao) {
  // JSON.parse lança quando o texto é inválido. Esse é o ponto.
}

const PADRAO = { tema: 'claro' };

console.log(lerConfig('{"tema":"escuro"}', PADRAO)); // { tema: 'escuro' }
console.log(lerConfig('isso nao e json', PADRAO));   // { tema: 'claro' }
console.log(lerConfig('42', PADRAO));                // { tema: 'claro' }`,
        hints: [
          '`JSON.parse` lança um SyntaxError quando o texto não é JSON válido. Envolva a chamada.',
          'Nem todo JSON válido é um objeto: `"42"` e `"null"` também passam pelo parse.',
          'Depois do parse, confira o tipo antes de devolver. Cuidado: `typeof null` é `"object"`.',
          'try { const v = JSON.parse(texto); if (typeof v !== "object" || v === null) return padrao; return v; } catch (e) { return padrao; }',
        ],
        tests: [
          {
            description: 'A função lerConfig existe',
            assertion: `if (typeof lerConfig !== 'function') throw new Error("Crie uma função chamada 'lerConfig'.");`,
          },
          {
            description: 'um JSON de objeto válido é devolvido',
            assertion: `
              const r = lerConfig('{"tema":"escuro","fonte":14}', { tema: 'claro' });
              if (r === null || typeof r !== 'object') throw new Error("Deveria devolver um objeto, veio " + JSON.stringify(r) + ".");
              if (r.tema !== 'escuro' || r.fonte !== 14) throw new Error("O objeto devolvido não bate com o JSON recebido: " + JSON.stringify(r));
            `,
          },
          {
            description: 'texto inválido devolve o padrão, sem lançar',
            assertion: `
              const padrao = { tema: 'claro' };
              let r;
              try { r = lerConfig('isso nao e json', padrao); }
              catch (e) { throw new Error("A função lançou em vez de devolver o padrão: " + e.message); }
              if (r !== padrao) throw new Error("Deveria devolver o próprio objeto padrão, veio " + JSON.stringify(r) + ".");
            `,
          },
          {
            description: 'JSON válido que não é objeto devolve o padrão',
            assertion: `
              const padrao = { tema: 'claro' };
              if (lerConfig('42', padrao) !== padrao) throw new Error("O texto '42' é JSON válido, mas não é um objeto de configuração.");
            `,
            hidden: true,
          },
          {
            description: 'o JSON null não passa por objeto',
            assertion: `
              const padrao = { tema: 'claro' };
              if (lerConfig('null', padrao) !== padrao) throw new Error("'null' é JSON válido e typeof null é 'object' — essa é a pegadinha. Precisa devolver o padrão.");
            `,
            hidden: true,
          },
          {
            description: 'texto vazio devolve o padrão',
            assertion: `
              const padrao = { tema: 'claro' };
              let r;
              try { r = lerConfig('', padrao); }
              catch (e) { throw new Error("Texto vazio fez a função lançar: " + e.message); }
              if (r !== padrao) throw new Error("Texto vazio deveria devolver o padrão.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'todo objeto sobrevive à ida e volta, e todo texto inválido cai no padrão',
            generate: `
              const invalidos = ['', 'isso nao e json', '{tema:', '{"a":}', 'undefined', 'null', '42'];

              if (rnd() < 0.5) {
                return { tipo: 'invalido', texto: invalidos[Math.floor(rnd() * invalidos.length)] };
              }

              const objeto = {
                tema: rnd() < 0.5 ? 'claro' : 'escuro',
                fonte: 10 + Math.floor(rnd() * 10),
                compacto: rnd() < 0.5,
              };

              return { tipo: 'objeto', texto: JSON.stringify(objeto), objeto: objeto };
            `,
            check: `
              const padrao = { padrao: true };
              const obtido = lerConfig(caso.texto, padrao);

              if (caso.tipo === 'invalido') {
                if (obtido !== padrao) {
                  throw new Error("para " + JSON.stringify(caso.texto) + " esperava o padrão, veio " + JSON.stringify(obtido) + ".");
                }
                return;
              }

              if (obtido === padrao) {
                throw new Error("para " + JSON.stringify(caso.texto) + " devolveu o padrão, mas o JSON era válido.");
              }

              const chaves = Object.keys(caso.objeto);
              for (const chave of chaves) {
                if (obtido[chave] !== caso.objeto[chave]) {
                  throw new Error("a chave " + chave + " voltou como " + JSON.stringify(obtido[chave]) + ", esperava " + JSON.stringify(caso.objeto[chave]) + ".");
                }
              }
            `,
          },
        ],
        solution: `function lerConfig(texto, padrao) {
  try {
    const valor = JSON.parse(texto);
    if (typeof valor !== 'object' || valor === null) return padrao;
    return valor;
  } catch (erro) {
    return padrao;
  }
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-10-achar-linha',
        type: 'find-bug',
        prompt:
          'Este programa quebra com `TypeError: itens is not iterable`.\n\nO erro é reportado numa linha. **Aponte a linha onde o defeito está** — que é outra.',
        concepts: ['depuracao'],
        difficulty: 'intermediario',
        tags: ['javascript', 'erros'],
        code: `function total(carrinho) {
  const itens = carrinho.produtos;
  let soma = 0;

  for (const item of itens) {
    soma += item.preco;
  }

  return soma;
}

console.log(total({ itens: [{ preco: 10 }] }));`,
        buggyLine: 2,
        fix: '  const itens = carrinho.itens;',
        symptomLine: 5,
        symptomFeedback:
          'É aí que o programa para, mas o `for` está correto: ele só recebeu `undefined` no lugar de uma lista. Suba uma linha de cada vez perguntando "de onde veio esse valor?" — a resposta está na linha 2, que lê uma propriedade que este carrinho não tem.',
        explanation:
          'A linha 2 lê `carrinho.produtos`, mas o objeto que chega tem `itens`. Ler uma propriedade que não existe **não dá erro**: devolve `undefined` em silêncio, e esse `undefined` viaja três linhas até encontrar o `for`, que é o primeiro lugar que não sabe o que fazer com ele.\n\nÉ o formato mais comum de bug em JavaScript: o erro aparece onde o valor errado foi **usado**, e o defeito está onde ele foi **produzido**.',
        hints: [
          'A mensagem diz que `itens` não é iterável. De onde veio o valor de `itens`?',
          'Compare os nomes de propriedade: o que a função lê, e o que o objeto passado realmente tem.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-10-corrigir',
        type: 'code',
        prompt: `A função abaixo deveria devolver o total do carrinho, mas quebra. **Encontre e corrija os dois problemas** sem reescrever tudo do zero.\n\nEla deve devolver 35 para o carrinho de exemplo, e 0 para um carrinho vazio.`,
        concepts: ['depuracao', 'arrays', 'loops'],
        difficulty: 'intermediario',
        tags: ['javascript', 'debugging', 'arrays'],
        initialCode: `function total(carrinho) {
  for (let i = 0; i <= carrinho.length; i++) {
    let soma = 0;
    soma = soma + carrinho[i].preco;
  }
  return soma;
}

console.log(total([{ preco: 10 }, { preco: 25 }])); // esperado: 35
`,
        hints: [
          'Execute e leia o erro. Ele aponta uma linha, mas a causa pode estar na linha de cima.',
          'Primeiro problema: a condição do loop deixa o índice passar do fim do array.',
          'Segundo problema: onde a variável soma está sendo declarada? O que acontece com ela a cada volta?',
          'Use i < carrinho.length e declare let soma = 0 antes do for, não dentro.',
        ],
        tests: [
          {
            description: 'A função total existe',
            assertion: `if (typeof total !== 'function') throw new Error("Mantenha uma função chamada 'total'.");`,
          },
          {
            description: 'Soma o carrinho de exemplo corretamente',
            assertion: `let r;
try {
  r = total([{ preco: 10 }, { preco: 25 }]);
} catch (e) {
  throw new Error("A função ainda quebra: " + e.message + ". Leia o erro e veja qual índice o loop está tentando acessar.");
}
if (r !== 35) throw new Error("Esperado 35, mas veio " + r + ". Onde a variável soma está declarada?");`,
          },
          {
            description: 'Carrinho vazio devolve 0',
            assertion: `let r;
try {
  r = total([]);
} catch (e) {
  throw new Error("Quebrou com carrinho vazio: " + e.message);
}
if (r !== 0) throw new Error("Um carrinho vazio deveria devolver 0, mas devolveu " + r + ".");`,
          },
          {
            description: 'Funciona com um item só',
            assertion: `if (total([{ preco: 7 }]) !== 7) throw new Error("Com um único item de 7, o total deveria ser 7.");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'o total bate com a soma dos preços, para qualquer carrinho',
            generate: `
              const quantos = Math.floor(rnd() * 8);
              const itens = [];
              let esperado = 0;

              for (let i = 0; i < quantos; i++) {
                const preco = Math.floor(rnd() * 100);
                itens.push({ preco: preco });
                esperado += preco;
              }

              return { itens: itens, esperado: esperado };
            `,
            check: `
              const obtido = total(caso.itens);
              if (obtido !== caso.esperado) {
                throw new Error("com " + caso.itens.length + " itens esperava " + caso.esperado + ", veio " + obtido + ".");
              }
            `,
          },
        ],
        solution: `function total(carrinho) {
  let soma = 0;
  for (let i = 0; i < carrinho.length; i++) {
    soma = soma + carrinho[i].preco;
  }
  return soma;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `O tipo do erro já diz onde procurar: \`SyntaxError\` é escrita, \`ReferenceError\` é nome que não existe, \`TypeError\` é valor de espécie errada, \`RangeError\` é valor fora da faixa. Quando travar, imprima os valores intermediários até achar **o primeiro** que não é o que você imaginava — a causa está antes de onde o erro estourou. Use \`try/catch\` para o que está fora do seu controle, e nunca deixe um \`catch\` vazio: esconder a falha é pior que a queda, porque some junto a única pista. E ao lançar, escolha o tipo certo e escreva a mensagem para uma pessoa ler às duas da manhã.`,
    },
  ],
};
