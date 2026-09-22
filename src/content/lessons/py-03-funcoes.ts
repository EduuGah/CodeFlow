import type { Lesson } from '../types';

export const lessonPythonFuncoes: Lesson = {
  id: 'lesson-py-3',
  trackId: 'track-python',
  title: 'Funções em Python',
  language: 'python',
  objective:
    'Chamar funções por nome de parâmetro, usar valores padrão com segurança, devolver mais de um valor com tupla, e documentar com docstring.',
  concepts: ['py-funcoes'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Função em Python é o que você já conhece — o que muda são três recursos que JavaScript não tem prontos do mesmo jeito.

## Parâmetros nomeados

Qualquer chamada pode nomear os parâmetros, em vez de depender só da posição:

~~~py
def criar_pedido(item, quantidade=1, urgente=False):
    return f'{quantidade}x {item}' + (' — urgente' if urgente else '')

criar_pedido('caderno')                          # posição, usa os padrões
criar_pedido('caderno', quantidade=3)             # nomeado, pula "quantidade" na posição
criar_pedido(item='caderno', urgente=True)        # tudo nomeado, ordem livre
~~~

Isso resolve um problema real: \`criarPedido('caderno', undefined, true)\` em JavaScript, para pular um parâmetro do meio, é feio e frágil. Em Python, você só nomeia o que quer pular na frente.

## Valor padrão — e a armadilha do padrão mutável

Um parâmetro com \`=\` tem valor padrão, como em JavaScript. A armadilha aparece quando o padrão é uma **lista ou dicionário**: Python cria esse valor **uma vez só**, na hora que a função é definida — não a cada chamada.

~~~py
def adicionar_item(item, lista=[]):  # NÃO FAÇA ISSO
    lista.append(item)
    return lista

adicionar_item('a')  # ['a']
adicionar_item('b')  # ['a', 'b'] — a MESMA lista da chamada anterior!
~~~

A segunda chamada devolve \`['a', 'b']\`, não \`['b']\` — a lista padrão sobreviveu entre as duas chamadas, porque as duas usaram o mesmo objeto. O jeito seguro:

~~~py
def adicionar_item(item, lista=None):
    if lista is None:
        lista = []
    lista.append(item)
    return lista
~~~

\`is None\` (não \`== None\`) é como se compara com \`None\` em Python — o equivalente ao \`=== null\` do JavaScript.

## Retorno múltiplo, com tupla

\`return a, b\` devolve os dois valores de uma vez, numa **tupla** (uma sequência que não muda depois de criada). Quem chama desempacota direto:

~~~py
def dividir(a, b):
    quociente = a // b   # divisão inteira
    resto = a % b
    return quociente, resto

q, r = dividir(17, 5)
print(q, r)  # 3 2
~~~

Não existe objeto \`{ quociente, resto }\` aqui — é a tupla que carrega os dois valores, na ordem.

## Docstring: a documentação mora dentro da função

A primeira linha do corpo, entre aspas triplas, é a docstring — a descrição que ferramentas (e outras pessoas) leem sem abrir o código:

~~~py
def calcular_frete(peso, distancia):
    """Devolve o frete em reais, dado o peso (kg) e a distância (km)."""
    return peso * 0.5 + distancia * 0.1
~~~
`.trim(),
    },
    {
      kind: 'example',
      language: 'python',
      code: `def formatar_nome(primeiro, ultimo, abreviar=False):
    """Junta nome e sobrenome; abreviar=True deixa só a inicial do sobrenome."""
    if abreviar:
        return f'{primeiro} {ultimo[0]}.'
    return f'{primeiro} {ultimo}'

print(formatar_nome('Ana', 'Souza'))
print(formatar_nome('Ana', 'Souza', abreviar=True))
print(formatar_nome(ultimo='Lima', primeiro='Bia'))`,
      caption:
        'Três chamadas, três jeitos: só posição, posição com um nomeado, e tudo nomeado (em qualquer ordem). A docstring documenta o que `abreviar=True` faz.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-3-nomeado',
        type: 'multiple-choice',
        prompt: 'O que `criar_pedido(item="caderno", urgente=True)` tem de diferente de uma chamada posicional?',
        concepts: ['py-funcoes'],
        difficulty: 'iniciante',
        tags: ['python', 'funcoes'],
        options: [
          'Os parâmetros são identificados pelo nome, então a ordem entre eles não importa, e dá para pular os que têm padrão',
          'É mais rápida de executar que uma chamada posicional',
          'Só funciona se a função não tiver nenhum parâmetro posicional',
          'É idêntica, Python só aceita como sintaxe alternativa sem efeito nenhum',
        ],
        correctIndex: 0,
        explanation:
          'Nomear um parâmetro identifica ele pelo nome, não pela posição na lista de argumentos — por isso a ordem entre parâmetros nomeados não importa, e um parâmetro com valor padrão (como `quantidade` no exemplo) pode ser pulado sem precisar passar um valor qualquer no lugar dele.',
        hints: ['Pense no problema que isso resolve: pular um parâmetro do meio sem precisar passar algo só para "preencher o espaço".'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-3-padrao-seguro',
        type: 'code',
        prompt:
          'Escreva `criar_perfil(nome, tags=None)`: devolve um dicionário `{"nome": nome, "tags": tags}`. Se `tags` não for passado, use uma lista vazia **nova a cada chamada** — não um padrão mutável compartilhado.',
        concepts: ['py-funcoes'],
        difficulty: 'intermediario',
        tags: ['python', 'funcoes', 'padrao-mutavel'],
        initialCode: `def criar_perfil(nome, tags=[]):
    tags.append('novo')
    return {"nome": nome, "tags": tags}
`,
        tests: [
          {
            description: 'Duas chamadas sem tags não compartilham a mesma lista',
            assertion: `perfil1 = criar_perfil("Ana")
perfil2 = criar_perfil("Bia")
assert perfil1["tags"] == ["novo"], "esperava so 'novo' no perfil da Ana, veio " + str(perfil1["tags"])
assert perfil2["tags"] == ["novo"], "o perfil da Bia nao deveria ter herdado a tag do perfil da Ana, veio " + str(perfil2["tags"])`,
          },
          {
            description: 'Passar tags explicitamente ainda funciona',
            assertion: 'assert criar_perfil("Carla", tags=["vip"])["tags"] == ["vip", "novo"]',
          },
        ],
        solution: `def criar_perfil(nome, tags=None):
    if tags is None:
        tags = []
    tags.append('novo')
    return {"nome": nome, "tags": tags}
`,
        hints: [
          'O padrão mutável (`tags=[]`) é criado uma vez só, na definição da função — todas as chamadas sem `tags` compartilham a mesma lista.',
          'Use `tags=None` como padrão, e dentro da função: `if tags is None: tags = []`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-3-retorno-multiplo',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['py-funcoes'],
        difficulty: 'iniciante',
        tags: ['python', 'tupla'],
        code: `def dividir(a, b):
    quociente = a // b
    resto = a % b
    return quociente, resto

q, r = dividir(17, 5)
print(q)
print(r)
print(dividir(9, 3))`,
        expectedOutput: `3
2
(3, 0)`,
        explanation:
          '`q, r = dividir(17, 5)` desempacota a tupla nas duas variáveis: `17 // 5` é `3` (divisão inteira), `17 % 5` é `2` (resto). Sem desempacotar, `print(dividir(9, 3))` mostra a tupla inteira, entre parênteses: `(3, 0)`.',
        hints: ['`//` é divisão inteira (arredonda para baixo); `%` é o resto — os mesmos operadores da aula anterior, agora nos dois valores de uma função.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-3-argumentos-faltando',
        type: 'find-bug',
        prompt: 'Este programa quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['py-funcoes'],
        difficulty: 'iniciante',
        tags: ['python', 'funcoes', 'bug'],
        code: `def calcular_frete(peso, distancia):
    """Devolve o frete em reais."""
    return peso * 0.5 + distancia * 0.1

print(calcular_frete(2))`,
        buggyLine: 5,
        fix: 'print(calcular_frete(2, 10))',
        explanation:
          '`calcular_frete` foi definida com dois parâmetros obrigatórios (nenhum tem valor padrão), e a chamada só passou um. Python lança `TypeError: calcular_frete() missing 1 required positional argument: \'distancia\'` — diferente de JavaScript, que preencheria o parâmetro que faltou com `undefined` em silêncio.',
        hints: [
          'A função pede dois valores; quantos a chamada está passando?',
          'Sem valor padrão, todo parâmetro é obrigatório — chamar sem ele é erro, não `undefined` como em JavaScript.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-3-docstring',
        type: 'multiple-choice',
        prompt: 'Onde mora a docstring de uma função, e o que ela é?',
        concepts: ['py-funcoes'],
        difficulty: 'iniciante',
        tags: ['python', 'docstring'],
        options: [
          'A primeira linha do corpo da função, entre aspas triplas — uma descrição que ferramentas conseguem ler sem abrir o código',
          'Um comentário com `#` escrito acima do `def`',
          'O nome da função, quando escrito de forma bem descritiva',
          'Um arquivo `.md` separado, com o mesmo nome da função',
        ],
        correctIndex: 0,
        explanation:
          'A docstring é uma string literal — geralmente entre `"""` — como primeira instrução do corpo da função. Diferente de um comentário `#`, ela fica associada à função em tempo de execução (acessível via `funcao.__doc__`), e é o que ferramentas de documentação e o `help()` do próprio Python leem.',
        hints: ['É uma string de verdade, não um comentário — por isso ferramentas conseguem lê-la programaticamente.'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Parâmetro nomeado identifica pelo nome, não pela posição — a ordem entre eles fica livre, e dá para pular os que têm padrão. Valor padrão funciona como em JavaScript, **exceto** quando é uma lista ou dicionário: esse padrão é criado uma vez só, e compartilhado entre chamadas — a correção é usar \`None\` e criar o valor de verdade dentro da função. \`return a, b\` devolve uma tupla, desempacotada com \`x, y = funcao()\`. E a docstring, a primeira linha do corpo entre aspas triplas, documenta a função de um jeito que ferramentas conseguem ler.

Na próxima aula: listas de verdade — fatiar, e a compreensão de lista, o \`map\`/\`filter\` do Python numa linha só.
`.trim(),
    },
  ],
};
