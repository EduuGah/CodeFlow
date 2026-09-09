import type { Lesson } from '../types';

export const lessonDatas: Lesson = {
  id: 'lesson-js-19',
  trackId: 'track-js-fundamentos',
  title: 'Datas: O Erro de Um Dia',
  language: 'javascript',
  objective:
    'Criar, comparar e formatar datas sem cair no erro de um dia causado por fuso horário.',
  concepts: ['datas', 'tipos-de-dados', 'casos-extremos'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Datas em JavaScript têm duas armadilhas que quase todo mundo encontra do jeito ruim: em produção.

**A primeira: o mês começa em zero.**

~~~javascript
new Date(2026, 3, 10);   // 10 de ABRIL, não de março
new Date(2026, 0, 1);    // 1º de janeiro
~~~

Dias, anos e horas contam normal. Só o mês é diferente, e não há lógica a decorar — é assim desde 1995.

**A segunda, mais séria: texto com hora e texto sem hora são interpretados de formas diferentes.**

~~~javascript
new Date('2026-03-10');        // meia-noite em UTC
new Date('2026-03-10T00:00');  // meia-noite no SEU fuso
~~~

No Brasil, UTC está três horas à frente. Então a primeira linha, no fuso de Brasília, é **9 de março às 21h**. Você pede o dia 10 e recebe o dia 9.

É esse o "erro de um dia" que aparece em relatório, filtro e aniversário — e que some quando o programador testa, porque a máquina dele está num fuso onde a conta fecha.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Ler as partes de uma data
const d = new Date(2026, 2, 10);   // 10 de março (mês 2!)
d.getFullYear();   // 2026
d.getMonth();      // 2  — some 1 para mostrar
d.getDate();       // 10 — o DIA do mês
d.getDay();        // 2  — o dia da SEMANA (0 = domingo)

// Comparar: datas viram números
const a = new Date(2026, 2, 10);
const b = new Date(2026, 2, 15);

a < b;                    // true — funciona
a.getTime() === b.getTime();   // compare assim, não com ===

// Somar dias: setDate ajusta mês e ano sozinho
const prazo = new Date(2026, 0, 30);
prazo.setDate(prazo.getDate() + 5);
prazo.getMonth();   // 1 (fevereiro) — virou o mês sozinho

// Mostrar para gente
d.toLocaleDateString('pt-BR');   // 10/03/2026`,
      caption:
        '`getDate` devolve o dia do mês; `getDay`, o dia da semana. Confundir os dois é o segundo erro mais comum aqui. E `setDate` aceita valores fora da faixa — somar 5 a 30 de janeiro dá 4 de fevereiro, sem você precisar saber quantos dias tem o mês.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-19-prever-mes',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Cuidado com a numeração do mês.',
        concepts: ['datas'],
        difficulty: 'iniciante',
        tags: ['javascript', 'datas'],
        code: `const d = new Date(2026, 11, 25);

console.log(d.getDate());
console.log(d.getMonth());
console.log(d.getFullYear());`,
        expectedOutput: '25\n11\n2026',
        explanation:
          '`11` é dezembro: o mês vai de 0 a 11. Para mostrar ao usuário, some 1 — ou use `toLocaleDateString`, que já faz isso. `getDate` devolve 25, o dia do mês.',
        hints: [
          'Se janeiro é 0, quanto é dezembro?',
          '`getMonth` devolve o mesmo número que você passou na criação.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-19-lacuna-mes',
        type: 'fill-blank',
        prompt:
          'Complete a função para devolver a data no formato `DD/MM/AAAA`. Lembre que o mês precisa de ajuste.',
        concepts: ['datas', 'strings'],
        difficulty: 'iniciante',
        tags: ['javascript', 'datas'],
        template: `function formatar(data) {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() {{1}}).padStart(2, '0');
  const ano = data.getFullYear();

  return dia + '/' + mes + '/' + ano;
}`,
        blanks: [{ placeholder: 'ajuste', size: 5 }],
        tests: [
          {
            description: '10 de março de 2026 vira 10/03/2026',
            assertion: `const r = formatar(new Date(2026, 2, 10)); if (r !== '10/03/2026') throw new Error("Esperava 10/03/2026, veio " + r + ".");`,
          },
          {
            description: '1º de janeiro vira 01/01/2026',
            assertion: `const r = formatar(new Date(2026, 0, 1)); if (r !== '01/01/2026') throw new Error("Esperava 01/01/2026, veio " + r + ". Janeiro é o mês 0.");`,
          },
          {
            description: '25 de dezembro vira 25/12/2026',
            assertion: `const r = formatar(new Date(2026, 11, 25)); if (r !== '25/12/2026') throw new Error("Esperava 25/12/2026, veio " + r + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'o mês mostrado é sempre o número humano, de 01 a 12',
            generate: `
              return {
                ano: 2020 + Math.floor(rnd() * 10),
                mes: Math.floor(rnd() * 12),
                dia: Math.floor(rnd() * 28) + 1,
              };
            `,
            check: `
              // Construída com partes locais, então não depende do fuso da máquina.
              const data = new Date(caso.ano, caso.mes, caso.dia);
              const esperado =
                String(caso.dia).padStart(2, '0') + '/' +
                String(caso.mes + 1).padStart(2, '0') + '/' +
                caso.ano;

              const obtido = formatar(data);
              if (obtido !== esperado) {
                throw new Error("esperava " + esperado + ", veio " + obtido + ".");
              }
            `,
          },
        ],
        explanation:
          '`getMonth` devolve de 0 a 11 porque é assim que o índice é guardado internamente. Quem lê espera de 1 a 12, então a conversão é responsabilidade de quem mostra.',
        hints: [
          'Se dezembro devolve 11 e você quer mostrar 12, qual é a operação?',
          'Some um.',
        ],
        solution: ['+ 1'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Três jeitos de comparar, e só um responde a sua pergunta

Comparar datas erra por um motivo simples: \`Date\` é um **objeto**, e comparar objetos com \`===\` compara identidade, não conteúdo.

~~~javascript
const a = new Date(2026, 2, 10);
const b = new Date(2026, 2, 10);

a === b;   // false — dois objetos diferentes
~~~

Duas datas iguais nunca são \`===\`. Então sobram duas perguntas, e elas têm respostas diferentes:

**"É o mesmo instante?"** — compare os números:

~~~javascript
a.getTime() === b.getTime();   // true
~~~

Isso compara até o milissegundo. Perfeito para ordenar, e errado para quase todo resto — porque \`10/03 às 9h\` e \`10/03 às 21h\` são instantes diferentes.

**"É o mesmo dia?"** — descarte a hora antes de comparar:

~~~javascript
function mesmoDia(x, y) {
  return x.toDateString() === y.toDateString();
}
~~~

Essa é a pergunta que os programas realmente fazem: "esse pedido é de hoje?", "o vencimento já passou?". E é a que mais dá errado, porque um \`getTime()\` respondendo "não" para duas datas do mesmo dia parece um bug do computador.

Para \`<\` e \`>\` não há truque: eles funcionam direto, porque o JavaScript converte a data para número na comparação. \`a < b\` está certo; só \`===\` é que não.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-19-prever-comparar',
        type: 'predict-output',
        prompt: 'O que este programa imprime, nas quatro linhas?',
        concepts: ['datas', 'objetos'],
        difficulty: 'intermediario',
        tags: ['javascript', 'datas'],
        code: `const a = new Date(2026, 2, 10);
const b = new Date(2026, 2, 10);

console.log(a === b);
console.log(a.getTime() === b.getTime());

const manha = new Date(2026, 2, 10, 9);
const noite = new Date(2026, 2, 10, 21);

console.log(manha.getTime() === noite.getTime());
console.log(manha.toDateString() === noite.toDateString());`,
        expectedOutput: 'false\ntrue\nfalse\ntrue',
        explanation:
          'A primeira comparação é `false` porque `===` entre objetos pergunta se são **o mesmo objeto**, e são dois. `getTime()` devolve números, então a segunda compara conteúdo e dá `true`. A terceira mostra o limite dessa comparação: manhã e noite do mesmo dia são instantes diferentes, e é isso que ela responde. Quando a pergunta era "é o mesmo dia?", o que serve é descartar a hora antes de comparar — que é o que `toDateString` faz.',
        hints: [
          'O que `===` compara quando os dois lados são objetos?',
          'Manhã e noite do mesmo dia: mesmo instante, ou mesmo dia?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Guardar e mostrar são coisas diferentes

A regra que evita quase todo problema de fuso:

- **Guarde em UTC**, no formato ISO: \`data.toISOString()\` produz \`2026-03-10T12:00:00.000Z\`. É o que vai para o banco e para a API.
- **Mostre no fuso de quem lê**: \`toLocaleDateString('pt-BR')\` converte na hora de exibir.

O erro clássico é guardar já formatado — \`"10/03/2026"\` no banco. Aí não dá para ordenar, não dá para comparar, e ninguém sabe de qual fuso aquele dia era.

E se você precisa de uma data **sem hora** (um aniversário, um vencimento), não use \`Date\` para transportá-la: guarde o texto \`"2026-03-10"\` e monte a data com partes locais quando for usar.

~~~javascript
const [ano, mes, dia] = '2026-03-10'.split('-').map(Number);
const data = new Date(ano, mes - 1, dia);   // 10 de março, no fuso local
~~~

Assim o dia 10 continua sendo o dia 10 em qualquer lugar do mundo.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-19-dias-entre',
        type: 'code',
        prompt:
          'Crie `diasEntre(inicio, fim)`, que recebe duas datas e devolve quantos **dias inteiros** existem entre elas.\n\nA ordem não importa: o resultado é sempre positivo. Se for o mesmo dia, devolve 0.',
        concepts: ['datas', 'casos-extremos'],
        difficulty: 'intermediario',
        tags: ['javascript', 'datas'],
        initialCode: `function diasEntre(inicio, fim) {
  // Datas viram números de milissegundos quando subtraídas.
}

console.log(diasEntre(new Date(2026, 2, 10), new Date(2026, 2, 15))); // 5
console.log(diasEntre(new Date(2026, 2, 15), new Date(2026, 2, 10))); // 5`,
        hints: [
          'Subtrair duas datas devolve a diferença em milissegundos.',
          'Um dia tem 24 × 60 × 60 × 1000 milissegundos.',
          '`Math.abs` resolve a ordem, e `Math.round` resolve a sobra de horas.',
        ],
        tests: [
          {
            description: 'A função diasEntre existe',
            assertion: `if (typeof diasEntre !== 'function') throw new Error("Crie uma função chamada 'diasEntre'.");`,
          },
          {
            description: 'de 10 a 15 de março são 5 dias',
            assertion: `const d = diasEntre(new Date(2026, 2, 10), new Date(2026, 2, 15)); if (d !== 5) throw new Error("Esperava 5, veio " + d + ".");`,
          },
          {
            description: 'a ordem não muda o resultado',
            assertion: `
              const a = diasEntre(new Date(2026, 2, 15), new Date(2026, 2, 10));
              if (a !== 5) throw new Error("Invertendo as datas deu " + a + ". Use Math.abs para o resultado ser sempre positivo.");
            `,
          },
          {
            description: 'o mesmo dia dá 0',
            assertion: `const d = diasEntre(new Date(2026, 2, 10), new Date(2026, 2, 10)); if (d !== 0) throw new Error("Esperava 0, veio " + d + ".");`,
            hidden: true,
          },
          {
            description: 'atravessa a virada do mês',
            assertion: `const d = diasEntre(new Date(2026, 0, 30), new Date(2026, 1, 4)); if (d !== 5) throw new Error("De 30 de janeiro a 4 de fevereiro são 5 dias, veio " + d + ".");`,
            hidden: true,
          },
          {
            description: 'atravessa o ano bissexto',
            assertion: `const d = diasEntre(new Date(2024, 1, 28), new Date(2024, 2, 1)); if (d !== 2) throw new Error("2024 é bissexto: de 28 de fevereiro a 1º de março são 2 dias, veio " + d + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'a contagem bate com a soma de dias, em qualquer ordem',
            generate: `
              return {
                ano: 2020 + Math.floor(rnd() * 8),
                mes: Math.floor(rnd() * 12),
                dia: Math.floor(rnd() * 28) + 1,
                soma: Math.floor(rnd() * 400),
              };
            `,
            check: `
              const inicio = new Date(caso.ano, caso.mes, caso.dia, 12);
              const fim = new Date(caso.ano, caso.mes, caso.dia + caso.soma, 12);

              const obtido = diasEntre(inicio, fim);
              if (obtido !== caso.soma) {
                throw new Error("somando " + caso.soma + " dias, diasEntre devolveu " + obtido + ".");
              }

              const invertido = diasEntre(fim, inicio);
              if (invertido !== caso.soma) {
                throw new Error("com as datas invertidas devolveu " + invertido + ", esperava " + caso.soma + ".");
              }
            `,
          },
        ],
        solution: `function diasEntre(inicio, fim) {
  const UM_DIA = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs(fim - inicio) / UM_DIA);
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `O mês vai de 0 a 11, e só o mês. \`getDate\` é o dia do mês, \`getDay\` é o dia da semana. Texto sem hora é lido como UTC e texto com hora é lido no fuso local — daí o erro de um dia que some quando o programador testa na máquina dele. A regra que evita quase tudo: guarde em UTC no formato ISO, mostre com \`toLocaleDateString\`, e para uma data sem hora transporte o texto \`"AAAA-MM-DD"\` montando as partes localmente na hora de usar. Para comparar, lembre que \`===\` entre datas é sempre falso: use \`getTime()\` quando a pergunta for sobre o instante, e descarte a hora quando ela for sobre o dia.`,
    },
  ],
};
