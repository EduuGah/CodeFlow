import type { Lesson } from '../types';

export const lessonPythonDicionariosEConjuntos: Lesson = {
  id: 'lesson-py-5',
  trackId: 'track-python',
  title: 'Dicionários e Conjuntos',
  language: 'python',
  objective:
    'Usar `dict` como o objeto do Python — acesso por chave, `.get()` com padrão, `.items()` — e `set` para coleções de valores únicos.',
  concepts: ['py-dicionarios'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um dicionário Python é o objeto do JavaScript: pares de chave e valor. A sintaxe de acesso muda; a ideia é a mesma.

## Acesso por colchetes, sempre

Onde JavaScript aceita \`objeto.propriedade\` ou \`objeto['propriedade']\`, Python só tem uma forma:

~~~py
pessoa = {'nome': 'Ana', 'idade': 25}
pessoa['nome']       # 'Ana' — sempre colchetes, nunca pessoa.nome
pessoa['cidade']     # KeyError: 'cidade' — a chave não existe, e isso lança
~~~

Acessar uma chave que não existe **lança** — diferente de JavaScript, que devolveria \`undefined\` sem reclamar.

## .get() para não lançar

Quando a chave pode não existir, \`.get(chave, padrao)\` devolve o padrão em vez de lançar:

~~~py
pessoa.get('cidade')            # None — não lança, mas também não avisa nada
pessoa.get('cidade', 'não informada')  # 'não informada'
~~~

É o equivalente ao \`objeto.cidade ?? 'não informada'\` de JavaScript, só que sem precisar do \`??\` — o padrão já é um argumento do método.

## Percorrer com .items()

\`.items()\` entrega chave e valor juntos, prontos para desempacotar num \`for\`:

~~~py
for chave, valor in pessoa.items():
    print(chave, valor)
# nome Ana
# idade 25
~~~

\`.keys()\` e \`.values()\` existem separados, para quando só um dos dois interessa.

## set: valores únicos, sem ordem garantida

\`set\` é o \`Set\` do JavaScript — uma coleção que não guarda duplicatas, e cuja ordem não é garantida:

~~~py
numeros = {1, 2, 2, 3, 3, 3}
print(numeros)          # {1, 2, 3} — duplicatas somem sozinhas

a = {1, 2, 3}
b = {2, 3, 4}
a | b   # {1, 2, 3, 4} — união
a & b   # {2, 3} — interseção (o que está nos dois)
a - b   # {1} — o que está em "a" e não em "b"
~~~

\`|\`, \`&\` e \`-\` entre conjuntos fazem união, interseção e diferença direto — sem precisar de \`filter\` nem de laço.
`.trim(),
    },
    {
      kind: 'example',
      language: 'python',
      code: `estoque = {'caderno': 10, 'caneta': 50, 'mochila': 3}

for produto, quantidade in estoque.items():
    if quantidade < 5:
        print(f'{produto}: estoque baixo ({quantidade})')

print(estoque.get('borracha', 0))  # 0 — não existe, usa o padrão`,
      caption:
        '`.items()` entrega os dois de uma vez; `.get(chave, 0)` evita o `KeyError` de um produto que ainda não está no estoque.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-5-acesso-lanca',
        type: 'multiple-choice',
        prompt: 'O que acontece ao acessar `dicionario["chave-que-nao-existe"]` (com colchetes, sem `.get()`)?',
        concepts: ['py-dicionarios'],
        difficulty: 'iniciante',
        tags: ['python', 'dicionarios'],
        options: [
          'Lança `KeyError` — diferente de JavaScript, que devolveria `undefined`',
          'Devolve `None`, sem lançar nada',
          'Devolve uma string vazia',
          'Cria a chave automaticamente, com valor `None`',
        ],
        correctIndex: 0,
        explanation:
          'Acesso por colchetes numa chave ausente lança `KeyError` — Python trata isso como um erro de verdade, não como um valor ausente silencioso. `.get()` é o método que existe justamente para os casos em que a ausência é esperada e não deveria lançar.',
        hints: ['Compare com `objeto.chaveQueNaoExiste` de JavaScript — Python é mais rígido aqui.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-5-preco-com-padrao',
        type: 'code',
        prompt:
          'Escreva `preco_ou_zero(precos, produto)`: recebe um dicionário `produto -> preco` e devolve o preço do produto, ou `0` se o produto não estiver no dicionário — usando `.get()`.',
        concepts: ['py-dicionarios'],
        difficulty: 'iniciante',
        tags: ['python', 'dicionarios'],
        initialCode: `def preco_ou_zero(precos, produto):
    return precos[produto]  # isto lança quando o produto não existe
`,
        tests: [
          {
            description: 'Produto existente devolve o preço',
            assertion:
              'assert preco_ou_zero({"caderno": 12.5}, "caderno") == 12.5, "esperava 12.5, veio " + str(preco_ou_zero({"caderno": 12.5}, "caderno"))',
          },
          {
            description: 'Produto ausente devolve 0, sem lançar',
            assertion: `try:
    resultado = preco_ou_zero({"caderno": 12.5}, "mochila")
except Exception as erro:
    assert False, "não deveria lançar para um produto ausente, mas lançou " + type(erro).__name__
else:
    assert resultado == 0, "esperava 0 para um produto ausente, veio " + str(resultado)`,
          },
        ],
        solution: `def preco_ou_zero(precos, produto):
    return precos.get(produto, 0)
`,
        hints: ['`.get(chave, padrao)` resolve isso numa linha — sem precisar de `if` para checar se a chave existe antes.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-5-items',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['py-dicionarios'],
        difficulty: 'iniciante',
        tags: ['python', 'items'],
        code: `notas = {'Ana': 8.5, 'Bia': 6.0}
for nome, nota in notas.items():
    situacao = 'aprovada' if nota >= 7 else 'em recuperação'
    print(nome, situacao)`,
        expectedOutput: `Ana aprovada
Bia em recuperação`,
        explanation:
          '`.items()` entrega cada par como `(chave, valor)`, desempacotado direto em `nome, nota` — um `for` só, sem precisar buscar o valor de volta pelo nome dentro do laço.',
        hints: ['`nome` recebe a chave, `nota` recebe o valor — na mesma ordem que `.items()` os entrega.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-5-conjunto-comum',
        type: 'code',
        prompt:
          'Escreva `interesses_em_comum(pessoa_a, pessoa_b)`: recebe duas listas de strings e devolve um `set` com os interesses que aparecem nas duas — use a interseção (`&`) de dois `set`.',
        concepts: ['py-dicionarios'],
        difficulty: 'intermediario',
        tags: ['python', 'set'],
        initialCode: `def interesses_em_comum(pessoa_a, pessoa_b):
    pass
`,
        tests: [
          {
            description: 'Interesses em comum entre as duas listas',
            assertion: `resultado = interesses_em_comum(["música", "cinema", "corrida"], ["cinema", "corrida", "leitura"])
assert resultado == {"cinema", "corrida"}, "esperava {'cinema', 'corrida'}, veio " + str(resultado)`,
          },
          {
            description: 'Sem nada em comum, devolve um conjunto vazio',
            assertion:
              'assert interesses_em_comum(["música"], ["cinema"]) == set(), "esperava um conjunto vazio, veio " + str(interesses_em_comum(["música"], ["cinema"]))',
          },
        ],
        solution: `def interesses_em_comum(pessoa_a, pessoa_b):
    return set(pessoa_a) & set(pessoa_b)
`,
        hints: [
          '`set(lista)` transforma uma lista num conjunto — sem duplicatas, sem ordem garantida.',
          '`&` entre dois `set` é a interseção: o que aparece nos dois.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-5-chave-errada',
        type: 'find-bug',
        prompt: 'Este programa quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['py-dicionarios'],
        difficulty: 'iniciante',
        tags: ['python', 'dicionarios', 'bug'],
        code: `def saudacao(pessoa):
    return 'Oi, ' + pessoa['name'] + '!'

print(saudacao({'nome': 'Ana'}))`,
        buggyLine: 2,
        fix: "    return 'Oi, ' + pessoa['nome'] + '!'",
        explanation:
          'O dicionário guarda a chave `\'nome\'` (em português), mas a função procura por `\'name\'` (em inglês) — uma chave que não existe nesse dicionário. Python lança `KeyError: \'name\'`, porque acesso por colchetes numa chave ausente sempre lança, sem devolver `None` ou `undefined` em silêncio.',
        hints: [
          'Compare a chave usada no dicionário criado (`{\'nome\': ...}`) com a chave que a função tenta ler.',
          'As duas precisam ser exatamente a mesma string.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Dicionário sempre acessa por colchetes (\`dicionario[chave]\`) — nunca ponto —, e uma chave ausente **lança** \`KeyError\`, diferente do \`undefined\` silencioso de JavaScript. \`.get(chave, padrao)\` é o jeito seguro de ler o que pode não existir; \`.items()\` entrega chave e valor juntos, prontos para um \`for\`.

\`set\` guarda valores únicos, sem ordem garantida, e \`|\`/\`&\`/\`-\` fazem união, interseção e diferença sem laço.

Na próxima aula: strings de verdade — fatiar (a mesma sintaxe de listas), f-strings, e \`split\`/\`join\`.
`.trim(),
    },
  ],
};
