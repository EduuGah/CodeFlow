import type { Lesson } from '../types';

export const lessonComponentes: Lesson = {
  id: 'lesson-react-1',
  trackId: 'track-react',
  title: 'Componentes: A Interface como Função',
  language: 'react',
  objective:
    'Escrever um componente — uma função que recebe props e devolve JSX —, compor componentes menores num maior, e entender o que o JSX vira quando compila.',
  concepts: ['react-componentes'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Na trilha da página você montou a interface com \`createElement\`, \`append\` e uma função \`desenhar\` que transformava uma lista em HTML toda vez que ela mudava. Aquela função \`desenhar\` é a ideia inteira do React: **a tela é uma função dos dados**. React é a biblioteca que faz isso em escala — com uma forma de escrever HTML dentro do código, e um jeito de atualizar só o que mudou.

## Um componente

~~~tsx
function Saudacao() {
  return <h1>Olá, mundo!</h1>;
}
~~~

Um **componente** é uma função que devolve o que deve aparecer na tela. O que ela devolve parece HTML, e se chama **JSX**. Não é uma string: é código, e o compilador o transforma numa chamada de função:

~~~tsx
// o que você escreve
<h1 className="titulo">Olá</h1>

// o que o compilador gera
React.createElement('h1', { className: 'titulo' }, 'Olá')
~~~

Por isso o TSX passa pelo mesmo compilador da trilha de TypeScript — e por isso \`class\` virou \`className\`: \`class\` é palavra reservada em JavaScript, e o JSX é JavaScript.

## Props: os parâmetros do componente

~~~tsx
interface SaudacaoProps {
  nome: string;
}

function Saudacao({ nome }: SaudacaoProps) {
  return <h1>Olá, {nome}!</h1>;
}
~~~

**Props** são os argumentos: um objeto, tipado como qualquer outro, que chega como primeiro parâmetro. As chaves \`{nome}\` dentro do JSX abrem uma janela para o JavaScript: qualquer expressão entra ali — uma variável, uma conta, uma chamada de função, um operador ternário.

~~~tsx
<Saudacao nome="Ana" />
<Saudacao nome={usuario.nome} />
~~~

Usar um componente é escrever uma tag com o nome dele. Texto vai entre aspas; qualquer outra coisa (número, variável, objeto) vai entre chaves. E o compilador confere: \`<Saudacao />\` sem \`nome\` é recusado, porque \`nome\` é obrigatório na interface — é o mesmo TypeScript de sempre, agora nas props.

## Compor

~~~tsx
function Item({ texto }: { texto: string }) {
  return <li>{texto}</li>;
}

function Lista() {
  return (
    <ul>
      <Item texto="Estudar" />
      <Item texto="Descansar" />
    </ul>
  );
}
~~~

Um componente usa outros. É assim que uma tela grande fica legível: cada pedaço com nome, cada nome com uma responsabilidade. A regra de ouro para decidir onde cortar é a mesma das funções — **se você precisa de um comentário para explicar o que um trecho do JSX faz, ele é um componente.**

## Quatro regras de sintaxe

1. **Nome com maiúscula.** \`<Item />\` é o seu componente; \`<item />\` é uma tag HTML que não existe. O React decide pela primeira letra.
2. **Uma raiz só.** Uma função devolve um valor; o JSX devolve um elemento. Dois irmãos soltos precisam de um pai — ou de um **fragmento**, \`<>…</>\`, que agrupa sem criar tag.
3. **Toda tag fecha.** \`<input />\`, \`<br />\`, \`<img />\` — o JSX não tolera a tag aberta do HTML.
4. **\`className\`, \`htmlFor\`, \`onClick\`.** Os atributos são os nomes do DOM em JavaScript, não os do HTML.

## Como funciona aqui

Nesta trilha, "Rodar o componente" compila o seu TSX e monta o componente **\`App\`** na pré-visualização — então todo exercício declara um \`App\`, mesmo que ele só use os outros. Os testes leem o DOM que o componente produziu, como na trilha da página, e podem clicar e digitar como uma pessoa faria. O que se verifica é sempre o que aparece na tela.
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `interface CartaoProps {
  nome: string;
  cargo: string;
  online: boolean;
}

function Cartao({ nome, cargo, online }: CartaoProps) {
  return (
    <article className={online ? 'cartao online' : 'cartao'}>
      <h2>{nome}</h2>
      <p>{cargo}</p>
      <span>{online ? 'disponível' : 'ausente'}</span>
    </article>
  );
}

function App() {
  return (
    <>
      <h1>Equipe</h1>
      <Cartao nome="Ana" cargo="Design" online={true} />
      <Cartao nome="Bruno" cargo="Dados" online={false} />
    </>
  );
}`,
      caption:
        'Um componente com três props tipadas, usado duas vezes. O ternário dentro das chaves decide a classe e o texto; o fragmento `<>` deixa o `App` devolver o título e os dois cartões sem inventar uma `<div>`.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-1-jsx',
        type: 'multiple-choice',
        prompt: 'O que `<h1 className="titulo">Olá</h1>` vira quando o compilador processa o JSX?',
        concepts: ['react-componentes'],
        difficulty: 'iniciante',
        tags: ['react', 'jsx'],
        options: [
          'Uma string com o HTML, que o React insere com `innerHTML`',
          "Uma chamada `React.createElement('h1', { className: 'titulo' }, 'Olá')` — o JSX é JavaScript com outra cara",
          'Um elemento do DOM criado na hora com `document.createElement`',
          'Um objeto `{ tag: "h1" }` guardado até a página carregar',
        ],
        correctIndex: 1,
        explanation:
          'JSX é açúcar sobre chamadas de função: cada tag vira `React.createElement(tipo, props, ...filhos)`, que devolve um objeto descrevendo o elemento — o React só toca no DOM depois, ao montar. É por isso que `class` virou `className` (o JSX é JavaScript, e `class` é reservado) e por que qualquer expressão cabe entre chaves.',
        hints: ['Lembre da trilha da página: como se cria um elemento sem HTML?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-1-saudacao',
        type: 'code',
        prompt:
          'Escreva o componente `Saudacao`, que recebe a prop `nome` (texto) e devolve um `<h1>` com `Olá, NOME!`. Em `App`, use-o duas vezes, com `Ana` e `Bia`, dentro de um fragmento.',
        concepts: ['react-componentes'],
        difficulty: 'iniciante',
        tags: ['react', 'componentes', 'props'],
        initialCode: `function App() {
  return <p>Escreva o componente Saudacao e use-o aqui.</p>;
}
`,
        tests: [
          {
            description: 'aparecem dois <h1>, um para cada nome',
            assertion: `const h1 = textos('h1'); if (h1.length !== 2) throw new Error('Esperava dois <h1>, encontrei ' + h1.length + '.');`,
          },
          {
            description: 'o primeiro diz "Olá, Ana!" e o segundo "Olá, Bia!"',
            assertion: `const h1 = textos('h1'); if (h1[0] !== 'Olá, Ana!' || h1[1] !== 'Olá, Bia!') throw new Error('Esperava "Olá, Ana!" e "Olá, Bia!", veio ' + JSON.stringify(h1));`,
          },
          {
            description: 'não há nenhuma <div> a mais: os dois títulos são filhos diretos da raiz',
            assertion: `const raiz = document.getElementById('root'); if (raiz.children.length !== 2 || raiz.children[0].tagName !== 'H1') throw new Error('Os dois <h1> deveriam ser filhos diretos da raiz — use um fragmento <>…</> em vez de uma <div>.');`,
          },
        ],
        hints: [
          'Um componente é uma função com nome em maiúscula que devolve JSX. A prop chega no primeiro parâmetro: `function Saudacao({ nome }: { nome: string })`.',
          'Dentro do JSX, a variável vai entre chaves: `<h1>Olá, {nome}!</h1>`. No `App`, `<Saudacao nome="Ana" />`, duas vezes, dentro de `<>` e `</>`.',
        ],
        solution: `function Saudacao({ nome }: { nome: string }) {
  return <h1>Olá, {nome}!</h1>;
}

function App() {
  return (
    <>
      <Saudacao nome="Ana" />
      <Saudacao nome="Bia" />
    </>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-1-lacuna-jsx',
        type: 'fill-blank',
        prompt: 'Complete o JSX: o atributo de classe, a expressão entre chaves e o fechamento da tag vazia.',
        concepts: ['react-componentes'],
        difficulty: 'iniciante',
        tags: ['react', 'jsx'],
        template: `function Perfil({ nome, fotos }: { nome: string; fotos: number }) {
  return (
    <section {{1}}="perfil">
      <h2>{{{2}}}</h2>
      <p>{fotos} fotos</p>
      <img src="data:," alt="" {{3}}
    </section>
  );
}

function App() {
  return <Perfil nome="Ana" fotos={12} />;
}`,
        blanks: [
          { placeholder: 'atributo', size: 9 },
          { placeholder: 'expressão', size: 4 },
          { placeholder: '', size: 2 },
        ],
        tests: [
          {
            description: 'a seção tem a classe perfil',
            assertion: `const s = document.querySelector('section'); if (!s || !s.classList.contains('perfil')) throw new Error('A <section> deveria ter a classe "perfil" — em JSX o atributo de classe tem outro nome.');`,
          },
          {
            description: 'o título mostra o nome vindo da prop',
            assertion: `if (texto('h2') !== 'Ana') throw new Error('O <h2> deveria mostrar "Ana", veio ' + JSON.stringify(texto('h2')));`,
          },
          {
            description: 'a imagem existe e a contagem de fotos aparece',
            assertion: `if (!document.querySelector('img')) throw new Error('Falta a <img>.'); if (texto('p') !== '12 fotos') throw new Error('Esperava "12 fotos", veio ' + JSON.stringify(texto('p')));`,
          },
        ],
        hints: [
          '`class` é palavra reservada em JavaScript; o JSX usa a propriedade correspondente do DOM, que termina em Name.',
          'Entre chaves vai a variável que chegou pela prop. A tag vazia fecha com barra antes do `>`.',
        ],
        solution: ['className', 'nome', '/>'],
        explanation:
          '`className` é o nome da propriedade `class` no DOM — o JSX é JavaScript, e `class` já tem dono. `{nome}` abre a janela para a expressão. E `<img … />` fecha a tag: o JSX exige, porque um elemento aberto sem fechar é ambíguo para o compilador, diferente do HTML que tolera.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-1-bug-prop',
        type: 'find-bug',
        prompt:
          'O compilador recusa este componente: `Property \'nome\' is missing`. Aponte a linha do defeito.',
        concepts: ['react-componentes'],
        difficulty: 'iniciante',
        tags: ['react', 'props', 'depuracao'],
        code: `interface SaudacaoProps {
  nome: string;
}

function Saudacao({ nome }: SaudacaoProps) {
  return <h1>Olá, {nome.toUpperCase()}!</h1>;
}

function App() {
  return (
    <div>
      <Saudacao />
    </div>
  );
}`,
        buggyLine: 12,
        fix: '      <Saudacao nome="Ana" />',
        explanation:
          '`SaudacaoProps` diz que `nome` é obrigatório, e `<Saudacao />` não passa nada. O compilador recusa na linha do uso — o mesmo que faria com uma função chamada sem argumento. Em JavaScript sem tipos o componente renderizaria e quebraria em `undefined.toUpperCase()`. As props de um componente são um contrato como qualquer outro: o TypeScript o confere em cada tag.',
        hints: [
          'O componente está certo. Olhe para onde ele é usado.',
          'Que prop a interface exige, e quem deixou de passá-la?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-1-maiuscula',
        type: 'multiple-choice',
        prompt: 'Você escreve `function cartao() { … }` e usa `<cartao />`. O que o React faz?',
        concepts: ['react-componentes'],
        difficulty: 'iniciante',
        tags: ['react', 'jsx'],
        options: [
          'Chama a função `cartao` normalmente',
          'Trata `<cartao>` como uma tag HTML — cria um elemento `<cartao>` vazio e desconhecido, e a sua função nunca roda',
          'Lança um erro dizendo que o componente não existe',
          'Converte o nome para `Cartao` automaticamente',
        ],
        correctIndex: 1,
        explanation:
          'O JSX decide pela primeira letra: minúscula é tag do DOM (`div`, `input`, e também `cartao`), maiúscula é componente. `<cartao />` vira `createElement(\'cartao\')`, um elemento HTML inexistente, silencioso, e a função fica sem uso. Por isso todo componente começa com maiúscula — não é estilo, é como o React lê o código.',
        hints: ['Como o React sabe se `<x>` é uma tag do DOM ou uma função sua?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-1-lista',
        type: 'code',
        prompt:
          'Componha: `Item` recebe `texto` (texto) e `feito` (booleano) e devolve um `<li>` com a classe `feito` quando `feito` é verdadeiro. `Lista` devolve um `<ul>` com três `Item`: "Estudar" (feito), "Descansar" (não feito), "Praticar" (não feito). `App` devolve `<Lista />`.',
        concepts: ['react-componentes'],
        difficulty: 'intermediario',
        tags: ['react', 'componentes', 'props'],
        initialCode: `function App() {
  return <p>Escreva Item, Lista, e use Lista aqui.</p>;
}
`,
        tests: [
          {
            description: 'há um <ul> com três <li>',
            assertion: `const itens = document.querySelectorAll('ul > li'); if (itens.length !== 3) throw new Error('Esperava 3 <li> dentro de um <ul>, encontrei ' + itens.length + '.');`,
          },
          {
            description: 'os textos são Estudar, Descansar e Praticar, nessa ordem',
            assertion: `const t = textos('ul > li'); if (JSON.stringify(t) !== JSON.stringify(['Estudar', 'Descansar', 'Praticar'])) throw new Error('Esperava ["Estudar","Descansar","Praticar"], veio ' + JSON.stringify(t));`,
          },
          {
            description: 'só o primeiro item tem a classe feito',
            assertion: `const itens = Array.from(document.querySelectorAll('ul > li')); const comClasse = itens.map((li) => li.classList.contains('feito')); if (JSON.stringify(comClasse) !== '[true,false,false]') throw new Error('A classe "feito" deveria estar só no primeiro item; veio ' + JSON.stringify(comClasse));`,
          },
        ],
        hints: [
          'Dois componentes e o App. `Item` decide a classe com um ternário: `className={feito ? \'feito\' : \'\'}`.',
          'Um booleano vai entre chaves: `<Item texto="Estudar" feito={true} />`. Para falso, `feito={false}`.',
        ],
        solution: `function Item({ texto, feito }: { texto: string; feito: boolean }) {
  return <li className={feito ? 'feito' : ''}>{texto}</li>;
}

function Lista() {
  return (
    <ul>
      <Item texto="Estudar" feito={true} />
      <Item texto="Descansar" feito={false} />
      <Item texto="Praticar" feito={false} />
    </ul>
  );
}

function App() {
  return <Lista />;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Um componente é uma função que recebe props e devolve JSX — que é JavaScript disfarçado: cada tag vira \`React.createElement\`, e por isso \`className\`, chaves para expressões e toda tag fechada. Props são tipadas e conferidas em cada uso. Componentes se compõem: nome com maiúscula, uma raiz (ou um fragmento), e um corte novo sempre que um trecho pede comentário. Aqui, \`App\` é o que o motor monta.`,
    },
  ],
};
