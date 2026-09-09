import type { Lesson } from '../types';

export const lessonVariaveis: Lesson = {
  id: 'lesson-js-1',
  trackId: 'track-js-fundamentos',
  title: 'Variáveis: Caixas na Memória',
  language: 'javascript',
  objective: 'Guardar valores na memória, recuperá-los pelo nome, e escolher entre let e const.',
  concepts: ['variaveis'],
  status: 'published',
  estimatedMinutes: 18,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Todo programa precisa lembrar de coisas. O preço que o usuário digitou, quantas vezes ele errou a senha, o nome que aparece no topo da tela.

Sem um lugar para guardar, o computador esqueceria tudo na linha seguinte:

~~~javascript
console.log(2 + 3);   // 5
console.log(2 + 3);   // 5, de novo — a conta foi refeita do zero
~~~

Uma **variável** resolve isso. Pense na memória como um armazém: você coloca o valor numa caixa e cola uma etiqueta nela. Depois, basta pedir pela etiqueta.

~~~javascript
let total = 2 + 3;    // guarda o resultado

console.log(total);   // 5
console.log(total);   // 5 — mesmo valor, sem refazer a conta
~~~

O nome \`total\` não tem nada de especial: é uma escolha sua. Você poderia chamar de \`x\`, mas daqui a três semanas, lendo o próprio código, \`total\` vai fazer sentido e \`x\` não.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Criar: palavra-chave, nome, sinal de igual, valor
let idade = 25;

// Ler: só o nome
console.log(idade);      // 25

// Mudar: nome, igual, valor novo — sem repetir a palavra-chave
idade = 26;
console.log(idade);      // 26

// O valor pode vir de uma conta, ou de outra variável
let nascimento = 2026 - idade;
let copia = idade;`,
      caption:
        'Você escreve `let` **uma vez**, quando cria. Depois disso, mudar o valor é só `nome = valor`. Repetir `let` na mesma variável é erro.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-1-escolher-nome',
        type: 'multiple-choice',
        prompt:
          'Um programa precisa guardar quantos itens estão no carrinho de compras. Qual nome de variável é o melhor?',
        concepts: ['variaveis'],
        difficulty: 'iniciante',
        tags: ['javascript', 'variaveis'],
        options: [
          'const q = 3;',
          'const quantidadeDeItens = 3;',
          'const quantidade_de_itens_no_carrinho_de_compras_do_usuario = 3;',
          'const dados = 3;',
        ],
        correctIndex: 1,
        explanation:
          'O nome existe para quem lê, não para o computador — que aceita qualquer um. `q` não diz nada, `dados` serve para qualquer coisa e por isso não serve para nada, e o terceiro é tão longo que atrapalha a leitura da linha. `quantidadeDeItens` diz exatamente o que guarda, no tamanho certo.',
        hints: [
          'O computador aceita qualquer nome. A pergunta é: qual deles você entenderia daqui a três semanas?',
          'Curto demais não diz nada. Longo demais atrapalha a leitura da linha inteira.',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## \`let\` e \`const\`: a diferença é a promessa

Existem duas palavras para criar variáveis, e escolher entre elas é uma decisão de projeto, não de estilo.

- \`let\` diz: **este valor vai mudar**.
- \`const\` diz: **este valor não vai mudar**.

Se você tentar mudar um \`const\`, o programa nem chega a rodar:

~~~javascript
const nome = 'Maria';
nome = 'Ana';         // TypeError: Assignment to constant variable.
~~~

Parece uma limitação, mas é uma proteção. Quando você lê \`const taxa = 0.1\`, sabe na hora que aquele valor é o mesmo do começo ao fim da função — sem precisar procurar o resto do arquivo atrás de uma linha que o altere.

**A recomendação prática:** comece sempre com \`const\`. Quando o programa reclamar que você precisa mudar aquele valor, troque para \`let\`. Assim cada \`let\` no seu código passa a significar alguma coisa — ele avisa "atenção, isto muda".

Existe uma terceira palavra, \`var\`, que você vai encontrar em código antigo. Ela tem um comportamento que causa bugs difíceis, e a aula sobre escopo explica por quê. Por ora: não use.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-1-prever-reatribuicao',
        type: 'predict-output',
        prompt:
          'O que este programa imprime? Acompanhe o valor de cada variável linha por linha.',
        concepts: ['variaveis'],
        difficulty: 'iniciante',
        tags: ['javascript', 'variaveis'],
        code: `let contador = 10;
const limite = 10;

contador = contador + 5;
contador = contador * 2;

console.log(contador);
console.log(limite);`,
        expectedOutput: '30\n10',
        explanation:
          '`contador = contador + 5` lê o valor atual (10), soma 5, e guarda o resultado de volta na mesma variável — que passa a valer 15. Depois `15 * 2` dá 30. O `limite` nunca foi tocado, então continua 10.',
        hints: [
          'O lado direito do `=` é calculado primeiro, usando o valor que a variável tem naquele momento.',
          'Depois de `contador = contador + 5`, quanto vale `contador`?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-1-lacuna-declarar',
        type: 'fill-blank',
        prompt:
          'Complete as duas palavras que faltam. A taxa **nunca muda** durante o programa; o saldo **muda** a cada operação.',
        concepts: ['variaveis'],
        difficulty: 'iniciante',
        tags: ['javascript', 'variaveis'],
        template: `{{1}} taxa = 0.1;
{{2}} saldo = 200;

saldo = saldo - saldo * taxa;`,
        blanks: [
          { placeholder: 'não muda', size: 6 },
          { placeholder: 'muda', size: 6 },
        ],
        tests: [
          {
            description: 'a taxa continua valendo 0.1',
            assertion: `if (taxa !== 0.1) throw new Error("A taxa deveria continuar 0.1, veio " + taxa + ".");`,
          },
          {
            description: 'o saldo virou 180',
            assertion: `if (saldo !== 180) throw new Error("Esperava saldo 180 (200 menos 10%), veio " + saldo + ".");`,
          },
          {
            description: 'a taxa foi declarada como valor que não muda',
            assertion: `
              let recusou = false;
              try { eval('taxa = 0.2'); } catch (e) { recusou = true; }
              if (!recusou) throw new Error("A taxa aceitou ser alterada. Um valor que não muda precisa ser declarado de forma que o programa recuse a mudança.");
            `,
            hidden: true,
          },
        ],
        explanation:
          'Declarar `taxa` como constante não é só documentação: o programa passa a **recusar** qualquer tentativa de alterá-la. Já `saldo` precisa mudar a cada operação, então tem que ser `let`.',
        hints: [
          'São as duas palavras que a aula acabou de apresentar.',
          'Uma promete que o valor não muda. A outra permite mudar.',
        ],
        solution: ['const', 'let'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## O que \`const\` realmente promete

Aqui mora a confusão mais comum de quem está começando. \`const\` protege **o nome**, não o conteúdo.

~~~javascript
const usuario = { nome: 'Ana' };

usuario.nome = 'Beatriz';   // permitido!
console.log(usuario.nome);  // Beatriz

usuario = { nome: 'Carla' }; // TypeError — isto sim é proibido
~~~

A promessa do \`const\` é: **esta etiqueta continuará colada nesta caixa**. O que está dentro da caixa pode ser reorganizado.

Para valores simples — número, texto, verdadeiro/falso — a distinção não aparece, porque não há "dentro" para mexer. Ela só importa com objetos e listas, e a aula sobre imutabilidade volta a esse ponto com calma.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-1-prever-const-objeto',
        type: 'predict-output',
        prompt:
          'Este programa roda sem erro. O que ele imprime?',
        concepts: ['variaveis', 'objetos'],
        difficulty: 'intermediario',
        tags: ['javascript', 'variaveis'],
        code: `const config = { tema: 'claro' };
const numeros = [1, 2];

config.tema = 'escuro';
numeros.push(3);

console.log(config.tema);
console.log(numeros.length);`,
        expectedOutput: 'escuro\n3',
        explanation:
          '`const` impede trocar a caixa, não mexer no que está dentro dela. Alterar uma propriedade e acrescentar um item à lista são mudanças de conteúdo — as duas são permitidas. O que daria erro seria `config = {}` ou `numeros = []`.',
        hints: [
          '`const` protege o nome ou o conteúdo?',
          'Nenhuma das duas linhas troca a caixa: as duas mexem dentro dela.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-1-declarar',
        type: 'code',
        prompt:
          'Crie as três variáveis de um placar de jogo:\n\n- `jogador` — o seu nome, e ele não muda durante a partida\n- `pontuacao` — começa em `100` e muda ao longo do jogo\n- `vidas` — começa em `3` e também muda\n\nEscolha `let` ou `const` conforme cada uma muda ou não.',
        concepts: ['variaveis'],
        difficulty: 'iniciante',
        tags: ['javascript', 'variaveis'],
        initialCode: `// Escreva suas três declarações abaixo\n\n`,
        hints: [
          'Comece perguntando de cada uma: este valor vai mudar durante o programa?',
          'A sintaxe é: palavra-chave, nome, sinal de igual, valor, ponto e vírgula.',
          'Texto fica entre aspas. Número, não.',
          'Duas delas mudam durante o jogo, e uma não.',
        ],
        tests: [
          {
            description: 'A constante jogador foi criada e guarda um texto',
            assertion: `
              if (typeof jogador === 'undefined') throw new Error("A variável 'jogador' não foi criada.");
              if (typeof jogador !== 'string') throw new Error("'jogador' deve guardar um texto, entre aspas.");
            `,
          },
          {
            description: 'pontuacao vale 100',
            assertion: `if (typeof pontuacao === 'undefined' || pontuacao !== 100) throw new Error("A variável 'pontuacao' deve existir e valer 100.");`,
          },
          {
            description: 'vidas vale 3',
            assertion: `if (typeof vidas === 'undefined' || vidas !== 3) throw new Error("A variável 'vidas' deve existir e valer 3.");`,
          },
          {
            description: 'jogador foi declarado como valor que não muda',
            assertion: `
              let recusou = false;
              try { eval('jogador = "outro"'); } catch (e) { recusou = true; }
              if (!recusou) throw new Error("O nome do jogador não muda durante a partida, então deveria ter sido declarado com const.");
            `,
            hidden: true,
          },
          {
            description: 'pontuacao e vidas podem mudar',
            assertion: `
              try { eval('pontuacao = 50; vidas = 2;'); }
              catch (e) { throw new Error("A pontuação e as vidas mudam durante o jogo, então precisam ser declaradas com let."); }
            `,
            hidden: true,
          },
        ],
        solution: `const jogador = "Eduardo";\nlet pontuacao = 100;\nlet vidas = 3;`,
      },
    },
    {
      kind: 'summary',
      markdown: `Uma variável guarda um valor para você usar depois, e o nome dela existe para quem lê o código. \`const\` promete que a etiqueta não sai da caixa; \`let\` permite trocá-la. Comece sempre com \`const\` e troque para \`let\` quando o programa exigir — assim cada \`let\` passa a avisar "atenção, isto muda". E lembre que \`const\` protege o nome, não o conteúdo: um objeto declarado com \`const\` ainda aceita ter suas propriedades alteradas.`,
    },
  ],
};
