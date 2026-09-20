import type { Lesson } from '../types';

export const lessonUtilitarios: Lesson = {
  id: 'lesson-ts-7',
  trackId: 'track-typescript',
  title: 'Utilitários: Tipos Feitos de Outros Tipos',
  language: 'typescript',
  objective:
    'Derivar um tipo de outro em vez de copiá-lo — Partial, Pick, Omit, Readonly, Record e keyof — para que a forma exista num lugar só e as variações a acompanhem.',
  concepts: ['ts-utilitarios'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um \`Usuario\` tem \`id\`, \`nome\`, \`email\` e \`idade\`. Ao **criar** um, o \`id\` ainda não existe — o servidor gera. Ao **atualizar**, qualquer campo pode faltar. Ao **listar**, só o nome e o email interessam. São quatro formas, e a tentação é escrever quatro interfaces.

Não escreva. Quatro cópias divergem: alguém acrescenta \`telefone\` em \`Usuario\` e esquece as outras três. TypeScript deriva uma forma da outra com **tipos utilitários** — genéricos que vêm prontos e transformam um tipo em outro.

~~~typescript
interface Usuario {
  id: number;
  nome: string;
  email: string;
  idade: number;
}

type NovoUsuario = Omit<Usuario, 'id'>;            // tudo, menos id
type Mudancas = Partial<Usuario>;                   // tudo opcional
type Contato = Pick<Usuario, 'nome' | 'email'>;     // só esses dois
type Congelado = Readonly<Usuario>;                 // nada muda depois
~~~

Cada um lê como frase. \`Partial<T>\` põe \`?\` em toda propriedade. \`Pick<T, K>\` fica só com as chaves listadas; \`Omit<T, K>\` tira as listadas. \`Readonly<T>\` marca tudo como somente leitura. Se \`Usuario\` ganha \`telefone\`, \`NovoUsuario\`, \`Mudancas\` e \`Congelado\` ganham junto — sem tocar em nada.

## O uso clássico: atualizar

~~~typescript
function atualizar(usuario: Usuario, mudancas: Partial<Usuario>): Usuario {
  return { ...usuario, ...mudancas };
}

atualizar(ana, { idade: 31 });            // aceito
atualizar(ana, { idade: '31' });          // recusado: idade é number
atualizar(ana, { telefone: '...' });      // recusado: Usuario não tem telefone
~~~

\`Partial\` deixa passar qualquer subconjunto, mas cada campo continua com o tipo de origem e nenhum campo novo entra. É a forma de "patch" que o compilador confere.

## \`Record\`: um objeto usado como mapa

~~~typescript
const estoque: Record<string, number> = {
  caneta: 10,
  caderno: 4,
};

estoque.lapis = 25;        // aceito
estoque.borracha = 'dez';  // recusado: valor precisa ser number
~~~

\`Record<K, V>\` é um objeto cujas chaves são \`K\` e cujos valores são \`V\`. Com chaves literais, vira uma tabela fechada: \`Record<'claro' | 'escuro', string>\` **exige** as duas chaves, nem mais nem menos.

## \`keyof\`: as chaves como tipo

~~~typescript
type Campo = keyof Usuario;   // 'id' | 'nome' | 'email' | 'idade'

function pegar(usuario: Usuario, campo: keyof Usuario) {
  return usuario[campo];
}

pegar(ana, 'nome');     // aceito
pegar(ana, 'senha');    // recusado
~~~

\`keyof T\` é a união dos nomes das propriedades de \`T\`. Sem ele, \`campo: string\` deixaria passar \`'senha'\`, e \`usuario[campo]\` seria recusado pelo compilador — ele não pode garantir que uma string qualquer é uma chave. \`keyof\` é a ponte entre "um nome de propriedade" e "uma propriedade que existe".

## \`typeof\` no mundo dos tipos

\`typeof\` que você conhece roda em execução. Numa posição de tipo, ele lê o tipo de um valor: \`const config = { tema: 'claro', fonte: 16 }\` e \`type Config = typeof config\` — a forma deduzida, sem escrever a interface. Útil para constantes grandes que já são a fonte de verdade.

## A regra

Existe **uma** forma canônica de cada coisa. Todo o resto deriva dela. Quando você se pegar copiando propriedades de uma interface para outra, pare: é \`Pick\`, \`Omit\` ou \`Partial\`.
`.trim(),
    },
    {
      kind: 'example',
      language: 'typescript',
      code: `interface Tarefa {
  id: number;
  titulo: string;
  feita: boolean;
  prazo?: string;
}

type NovaTarefa = Omit<Tarefa, 'id'>;
type Mudancas = Partial<Omit<Tarefa, 'id'>>;   // combináveis

let proximoId = 1;

function criar(dados: NovaTarefa): Tarefa {
  return { id: proximoId++, ...dados };
}

function atualizar(tarefa: Tarefa, mudancas: Mudancas): Tarefa {
  return { ...tarefa, ...mudancas };
}

const porStatus: Record<'pendente' | 'feita', number> = { pendente: 0, feita: 0 };

const t = criar({ titulo: 'Estudar tipos', feita: false });
const t2 = atualizar(t, { feita: true });
porStatus[t2.feita ? 'feita' : 'pendente'] += 1;

console.log(t2.id, t2.titulo, t2.feita);   // 1 Estudar tipos true
console.log(porStatus);                    // { pendente: 0, feita: 1 }`,
      caption:
        'Uma interface, e todas as formas derivadas dela. `criar` não aceita `id`; `atualizar` aceita qualquer pedaço, mas nunca `id` nem um campo inexistente; `porStatus` exige exatamente as duas chaves. Se `Tarefa` ganhar um campo, tudo acompanha.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-7-partial',
        type: 'multiple-choice',
        prompt: 'O que `Partial<Usuario>` produz?',
        concepts: ['ts-utilitarios'],
        difficulty: 'iniciante',
        tags: ['typescript', 'utilitarios'],
        options: [
          'Um `Usuario` com metade das propriedades',
          'O mesmo `Usuario`, com toda propriedade marcada como opcional — qualquer subconjunto é aceito, cada campo mantém o tipo, e nenhum campo novo entra',
          'Um `Usuario` em que qualquer propriedade aceita `any`',
          'Um objeto vazio do tipo `Usuario`',
        ],
        correctIndex: 1,
        explanation:
          '`Partial<T>` põe `?` em cada propriedade de `T`. `{ idade: 31 }` é aceito, `{}` é aceito, `{ idade: \'31\' }` é recusado (o tipo do campo não muda) e `{ telefone: 1 }` é recusado (objeto literal não pode ter propriedade a mais). É o tipo de um "patch": tudo pode faltar, nada pode estar errado.',
        hints: ['"Partial" é "parcial": um pedaço. Que pedaço é aceito?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-7-prever',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Os utilitários são apagados como qualquer tipo; o `...` é JavaScript.',
        concepts: ['ts-utilitarios'],
        difficulty: 'iniciante',
        tags: ['typescript', 'utilitarios'],
        code: `const base = { tema: 'claro', fonte: 16, animacoes: true };

const mudancas: Partial<typeof base> = { fonte: 18 };
const final = { ...base, ...mudancas };

console.log(JSON.stringify(mudancas));
console.log(final.fonte, final.tema);
console.log(Object.keys(final).length);`,
        expectedOutput: '{"fonte":18}\n18 claro\n3',
        explanation:
          '`mudancas` é só o que foi escrito: `{ fonte: 18 }`. O espalhamento copia `base` e depois sobrescreve com `mudancas`, então `fonte` vira 18 e o resto fica. `Partial<typeof base>` só serviu ao compilador — para aceitar o pedaço e recusar `{ fonte: \'18\' }`. Em execução, três chaves e nenhum vestígio do tipo.',
        hints: ['O segundo `...` ganha do primeiro nas chaves repetidas.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-7-atualizar',
        type: 'code',
        prompt:
          'Tipe `atualizar`: recebe um `Usuario` e um pedaço de `Usuario` (qualquer subconjunto dos campos), e devolve o usuário com as mudanças aplicadas. Não copie a interface: derive o tipo do pedaço com um utilitário. Os testes cobram que `{ nome: 5 }` e `{ telefone: \'…\' }` sejam recusados.',
        concepts: ['ts-utilitarios'],
        difficulty: 'intermediario',
        tags: ['typescript', 'utilitarios'],
        initialCode: `interface Usuario {
  id: number;
  nome: string;
  email: string;
}

function atualizar(usuario: Usuario, mudancas: any): Usuario {
  return { ...usuario, ...mudancas };
}
`,
        tests: [
          {
            description: 'atualizar troca só o que foi passado',
            assertion: `const u = { id: 1, nome: 'Ana', email: 'ana@x.com' }; const r = atualizar(u, { nome: 'Ana Maria' }); if (r.nome !== 'Ana Maria' || r.email !== 'ana@x.com' || r.id !== 1) throw new Error('Esperava só o nome trocado, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'atualizar não muda o usuário original',
            assertion: `const u = { id: 1, nome: 'Ana', email: 'ana@x.com' }; atualizar(u, { nome: 'Bia' }); if (u.nome !== 'Ana') throw new Error('O usuário original foi modificado.');`,
          },
        ],
        typeTests: [
          { description: 'um pedaço com um campo é aceito', code: "atualizar({ id: 1, nome: 'a', email: 'e' }, { email: 'novo@x.com' });" },
          { description: 'um pedaço vazio é aceito', code: "atualizar({ id: 1, nome: 'a', email: 'e' }, {});" },
          { description: 'um campo com o tipo errado é recusado', code: "atualizar({ id: 1, nome: 'a', email: 'e' }, { nome: 5 });", rejects: true },
          { description: 'um campo que Usuario não tem é recusado', code: "atualizar({ id: 1, nome: 'a', email: 'e' }, { telefone: '9' });", rejects: true },
        ],
        hints: [
          'O utilitário que torna toda propriedade opcional.',
          '`mudancas: Partial<Usuario>`. O corpo já está certo.',
        ],
        solution: `interface Usuario {
  id: number;
  nome: string;
  email: string;
}

function atualizar(usuario: Usuario, mudancas: Partial<Usuario>): Usuario {
  return { ...usuario, ...mudancas };
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-7-lacuna-derivar',
        type: 'fill-blank',
        prompt: 'Complete com o utilitário certo: o tipo de um usuário novo (sem `id`), e um objeto que mapeia nomes de produto a quantidades.',
        concepts: ['ts-utilitarios'],
        difficulty: 'iniciante',
        tags: ['typescript', 'utilitarios'],
        template: `interface Usuario {
  id: number;
  nome: string;
  email: string;
}

type NovoUsuario = {{1}}<Usuario, 'id'>;

const estoque: {{2}}<string, number> = { caneta: 10, caderno: 4 };

const novo: NovoUsuario = { nome: 'Ana', email: 'ana@x.com' };
console.log(novo.nome, estoque.caneta);`,
        blanks: [
          { placeholder: 'utilitário', size: 7 },
          { placeholder: 'utilitário', size: 7 },
        ],
        tests: [
          {
            description: 'os valores existem',
            assertion: `if (novo.nome !== 'Ana' || estoque.caneta !== 10) throw new Error('novo.nome deveria ser Ana e estoque.caneta 10.');`,
          },
        ],
        typeTests: [
          { description: 'um novo usuário com id é recusado', code: "const errado: NovoUsuario = { id: 1, nome: 'a', email: 'e' };", rejects: true },
          { description: 'um novo usuário sem email é recusado', code: "const errado2: NovoUsuario = { nome: 'a' };", rejects: true },
          { description: 'o estoque aceita uma chave nova com número', code: 'estoque.lapis = 3;' },
          { description: 'o estoque recusa um valor em texto', code: "estoque.borracha = 'dez';", rejects: true },
        ],
        hints: [
          'O primeiro tira uma chave de uma forma; o segundo descreve um objeto por tipo de chave e tipo de valor.',
          'Um "omite"; o outro "registra".',
        ],
        solution: ['Omit', 'Record'],
        explanation:
          '`Omit<Usuario, \'id\'>` é `Usuario` sem `id` — o resto continua obrigatório, por isso faltar `email` é recusado. `Record<string, number>` é um objeto de chaves texto e valores número: qualquer chave entra, desde que o valor seja número. Nenhuma das duas formas foi escrita à mão; as duas acompanham `Usuario` e o par chave/valor declarado.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-7-bug-keyof',
        type: 'find-bug',
        prompt:
          'O compilador recusa: `Element implicitly has an \'any\' type because expression of type \'string\' can\'t be used to index type \'Produto\'`. Aponte a linha que precisa mudar.',
        concepts: ['ts-utilitarios'],
        difficulty: 'intermediario',
        tags: ['typescript', 'utilitarios', 'depuracao'],
        code: `interface Produto {
  nome: string;
  preco: number;
  estoque: number;
}

function pegar(produto: Produto, campo: string) {
  return produto[campo];
}

const caneta: Produto = { nome: 'Caneta', preco: 3.5, estoque: 10 };
console.log(pegar(caneta, 'preco'));`,
        buggyLine: 7,
        fix: 'function pegar(produto: Produto, campo: keyof Produto) {',
        symptomLine: 8,
        symptomFeedback:
          'É onde o erro aparece: `produto[campo]` com um `campo` que pode ser qualquer texto. A linha está certa — o que falta é o tipo do parâmetro prometer que `campo` é uma chave de `Produto`.',
        explanation:
          '`campo: string` aceita `\'senha\'`, `\'\'`, qualquer coisa — e o compilador não pode garantir que `produto[campo]` existe, então recusa o acesso. `keyof Produto` é a união `\'nome\' | \'preco\' | \'estoque\'`: com ele, `pegar(caneta, \'preco\')` é aceito, `pegar(caneta, \'senha\')` é recusado na chamada, e `produto[campo]` compila porque toda chave possível existe.',
        hints: [
          'O erro aparece no acesso, mas o que o compilador sabe sobre `campo` quando chega lá?',
          'Existe um operador que transforma "as chaves de um tipo" num tipo.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-7-pick-omit',
        type: 'multiple-choice',
        prompt: 'Para um tipo com só `nome` e `email` de `Usuario` (que tem `id`, `nome`, `email`, `idade`), qual utilitário é o mais direto?',
        concepts: ['ts-utilitarios'],
        difficulty: 'iniciante',
        tags: ['typescript', 'utilitarios'],
        options: [
          "`Omit<Usuario, 'nome' | 'email'>`",
          "`Pick<Usuario, 'nome' | 'email'>`: fica só com as chaves listadas",
          '`Partial<Usuario>`',
          "`Record<'nome' | 'email', Usuario>`",
        ],
        correctIndex: 1,
        explanation:
          '`Pick` fica com as chaves que você lista; `Omit` tira as que você lista. Os dois chegam ao mesmo lugar aqui (`Omit<Usuario, \'id\' | \'idade\'>` daria o mesmo), e a escolha é a que lê melhor: quando o que fica é a lista curta, `Pick`; quando o que sai é a lista curta, `Omit`. `Partial` não tira nada — torna opcional. `Record<K, V>` monta um objeto do zero, não deriva de `Usuario`.',
        hints: ['Você quer dizer "estas duas" ou "todas menos estas duas"? Qual frase é mais curta?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Uma forma canônica, e todo o resto derivado dela: \`Partial<T>\` (tudo opcional — o tipo de um patch), \`Pick<T, K>\` e \`Omit<T, K>\` (com ou sem as chaves listadas), \`Readonly<T>\`, \`Record<K, V>\` (objeto como mapa; com chaves literais, uma tabela fechada) e \`keyof T\` (as chaves como união de literais — a ponte para acessar \`obj[chave]\` com segurança). Copiar propriedades de uma interface para outra é o sinal de que um utilitário faltou.`,
    },
  ],
};
