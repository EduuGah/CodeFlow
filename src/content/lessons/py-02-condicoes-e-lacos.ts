import type { Lesson } from '../types';

export const lessonPythonCondicoesELacos: Lesson = {
  id: 'lesson-py-2',
  trackId: 'track-python',
  title: 'Condições e Laços',
  language: 'python',
  objective:
    'Escrever condições com `and`/`or`/`not`, percorrer coleções com `for` sem índice, gerar sequências com `range`, e reconhecer os valores que Python trata como falsos.',
  concepts: ['py-condicoes'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
As condições e os laços fazem o mesmo trabalho que já fazem em JavaScript — a sintaxe é o que muda.

## and, or, not no lugar de &&, ||, !

Onde JavaScript usa símbolos, Python usa palavras:

~~~py
idade = 20
tem_carteira = True

if idade >= 18 and tem_carteira:
    print('pode dirigir')

if not tem_carteira:
    print('precisa tirar a carteira')
~~~

O comportamento de curto-circuito é o mesmo: em \`a and b\`, se \`a\` for falso, \`b\` nem é avaliado.

## for percorre direto, sem índice

O \`for\` mais comum em Python não conta índices — ele entrega cada item da coleção, direto:

~~~py
frutas = ['maçã', 'banana', 'uva']
for fruta in frutas:
    print(fruta)
~~~

Comparado ao \`for (let i = 0; i < frutas.length; i++)\` de JavaScript, isso é o equivalente ao \`for...of\` — só que em Python **é** a forma normal do \`for\`, não uma alternativa. Quando o índice faz falta de verdade, \`enumerate()\` entrega os dois:

~~~py
for indice, fruta in enumerate(frutas):
    print(indice, fruta)
# 0 maçã
# 1 banana
# 2 uva
~~~

## range() gera a sequência de números

Quando o que você quer é repetir um número de vezes (não percorrer uma coleção), \`range()\` gera a sequência:

~~~py
for i in range(3):        # 0, 1, 2 — três vezes, começando do zero
    print(i)

for i in range(2, 5):     # 2, 3, 4 — início e fim (fim não incluído)
    print(i)

for i in range(10, 0, -2): # 10, 8, 6, 4, 2 — com passo
    print(i)
~~~

\`range(fim)\` sozinho já cobre o caso mais comum: "repita isto N vezes".

## while, break, continue — iguais

\`while\` roda enquanto a condição for verdadeira; \`break\` sai do laço na hora; \`continue\` pula para a próxima volta. As três palavras são exatamente as mesmas de JavaScript.

## Falsy em Python: mais casos que em JavaScript

Um \`if\` aceita qualquer valor, não só \`True\`/\`False\` — e Python considera **falsos** mais casos que JavaScript costuma ensinar: \`0\`, \`""\` (string vazia), \`[]\` (lista vazia), \`{}\` (dicionário vazio) e \`None\`. Todo o resto é verdadeiro.

~~~py
lista = []
if lista:
    print('tem item')
else:
    print('lista vazia')  # isto imprime
~~~

Isso permite escrever \`if lista:\` em vez de \`if len(lista) > 0:\` — mais curto, e é o jeito que código Python de verdade costuma ser escrito.
`.trim(),
    },
    {
      kind: 'example',
      language: 'python',
      code: `def resumo_das_notas(notas):
    if not notas:
        return 'sem notas ainda'

    total = 0
    aprovados = 0
    for nota in notas:
        total += nota
        if nota >= 6:
            aprovados += 1

    media = total / len(notas)
    return f'média {media}, {aprovados} de {len(notas)} aprovados'

print(resumo_das_notas([7, 4, 8, 9]))
print(resumo_das_notas([]))`,
      caption:
        '`if not notas:` aproveita que uma lista vazia é falsy — sem precisar escrever `len(notas) == 0`. `+=` funciona igual a JavaScript.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-2-and-or-not',
        type: 'multiple-choice',
        prompt: 'Como se escreve "e" lógico, "ou" lógico e negação em Python?',
        concepts: ['py-condicoes'],
        difficulty: 'iniciante',
        tags: ['python', 'condicoes'],
        options: [
          '`and`, `or`, `not`',
          '`&&`, `||`, `!` — os mesmos símbolos de JavaScript',
          '`&`, `|`, `~`',
          '`AND`, `OR`, `NOT`, sempre maiúsculas',
        ],
        correctIndex: 0,
        explanation:
          'Python usa palavras em minúsculas em vez de símbolos: `and`, `or`, `not`. `&`, `|` e `~` existem em Python, mas são operadores bit a bit — outra coisa, que esta aula não cobre.',
        hints: ['São três palavras comuns do português/inglês, em minúsculas.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-2-somar-pares',
        type: 'code',
        prompt: 'Escreva `somar_pares(numeros)`: devolve a soma de só os números pares da lista.',
        concepts: ['py-condicoes'],
        difficulty: 'iniciante',
        tags: ['python', 'for', 'condicoes'],
        initialCode: `def somar_pares(numeros):
    total = 0
    # percorra "numeros" com for, some só os pares (resto da divisão por 2 é 0)
    return total
`,
        tests: [
          {
            description: 'somar_pares([1, 2, 3, 4]) é 6',
            assertion: 'assert somar_pares([1, 2, 3, 4]) == 6, "esperava 6 (2 + 4)"',
          },
          {
            description: 'somar_pares([1, 3, 5]) é 0 — nenhum par',
            assertion: 'assert somar_pares([1, 3, 5]) == 0, "esperava 0, sem nenhum par"',
          },
          {
            description: 'somar_pares([]) é 0 — lista vazia',
            assertion: 'assert somar_pares([]) == 0, "esperava 0 para lista vazia"',
          },
        ],
        solution: `def somar_pares(numeros):
    total = 0
    for numero in numeros:
        if numero % 2 == 0:
            total += numero
    return total
`,
        hints: [
          '`for numero in numeros:` percorre cada item, sem precisar de índice.',
          'Um número é par quando `numero % 2 == 0` — o `%` é o resto da divisão, igual a JavaScript.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-2-range-passo',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['py-condicoes'],
        difficulty: 'intermediario',
        tags: ['python', 'range'],
        code: `for i in range(1, 10, 3):
    print(i)`,
        expectedOutput: `1
4
7`,
        explanation:
          '`range(1, 10, 3)` começa em 1, soma 3 a cada volta, e para **antes** de chegar a 10: 1, depois 4, depois 7 — o próximo seria 10, que já não entra, porque o fim de `range` nunca é incluído.',
        hints: ['O terceiro número de `range` é o passo — quanto soma a cada volta. O segundo número nunca é alcançado.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-2-laco-sem-fim',
        type: 'find-bug',
        prompt: 'Este programa nunca termina. Aponte a linha que precisa mudar.',
        concepts: ['py-condicoes'],
        difficulty: 'intermediario',
        tags: ['python', 'while', 'bug'],
        code: `def contar_ate(limite):
    contador = 0
    while contador < limite:
        print(contador)
        contador = 0

contar_ate(3)`,
        buggyLine: 5,
        fix: '        contador += 1',
        explanation:
          'A condição `contador < limite` nunca deixa de ser verdadeira, porque `contador` é reiniciado para `0` a cada volta em vez de crescer. Um `while` sempre precisa de algo que aproxime a condição do fim — aqui, incrementar `contador` a cada volta.',
        hints: [
          'Releia o que acontece com `contador` dentro do laço — ele deveria mudar de um jeito que aproxima a condição de ficar falsa.',
          'Um contador que sempre volta a zero nunca alcança `limite`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-2-falsy',
        type: 'multiple-choice',
        prompt: 'Qual destes valores Python considera **falso** dentro de um `if`?',
        concepts: ['py-condicoes'],
        difficulty: 'intermediario',
        tags: ['python', 'falsy'],
        options: [
          '`[]` — uma lista vazia',
          '`[0]` — uma lista com um único item, o número zero',
          '`"0"` — a string com o caractere "0"',
          '`" "` — uma string com um espaço',
        ],
        correctIndex: 0,
        explanation:
          'Uma coleção vazia (lista, dicionário, string) é falsy — o que importa é estar vazia, não o que ela guardaria. As outras três opções **não** estão vazias: `[0]` tem um item, `"0"` e `" "` têm um caractere cada — todo string não vazia é truthy, mesmo que pareça "zero".',
        hints: ['A regra do Python é sobre estar vazio, não sobre o valor "parecer" zero ou nulo.'],
      },
    },
    {
      kind: 'summary',
      markdown: `
\`and\`, \`or\`, \`not\` no lugar dos símbolos; \`for item in colecao\` percorre direto, sem índice — \`enumerate()\` quando o índice faz falta; \`range(inicio, fim, passo)\` gera números, com o fim nunca incluído. \`while\`, \`break\`, \`continue\` são as mesmas palavras de sempre.

E Python considera falsos mais casos que o costume de JavaScript ensina: \`0\`, \`""\`, \`[]\`, \`{}\`, \`None\` — qualquer coleção ou valor "vazio", não só \`false\` e \`null\`.

Na próxima aula: funções, com o que muda de verdade — parâmetros nomeados, valor padrão (e a armadilha do padrão mutável), e o retorno múltiplo.
`.trim(),
    },
  ],
};
