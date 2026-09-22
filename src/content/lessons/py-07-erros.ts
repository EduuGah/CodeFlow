import type { Lesson } from '../types';

export const lessonPythonErros: Lesson = {
  id: 'lesson-py-7',
  trackId: 'track-python',
  title: 'Erros em Python',
  language: 'python',
  objective:
    'Tratar exceções com `try/except/finally`, pegar só o tipo esperado, e nomear os próprios erros com uma classe que herda de `Exception`.',
  concepts: ['py-erros'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
O mecanismo é o mesmo de \`try/catch/finally\`; o nome de duas das três palavras muda.

## try / except / finally

~~~py
try:
    resultado = 10 / 0
except ZeroDivisionError:
    print('não dá para dividir por zero')
finally:
    print('isto roda sempre, deu erro ou não')
~~~

\`except\` é o \`catch\`; \`finally\` é igual. A diferença que importa: \`except TipoDoErro:\` pega **só aquele tipo** de exceção — qualquer outro tipo continua subindo, sem ser capturado ali.

~~~py
try:
    lista = [1, 2, 3]
    print(lista[10])
except ZeroDivisionError:
    print('isto não roda — o erro foi IndexError, não ZeroDivisionError')
~~~

O \`IndexError\` do exemplo acima não é pego por \`except ZeroDivisionError\`, e continua subindo — o programa quebra do mesmo jeito que quebraria sem \`try\` nenhum. É o oposto de um \`catch\` sem tipo, que em JavaScript pega qualquer coisa.

## except captura o erro com um nome

\`except TipoDoErro as erro\` guarda a exceção numa variável, para ler a mensagem:

~~~py
try:
    idade = int('abc')
except ValueError as erro:
    print(f'não deu para converter: {erro}')
~~~

## raise lança

\`raise\` é o \`throw\`. Pode relançar uma exceção pronta, ou criar uma:

~~~py
def validar_idade(idade):
    if idade < 0:
        raise ValueError('idade não pode ser negativa')
    return idade
~~~

## Erro com nome próprio: uma classe que herda de Exception

Como \`class MeuErro extends Error\` em JavaScript, um erro com nome em Python é uma classe que herda de \`Exception\`:

~~~py
class SaldoInsuficiente(Exception):
    pass

def sacar(saldo, valor):
    if valor > saldo:
        raise SaldoInsuficiente(f'saldo {saldo}, tentou sacar {valor}')
    return saldo - valor

try:
    sacar(100, 500)
except SaldoInsuficiente as erro:
    print(f'saque recusado: {erro}')
~~~

\`except SaldoInsuficiente\` só pega esse erro específico — outros erros (um \`TypeError\` por um argumento errado, por exemplo) continuam subindo, exatamente como um \`instanceof\` filtraria em JavaScript.
`.trim(),
    },
    {
      kind: 'example',
      language: 'python',
      code: `class EstoqueInsuficiente(Exception):
    pass

def vender(estoque, produto, quantidade):
    disponivel = estoque.get(produto, 0)
    if quantidade > disponivel:
        raise EstoqueInsuficiente(f'{produto}: pediu {quantidade}, tem {disponivel}')
    estoque[produto] = disponivel - quantidade
    return estoque

estoque = {'caderno': 5}
try:
    vender(estoque, 'caderno', 10)
except EstoqueInsuficiente as erro:
    print(f'venda recusada: {erro}')
finally:
    print('tentativa registrada')`,
      caption:
        'O erro nomeado carrega a mensagem certa; `finally` roda mesmo quando `except` pegou o erro — útil para um log que precisa acontecer sempre.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-7-nomes',
        type: 'multiple-choice',
        prompt: 'Qual é a tradução correta de `try`/`catch`/`finally` de JavaScript para Python?',
        concepts: ['py-erros'],
        difficulty: 'iniciante',
        tags: ['python', 'erros'],
        options: [
          '`try` / `except` / `finally`',
          '`try` / `catch` / `finally` — as três palavras são as mesmas',
          '`attempt` / `except` / `always`',
          '`try` / `rescue` / `ensure`',
        ],
        correctIndex: 0,
        explanation:
          '`try` e `finally` continuam iguais; só `catch` vira `except` em Python.',
        hints: ['Duas das três palavras não mudam — só uma tem nome diferente.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-7-converter-seguro',
        type: 'code',
        prompt:
          'Escreva `converter_ou_zero(texto)`: tenta `int(texto)`; se der `ValueError` (texto que não é número), devolve `0` em vez de deixar o erro subir.',
        concepts: ['py-erros'],
        difficulty: 'iniciante',
        tags: ['python', 'try-except'],
        initialCode: `def converter_ou_zero(texto):
    return int(texto)  # isto lança ValueError para texto que não é número
`,
        tests: [
          {
            description: 'Texto numérico converte normalmente',
            assertion: 'assert converter_ou_zero("42") == 42',
          },
          {
            description: 'Texto não numérico devolve 0, sem lançar',
            assertion: 'assert converter_ou_zero("abc") == 0',
          },
        ],
        solution: `def converter_ou_zero(texto):
    try:
        return int(texto)
    except ValueError:
        return 0
`,
        hints: ['Envolva a conversão num `try`, e pegue especificamente `ValueError` — o tipo que `int()` lança para texto inválido.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-7-finally-sempre-roda',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['py-erros'],
        difficulty: 'intermediario',
        tags: ['python', 'finally'],
        code: `def processar(numero):
    try:
        print('início')
        return 100 / numero
    except ZeroDivisionError:
        print('erro: divisão por zero')
        return None
    finally:
        print('fim')

print(processar(0))
print(processar(5))`,
        expectedOutput: `início
erro: divisão por zero
fim
None
início
fim
20.0`,
        explanation:
          '`finally` roda **mesmo com um `return` dentro do `try` ou do `except`** — o "fim" aparece antes do valor devolvido ser de fato impresso pelo `print` de fora, nos dois casos. Na primeira chamada o erro é pego; na segunda, não há erro, e o `except` nem executa.',
        hints: ['`finally` roda sempre — antes da função de fato terminar, mesmo quando um `return` já foi decidido dentro do `try`/`except`.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-7-tipo-errado',
        type: 'find-bug',
        prompt: 'Este programa quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['py-erros'],
        difficulty: 'intermediario',
        tags: ['python', 'except', 'bug'],
        code: `def primeiro_item(lista):
    try:
        return lista[0]
    except ValueError:
        return None

print(primeiro_item([]))`,
        buggyLine: 4,
        fix: '    except IndexError:',
        explanation:
          'Acessar o índice 0 de uma lista vazia lança `IndexError`, não `ValueError` — e `except ValueError` só pega `ValueError`. Como o tipo não bate, o `IndexError` continua subindo sem ser capturado, e o programa quebra do jeito que quebraria sem `try` nenhum.',
        hints: [
          'Qual exceção uma lista vazia lança ao ser indexada — a mesma do exemplo da aula com uma lista de 3 itens e índice 10?',
          'O tipo no `except` precisa ser exatamente o tipo que a operação pode lançar.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-7-erro-proprio',
        type: 'code',
        prompt:
          'Crie a classe `IdadeInvalida(Exception)` e escreva `validar_idade(idade)`: lança `IdadeInvalida` (com uma mensagem) se `idade` for negativa; senão, devolve `idade`.',
        concepts: ['py-erros'],
        difficulty: 'intermediario',
        tags: ['python', 'raise', 'excecao-propria'],
        initialCode: `# defina a classe IdadeInvalida aqui

def validar_idade(idade):
    pass
`,
        tests: [
          {
            description: 'Idade válida é devolvida sem lançar',
            assertion: 'assert validar_idade(25) == 25, "esperava 25, veio " + str(validar_idade(25))',
          },
          {
            description: 'Idade negativa lança IdadeInvalida',
            assertion: `try:
    validar_idade(-5)
    assert False, "deveria ter lançado uma exceção para idade negativa"
except Exception as erro:
    assert type(erro).__name__ == "IdadeInvalida", "esperava IdadeInvalida, veio " + type(erro).__name__`,
          },
          {
            description: 'IdadeInvalida é mesmo uma Exception (pode ser pega genericamente)',
            assertion: `try:
    validar_idade(-1)
    assert False, "deveria ter lançado"
except Exception:
    pass`,
          },
        ],
        solution: `class IdadeInvalida(Exception):
    pass

def validar_idade(idade):
    if idade < 0:
        raise IdadeInvalida(f'idade não pode ser negativa: {idade}')
    return idade
`,
        hints: [
          '`class IdadeInvalida(Exception): pass` já é um erro nomeado válido — não precisa de mais nada dentro dela.',
          '`raise IdadeInvalida("mensagem")` lança, do mesmo jeito que `raise ValueError("mensagem")`.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
\`try\`/\`except\`/\`finally\` — só \`catch\` vira \`except\`. \`except TipoDoErro:\` pega só aquele tipo; qualquer outro continua subindo, o oposto de um \`catch\` sem tipo. \`raise\` lança; uma classe que herda de \`Exception\` nomeia um erro próprio, do mesmo jeito que \`extends Error\` em JavaScript.

Na próxima aula: classes — \`__init__\`, \`self\`, e quando uma classe vale a pena.
`.trim(),
    },
  ],
};
