import type { Lesson } from '../types';

export const lessonPythonDepoisDeJavascript: Lesson = {
  id: 'lesson-py-1',
  trackId: 'track-python',
  title: 'Python Depois de JavaScript',
  language: 'python',
  objective:
    'Reconhecer o que muda de sintaxe entre JavaScript e Python (indentação, `print`, comentários, `None`) e o que continua sendo o mesmo raciocínio — variável, função, tipo.',
  concepts: ['py-intro'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Você já sabe programar — as próximas aulas não ensinam "o que é uma função" de novo, ensinam **como o Python escreve** o que você já sabe fazer. A primeira diferença aparece antes de qualquer linha de código de verdade: como o Python decide o que pertence a um bloco.

## Chaves viram indentação

Em JavaScript, um bloco é o que está entre \`{\` e \`}\` — a indentação é só para humanos lerem; o motor ignora os espaços. Em Python, **a indentação é a sintaxe**: não existem chaves, e o recuo é o que diz "isto está dentro do \`if\`", "isto já saiu dele".

~~~js
// JavaScript: as chaves marcam o bloco.
function classificar(idade) {
  if (idade >= 18) {
    return 'adulto';
  } else {
    return 'menor';
  }
}
~~~

~~~py
# Python: a indentação marca o bloco. Sem chaves, sem ponto e vírgula.
def classificar(idade):
    if idade >= 18:
        return 'adulto'
    else:
        return 'menor'
~~~

Duas consequências práticas: misturar quantidades diferentes de espaço no mesmo bloco é **erro de sintaxe**, não frescura de estilo — o Python literalmente não sabe mais o que pertence a onde. E o \`:\` no fim de \`if\`, \`def\`, \`for\` não é decoração: ele anuncia "o bloco indentado começa na próxima linha".

## print() no lugar de console.log

\`print()\` é a função embutida para mostrar algo — o equivalente direto de \`console.log\`. Sem \`console.\`, sem parênteses de método: é uma função solta, como qualquer outra.

~~~py
print('Olá')          # Olá
print(1, 2, 3)        # 1 2 3 — print junta os argumentos com espaço
~~~

## Tipos dinâmicos, sem coerção implícita

Python também não pede o tipo de uma variável de antemão — nesse sentido, é como JavaScript. A diferença aparece na hora de **misturar tipos**: JavaScript converte silenciosamente (\`'5' + 1\` vira \`'51'\`); Python recusa.

~~~py
'5' + 1       # TypeError: can only concatenate str (not "int") to str
'5' + str(1)  # '51' — a conversão precisa ser pedida
5 + int('1')  # 6
~~~

Isso não é uma limitação — é uma escolha: um erro na hora certa é mais barato que um bug silencioso três telas depois.

## Comentário, e sem ponto e vírgula

Comentário começa com \`#\`, até o fim da linha — não existe o \`/* */\` de bloco. E não há \`;\` no fim das instruções: a quebra de linha já separa uma instrução da próxima.

## None é o único "nada"

JavaScript tem dois jeitos de dizer "nada" — \`null\` (ausência deliberada) e \`undefined\` (nunca foi definido) — e a distinção já causou confusão nesta plataforma inteira. Python tem só um: \`None\`. Uma função sem \`return\` explícito devolve \`None\`, do mesmo jeito que uma variável que você quer marcar como "vazia por enquanto".

~~~py
def sem_retorno():
    pass  # não faz nada — um corpo não pode ficar vazio, "pass" preenche o espaço

print(sem_retorno())  # None
~~~
`.trim(),
    },
    {
      kind: 'example',
      language: 'python',
      code: `def saudacao(nome, entusiasmado):
    if entusiasmado:
        return 'Oi, ' + nome + '!!!'
    else:
        return 'Oi, ' + nome + '.'

print(saudacao('Ana', True))
print(saudacao('Bia', False))`,
      caption:
        'Sem chaves, sem ponto e vírgula: o `:` abre o bloco, a indentação diz onde ele termina. `True`/`False` começam com maiúscula — outra diferença de sintaxe para guardar.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-1-o-que-define-bloco',
        type: 'multiple-choice',
        prompt: 'Em Python, o que define onde um bloco de código (o corpo de um `if`, por exemplo) começa e termina?',
        concepts: ['py-intro'],
        difficulty: 'iniciante',
        tags: ['python', 'sintaxe'],
        options: [
          'A indentação — linhas com o mesmo recuo pertencem ao mesmo bloco',
          'Chaves `{` e `}`, como em JavaScript',
          'A palavra `end`, escrita depois do último comando do bloco',
          'Não há bloco: cada linha do arquivo é independente',
        ],
        correctIndex: 0,
        explanation:
          'Sem chaves — a indentação **é** a sintaxe. É por isso que misturar recuos diferentes no mesmo bloco quebra o programa: o Python não tem outra forma de saber o que pertence a cada nível.',
        hints: ['Pense no que aconteceria se você apagasse todos os espaços no início de cada linha de um programa Python.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-1-print-junta',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['py-intro'],
        difficulty: 'iniciante',
        tags: ['python', 'print'],
        code: `print('idade:', 25)
print(1, 2, 3)
print('sem espaço extra' + '!')`,
        expectedOutput: `idade: 25
1 2 3
sem espaço extra!`,
        explanation:
          'Quando `print` recebe vários argumentos separados por vírgula, ele os junta com um espaço entre cada um — é por isso que `\'idade:\', 25` vira `idade: 25`. Já `+` entre duas strings apenas concatena, sem espaço nenhum extra.',
        hints: ['Vírgula dentro de `print(...)` e `+` entre strings fazem coisas diferentes — repare em qual dos três usa qual.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-1-classificar',
        type: 'code',
        prompt:
          'Escreva `classificar_idade(idade)`: devolve `"crianca"` para menos de 12, `"adolescente"` de 12 a 17, e `"adulto"` de 18 em diante.',
        concepts: ['py-intro'],
        difficulty: 'iniciante',
        tags: ['python', 'condicoes'],
        initialCode: `def classificar_idade(idade):
    pass  # substitua pelo corpo da função
`,
        tests: [
          {
            description: 'classificar_idade(5) é "crianca"',
            assertion: 'assert classificar_idade(5) == "crianca", "esperava crianca para idade 5"',
          },
          {
            description: 'classificar_idade(12) já é "adolescente" — o limite inclui o 12',
            assertion: 'assert classificar_idade(12) == "adolescente", "esperava adolescente para idade 12"',
          },
          {
            description: 'classificar_idade(17) ainda é "adolescente"',
            assertion: 'assert classificar_idade(17) == "adolescente", "esperava adolescente para idade 17"',
          },
          {
            description: 'classificar_idade(18) já é "adulto"',
            assertion: 'assert classificar_idade(18) == "adulto", "esperava adulto para idade 18"',
          },
        ],
        solution: `def classificar_idade(idade):
    if idade < 12:
        return "crianca"
    elif idade < 18:
        return "adolescente"
    else:
        return "adulto"
`,
        hints: [
          'Python encadeia condições com `elif` — nem "else if" (JavaScript) nem uma palavra nova: é a contração das duas.',
          'Três faixas, três retornos: `if idade < 12`, `elif idade < 18`, `else`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-1-coercao',
        type: 'multiple-choice',
        prompt: 'O que acontece ao rodar `\'5\' + 1` em Python?',
        concepts: ['py-intro'],
        difficulty: 'iniciante',
        tags: ['python', 'tipos'],
        options: [
          'Lança `TypeError` — Python não converte um tipo no outro sozinho',
          'Devolve `\'51\'`, como em JavaScript',
          'Devolve `6`, convertendo a string para número',
          'Devolve `\'5\'`, ignorando o número',
        ],
        correctIndex: 0,
        explanation:
          'Diferente de JavaScript, que converteria silenciosamente para produzir `\'51\'`, Python recusa somar tipos diferentes — a conversão precisa ser pedida explicitamente, com `str(1)` ou `int(\'5\')`.',
        hints: ['Esta é justamente a diferença que a aula chama de "sem coerção implícita".'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-1-indentacao-quebrada',
        type: 'find-bug',
        prompt: 'Este programa quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['py-intro'],
        difficulty: 'intermediario',
        tags: ['python', 'sintaxe', 'bug'],
        code: `def maior_de_idade(idade):
    if idade >= 18:
        return True
      else:
        return False

print(maior_de_idade(20))`,
        buggyLine: 4,
        fix: '    else:',
        explanation:
          'O `else` está indentado dois espaços a mais que o `if` que ele deveria fechar — Python não reconhece a que bloco ele pertence, e recusa o programa com `IndentationError` antes mesmo de rodar a primeira linha. `if` e `else` do mesmo condicional precisam do mesmo recuo.',
        hints: [
          'Compare o número de espaços antes de `if` e antes do `else` que deveria combinar com ele.',
          'Os dois lados de um `if`/`else` precisam começar exatamente na mesma coluna.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-1-none',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['py-intro'],
        difficulty: 'intermediario',
        tags: ['python', 'none'],
        code: `def buscar(lista, alvo):
    for item in lista:
        if item == alvo:
            return item
    # nenhum return explícito depois do laço

print(buscar([1, 2, 3], 2))
print(buscar([1, 2, 3], 9))`,
        expectedOutput: `2
None`,
        explanation:
          'Quando o laço termina sem encontrar o alvo, a função chega ao fim do corpo sem passar por nenhum `return` — e uma função sem `return` explícito devolve `None`, o único "nada" do Python (em vez da dupla `null`/`undefined` do JavaScript).',
        hints: ['O que uma função Python devolve quando o fluxo chega ao fim do corpo sem um `return`?'],
      },
    },
    {
      kind: 'summary',
      markdown: `
A indentação **é** a sintaxe — não existem chaves, e o \`:\` anuncia que o bloco indentado começa na linha seguinte. \`print()\` substitui \`console.log\`; comentário é \`#\`; não há ponto e vírgula. Tipos continuam dinâmicos, mas sem a coerção silenciosa do JavaScript — misturar \`str\` com \`int\` é \`TypeError\`, não conversão automática. E onde JavaScript tem dois "nada" (\`null\`, \`undefined\`), Python tem só \`None\`.

O raciocínio de variável, condição e função continua sendo o mesmo que você já tem — só a forma de escrever muda.

Na próxima aula: condições e laços, com o \`for\` que percorre coleções direto, sem índice.
`.trim(),
    },
  ],
};
