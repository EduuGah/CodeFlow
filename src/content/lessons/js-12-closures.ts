import type { Lesson } from '../types';

export const lessonClosures: Lesson = {
  id: 'lesson-js-12',
  trackId: 'track-js-fundamentos',
  title: 'Closures: Funções que Lembram',
  language: 'javascript',
  objective:
    'Criar uma função que guarda estado próprio entre chamadas, e explicar por que o valor sobrevive.',
  concepts: ['closures', 'escopo', 'funcoes'],
  status: 'published',
  estimatedMinutes: 18,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Você já sabe que uma variável some quando o território dela acaba. Existe uma exceção — e ela é uma das ferramentas mais úteis do JavaScript.

**Se uma função criada lá dentro ainda estiver viva, o território não é apagado.**

~~~javascript
function criarContador() {
  let contagem = 0;              // deveria sumir quando criarContador termina

  return function () {
    contagem += 1;               // mas esta função ainda usa \`contagem\`
    return contagem;
  };
}

const contar = criarContador();
console.log(contar());   // 1
console.log(contar());   // 2
~~~

\`criarContador\` já terminou. Mesmo assim \`contagem\` continua existindo, porque a função devolvida ainda precisa dela. Esse par — a função mais o território que ela carrega junto — é o que se chama **closure**.

Repare no que isso resolve: \`contagem\` é privada. Nada fora consegue ler nem mexer nela, só chamar \`contar()\`. É estado guardado sem variável global.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Cada chamada cria um território SEPARADO
const contarA = criarContador();
const contarB = criarContador();

console.log(contarA()); // 1
console.log(contarA()); // 2
console.log(contarB()); // 1  <- território próprio, não continua de 2

function criarContador() {
  let contagem = 0;
  return () => ++contagem;
}

// Uso comum: guardar uma configuração
function criarSaudacao(saudacao) {
  return (nome) => saudacao + ', ' + nome + '!';
}

const bomDia = criarSaudacao('Bom dia');
console.log(bomDia('Ana'));    // Bom dia, Ana!
console.log(bomDia('Bruno'));  // Bom dia, Bruno!`,
      caption:
        '`contarA` e `contarB` não compartilham nada. Cada chamada de `criarContador` cria um território novo — e é por isso que closure não é o mesmo que variável global.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-12-prever-closure',
        type: 'predict-output',
        prompt:
          'Duas funções foram criadas a partir da mesma fábrica. O que este programa imprime?',
        concepts: ['closures'],
        difficulty: 'iniciante',
        tags: ['javascript', 'closures'],
        code: `function criarCarrinho() {
  let itens = 0;
  return () => ++itens;
}

const carrinhoA = criarCarrinho();
const carrinhoB = criarCarrinho();

console.log(carrinhoA());
console.log(carrinhoA());
console.log(carrinhoB());`,
        expectedOutput: '1\n2\n1',
        explanation:
          'Cada chamada de `criarCarrinho` cria um território novo, com o seu próprio `itens`. `carrinhoB` não continua de onde `carrinhoA` parou — ele começa do zero, porque são dois territórios separados.',
        hints: [
          'Quantas vezes `criarCarrinho()` foi chamada? Cada chamada cria quantos `itens`?',
          '`carrinhoA` e `carrinhoB` compartilham a mesma variável, ou cada um tem a sua?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-12-lacuna-fabrica',
        type: 'fill-blank',
        prompt:
          'Complete a fábrica: `criarMultiplicador(3)` deve devolver uma função que multiplica por 3.',
        concepts: ['closures', 'funcoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'closures'],
        template: `function criarMultiplicador(fator) {
  return function (numero) {
    return {{1}};
  };
}`,
        blanks: [{ placeholder: 'a conta', size: 16 }],
        tests: [
          {
            description: 'criarMultiplicador(3)(4) devolve 12',
            assertion: `const triplo = criarMultiplicador(3); if (triplo(4) !== 12) throw new Error("Esperava 12, veio " + triplo(4) + ".");`,
          },
          {
            description: 'cada fábrica lembra do seu próprio fator',
            assertion: `const dobro = criarMultiplicador(2); const decuplo = criarMultiplicador(10); if (dobro(5) !== 10 || decuplo(5) !== 50) throw new Error("dobro(5) deu " + dobro(5) + " e decuplo(5) deu " + decuplo(5) + ". Cada função precisa lembrar do fator que recebeu.");`,
          },
        ],
        properties: [
          {
            description: 'multiplicar por qualquer fator dá o produto',
            generate: `return { fator: Math.floor(rnd() * 20) - 10, numero: Math.floor(rnd() * 20) - 10 };`,
            check: `
              const f = criarMultiplicador(caso.fator);
              const esperado = caso.fator * caso.numero;
              if (f(caso.numero) !== esperado) {
                throw new Error("com fator " + caso.fator + " e número " + caso.numero + " esperava " + esperado + ", veio " + f(caso.numero) + ".");
              }
            `,
          },
        ],
        explanation:
          'A função de dentro continua enxergando `fator`, mesmo depois que `criarMultiplicador` terminou. É por isso que `dobro` e `decuplo` se comportam diferente: cada uma carrega o território onde nasceu.',
        hints: [
          'A função de dentro recebe `numero`. Que outro nome ela ainda consegue enxergar?',
          'Multiplique o parâmetro de dentro pelo parâmetro da fábrica.',
        ],
        solution: ['numero * fator'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Por que isso importa na prática

Closure não é curiosidade acadêmica. É o que faz funcionar:

- **Configuração fixa** — \`criarSaudacao('Bom dia')\` devolve uma função já configurada.
- **Estado privado** — um contador que ninguém consegue corromper de fora.
- **Callbacks que lembram do contexto** — a função passada para um evento ainda enxerga as variáveis de onde foi criada.

Esse último caso é a ponte para a próxima aula, e é onde closure deixa de ser teoria: quando o código precisa **esperar** por algo, a função que responde precisa lembrar do que estava acontecendo quando o pedido foi feito.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-12-cofre',
        type: 'code',
        prompt:
          'Crie a função `criarCofre(senha)`, que devolve um objeto com dois métodos:\n\n- `guardar(valor)` — guarda o valor\n- `abrir(tentativa)` — devolve o valor guardado se a senha bater, ou `null` se não bater\n\nA senha **não pode** ficar acessível de fora: `cofre.senha` tem que ser `undefined`.',
        concepts: ['closures', 'objetos', 'funcoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'closures'],
        initialCode: `function criarCofre(senha) {
  // O que precisa ficar escondido nasce aqui, e não no objeto devolvido.
}

const cofre = criarCofre('1234');
cofre.guardar('meu segredo');
console.log(cofre.abrir('errada'));  // esperado: null
console.log(cofre.abrir('1234'));    // esperado: meu segredo
console.log(cofre.senha);            // esperado: undefined`,
        hints: [
          'O valor guardado precisa sobreviver entre as chamadas de `guardar` e `abrir`. Onde ele nasce?',
          'Se você colocar a senha como propriedade do objeto devolvido, qualquer um lê. Deixe-a só no território da função.',
          'Devolva `{ guardar: (v) => { ... }, abrir: (t) => { ... } }` — as duas enxergam `senha` e o valor guardado.',
        ],
        tests: [
          {
            description: 'A função criarCofre existe',
            assertion: `if (typeof criarCofre !== 'function') throw new Error("Crie uma função chamada 'criarCofre'.");`,
          },
          {
            description: 'com a senha certa, devolve o que foi guardado',
            assertion: `const c = criarCofre('abc'); c.guardar('tesouro'); if (c.abrir('abc') !== 'tesouro') throw new Error("Esperava 'tesouro', veio " + c.abrir('abc') + ".");`,
          },
          {
            description: 'com a senha errada, devolve null',
            assertion: `const c = criarCofre('abc'); c.guardar('tesouro'); if (c.abrir('xyz') !== null) throw new Error("Com senha errada o cofre deve devolver null, mas devolveu " + c.abrir('xyz') + ".");`,
          },
          {
            description: 'a senha não vaza pelo objeto',
            assertion: `const c = criarCofre('abc'); if (c.senha !== undefined) throw new Error("cofre.senha deveria ser undefined, mas é " + c.senha + ". Deixe a senha só no território da função.");`,
            hidden: true,
          },
          {
            description: 'dois cofres não compartilham conteúdo',
            assertion: `const a = criarCofre('1'); const b = criarCofre('2'); a.guardar('de A'); b.guardar('de B'); if (a.abrir('1') !== 'de A' || b.abrir('2') !== 'de B') throw new Error("Cada cofre precisa do próprio território. a.abrir deu " + a.abrir('1') + " e b.abrir deu " + b.abrir('2') + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'qualquer senha errada é recusada, e a certa é aceita',
            generate: `
              const letras = 'abc123';
              const sortear = (n) => {
                let s = '';
                for (let i = 0; i < n; i++) s += letras[Math.floor(rnd() * letras.length)];
                return s;
              };
              return { senha: sortear(4), tentativa: sortear(4), valor: sortear(6) };
            `,
            check: `
              const c = criarCofre(caso.senha);
              c.guardar(caso.valor);

              const esperado = caso.tentativa === caso.senha ? caso.valor : null;
              const obtido = c.abrir(caso.tentativa);

              if (obtido !== esperado) {
                throw new Error("senha '" + caso.senha + "', tentativa '" + caso.tentativa + "': esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        solution: `function criarCofre(senha) {
  let guardado = null;

  return {
    guardar(valor) {
      guardado = valor;
    },
    abrir(tentativa) {
      return tentativa === senha ? guardado : null;
    },
  };
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Um território não é apagado enquanto alguma função criada nele continuar viva. Esse par — função mais território — é a **closure**, e é o que permite guardar estado privado sem variável global. Cada chamada da fábrica cria um território novo: duas funções feitas pela mesma fábrica não compartilham nada.`,
    },
  ],
};
