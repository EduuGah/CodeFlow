import type { Lesson } from '../types';

export const lessonPythonStringsEFStrings: Lesson = {
  id: 'lesson-py-6',
  trackId: 'track-python',
  title: 'Strings e F-strings',
  language: 'python',
  objective:
    'Fatiar strings com a mesma sintaxe de listas, interpolar com f-string, e usar `split`/`join` — com `join` do lado que Python inverteu em relação a JavaScript.',
  concepts: ['py-strings'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Uma string em Python se comporta como uma lista de caracteres para várias operações — o que você aprendeu sobre fatiar na aula passada se aplica direto.

## Fatiar, do mesmo jeito

~~~py
palavra = 'programação'
palavra[0]      # 'p'
palavra[-1]     # 'o' — último caractere
palavra[:4]     # 'prog'
palavra[4:]     # 'ramação'
palavra[::-1]   # 'oãçamargorp' — invertida
len(palavra)    # 11
~~~

Mesma sintaxe \`[a:b]\`, mesmo \`len()\`, mesmo índice negativo. A diferença: uma string é **imutável** — \`palavra[0] = 'P'\` lança erro. Para "mudar" uma string, sempre se cria uma nova.

## f-string: o template literal do Python

Uma string com \`f\` antes das aspas interpola expressões dentro de \`{}\` — o equivalente direto ao template literal (\`\` \`texto \${variavel}\` \`\`) de JavaScript:

~~~py
nome = 'Ana'
idade = 25
print(f'{nome} tem {idade} anos')          # Ana tem 25 anos
print(f'daqui a 1 ano: {idade + 1}')       # daqui a 1 ano: 26
print(f'{3.14159:.2f}')                     # 3.14 — formata com 2 casas decimais
~~~

\`:.2f\` depois de uma expressão numa f-string é formatação — \`.2f\` significa "número decimal, 2 casas".

## split e join — join do lado trocado

\`split\` quebra uma string numa lista, pelo separador dado:

~~~py
'a,b,c'.split(',')          # ['a', 'b', 'c']
'um  dois   três'.split()    # ['um', 'dois', 'três'] — sem argumento, quebra por espaços (qualquer quantidade)
~~~

\`join\` faz o caminho inverso — mas é **método da string separadora**, não da lista, e recebe a lista como argumento. É o oposto de \`array.join(separador)\` de JavaScript:

~~~py
', '.join(['a', 'b', 'c'])   # 'a, b, c'
'-'.join(['2026', '01', '15'])  # '2026-01-15'
~~~

Lê-se "junte esta lista, usando isto como separador" — a ordem que parece estranha no começo é a mais comum depois de algumas vezes.
`.trim(),
    },
    {
      kind: 'example',
      language: 'python',
      code: `def formatar_cabecalho(titulo, largura=20):
    return f'{titulo.center(largura, "-")}'

def resumir_tags(tags):
    return ', '.join(tags) if tags else 'sem tags'

print(formatar_cabecalho('Menu'))
print(resumir_tags(['python', 'web']))
print(resumir_tags([]))`,
      caption:
        '`.center(largura, "-")` centraliza a string, preenchendo com `-` — mais um método de string que não existe em JavaScript. `join` só roda se `tags` não for uma lista vazia (que é falsy).',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-6-fstring',
        type: 'multiple-choice',
        prompt: 'Como se escreve o equivalente Python de `` `Olá, ${nome}!` `` (template literal de JavaScript)?',
        concepts: ['py-strings'],
        difficulty: 'iniciante',
        tags: ['python', 'f-string'],
        options: [
          '`f\'Olá, {nome}!\'`',
          '`\'Olá, \' + nome + \'!\'`, porque Python não tem interpolação',
          '`\'Olá, %{nome}!\'`',
          '`\'Olá, {nome}!\'`.format()`, sem o `f` na frente',
        ],
        correctIndex: 0,
        explanation:
          'O `f` antes das aspas marca a string como f-string, e `{}` interpola qualquer expressão dentro — o equivalente direto ao `${}` do template literal. A concatenação com `+` funciona, mas é a forma antiga; `.format()` sem `f` na frente pede uma sintaxe diferente (`{}` posicional).',
        hints: ['Uma única letra antes das aspas muda tudo — qual é ela?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-6-fatiar-string',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['py-strings'],
        difficulty: 'intermediario',
        tags: ['python', 'fatiar'],
        code: `email = 'ana@exemplo.com'
arroba = email.index('@')
print(email[:arroba])
print(email[arroba + 1:])`,
        expectedOutput: `ana
exemplo.com`,
        explanation:
          '`.index(\'@\')` acha a posição do `@` (índice 3). `email[:arroba]` pega tudo antes dela (`\'ana\'`); `email[arroba + 1:]` pega tudo depois, pulando o próprio `@` — a mesma técnica de fatiar de uma lista, aplicada a uma string.',
        hints: ['`.index(valor)` devolve a posição onde o valor aparece pela primeira vez — o mesmo `indexOf` de JavaScript, com outro nome.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-6-formatar-preco',
        type: 'code',
        prompt:
          'Escreva `descricao_do_produto(nome, preco)`: devolve uma f-string no formato `"Caderno — R$ 12.50"` (o preço com exatamente 2 casas decimais, usando `:.2f`).',
        concepts: ['py-strings'],
        difficulty: 'iniciante',
        tags: ['python', 'f-string'],
        initialCode: `def descricao_do_produto(nome, preco):
    pass
`,
        tests: [
          {
            description: 'Preço com uma casa decimal ganha o zero',
            assertion: 'assert descricao_do_produto("Caderno", 12.5) == "Caderno — R$ 12.50", "veio " + descricao_do_produto("Caderno", 12.5)',
          },
          {
            description: 'Preço inteiro ganha as duas casas decimais',
            assertion: 'assert descricao_do_produto("Caneta", 2) == "Caneta — R$ 2.00", "esperava \'Caneta — R$ 2.00\', veio " + str(descricao_do_produto("Caneta", 2))',
          },
        ],
        solution: `def descricao_do_produto(nome, preco):
    return f'{nome} — R$ {preco:.2f}'
`,
        hints: [
          'Uma única f-string resolve: `f\'{nome} — R$ {preco:.2f}\'`.',
          '`:.2f` depois da expressão formata como número decimal com 2 casas — funciona mesmo se `preco` for um número inteiro.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-6-join-do-lado-errado',
        type: 'find-bug',
        prompt: 'Este programa quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['py-strings'],
        difficulty: 'intermediario',
        tags: ['python', 'join', 'bug'],
        code: `def juntar_tags(tags):
    return tags.join(', ')

print(juntar_tags(['python', 'web', 'sql']))`,
        buggyLine: 2,
        fix: "    return ', '.join(tags)",
        explanation:
          '`join` é método da **string separadora**, não da lista — o oposto de `array.join()` em JavaScript. `tags.join(\', \')` tenta chamar `.join` numa lista, que não tem esse método, e lança `AttributeError: \'list\' object has no attribute \'join\'`. A forma certa inverte os dois lados: `\', \'.join(tags)`.',
        hints: [
          'Em Python, quem chama `.join()` é o separador (a string), não a coleção — o oposto do que JavaScript ensina.',
          'Troque os dois lados: a string com a vírgula chama `.join`, recebendo a lista como argumento.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-6-primeiro-e-ultimo-nome',
        type: 'code',
        prompt:
          'Escreva `primeiro_e_ultimo_nome(nome_completo)`: recebe uma string como `"Ana Paula Souza"` e devolve `"Ana Souza"` — só o primeiro e o último nome, separados por um espaço. Use `.split()` e `.join()`.',
        concepts: ['py-strings'],
        difficulty: 'intermediario',
        tags: ['python', 'split', 'join'],
        initialCode: `def primeiro_e_ultimo_nome(nome_completo):
    pass
`,
        tests: [
          {
            description: 'Três nomes vira primeiro e último',
            assertion:
              'assert primeiro_e_ultimo_nome("Ana Paula Souza") == "Ana Souza", "esperava \'Ana Souza\', veio " + str(primeiro_e_ultimo_nome("Ana Paula Souza"))',
          },
          {
            description: 'Dois nomes continuam os dois',
            assertion:
              'assert primeiro_e_ultimo_nome("Bia Lima") == "Bia Lima", "esperava \'Bia Lima\', veio " + str(primeiro_e_ultimo_nome("Bia Lima"))',
          },
          {
            description: 'Um nome só se repete',
            assertion:
              'assert primeiro_e_ultimo_nome("Carla") == "Carla Carla", "esperava \'Carla Carla\', veio " + str(primeiro_e_ultimo_nome("Carla"))',
          },
        ],
        solution: `def primeiro_e_ultimo_nome(nome_completo):
    partes = nome_completo.split()
    return ' '.join([partes[0], partes[-1]])
`,
        hints: [
          '`.split()` sem argumento quebra por espaços, devolvendo a lista de nomes.',
          'O primeiro é `partes[0]`, o último é `partes[-1]` — junte os dois com `\' \'.join([...])`.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
String se fatia como lista (\`[a:b]\`, índice negativo, \`len()\`), mas é imutável. F-string (\`f'texto {expressao}'\`) interpola, como o template literal de JavaScript — e \`:.2f\` formata números dentro dela. \`split\` quebra em lista; \`join\` é método do **separador**, não da lista — \`', '.join(lista)\`, do lado trocado em relação a JavaScript.

Na próxima aula: erros — \`try\`/\`except\`/\`finally\`, e como nomear os seus próprios.
`.trim(),
    },
  ],
};
