import type { Lesson } from '../types';

export const lessonPythonListasECompreensoes: Lesson = {
  id: 'lesson-py-4',
  trackId: 'track-python',
  title: 'Listas e Compreensões',
  language: 'python',
  objective:
    'Manipular listas com os métodos do Python, fatiar com `[a:b]`, e escrever uma compreensão de lista — o `map`/`filter` do Python numa linha só.',
  concepts: ['py-listas'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Lista é o array do Python. Boa parte do que você já sabe de arrays em JavaScript se aplica direto — o vocabulário e uma sintaxe nova de fatiar são as diferenças.

## Os métodos mais comuns

~~~py
numeros = [3, 1, 4]
numeros.append(1)        # acrescenta no fim — como push
numeros.insert(0, 9)     # insere numa posição
numeros.remove(1)        # remove a PRIMEIRA ocorrência do valor 1 (não por índice)
numeros.pop()            # tira e devolve o último — como pop de JavaScript
len(numeros)              # tamanho — função, não propriedade .length
9 in numeros              # True se o valor está na lista — como includes()
~~~

Repare: \`len()\` é uma função que recebe a lista, não um método nem uma propriedade — \`numeros.length\` não existe em Python.

## Fatiar com [a:b]

Fatiar (\`slice\`, em JavaScript) tem sintaxe própria: \`lista[inicio:fim]\`, com o fim **não incluído** — a mesma regra do \`range()\`.

~~~py
letras = ['a', 'b', 'c', 'd', 'e']
letras[1:3]    # ['b', 'c']
letras[:2]     # ['a', 'b'] — do começo até o índice 2 (exclusive)
letras[3:]     # ['d', 'e'] — do índice 3 até o fim
letras[-1]     # 'e' — índice negativo conta do fim
letras[::-1]   # ['e', 'd', 'c', 'b', 'a'] — passo -1 inverte a lista
~~~

## Compreensão de lista: map e filter numa linha

Uma compreensão de lista constrói uma lista nova a partir de outra, com a transformação e o filtro dentro dos colchetes:

~~~py
numeros = [1, 2, 3, 4, 5, 6]

dobrados = [n * 2 for n in numeros]              # o map()
pares = [n for n in numeros if n % 2 == 0]       # o filter()
pares_dobrados = [n * 2 for n in numeros if n % 2 == 0]  # os dois juntos
~~~

Lida da esquerda para a direita: "para cada \`n\` em \`numeros\`, se \`n\` for par, o resultado é \`n * 2\`". É a forma que código Python de verdade usa no lugar de um \`for\` que cria uma lista vazia e vai dando \`append\` — mais compacta, e mais comum no dia a dia da linguagem que o \`for\` explícito para esse tipo de transformação.

~~~py
# O mesmo resultado, com for explícito — funciona, mas não é o idiomático:
pares_dobrados = []
for n in numeros:
    if n % 2 == 0:
        pares_dobrados.append(n * 2)
~~~
`.trim(),
    },
    {
      kind: 'example',
      language: 'python',
      code: `produtos = [
    {'nome': 'Caderno', 'preco': 12.5},
    {'nome': 'Caneta', 'preco': 2.3},
    {'nome': 'Mochila', 'preco': 129.9},
]

nomes = [p['nome'] for p in produtos]
caros = [p['nome'] for p in produtos if p['preco'] > 10]

print(nomes)
print(caros)`,
      caption:
        'A compreensão acessa `p[\'nome\']` dentro da expressão — como um `.map(p => p.nome)` de JavaScript, só que sem a função de seta.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-4-len-nao-e-propriedade',
        type: 'multiple-choice',
        prompt: 'Como se descobre quantos itens uma lista tem, em Python?',
        concepts: ['py-listas'],
        difficulty: 'iniciante',
        tags: ['python', 'listas'],
        options: [
          '`len(lista)` — uma função que recebe a lista',
          '`lista.length` — uma propriedade, como em JavaScript',
          '`lista.length()` — um método',
          '`lista.size` — uma propriedade com outro nome',
        ],
        correctIndex: 0,
        explanation:
          '`len()` é uma função embutida que recebe qualquer coleção (lista, string, dicionário) — não uma propriedade nem um método da lista. `lista.length` não existe em Python.',
        hints: ['Em Python, o tamanho de quase tudo (lista, string, dicionário) usa a mesma função.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-4-fatiar',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['py-listas'],
        difficulty: 'intermediario',
        tags: ['python', 'fatiar'],
        code: `letras = ['a', 'b', 'c', 'd', 'e']
print(letras[1:3])
print(letras[:2])
print(letras[-1])
print(letras[::-1])`,
        expectedOutput: `['b', 'c']
['a', 'b']
e
['e', 'd', 'c', 'b', 'a']`,
        explanation:
          '`[1:3]` pega os índices 1 e 2 (o 3 fica de fora); `[:2]` começa do início e para antes do índice 2; `[-1]` conta a partir do fim, então é o último item; `[::-1]` (sem início nem fim, passo -1) percorre a lista inteira de trás para a frente.',
        hints: ['O segundo número de um fatiamento nunca é incluído — a mesma regra de `range()`.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-4-nomes-maiusculos',
        type: 'code',
        prompt:
          'Escreva `nomes_maiusculos(pessoas)`: recebe uma lista de dicionários com a chave `"nome"`, e devolve uma lista só com os nomes, em maiúsculas (`str.upper()`) — usando compreensão de lista.',
        concepts: ['py-listas'],
        difficulty: 'intermediario',
        tags: ['python', 'compreensao'],
        initialCode: `def nomes_maiusculos(pessoas):
    # uma compreensão de lista: [expressao for item in pessoas]
    pass
`,
        tests: [
          {
            description: 'Duas pessoas viram os dois nomes, em maiúsculas',
            assertion: 'assert nomes_maiusculos([{"nome": "ana"}, {"nome": "bia"}]) == ["ANA", "BIA"], "esperava [\'ANA\', \'BIA\']"',
          },
          {
            description: 'Lista vazia devolve lista vazia',
            assertion: 'assert nomes_maiusculos([]) == [], "esperava lista vazia"',
          },
        ],
        solution: `def nomes_maiusculos(pessoas):
    return [pessoa["nome"].upper() for pessoa in pessoas]
`,
        hints: [
          '`pessoa["nome"]` acessa a chave dentro do dicionário, como um objeto de JavaScript.',
          '`[pessoa["nome"].upper() for pessoa in pessoas]` — a expressão antes do `for` é o que vai para a lista nova.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-4-so-os-caros',
        type: 'code',
        prompt:
          'Escreva `filtrar_caros(produtos, limite)`: devolve só os produtos (a lista inteira de dicionários) cujo `"preco"` é maior que `limite` — usando compreensão de lista com `if`.',
        concepts: ['py-listas'],
        difficulty: 'intermediario',
        tags: ['python', 'compreensao'],
        initialCode: `def filtrar_caros(produtos, limite):
    # [item for item in produtos if condicao]
    pass
`,
        tests: [
          {
            description: 'Só os produtos acima do limite ficam',
            assertion: `produtos = [{"nome": "Caderno", "preco": 12.5}, {"nome": "Caneta", "preco": 2.3}, {"nome": "Mochila", "preco": 129.9}]
resultado = filtrar_caros(produtos, 10)
nomes = [p["nome"] for p in resultado]
assert nomes == ["Caderno", "Mochila"], "esperava ['Caderno', 'Mochila'], veio " + str(nomes)`,
          },
          {
            description: 'Nenhum produto acima do limite devolve lista vazia',
            assertion: 'assert filtrar_caros([{"nome": "Caneta", "preco": 2.3}], 100) == [], "esperava lista vazia"',
          },
        ],
        solution: `def filtrar_caros(produtos, limite):
    return [produto for produto in produtos if produto["preco"] > limite]
`,
        hints: [
          'A condição depois do `if`, dentro dos colchetes, decide o que entra na lista nova.',
          '`[produto for produto in produtos if produto["preco"] > limite]` — sem transformar nada, só filtrando.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-4-remove-por-valor',
        type: 'find-bug',
        prompt: 'Este programa quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['py-listas'],
        difficulty: 'intermediario',
        tags: ['python', 'listas', 'bug'],
        code: `def tirar_da_fila(fila, posicao):
    fila.remove(posicao)
    return fila

fila = ['Ana', 'Bia', 'Carla']
print(tirar_da_fila(fila, 1))`,
        buggyLine: 2,
        fix: '    fila.pop(posicao)',
        explanation:
          '`.remove(valor)` tira a primeira ocorrência **daquele valor** na lista — não o item **naquela posição**. Chamar `fila.remove(1)` procura o valor `1` (um número) dentro de uma lista de strings, não encontra, e lança `ValueError: list.remove(x): x not in list`. Para tirar pelo índice, o método certo é `.pop(indice)`.',
        hints: [
          '`.remove()` e `.pop()` fazem coisas diferentes: um procura por valor, o outro por posição. Qual dos dois a função deveria usar, já que `posicao` é um índice?',
          'A lista `[\'Ana\', \'Bia\', \'Carla\']` não tem o número `1` como item — só strings.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
\`len()\` é função, não propriedade; \`.append()\`, \`.pop()\`, \`.remove()\` (por valor) e \`in\` cobrem o que arrays de JavaScript fazem. Fatiar usa \`[a:b]\`, com o fim nunca incluído — \`[-1]\` conta do fim, \`[::-1]\` inverte.

A compreensão de lista — \`[expressao for item in colecao if condicao]\` — é o \`map\`/\`filter\` do Python numa linha, e é a forma que código Python de verdade prefere no lugar de um \`for\` explícito construindo a lista aos poucos.

Na próxima aula: dicionários e conjuntos — o objeto e o \`Set\` do Python.
`.trim(),
    },
  ],
};
