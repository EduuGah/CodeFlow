import type { Lesson } from '../types';

export const lessonTokens: Lesson = {
  id: 'lesson-web-6',
  trackId: 'track-web',
  title: 'Tokens: O Crachá que Vence',
  language: 'javascript',
  objective:
    'Ler o conteúdo de um token, entender por que ele não é secreto, e saber o que nunca colocar dentro dele.',
  concepts: ['autenticacao', 'seguranca-web', 'json'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um **token** é um crachá: o servidor te entrega depois do login, e você o mostra em cada pedido. O formato mais comum se chama **JWT**, e ele é só um texto com três partes separadas por ponto:

~~~
eyJhbGciOiJIUzI1NiJ9  .  eyJzdWIiOjEsImV4cCI6MTc2NX0  .  4f3a9c...
└────── cabeçalho ─────┘   └───────── conteúdo ────────┘  └ assinatura ┘
~~~

- **Cabeçalho** — qual algoritmo assinou.
- **Conteúdo** — os dados: quem é, quando vence, o que pode.
- **Assinatura** — a prova de que o servidor emitiu isto.

As duas primeiras partes são **JSON codificado em base64url**. Base64 **não é criptografia**: é só um jeito de escrever bytes usando letras e números, e qualquer pessoa desfaz em uma linha.

## O que isso significa na prática

**Qualquer um lê o conteúdo do seu token.** Abrir o console do navegador e decodificar leva cinco segundos. Não é falha — é como o formato foi feito. A consequência é direta:

> **Nunca coloque nada secreto no conteúdo de um token.** Nem senha, nem CPF, nem chave de API.

**Ninguém consegue forjar um.** Alterar o conteúdo invalida a assinatura, e produzir uma assinatura nova exige uma chave que só o servidor tem. É por isso que ele funciona: o conteúdo é público, a autenticidade não.

**Só o servidor pode confiar no token.** O cliente pode ler o conteúdo para decidir o que mostrar na tela, mas isso é experiência. Quem confere a assinatura — e portanto quem confia — é o servidor, em cada pedido.

## O vencimento

O conteúdo traz um campo \`exp\`: o instante em que o crachá deixa de valer, em **segundos** desde 1970. Repare na unidade, porque o \`Date.now()\` do JavaScript devolve **milissegundos** — e essa diferença de mil é um dos erros mais comuns com JWT. Um token comparado na unidade errada parece vencido desde sempre, ou válido para sempre.

O vencimento existe por causa do problema da aula anterior: como ninguém guarda registro do token, **não há como revogá-lo**. Se ele vazar, quem o tiver é você até ele vencer. Daí a prática usual: um token de acesso curto, de minutos, e um token de renovação separado, guardado com mais cuidado, que serve para pedir um novo.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Decodificar o conteúdo: uma linha, sem chave nenhuma
function lerConteudo(token) {
  const meio = token.split('.')[1];
  return JSON.parse(atob(meio));
}

console.log(lerConteudo(token));
// { sub: 1, nome: "Ana", papel: "admin", exp: 1765000000 }

// O "sub" é o assunto do token: o identificador de quem ele representa.
// O "exp" está em SEGUNDOS. Date.now() está em milissegundos.
const agoraEmSegundos = Math.floor(Date.now() / 1000);

// Mandar em cada pedido
await fetch(API + '/pedidos', {
  headers: { Authorization: 'Bearer ' + token },
});

// O que o cliente pode fazer com o conteúdo: decidir o que MOSTRAR.
// O que ele não pode: decidir o que é PERMITIDO — isso é do servidor.`,
      caption:
        'A palavra `Bearer` antes do token é parte do padrão: ela diz "quem portar isto é quem eu digo que é". É literalmente um crachá ao portador — e por isso ele vale para quem o tiver na mão.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-6-nao-e-secreto',
        type: 'multiple-choice',
        prompt:
          'Um colega guardou o CPF do usuário dentro do conteúdo do JWT, "porque o token é criptografado". Qual é o problema?',
        concepts: ['autenticacao', 'seguranca-web'],
        difficulty: 'iniciante',
        tags: ['web', 'seguranca'],
        options: [
          'Nenhum: só o servidor tem a chave para abrir o token',
          'O conteúdo é apenas base64, que qualquer pessoa desfaz — a assinatura protege contra alteração, não contra leitura',
          'O problema é o tamanho: o CPF deixa o token grande demais para caber no cabeçalho',
          'Só é problema se o token não tiver campo de vencimento',
        ],
        correctIndex: 1,
        explanation:
          'Base64 não é criptografia — é uma forma de **escrever** bytes, e desfazer é uma chamada de função. Qualquer um que veja o token lê o conteúdo inteiro, inclusive quem interceptar, quem tiver acesso ao navegador da pessoa, ou qualquer sistema por onde o token passe em um log. O que a assinatura garante é outra coisa: que **ninguém alterou** o conteúdo. Autenticidade, não sigilo. Dado sensível fica no servidor, e o token carrega só o identificador que permite buscá-lo.',
        hints: [
          'Base64 precisa de chave para ser desfeito?',
          'A assinatura impede que alguém leia, ou que alguém modifique?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-6-prever-unidade',
        type: 'predict-output',
        prompt:
          'O campo `exp` de um JWT está em segundos. O que este programa imprime?',
        concepts: ['autenticacao', 'datas'],
        difficulty: 'intermediario',
        tags: ['web', 'autenticacao'],
        code: `const conteudo = { sub: 1, exp: 2000000000 };
const agoraMs = 1700000000000;

console.log(conteudo.exp < agoraMs);
console.log(conteudo.exp < Math.floor(agoraMs / 1000));
console.log(Math.floor(agoraMs / 1000));`,
        expectedOutput: 'true\nfalse\n1700000000',
        explanation:
          'A primeira comparação mistura as unidades: `2000000000` segundos contra `1700000000000` milissegundos. Como o número em milissegundos é mil vezes maior, **todo token parece vencido** — e o sintoma é um sistema que recusa logins recém-feitos. A segunda comparação converte antes, e aí a resposta é a certa: esse token ainda vale. Comparar números que representam grandezas diferentes não dá erro nenhum; dá uma resposta errada com cara de certa.',
        hints: [
          'Os dois números estão na mesma unidade na primeira comparação?',
          'Qual é maior: um instante em segundos, ou o mesmo instante em milissegundos?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-6-lacuna-exp',
        type: 'fill-blank',
        prompt:
          'Complete a checagem de vencimento. `agoraMs` vem de `Date.now()`, e `exp` está em segundos.',
        concepts: ['autenticacao', 'datas'],
        difficulty: 'intermediario',
        tags: ['web', 'autenticacao'],
        template: `function venceu(conteudo, agoraMs) {
  if (conteudo.exp === undefined) return false;

  const agoraEmSegundos = Math.floor(agoraMs {{1}} 1000);

  return conteudo.exp {{2}} agoraEmSegundos;
}`,
        blanks: [
          { placeholder: 'converte', size: 3 },
          { placeholder: 'já passou', size: 4 },
        ],
        tests: [
          {
            description: 'token do futuro ainda vale',
            assertion: `if (venceu({ exp: 2000000000 }, 1700000000000) !== false) throw new Error("Um token que vence em 2033 não está vencido em 2023.");`,
          },
          {
            description: 'token do passado venceu',
            assertion: `if (venceu({ exp: 1600000000 }, 1700000000000) !== true) throw new Error("Um token que venceu em 2020 está vencido em 2023.");`,
          },
          {
            description: 'sem exp, não vence',
            assertion: `if (venceu({ sub: 1 }, 1700000000000) !== false) throw new Error("Sem campo exp não há vencimento a checar.");`,
          },
          {
            description: 'o instante exato ainda vale',
            assertion: `
              const agoraMs = 1700000000000;
              if (venceu({ exp: 1700000000 }, agoraMs) !== false) throw new Error("No segundo exato do vencimento o token ainda vale: vencido é o que já PASSOU. Use a comparação estrita.");
            `,
            hidden: true,
          },
          {
            description: 'um segundo depois, venceu',
            assertion: `if (venceu({ exp: 1699999999 }, 1700000000000) !== true) throw new Error("Um segundo antes de agora já passou: o token está vencido.");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'a resposta bate com a comparação feita na mesma unidade',
            generate: `
              const agoraSegundos = 1700000000 + Math.floor(rnd() * 1000);
              const deslocamento = Math.floor(rnd() * 200) - 100;

              return { agoraMs: agoraSegundos * 1000, exp: agoraSegundos + deslocamento };
            `,
            check: `
              const esperado = caso.exp < Math.floor(caso.agoraMs / 1000);
              const obtido = venceu({ exp: caso.exp }, caso.agoraMs);

              if (obtido !== esperado) {
                throw new Error("exp " + caso.exp + " contra agora " + Math.floor(caso.agoraMs / 1000) + ": esperava " + esperado + ", veio " + obtido + ".");
              }
            `,
          },
        ],
        explanation:
          'Duas decisões pequenas com consequência grande. A conversão para segundos é o que faz a comparação ser entre grandezas iguais — sem ela, todo token parece vencido. E a comparação estrita trata o segundo exato do vencimento como ainda válido: "vencido" é o que já passou, não o que está acontecendo agora. É a mesma armadilha de fronteira de "acima de" contra "a partir de".',
        hints: [
          'Milissegundos viram segundos por qual operação?',
          'Vencido é o que já passou. No instante exato do vencimento, o token ainda vale.',
        ],
        solution: ['/', '<'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-6-ler-token',
        type: 'code',
        prompt: `Crie \`lerToken(token, agoraMs)\`, que **retorna** o que o cliente precisa saber sobre um JWT.\n\nO token tem três partes separadas por ponto; a do meio é o conteúdo em **base64**, e \`atob\` a desfaz.\n\nDevolva \`{ valido, conteudo, motivo }\`:\n\n- Formato errado (não tem três partes) → \`{ valido: false, conteudo: null, motivo: "formato" }\`\n- Conteúdo que não é JSON de objeto → mesmo formato, motivo \`"conteudo"\`\n- Vencido → \`{ valido: false, conteudo: <o objeto>, motivo: "vencido" }\`\n- Tudo certo → \`{ valido: true, conteudo: <o objeto>, motivo: null }\`\n\nA função **nunca** pode lançar: o token vem de fora.`,
        concepts: ['autenticacao', 'json', 'seguranca-web'],
        difficulty: 'intermediario',
        tags: ['web', 'autenticacao'],
        initialCode: `function lerToken(token, agoraMs) {
  // split('.') → a parte do meio → atob → JSON.parse.
  // Cada um desses passos pode falhar com um token de origem desconhecida.
}

const conteudo = btoa(JSON.stringify({ sub: 1, exp: 2000000000 }));
const token = 'cabecalho.' + conteudo + '.assinatura';

console.log(lerToken(token, 1700000000000));
console.log(lerToken('nao-e-token', 1700000000000));`,
        hints: [
          'Comece conferindo que `String(token).split(".")` tem exatamente 3 partes.',
          '`atob` e `JSON.parse` lançam com entrada inválida: os dois precisam ficar dentro de um try.',
          'Depois do parse, confirme que o resultado é um objeto — `"42"` é JSON válido e não serve.',
          'Vencimento só depois de ter o conteúdo: sem `exp`, o token não vence.',
        ],
        tests: [
          {
            description: 'A função lerToken existe',
            assertion: `if (typeof lerToken !== 'function') throw new Error("Crie uma função chamada 'lerToken'.");`,
          },
          {
            description: 'lê um token válido',
            assertion: `
              const t = 'h.' + btoa(JSON.stringify({ sub: 1, nome: 'Ana', exp: 2000000000 })) + '.s';
              const r = lerToken(t, 1700000000000);
              if (r === null || typeof r !== 'object') throw new Error("Deveria devolver um objeto, veio " + JSON.stringify(r) + ".");
              if (r.valido !== true) throw new Error("Este token vence em 2033 e agora é 2023: deveria ser válido. Motivo veio " + JSON.stringify(r.motivo) + ".");
              if (r.conteudo === null || r.conteudo.sub !== 1 || r.conteudo.nome !== 'Ana') throw new Error("O conteúdo devolvido não bate: " + JSON.stringify(r.conteudo));
              if (r.motivo !== null) throw new Error("Token válido não tem motivo de recusa, veio " + JSON.stringify(r.motivo) + ".");
            `,
          },
          {
            description: 'formato errado é recusado sem lançar',
            assertion: `
              let r;
              try { r = lerToken('nao-e-token', 1700000000000); }
              catch (e) { throw new Error("A função lançou em vez de recusar: " + e.message); }
              if (r.valido !== false || r.motivo !== 'formato') throw new Error("Sem três partes, o motivo é 'formato'. Veio " + JSON.stringify(r) + ".");
              if (r.conteudo !== null) throw new Error("Sem conseguir ler, o conteúdo é null. Veio " + JSON.stringify(r.conteudo) + ".");
            `,
          },
          {
            description: 'token vencido devolve o conteúdo e o motivo',
            assertion: `
              const t = 'h.' + btoa(JSON.stringify({ sub: 7, exp: 1600000000 })) + '.s';
              const r = lerToken(t, 1700000000000);
              if (r.valido !== false || r.motivo !== 'vencido') throw new Error("Deveria ser inválido por vencimento. Veio " + JSON.stringify(r) + ".");
              if (r.conteudo === null || r.conteudo.sub !== 7) throw new Error("Mesmo vencido, o conteúdo foi lido e deve voltar — é o que permite dizer QUEM venceu. Veio " + JSON.stringify(r.conteudo) + ".");
            `,
          },
          {
            description: 'meio que não é JSON válido é recusado',
            assertion: `
              let r;
              try { r = lerToken('h.' + btoa('isso nao e json') + '.s', 1700000000000); }
              catch (e) { throw new Error("A função lançou com conteúdo inválido: " + e.message); }
              if (r.valido !== false || r.motivo !== 'conteudo') throw new Error("Conteúdo ilegível tem motivo 'conteudo'. Veio " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
          {
            description: 'JSON válido que não é objeto também é recusado',
            assertion: `
              const r = lerToken('h.' + btoa('42') + '.s', 1700000000000);
              if (r.valido !== false || r.motivo !== 'conteudo') throw new Error("'42' é JSON válido mas não é um conteúdo de token. Veio " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
          {
            description: 'token sem exp não vence',
            assertion: `
              const t = 'h.' + btoa(JSON.stringify({ sub: 3 })) + '.s';
              const r = lerToken(t, 1700000000000);
              if (r.valido !== true) throw new Error("Sem campo exp não há vencimento a checar, então o token vale. Veio " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
          {
            description: 'entrada que nem é texto não derruba a função',
            assertion: `
              for (const entrada of [null, undefined, 42, {}]) {
                let r;
                try { r = lerToken(entrada, 1700000000000); }
                catch (e) { throw new Error("Lançou com a entrada " + JSON.stringify(entrada) + ": " + e.message + ". O token vem de fora e pode ser qualquer coisa."); }
                if (r.valido !== false) throw new Error("A entrada " + JSON.stringify(entrada) + " não é um token válido.");
              }
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'a validade depende só do formato, do conteúdo e do vencimento',
            generate: `
              const agoraSegundos = 1700000000;
              const sorteio = rnd();

              if (sorteio < 0.2) {
                const quebrados = ['', 'abc', 'a.b', 'a.b.c.d'];
                return { token: quebrados[Math.floor(rnd() * quebrados.length)], motivo: 'formato' };
              }

              if (sorteio < 0.35) {
                return { token: 'h.' + btoa('nao e json') + '.s', motivo: 'conteudo' };
              }

              const vencido = rnd() < 0.4;
              const exp = agoraSegundos + (vencido ? -500 : 500);
              const sub = Math.floor(rnd() * 100);

              return {
                token: 'h.' + btoa(JSON.stringify({ sub: sub, exp: exp })) + '.s',
                motivo: vencido ? 'vencido' : null,
                sub: sub,
              };
            `,
            check: `
              const r = lerToken(caso.token, 1700000000000);

              if (r === null || typeof r !== 'object') {
                throw new Error("para " + JSON.stringify(caso.token) + " devolveu " + JSON.stringify(r) + ".");
              }
              if (r.motivo !== caso.motivo) {
                throw new Error("para " + JSON.stringify(caso.token) + " o motivo veio " + JSON.stringify(r.motivo) + ", esperava " + JSON.stringify(caso.motivo) + ".");
              }
              if (r.valido !== (caso.motivo === null)) {
                throw new Error("motivo " + JSON.stringify(caso.motivo) + " e valido " + r.valido + " não combinam.");
              }
              if (caso.sub !== undefined && (r.conteudo === null || r.conteudo.sub !== caso.sub)) {
                throw new Error("o conteúdo deveria trazer sub " + caso.sub + ", veio " + JSON.stringify(r.conteudo) + ".");
              }
            `,
          },
        ],
        solution: `function lerToken(token, agoraMs) {
  const recusa = (motivo) => ({ valido: false, conteudo: null, motivo: motivo });

  const partes = String(token).split('.');
  if (partes.length !== 3) return recusa('formato');

  let conteudo;
  try {
    conteudo = JSON.parse(atob(partes[1]));
  } catch (erro) {
    return recusa('conteudo');
  }

  if (typeof conteudo !== 'object' || conteudo === null) return recusa('conteudo');

  if (conteudo.exp !== undefined && conteudo.exp < Math.floor(agoraMs / 1000)) {
    return { valido: false, conteudo: conteudo, motivo: 'vencido' };
  }

  return { valido: true, conteudo: conteudo, motivo: null };
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Um JWT são três partes separadas por ponto, e as duas primeiras são JSON em **base64** — que não é criptografia. Qualquer pessoa lê o conteúdo do seu token em uma linha, então nada secreto entra ali; o que a assinatura garante é que ninguém **alterou**, não que ninguém leu. O cliente pode ler o conteúdo para decidir o que mostrar, mas quem confere a assinatura e confia é o servidor, em cada pedido. O campo \`exp\` está em **segundos** enquanto \`Date.now()\` está em milissegundos, e comparar na unidade errada não dá erro — dá uma resposta errada com cara de certa. E como ninguém guarda registro do token, revogar é difícil: daí o acesso curto somado a um token de renovação separado.`,
    },
  ],
};
