import type { Lesson } from '../types';

export const lessonPythonModulosEBibliotecaPadrao: Lesson = {
  id: 'lesson-py-9',
  trackId: 'track-python',
  title: 'Módulos e a Biblioteca Padrão',
  language: 'python',
  objective:
    'Importar um módulo com `import` ou `from ... import`, e usar o que a biblioteca padrão já traz pronto — `json`, `math`, `datetime` — sem instalar nada.',
  concepts: ['py-modulos'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Python chega com uma biblioteca padrão grande — boa parte do que você instalaria via npm em JavaScript já vem pronta.

## Duas formas de importar

~~~py
import math
math.sqrt(16)      # 4.0 — precisa do prefixo "math."

from math import sqrt
sqrt(16)            # 4.0 — importou só o nome, sem prefixo
~~~

\`import modulo\` traz o módulo inteiro, e cada uso precisa do prefixo — mais claro sobre de onde cada coisa vem. \`from modulo import nome\` traz um nome específico direto, sem prefixo — mais curto, mas menos óbvio de onde \`sqrt\` veio ao ler o código isolado. Os dois são comuns; o segundo costuma ser reservado para poucos nomes bem conhecidos.

Uma terceira forma dá um apelido ao módulo importado, com \`as\`:

~~~py
import math as m
m.sqrt(16)   # 4.0 — mesmo módulo, nome mais curto
~~~

\`import numpy as np\` e \`import pandas as pd\` são os apelidos mais famosos do ecossistema Python — tão comuns que viraram convenção, mesmo sem nenhuma regra da linguagem exigindo. O Pyodide desta plataforma só traz a biblioteca padrão (o que já vem com o Python, sem instalar nada); pacotes de fora dela, como \`numpy\`, não estão disponíveis aqui.

## json: o JSON.parse / JSON.stringify do Python

~~~py
import json

dados = {'nome': 'Ana', 'idade': 25}
texto = json.dumps(dados)          # '{"nome": "Ana", "idade": 25}' — como JSON.stringify
de_volta = json.loads(texto)       # {'nome': 'Ana', 'idade': 25} — como JSON.parse
~~~

\`dumps\` (de "dump string") serializa; \`loads\` (de "load string") desserializa — os nomes não lembram \`stringify\`/\`parse\`, mas o par funciona igual.

## math: o Math do Python

~~~py
import math

math.sqrt(16)     # 4.0
math.floor(4.7)   # 4
math.ceil(4.2)    # 5
math.pi           # 3.141592653589793 — uma constante, sem parênteses
~~~

## datetime: datas

~~~py
from datetime import date

hoje = date(2026, 9, 22)
print(hoje)             # 2026-09-22
print(hoje.year)         # 2026
outra = date(2026, 1, 1)
print((hoje - outra).days)  # 264 — subtrair datas dá a diferença em dias
~~~

Diferente do \`Date\` de JavaScript (que mistura data e hora, com mês começando em 0), \`date\` do Python guarda só ano/mês/dia, com o mês contado normalmente — janeiro é \`1\`, não \`0\`.
`.trim(),
    },
    {
      kind: 'example',
      language: 'python',
      code: `import json
import math

def resumo_do_pedido(itens):
    total = sum(item['preco'] for item in itens)
    return json.dumps({
        'itens': len(itens),
        'total': round(total, 2),
        'raiz_do_total': round(math.sqrt(total), 2),
    })

print(resumo_do_pedido([{'preco': 10}, {'preco': 15}]))`,
      caption:
        '`sum(...)` com uma expressão geradora soma os preços sem `for` explícito; `json.dumps` transforma o dicionário final numa string — pronta para salvar ou enviar.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-9-duas-formas',
        type: 'multiple-choice',
        prompt: 'Depois de `from math import sqrt`, como se chama a função?',
        concepts: ['py-modulos'],
        difficulty: 'iniciante',
        tags: ['python', 'import'],
        options: [
          '`sqrt(16)` — sem prefixo, porque o nome foi importado diretamente',
          '`math.sqrt(16)` — sempre com o prefixo do módulo',
          '`from.sqrt(16)`',
          'Não é possível chamar a função depois desse tipo de import',
        ],
        correctIndex: 0,
        explanation:
          '`from math import sqrt` traz o nome `sqrt` para o espaço atual, sem precisar do prefixo `math.` — diferente de `import math`, que exige `math.sqrt(...)` em toda chamada.',
        hints: ['O que muda entre `import math` e `from math import sqrt` é justamente se o prefixo é necessário.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-9-json',
        type: 'code',
        prompt:
          'Escreva `pedido_para_texto(pedido)`: recebe um dicionário e devolve a versão JSON dele, como string, usando `json.dumps`.',
        concepts: ['py-modulos'],
        difficulty: 'iniciante',
        tags: ['python', 'json'],
        initialCode: `import json

def pedido_para_texto(pedido):
    pass
`,
        tests: [
          {
            description: 'O texto, decodificado de volta, é igual ao dicionário original',
            assertion: `pedido = {"id": 1, "total": 25.5}
texto = pedido_para_texto(pedido)
assert isinstance(texto, str), "esperava uma string, veio " + str(type(texto))
assert json.loads(texto) == pedido, "o texto decodificado deveria ser igual ao pedido original"`,
          },
        ],
        solution: `import json

def pedido_para_texto(pedido):
    return json.dumps(pedido)
`,
        hints: ['`json.dumps(valor)` transforma qualquer dicionário (ou lista) numa string — uma chamada resolve.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-9-datas',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['py-modulos'],
        difficulty: 'intermediario',
        tags: ['python', 'datetime'],
        code: `from datetime import date

inicio = date(2026, 1, 1)
fim = date(2026, 1, 15)
diferenca = fim - inicio
print(diferenca.days)
print(fim.month)
print(fim > inicio)`,
        expectedOutput: `14
1
True`,
        explanation:
          'Subtrair duas `date` dá um `timedelta`, cujo `.days` é a diferença em dias inteiros — de 1 a 15 de janeiro são 14 dias. `.month` de `fim` é `1` (janeiro é 1, não 0). E datas podem ser comparadas com `>`/`<`, como números.',
        hints: ['`fim - inicio` não devolve um número direto — devolve um objeto com `.days` dentro.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-9-modulo-nao-importado',
        type: 'find-bug',
        prompt: 'Este programa quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['py-modulos'],
        difficulty: 'iniciante',
        tags: ['python', 'import', 'bug'],
        code: `import mathh

def raiz_quadrada_arredondada(numero):
    return round(math.sqrt(numero))

print(raiz_quadrada_arredondada(50))`,
        buggyLine: 1,
        fix: 'import math',
        explanation:
          'O nome do módulo está errado — `mathh`, com um "h" a mais, não existe. Python lança `ModuleNotFoundError: No module named \'mathh\'` na hora de importar, antes mesmo de a função rodar. Diferente de `Math` em JavaScript, que está sempre disponível global sem nenhum passo antes, um módulo em Python precisa de um `import` — e o nome dele precisa estar certo.',
        hints: [
          'Releia o nome do módulo na linha do `import`, letra por letra — ele não é exatamente `math`.',
          'O restante do programa já usa `math.sqrt(...)` corretamente — só o `import` está com o nome errado.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-9-media-arredondada',
        type: 'code',
        prompt:
          'Escreva `media_arredondada(numeros)`: devolve a média da lista, arredondada para cima (`math.ceil`) até o inteiro mais próximo. Lista vazia devolve `0`.',
        concepts: ['py-modulos'],
        difficulty: 'intermediario',
        tags: ['python', 'math'],
        initialCode: `import math

def media_arredondada(numeros):
    pass
`,
        tests: [
          {
            description: 'Média 6.33 arredonda para cima, 7',
            assertion: 'assert media_arredondada([5, 6, 8]) == 7, "esperava 7 (media 6.33 arredondada pra cima)"',
          },
          {
            description: 'Média exata não muda',
            assertion: 'assert media_arredondada([4, 6]) == 5, "esperava 5, veio " + str(media_arredondada([4, 6]))',
          },
          {
            description: 'Lista vazia devolve 0',
            assertion: 'assert media_arredondada([]) == 0, "esperava 0 para lista vazia, veio " + str(media_arredondada([]))',
          },
        ],
        solution: `import math

def media_arredondada(numeros):
    if not numeros:
        return 0
    return math.ceil(sum(numeros) / len(numeros))
`,
        hints: [
          '`sum(numeros) / len(numeros)` é a média; `math.ceil(...)` arredonda para cima.',
          '`if not numeros:` aproveita que uma lista vazia é falsy, como na aula de condições.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
\`import modulo\` traz o módulo inteiro (com prefixo); \`from modulo import nome\` traz um nome direto. A biblioteca padrão já resolve boa parte do que se instalaria via npm: \`json\` (\`dumps\`/\`loads\`, como \`stringify\`/\`parse\`), \`math\` (o \`Math\` do Python, mas precisa de \`import\`), \`datetime\` (datas com mês começando em 1, não 0).

Na última aula da trilha: um projeto que junta tudo — ler dados, transformar, escrever um relatório.
`.trim(),
    },
  ],
};
