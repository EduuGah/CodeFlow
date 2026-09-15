import type { Lesson } from '../types';

export const lessonFormulariosReact: Lesson = {
  id: 'lesson-react-4',
  trackId: 'track-react',
  title: 'Formulários: Campos Controlados',
  language: 'react',
  objective:
    'Ligar campos ao estado (valor e onChange), interceptar o envio, validar com mensagens na hora certa, e guardar o formulário inteiro num objeto só.',
  concepts: ['react-formularios'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Na trilha da página, o formulário era lido na hora do envio: \`FormData\`, \`preventDefault\`, validação. Em React o formulário continua sendo HTML — mas há um jeito de fazê-lo que muda tudo o que vem depois: **o estado é a fonte de verdade, e o campo só o mostra.**

## Campo controlado

~~~tsx
function Busca() {
  const [termo, setTermo] = React.useState('');

  return (
    <input
      value={termo}
      onChange={(e) => setTermo(e.target.value)}
      placeholder="Buscar"
    />
  );
}
~~~

\`value={termo}\` diz ao campo o que mostrar; \`onChange\` guarda cada tecla no estado. O campo é **controlado**: o que aparece nele é sempre o que está em \`termo\`. Parece redundante — o campo já sabe o que tem dentro — e é o que permite tudo o mais: limpar o campo é \`setTermo('')\`, validar é ler \`termo\`, mostrar o resultado enquanto digita é usar \`termo\` no JSX. Nada de \`querySelector\`.

Um \`value\` sem \`onChange\` é um campo travado: o React avisa, e a pessoa digita e nada acontece. Os dois andam juntos.

## Tipos de campo

- Texto, número, e-mail, \`<textarea>\`: \`value\` + \`onChange\` com \`e.target.value\` (sempre texto — converta com \`Number(...)\` quando precisar).
- Caixa de marcar: \`checked={ativo}\` + \`onChange={(e) => setAtivo(e.target.checked)}\`.
- \`<select>\`: \`value\` + \`onChange\` com \`e.target.value\`, e o valor de cada \`<option>\`.

## O envio

~~~tsx
function Cadastro() {
  const [nome, setNome] = React.useState('');
  const [enviado, setEnviado] = React.useState(false);

  function enviar(e: React.FormEvent) {
    e.preventDefault();          // sem isto a página recarrega
    setEnviado(true);
  }

  return (
    <form onSubmit={enviar}>
      <label>
        Nome
        <input value={nome} onChange={(e) => setNome(e.target.value)} />
      </label>
      <button type="submit">Cadastrar</button>
      {enviado && <p>Cadastrado: {nome}</p>}
    </form>
  );
}
~~~

\`onSubmit\` no \`<form>\`, não \`onClick\` no botão: assim Enter no campo também envia, como a pessoa espera. O \`preventDefault\` é o primeiro ato, como na trilha da página. E os dados já estão no estado — não há o que ler do formulário.

## Validar na hora certa

A aula de formulários que ajudam ensinou: erro ao lado do campo, no momento certo — não a cada tecla desde o início, e não só depois do envio. Um padrão simples:

~~~tsx
const [tocado, setTocado] = React.useState(false);
const erro = nome.trim() === '' ? 'Informe o nome.' : null;

<input value={nome} onChange={...} onBlur={() => setTocado(true)} />
{tocado && erro && <p role="alert">{erro}</p>}
<button type="submit" disabled={erro !== null}>Cadastrar</button>
~~~

O erro é **derivado** do valor; \`tocado\` só decide quando mostrá-lo. O botão desabilitado enquanto há erro evita o envio inválido sem gritar antes da hora.

## Muitos campos: um objeto

Cinco campos não pedem cinco \`useState\`. Um objeto e um \`onChange\` genérico:

~~~tsx
interface Dados { nome: string; email: string; aceito: boolean }
const [dados, setDados] = React.useState<Dados>({ nome: '', email: '', aceito: false });

function mudar(e: React.ChangeEvent) {
  const { name, value, type, checked } = e.target;
  setDados({ ...dados, [name]: type === 'checkbox' ? checked : value });
}

<input name="nome" value={dados.nome} onChange={mudar} />
<input name="email" value={dados.email} onChange={mudar} />
<input name="aceito" type="checkbox" checked={dados.aceito} onChange={mudar} />
~~~

O \`name\` de cada campo é a chave no objeto, e \`[name]\` (chave calculada) escolhe qual atualizar. O objeto é sempre novo — espalhamento, como na aula de estado.

## Erros

- \`value\` sem \`onChange\` (campo travado).
- \`onClick\` no botão em vez de \`onSubmit\` no formulário.
- Esquecer o \`preventDefault\`.
- Mostrar o erro de validação antes de a pessoa tocar no campo.
- Ler o DOM (\`querySelector\`) num formulário controlado: o estado já tem tudo.
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `interface Dados {
  nome: string;
  email: string;
  novidades: boolean;
}

function App() {
  const [dados, setDados] = React.useState<Dados>({ nome: '', email: '', novidades: false });
  const [enviado, setEnviado] = React.useState<Dados | null>(null);
  const [tocouEmail, setTocouEmail] = React.useState(false);

  const erroEmail = dados.email.includes('@') ? null : 'Informe um e-mail com @.';
  const valido = dados.nome.trim() !== '' && erroEmail === null;

  function mudar(e: React.ChangeEvent) {
    const { name, value, type, checked } = e.target;
    setDados({ ...dados, [name]: type === 'checkbox' ? checked : value });
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviado(dados);
  }

  return (
    <form onSubmit={enviar}>
      <label>
        Nome
        <input name="nome" value={dados.nome} onChange={mudar} />
      </label>
      <label>
        E-mail
        <input name="email" value={dados.email} onChange={mudar} onBlur={() => setTocouEmail(true)} />
      </label>
      {tocouEmail && erroEmail && <p role="alert">{erroEmail}</p>}
      <label>
        <input name="novidades" type="checkbox" checked={dados.novidades} onChange={mudar} />
        Quero receber novidades
      </label>
      <button type="submit" disabled={!valido}>Cadastrar</button>
      {enviado && <p>Cadastrado: {enviado.nome} ({enviado.email})</p>}
    </form>
  );
}`,
      caption:
        'Três campos num objeto, um `onChange` para todos, o erro derivado e mostrado só depois do `onBlur`, o botão desabilitado enquanto o formulário é inválido, e o envio que lê o estado — nunca o DOM.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-4-controlado',
        type: 'multiple-choice',
        prompt: 'O que acontece com `<input value={nome} />` sem `onChange`?',
        concepts: ['react-formularios'],
        difficulty: 'iniciante',
        tags: ['react', 'formularios'],
        options: [
          'Funciona normalmente; o `onChange` é opcional',
          'O campo fica travado: a pessoa digita e o valor volta a ser `nome`, porque o React mostra sempre o estado — e o estado nunca muda',
          'O React lança um erro e o componente não renderiza',
          'O campo vira somente leitura, com aparência de desabilitado',
        ],
        correctIndex: 1,
        explanation:
          'Um campo controlado mostra o que o estado diz. Sem `onChange` para atualizar o estado a cada tecla, o React reimpõe o valor antigo depois de cada digitação — o campo parece travado, e o console avisa. `value` e `onChange` são um par: um mostra, o outro guarda.',
        hints: ['Quem decide o que o campo mostra: o campo ou o estado?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-4-eco',
        type: 'code',
        prompt:
          'Escreva `App` com um campo controlado de rótulo `Nome` e, abaixo, um `<p>` que mostra `Olá, NOME!` enquanto a pessoa digita — e `Digite seu nome` quando o campo está vazio. Um botão `Limpar` esvazia o campo.',
        concepts: ['react-formularios'],
        difficulty: 'iniciante',
        tags: ['react', 'formularios', 'estado'],
        initialCode: `function App() {
  return (
    <div>
      <label>
        Nome <input />
      </label>
      <p>Digite seu nome</p>
    </div>
  );
}
`,
        tests: [
          {
            description: 'vazio, mostra Digite seu nome',
            assertion: `if (texto('p') !== 'Digite seu nome') throw new Error('Esperava "Digite seu nome", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'digitar Ana mostra Olá, Ana!',
            assertion: `await digitar(campo('Nome'), 'Ana'); if (texto('p') !== 'Olá, Ana!') throw new Error('Esperava "Olá, Ana!", veio ' + JSON.stringify(texto('p'))); if (campo('Nome').value !== 'Ana') throw new Error('O campo deveria mostrar Ana — ele é controlado pelo estado.');`,
          },
          {
            description: 'Limpar esvazia o campo e volta ao texto inicial',
            assertion: `await clicar(botao('Limpar')); if (campo('Nome').value !== '') throw new Error('Depois de Limpar o campo deveria estar vazio.'); if (texto('p') !== 'Digite seu nome') throw new Error('Depois de Limpar esperava "Digite seu nome", veio ' + JSON.stringify(texto('p')));`,
          },
        ],
        hints: [
          '`const [nome, setNome] = React.useState(\'\')`; o input recebe `value={nome}` e `onChange={(e) => setNome(e.target.value)}`.',
          'O `<p>` é um ternário sobre `nome.trim() === \'\'`. Limpar é `setNome(\'\')` — é por isso que o campo é controlado.',
        ],
        solution: `function App() {
  const [nome, setNome] = React.useState('');
  return (
    <div>
      <label>
        Nome <input value={nome} onChange={(e) => setNome(e.target.value)} />
      </label>
      <p>{nome.trim() === '' ? 'Digite seu nome' : 'Olá, ' + nome + '!'}</p>
      <button onClick={() => setNome('')}>Limpar</button>
    </div>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-4-lacuna-envio',
        type: 'fill-blank',
        prompt: 'Complete o envio: o evento do formulário, o que impede a recarga, e a propriedade do estado que o campo mostra.',
        concepts: ['react-formularios'],
        difficulty: 'iniciante',
        tags: ['react', 'formularios'],
        template: `function App() {
  const [email, setEmail] = React.useState('');
  const [enviado, setEnviado] = React.useState<string | null>(null);

  function enviar(e: React.FormEvent) {
    e.{{2}}();
    setEnviado(email);
  }

  return (
    <form {{1}}={enviar}>
      <label>
        E-mail <input {{3}}={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button type="submit">Assinar</button>
      {enviado && <p>Assinado: {enviado}</p>}
    </form>
  );
}`,
        blanks: [
          { placeholder: 'evento', size: 9 },
          { placeholder: 'método', size: 15 },
          { placeholder: 'atributo', size: 6 },
        ],
        tests: [
          {
            description: 'antes de enviar não há confirmação',
            assertion: `if (document.querySelector('p')) throw new Error('A confirmação só aparece depois do envio.');`,
          },
          {
            description: 'digitar e enviar mostra a confirmação com o e-mail',
            assertion: `await digitar(campo('E-mail'), 'ana@x.com'); await enviar('form'); if (texto('p') !== 'Assinado: ana@x.com') throw new Error('Esperava "Assinado: ana@x.com", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'o campo continua mostrando o que está no estado',
            assertion: `if (campo('E-mail').value !== 'ana@x.com') throw new Error('O campo deveria mostrar o valor do estado.');`,
          },
        ],
        hints: [
          'O evento de envio vai no `<form>`, e o nome dele começa com "on".',
          'O método do evento que cancela o comportamento padrão; e o atributo que faz o campo mostrar o estado.',
        ],
        solution: ['onSubmit', 'preventDefault', 'value'],
        explanation:
          '`onSubmit` no formulário pega o clique no botão e o Enter no campo. `preventDefault` impede a recarga da página — sem ele o estado inteiro se perde. `value={email}` fecha o circuito do campo controlado: o campo mostra o estado, o `onChange` o atualiza. Na hora de enviar, os dados já estão em `email`; não há o que ler do DOM.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-4-bug-setter',
        type: 'find-bug',
        prompt:
          "O compilador recusa: `Type 'Dispatch<SetStateAction<string>>' is not assignable to type '(evento: ChangeEvent) => void'`. É o erro mais comum ao ligar um campo ao estado. Aponte a linha do defeito.",
        concepts: ['react-formularios'],
        difficulty: 'iniciante',
        tags: ['react', 'formularios', 'depuracao'],
        code: `function App() {
  const [nome, setNome] = React.useState('');
  const [salvo, setSalvo] = React.useState('');

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvo(nome);
  }

  return (
    <form onSubmit={salvar}>
      <input value={nome} onChange={setNome} />
      <button type="submit">Salvar</button>
      {salvo && <p>Salvo: {salvo}</p>}
    </form>
  );
}`,
        buggyLine: 12,
        fix: '      <input value={nome} onChange={(e) => setNome(e.target.value)} />',
        explanation:
          '`onChange` entrega um **evento**, não o texto. `onChange={setNome}` passaria o evento inteiro para o estado — e o compilador recusa, porque `setNome` pede um texto (ou uma função que devolve texto) e receberia um `ChangeEvent`. Sem tipos, o campo mostraria `[object Object]` na primeira tecla. O manipulador certo desembrulha o valor: `(e) => setNome(e.target.value)`.',
        hints: [
          'O que o `onChange` passa para a função que recebe? Compare com o que `setNome` espera.',
          'O valor digitado está dentro do evento, em `e.target.value`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-4-quando-validar',
        type: 'multiple-choice',
        prompt: 'Um campo de e-mail mostra "Informe um e-mail com @" desde o primeiro instante, com o campo ainda vazio. Qual é o padrão que a aula recomenda?',
        concepts: ['react-formularios'],
        difficulty: 'iniciante',
        tags: ['react', 'formularios', 'ux'],
        options: [
          'Validar só no envio, e mostrar todos os erros de uma vez',
          'Derivar o erro do valor, mas mostrá-lo só depois de a pessoa ter tocado no campo (`onBlur`) — e desabilitar o envio enquanto houver erro',
          'Mostrar o erro a cada tecla desde o início, para a pessoa saber logo',
          'Validar com `alert()` ao enviar',
        ],
        correctIndex: 1,
        explanation:
          'O erro é uma função do valor — derivado, sempre atualizado. Mas mostrar antes de a pessoa tentar é gritar com quem ainda não errou. Um estado `tocado`, ligado no `onBlur`, decide o momento; o botão desabilitado enquanto há erro evita o envio inválido sem mensagem antecipada. É a aula de formulários que ajudam, agora em React.',
        hints: ['Separe duas perguntas: o valor está errado? e: é hora de dizer isso?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-4-objeto',
        type: 'code',
        prompt:
          'Escreva `App` com um formulário de dois campos — rótulos `Nome` e `Cidade` — guardados **num objeto só** com um único `onChange` (use o `name` de cada campo), um botão `Enviar` desabilitado enquanto qualquer campo estiver vazio, e, depois do envio, um `<p>` com `NOME mora em CIDADE`.',
        concepts: ['react-formularios'],
        difficulty: 'intermediario',
        tags: ['react', 'formularios', 'estado'],
        initialCode: `interface Dados {
  nome: string;
  cidade: string;
}

function App() {
  return (
    <form>
      <label>
        Nome <input name="nome" />
      </label>
      <label>
        Cidade <input name="cidade" />
      </label>
      <button type="submit">Enviar</button>
    </form>
  );
}
`,
        tests: [
          {
            description: 'começa com o botão desabilitado',
            assertion: `if (!botao('Enviar').disabled) throw new Error('Com os campos vazios o botão Enviar deveria estar desabilitado.');`,
          },
          {
            description: 'com só o nome preenchido, continua desabilitado',
            assertion: `await digitar(campo('Nome'), 'Ana'); if (!botao('Enviar').disabled) throw new Error('Com a cidade vazia o botão deveria continuar desabilitado.');`,
          },
          {
            description: 'com os dois preenchidos, habilita, e o envio mostra a frase',
            assertion: `await digitar(campo('Cidade'), 'Recife'); if (botao('Enviar').disabled) throw new Error('Com os dois campos preenchidos o botão deveria estar habilitado.'); await enviar('form'); if (texto('p') !== 'Ana mora em Recife') throw new Error('Esperava "Ana mora em Recife", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'os campos continuam controlados depois do envio',
            assertion: `if (campo('Nome').value !== 'Ana' || campo('Cidade').value !== 'Recife') throw new Error('Os campos deveriam continuar mostrando o estado.');`,
          },
        ],
        hints: [
          '`const [dados, setDados] = React.useState<Dados>({ nome: \'\', cidade: \'\' })`, e um `mudar(e)` que faz `setDados({ ...dados, [e.target.name]: e.target.value })`.',
          'Cada input: `value={dados.nome}` (ou `.cidade`) e `onChange={mudar}`. O botão: `disabled={dados.nome.trim() === \'\' || dados.cidade.trim() === \'\'}`. O envio guarda uma cópia num segundo estado, com `preventDefault`.',
        ],
        solution: `interface Dados {
  nome: string;
  cidade: string;
}

function App() {
  const [dados, setDados] = React.useState<Dados>({ nome: '', cidade: '' });
  const [enviado, setEnviado] = React.useState<Dados | null>(null);
  const incompleto = dados.nome.trim() === '' || dados.cidade.trim() === '';

  function mudar(e: React.ChangeEvent) {
    setDados({ ...dados, [e.target.name]: e.target.value });
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviado(dados);
  }

  return (
    <form onSubmit={enviar}>
      <label>
        Nome <input name="nome" value={dados.nome} onChange={mudar} />
      </label>
      <label>
        Cidade <input name="cidade" value={dados.cidade} onChange={mudar} />
      </label>
      <button type="submit" disabled={incompleto}>Enviar</button>
      {enviado && <p>{enviado.nome} mora em {enviado.cidade}</p>}
    </form>
  );
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Campo controlado: \`value\` mostra o estado, \`onChange\` o atualiza — sempre os dois. \`onSubmit\` no formulário com \`preventDefault\` primeiro; os dados já estão no estado, não se lê o DOM. O erro é derivado do valor e mostrado depois do \`onBlur\`, com o envio desabilitado enquanto ele existir. Muitos campos: um objeto, um \`onChange\` que usa o \`name\` como chave, e sempre um objeto novo.`,
    },
  ],
};
