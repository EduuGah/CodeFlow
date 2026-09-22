import type { Lesson } from '../types';

export const lessonPythonProjeto: Lesson = {
  id: 'lesson-py-10',
  trackId: 'track-python',
  title: 'Projeto: Ler, Transformar, Escrever',
  language: 'python',
  objective:
    'Juntar o que a trilha ensinou — listas, dicionários, strings, erros — na forma que quase todo script de dados tem: ler os registros, transformar com funções, produzir um relatório.',
  concepts: ['py-projeto'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um script que processa dados quase sempre tem a mesma forma, em três partes: **ler** os dados de entrada (de um arquivo, de uma API, ou já prontos numa lista), **transformar** com funções que não têm efeito colateral, e **escrever** a saída (na tela, num arquivo, num relatório). É a mesma forma de qualquer pipeline de dados, só que pequena o bastante para caber numa aula.

Esta aula não ensina nada novo — ela junta listas, dicionários, compreensões, f-strings e tratamento de erro, que as aulas 2 a 9 já ensinaram, num script só.

## Os dados de entrada

~~~py
registros = [
    {'produto': 'Caderno', 'quantidade': 3, 'preco_unitario': 12.5},
    {'produto': 'Caneta', 'quantidade': 10, 'preco_unitario': 2.3},
    {'produto': 'Mochila', 'quantidade': 1, 'preco_unitario': 129.9},
]
~~~

Uma lista de dicionários — o formato mais comum para "várias linhas, cada uma com os mesmos campos" (o que viria de um CSV ou de uma resposta JSON).

## Transformar: funções que calculam, sem imprimir nada

~~~py
def subtotal(registro):
    return registro['quantidade'] * registro['preco_unitario']

def total_geral(registros):
    return sum(subtotal(r) for r in registros)
~~~

Repare: \`subtotal\` e \`total_geral\` só calculam e devolvem — nenhuma delas imprime nada. Misturar "calcular" com "mostrar na tela" numa função só é a mesma armadilha que a trilha de Engenharia já apontou: duas razões de mudar, uma função só.

## Escrever: montar o relatório por último

~~~py
def gerar_relatorio(registros):
    linhas = []
    for r in registros:
        linhas.append(f"{r['produto']}: {r['quantidade']}x R$ {r['preco_unitario']:.2f} = R$ {subtotal(r):.2f}")
    linhas.append(f'Total: R$ {total_geral(registros):.2f}')
    return '\\n'.join(linhas)

print(gerar_relatorio(registros))
~~~

Só na última função o texto é de fato montado — as anteriores continuam reutilizáveis para qualquer outro formato de saída que aparecer depois (um total só, uma exportação em JSON, o que for).

## Dados nem sempre vêm limpos

Um registro real pode vir sem um campo esperado. Sem tratar isso, o script inteiro quebra por causa de **uma** linha ruim — a mesma lição da aula de erros, agora aplicada a dados de verdade.
`.trim(),
    },
    {
      kind: 'example',
      language: 'python',
      code: `def subtotal_seguro(registro):
    try:
        return registro['quantidade'] * registro['preco_unitario']
    except KeyError as erro:
        print(f'registro incompleto, faltou {erro}: {registro}')
        return 0

registros = [
    {'produto': 'Caderno', 'quantidade': 3, 'preco_unitario': 12.5},
    {'produto': 'Caneta', 'quantidade': 10},  # faltou preco_unitario
]

total = sum(subtotal_seguro(r) for r in registros)
print(f'total (ignorando o registro incompleto): R$ {total:.2f}')`,
      caption:
        'Um registro ruim não derruba o relatório inteiro — `subtotal_seguro` avisa qual campo faltou e segue em frente com `0`, em vez de deixar o `KeyError` quebrar o script todo.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-10-tres-partes',
        type: 'multiple-choice',
        prompt: 'Qual é a forma mais comum de um script que processa dados?',
        concepts: ['py-projeto'],
        difficulty: 'iniciante',
        tags: ['python', 'projeto'],
        options: [
          'Ler os dados de entrada, transformar com funções que calculam, escrever a saída por último',
          'Escrever a saída primeiro, depois preencher com os dados conforme chegam',
          'Misturar leitura, cálculo e exibição numa função só, para ser mais rápido',
          'Não existe uma forma comum — cada script é organizado do zero',
        ],
        correctIndex: 0,
        explanation:
          'Separar em três fases — ler, transformar, escrever — mantém as funções de cálculo reutilizáveis (sem imprimir nada) e isola a montagem do texto final numa etapa só, a mesma disciplina de "uma razão para mudar" que a trilha de Engenharia ensinou para arquivos e funções.',
        hints: ['Pense em qual das opções deixaria mais fácil trocar só a forma da saída (de texto para JSON, por exemplo) sem mexer no cálculo.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-10-subtotal-e-total',
        type: 'code',
        prompt:
          'Escreva `subtotal(registro)` (devolve `quantidade * preco_unitario`) e `total_geral(registros)` (a soma dos subtotais de todos os registros, usando uma expressão geradora com `sum(... for ...)`.',
        concepts: ['py-projeto'],
        difficulty: 'intermediario',
        tags: ['python', 'listas', 'dicionarios'],
        initialCode: `def subtotal(registro):
    pass

def total_geral(registros):
    pass
`,
        tests: [
          {
            description: 'subtotal calcula quantidade vezes preço',
            assertion:
              'assert subtotal({"quantidade": 3, "preco_unitario": 10}) == 30, "esperava 30, veio " + str(subtotal({"quantidade": 3, "preco_unitario": 10}))',
          },
          {
            description: 'total_geral soma os subtotais de todos os registros',
            assertion: `registros = [{"quantidade": 3, "preco_unitario": 10}, {"quantidade": 2, "preco_unitario": 5}]
assert total_geral(registros) == 40, "esperava 40 (30 + 10), veio " + str(total_geral(registros))`,
          },
          {
            description: 'Lista vazia soma 0',
            assertion: 'assert total_geral([]) == 0, "esperava 0 para lista vazia, veio " + str(total_geral([]))',
          },
        ],
        solution: `def subtotal(registro):
    return registro['quantidade'] * registro['preco_unitario']

def total_geral(registros):
    return sum(subtotal(r) for r in registros)
`,
        hints: [
          '`subtotal` só multiplica dois campos do dicionário — uma linha resolve.',
          '`sum(subtotal(r) for r in registros)` soma o resultado de `subtotal` aplicado a cada registro, sem precisar de uma lista intermediária.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-10-relatorio-previsto',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['py-projeto'],
        difficulty: 'intermediario',
        tags: ['python', 'relatorio'],
        code: `def linha_do_relatorio(registro):
    total = registro['quantidade'] * registro['preco_unitario']
    return f"{registro['produto']}: R$ {total:.2f}"

registros = [
    {'produto': 'Caderno', 'quantidade': 2, 'preco_unitario': 12.5},
    {'produto': 'Caneta', 'quantidade': 4, 'preco_unitario': 2.3},
]

linhas = [linha_do_relatorio(r) for r in registros]
print('\\n'.join(linhas))`,
        expectedOutput: `Caderno: R$ 25.00
Caneta: R$ 9.20`,
        explanation:
          'A compreensão de lista aplica `linha_do_relatorio` a cada registro, produzindo uma linha de texto por item; `\'\\n\'.join(linhas)` junta as duas com uma quebra de linha entre elas — o relatório final, montado só no fim.',
        hints: ['Calcule cada total à parte: `2 × 12.5` e `4 × 2.3`, formatados com duas casas decimais.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-10-campo-faltando',
        type: 'find-bug',
        prompt: 'Este programa quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['py-projeto'],
        difficulty: 'intermediario',
        tags: ['python', 'dados-incompletos', 'bug'],
        code: `def subtotal_seguro(registro):
    try:
        return registro['quantidade'] * registro['preco_unitario']
    except IndexError:
        return 0

registros = [{'produto': 'Caneta', 'quantidade': 10}]
print(subtotal_seguro(registros[0]))`,
        buggyLine: 4,
        fix: '    except KeyError:',
        explanation:
          'O registro não tem a chave `\'preco_unitario\'` — acessar uma chave ausente num dicionário lança `KeyError`, não `IndexError` (que é sobre posições de lista, fora de contexto aqui). Como o `except` está esperando o tipo errado, o `KeyError` de verdade continua subindo, e o programa quebra.',
        hints: [
          'A operação que falha é `registro[\'preco_unitario\']` — um acesso a **dicionário**, não a lista. Qual exceção isso lança?',
          'Compare com a aula de dicionários: acessar uma chave ausente sempre lança o mesmo tipo de erro.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-10-relatorio-completo',
        type: 'code',
        prompt:
          'Escreva `gerar_relatorio(registros)`: uma linha por registro no formato `"Produto: NxR$ preco = R$ subtotal"` — por exemplo, `"Caderno: 2x R$ 12.50 = R$ 25.00"` —, seguida de uma linha final `"Total: R$ total_geral"`. Tudo junto com `\\n`.',
        concepts: ['py-projeto'],
        difficulty: 'avancado',
        tags: ['python', 'projeto', 'relatorio'],
        initialCode: `def subtotal(registro):
    return registro['quantidade'] * registro['preco_unitario']

def total_geral(registros):
    return sum(subtotal(r) for r in registros)

def gerar_relatorio(registros):
    pass
`,
        tests: [
          {
            description: 'Relatório com dois produtos e o total no fim',
            assertion: `registros = [
    {"produto": "Caderno", "quantidade": 2, "preco_unitario": 12.5},
    {"produto": "Caneta", "quantidade": 4, "preco_unitario": 2.3},
]
esperado = "Caderno: 2x R$ 12.50 = R$ 25.00\\nCaneta: 4x R$ 2.30 = R$ 9.20\\nTotal: R$ 34.20"
assert gerar_relatorio(registros) == esperado, "o relatório não bateu com o esperado, veio:\\n" + str(gerar_relatorio(registros))`,
          },
          {
            description: 'Um produto só ainda tem a linha de total',
            assertion: `registros = [{"produto": "Mochila", "quantidade": 1, "preco_unitario": 129.9}]
esperado = "Mochila: 1x R$ 129.90 = R$ 129.90\\nTotal: R$ 129.90"
assert gerar_relatorio(registros) == esperado, "o relatório não bateu com o esperado, veio:\\n" + str(gerar_relatorio(registros))`,
          },
        ],
        solution: `def subtotal(registro):
    return registro['quantidade'] * registro['preco_unitario']

def total_geral(registros):
    return sum(subtotal(r) for r in registros)

def gerar_relatorio(registros):
    linhas = []
    for r in registros:
        linhas.append(
            f"{r['produto']}: {r['quantidade']}x R$ {r['preco_unitario']:.2f} = R$ {subtotal(r):.2f}"
        )
    linhas.append(f'Total: R$ {total_geral(registros):.2f}')
    return '\\n'.join(linhas)
`,
        hints: [
          'Monte uma lista de linhas — uma por registro, no formato pedido —, acrescente a linha do total no fim, e junte tudo com `\'\\n\'.join(linhas)`.',
          'Reaproveite `subtotal(r)` e `total_geral(registros)`, que já fazem as contas — a função nova só monta o texto.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Ler, transformar, escrever: a forma que sustenta quase todo script de dados. Funções de cálculo (\`subtotal\`, \`total_geral\`) não imprimem nada — só a última etapa monta o texto final, o que mantém tudo reutilizável para qualquer outra saída que apareça depois. E dados reais vêm incompletos às vezes: tratar o \`KeyError\` de um campo ausente evita que uma linha ruim derrube o relatório inteiro.

Isso fecha a trilha de Python inteira — as dez aulas do roadmap original. \`for\`, funções, listas, dicionários, strings, erros, classes e módulos: o vocabulário muda, o raciocínio de programar continua sendo o mesmo que você já tinha.
`.trim(),
    },
  ],
};
