import type { Lesson } from '../types';

export const lessonPythonClasses: Lesson = {
  id: 'lesson-py-8',
  trackId: 'track-python',
  title: 'Classes em Python',
  language: 'python',
  objective:
    'Escrever uma classe com `__init__` e métodos, entender por que `self` aparece em todo método, e reconhecer quando uma classe vale a pena — e quando é só burocracia.',
  concepts: ['py-classes'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Uma classe em Python guarda dados e comportamento juntos, como em JavaScript — a diferença é o quanto fica explícito.

## __init__ é o construtor

~~~py
class ContaBancaria:
    def __init__(self, titular, saldo=0):
        self.titular = titular
        self.saldo = saldo

conta = ContaBancaria('Ana', 100)
print(conta.titular)  # Ana
print(conta.saldo)    # 100
~~~

\`__init__\` é chamado automaticamente ao criar o objeto (\`ContaBancaria('Ana', 100)\`) — é o \`constructor\` de JavaScript, com um nome fixo diferente.

## self é o this, mas escrito por extenso

Em JavaScript, \`this\` aparece sozinho dentro de um método. Em Python, **todo método recebe o próprio objeto como primeiro parâmetro, explicitamente** — e o nome convencional para esse parâmetro é \`self\`:

~~~py
class ContaBancaria:
    def __init__(self, titular, saldo=0):
        self.titular = titular
        self.saldo = saldo

    def depositar(self, valor):
        self.saldo += valor
        return self.saldo

    def sacar(self, valor):
        if valor > self.saldo:
            raise ValueError('saldo insuficiente')
        self.saldo -= valor
        return self.saldo
~~~

Ao **chamar** \`conta.depositar(50)\`, você não passa o \`self\` — Python o preenche sozinho com \`conta\`. Mas ao **definir** o método, \`self\` precisa estar lá, escrito, como primeiro parâmetro — sempre. Esquecê-lo é o erro mais comum de quem começa com classes em Python.

## Método é função dentro da classe

Não existe sintaxe especial para método além de estar indentado dentro do \`class\` e receber \`self\`. Chamar \`conta.depositar(50)\` é açúcar sintático para \`ContaBancaria.depositar(conta, 50)\` — o objeto que vem antes do ponto vira o primeiro argumento.

## Quando uma classe vale a pena

Uma classe faz sentido quando **dados e comportamento andam sempre juntos** — o saldo de uma conta e as operações que o mudam, por exemplo. Não vale a pena só para "agrupar" funções que não compartilham estado nenhum: um módulo com funções soltas (como a trilha de Engenharia já ensinou) resolve isso mais simples, sem a cerimônia de \`self\` e \`__init__\`.
`.trim(),
    },
    {
      kind: 'example',
      language: 'python',
      code: `class ListaDeTarefas:
    def __init__(self):
        self.tarefas = []

    def adicionar(self, titulo):
        self.tarefas.append({'titulo': titulo, 'feita': False})

    def concluir(self, indice):
        self.tarefas[indice]['feita'] = True

    def pendentes(self):
        return [t for t in self.tarefas if not t['feita']]

lista = ListaDeTarefas()
lista.adicionar('Estudar Python')
lista.adicionar('Fazer o projeto')
lista.concluir(0)
print(lista.pendentes())`,
      caption:
        'Os dados (`self.tarefas`) e o comportamento (`adicionar`, `concluir`, `pendentes`) moram juntos — o caso em que uma classe compensa a cerimônia do `self`.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-8-init-e-construtor',
        type: 'multiple-choice',
        prompt: 'Qual método é chamado automaticamente ao criar um objeto de uma classe, em Python?',
        concepts: ['py-classes'],
        difficulty: 'iniciante',
        tags: ['python', 'classes'],
        options: [
          '`__init__`',
          '`constructor`, como em JavaScript',
          '`__new__`, sempre',
          '`__start__`',
        ],
        correctIndex: 0,
        explanation:
          '`__init__` é o equivalente Python ao `constructor` de JavaScript — chamado automaticamente quando `NomeDaClasse(...)` cria um objeto novo. (`__new__` existe em Python, mas controla a criação do objeto em si, um nível mais baixo que a maioria do código nunca precisa tocar.)',
        hints: ['O nome tem dois underscores de cada lado — um padrão comum de métodos especiais em Python.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-8-contador',
        type: 'code',
        prompt:
          'Escreva a classe `Contador` com `__init__(self)` (começa em 0), `incrementar(self)` (soma 1 e devolve o novo valor) e `valor(self)` (devolve o valor atual, sem mudar nada).',
        concepts: ['py-classes'],
        difficulty: 'iniciante',
        tags: ['python', 'classes'],
        initialCode: `class Contador:
    def __init__(self):
        pass

    def incrementar(self):
        pass

    def valor(self):
        pass
`,
        tests: [
          {
            description: 'Começa em 0',
            assertion: 'assert Contador().valor() == 0, "esperava 0, veio " + str(Contador().valor())',
          },
          {
            description: 'incrementar soma 1 e devolve o novo valor',
            assertion: `c = Contador()
assert c.incrementar() == 1, "esperava 1 depois do primeiro incrementar"
assert c.incrementar() == 2, "esperava 2 depois do segundo incrementar"`,
          },
          {
            description: 'valor() não muda o contador',
            assertion: `c = Contador()
c.incrementar()
assert c.valor() == 1, "esperava 1 depois de um incrementar"
assert c.valor() == 1, "chamar valor() de novo não deveria mudar nada"`,
          },
        ],
        solution: `class Contador:
    def __init__(self):
        self.contagem = 0

    def incrementar(self):
        self.contagem += 1
        return self.contagem

    def valor(self):
        return self.contagem
`,
        hints: [
          '`__init__` guarda o estado inicial em `self.algumNome = 0`.',
          '`incrementar` muda `self.algumNome` e devolve o valor atualizado; `valor` só lê, sem mudar nada.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-8-self-e-preenchido',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['py-classes'],
        difficulty: 'intermediario',
        tags: ['python', 'self'],
        code: `class Retangulo:
    def __init__(self, largura, altura):
        self.largura = largura
        self.altura = altura

    def area(self):
        return self.largura * self.altura

r1 = Retangulo(3, 4)
r2 = Retangulo(5, 2)
print(r1.area())
print(r2.area())
print(r1.largura)`,
        expectedOutput: `12
10
3`,
        explanation:
          'Cada objeto (`r1`, `r2`) tem os próprios `self.largura`/`self.altura` — criar um segundo `Retangulo` não afeta o primeiro. `r1.area()` chama o método com `self` preenchido automaticamente como `r1`, então usa `3 * 4`.',
        hints: ['Cada chamada de `Retangulo(...)` cria um objeto com os próprios valores, independente dos outros já criados.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-py-8-self-esquecido',
        type: 'find-bug',
        prompt: 'Este programa quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['py-classes'],
        difficulty: 'intermediario',
        tags: ['python', 'self', 'bug'],
        code: `class Saudacao:
    def __init__(self, nome):
        self.nome = nome

    def falar():
        return 'Oi, ' + self.nome

s = Saudacao('Ana')
print(s.falar())`,
        buggyLine: 5,
        fix: '    def falar(self):',
        explanation:
          '`falar` foi definida sem `self` como parâmetro, mas Python sempre passa o próprio objeto como primeiro argumento ao chamar `s.falar()` — e não há onde colocá-lo, porque a função não declarou nenhum parâmetro. O erro é `TypeError: falar() takes 0 positional arguments but 1 was given`. Todo método precisa de `self` como primeiro parâmetro, mesmo que o corpo dele use `self` para acessar `self.nome`.',
        hints: [
          'Compare esta definição de método com as da aula — o que falta na lista de parâmetros?',
          'Python sempre manda o objeto como primeiro argumento; o método precisa ter um lugar declarado para recebê-lo.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
\`__init__\` é o construtor; \`self\` é o \`this\`, mas escrito por extenso — todo método precisa declará-lo como primeiro parâmetro, e Python o preenche sozinho na hora de chamar. Método é só uma função dentro da classe, chamada com \`objeto.metodo()\`.

Uma classe vale a pena quando dados e comportamento andam sempre juntos — não para agrupar funções que não compartilham estado.

Na próxima aula: módulos e a biblioteca padrão — \`import\`, e o que \`json\`/\`datetime\` já trazem prontos.
`.trim(),
    },
  ],
};
