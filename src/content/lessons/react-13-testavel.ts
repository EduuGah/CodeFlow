import type { Lesson } from '../types';

export const lessonTestavel: Lesson = {
  id: 'lesson-react-13',
  trackId: 'track-react',
  title: 'Acessível e Testável: O que os Testes Veem',
  language: 'react',
  objective:
    'Escrever componentes que um teste (e um leitor de tela) consegue usar como uma pessoa usa — por papel, por rótulo, por texto — e decidir o que vale testar: o comportamento, nunca a implementação.',
  concepts: ['react-testes'],
  status: 'published',
  estimatedMinutes: 27,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Todos os exercícios desta trilha foram verificados do mesmo jeito: um teste montou o componente, achou um botão pelo texto, digitou num campo pelo rótulo, clicou, e leu o que apareceu. Nenhum teste olhou o nome de uma variável, um \`useState\`, uma classe CSS. Esta aula explica esse jeito — porque ele é o jeito certo de testar interface, e porque escrever para ele produz componentes melhores.

## O teste usa a tela como a pessoa

Uma biblioteca de teste de React (a mais usada se chama Testing Library) tem uma regra: **encontre as coisas como o usuário as encontra**.

- Um botão, pelo **papel** e pelo **texto**: "o botão Salvar".
- Um campo, pelo **rótulo**: "o campo E-mail".
- Uma mensagem, pelo **texto** ou pelo **papel** (\`alert\`, \`status\`).

Nunca por classe CSS, id ou estrutura (\`div > div > span\`). Classe e estrutura mudam quando o design muda, e o teste quebra sem que nada tenha quebrado para a pessoa. O papel e o rótulo só mudam quando a interface muda de verdade.

E aqui está o ganho escondido: **o que o teste consegue achar é o que o leitor de tela consegue anunciar.** Um componente testável por papel e rótulo é, por construção, acessível. As duas coisas são a mesma coisa.

## O que torna um componente achável

~~~tsx
// @recusado
<div className="botao" onClick={enviar}>Enviar</div>
<input placeholder="E-mail" />
<span className="erro">{erro}</span>
~~~

O \`div\` não tem papel de botão: teste e leitor de tela não o encontram como botão, e o teclado não o aciona. O \`placeholder\` some ao digitar e não é rótulo. O \`span\` de erro não é anunciado. A versão achável:

~~~tsx
<button onClick={enviar}>Enviar</button>
<label>
  E-mail <input value={email} onChange={…} />
</label>
{erro && <p role="alert">{erro}</p>}
{enviado && <p role="status">Inscrição confirmada.</p>}
~~~

\`<button>\` é botão para todos. \`<label>\` que envolve o campo (ou \`htmlFor\` + \`id\`) é o rótulo que o teste e o leitor de tela leem. \`role="alert"\` anuncia o erro na hora; \`role="status"\` anuncia a confirmação sem interromper. Um botão só de ícone ganha \`aria-label\`. Tudo isso é a aula de teclado da trilha da página, vista pelo lado do teste.

## O que testar

Comportamento, nunca implementação:

- **Sim**: "digitar um e-mail inválido e enviar mostra o erro"; "com o e-mail válido, o botão fica desabilitado durante o envio e depois aparece a confirmação".
- **Não**: "o estado \`erro\` vira \`'inválido'\`"; "\`setEnviando\` é chamado uma vez"; "a lista tem a classe \`ativa\`".

O teste de comportamento sobrevive a você trocar \`useState\` por \`useReducer\`, renomear tudo e mudar o CSS. O teste de implementação quebra a cada refatoração e não pega o bug que importa — a pessoa não vê a confirmação. A trilha de JavaScript já disse: um teste que aceita tudo não vale nada; um que reprova o refatoramento certo vale menos ainda.

## O DOM na hora certa

Um componente não toca o DOM durante a renderização — o DOM ainda não existe. \`document.getElementById('email').focus()\` no corpo do componente quebra na primeira montagem. Focar, medir, rolar: no \`useEffect\` (o DOM já está pronto) ou por um \`ref\`. E o teste, que roda depois da montagem, vê o foco onde deveria estar.

## Erros

- \`div\` clicável no lugar de \`button\`.
- \`placeholder\` como único rótulo.
- Erro e confirmação sem \`role\`: aparecem, mas ninguém é avisado.
- Teste que lê estado interno ou classe CSS.
- DOM manipulado no corpo do componente.
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `window.__servidor = { '/api/inscricao': (opcoes: { method?: string }) => (opcoes.method === 'POST' ? { ok: true } : null) };

function App() {
  const [email, setEmail] = React.useState('');
  const [erro, setErro] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);
  const [confirmado, setConfirmado] = React.useState(false);
  const campoRef = React.useRef<HTMLInputElement>(null);

  // O DOM só existe depois da montagem: o foco vai num efeito, por um ref.
  React.useEffect(() => {
    campoRef.current?.focus();
  }, []);

  async function inscrever(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) {
      setErro('Informe um e-mail com @.');
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const r = await fetch('/api/inscricao', { method: 'POST', body: email });
      if (!r.ok) throw new Error('status ' + r.status);
      setConfirmado(true);
    } catch {
      setErro('Não foi possível inscrever. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={inscrever}>
      <label>
        E-mail <input ref={campoRef} value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Inscrever'}</button>
      {erro && <p role="alert">{erro}</p>}
      {confirmado && <p role="status">Inscrição confirmada.</p>}
    </form>
  );
}`,
      caption:
        'Tudo aqui é achável pelo que a pessoa vê: o campo pelo rótulo, o botão pelo texto, o erro e a confirmação pelo papel. O foco inicial vai num efeito, por um ref. Um teste deste componente lê exatamente como o enunciado de um exercício.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-13-achar',
        type: 'multiple-choice',
        prompt: 'Um teste precisa clicar no botão de enviar. Qual é o jeito recomendado de encontrá-lo?',
        concepts: ['react-testes'],
        difficulty: 'iniciante',
        tags: ['react', 'testes', 'acessibilidade'],
        options: [
          'Pela classe CSS: `.botao-primario`',
          'Pelo papel e pelo texto: o botão "Enviar" — o mesmo jeito que a pessoa e o leitor de tela o encontram',
          'Pela posição: o segundo `<button>` do formulário',
          'Pelo id: `#btn-1`',
        ],
        correctIndex: 1,
        explanation:
          'Papel e texto só mudam quando a interface muda de verdade; classe, id e posição mudam quando o design muda, e o teste quebra sem motivo. E o que o teste encontra por papel e texto é o que o leitor de tela anuncia — o componente testável e o acessível são o mesmo componente.',
        hints: ['Como a pessoa descreveria o botão para alguém do outro lado do telefone?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-13-achavel',
        type: 'code',
        prompt:
          'Este formulário funciona, mas nem um teste nem um leitor de tela conseguem usá-lo. Torne-o achável **sem mudar o comportamento**: o botão é um `<button>` com o texto `Enviar`; o campo tem o rótulo `Nome` num `<label>`; a mensagem de erro (`Informe o nome.`) tem `role="alert"`; a confirmação (`Enviado: NOME`) tem `role="status"`.',
        concepts: ['react-testes'],
        difficulty: 'intermediario',
        tags: ['react', 'testes', 'acessibilidade'],
        initialCode: `function App() {
  const [nome, setNome] = React.useState('');
  const [erro, setErro] = React.useState(false);
  const [enviado, setEnviado] = React.useState<string | null>(null);

  function enviar() {
    if (nome.trim() === '') {
      setErro(true);
      return;
    }
    setErro(false);
    setEnviado(nome);
  }

  return (
    <div>
      <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
      <div className="botao" onClick={enviar}>Enviar</div>
      {erro && <span className="erro">Informe o nome.</span>}
      {enviado && <span className="ok">Enviado: {enviado}</span>}
    </div>
  );
}
`,
        tests: [
          {
            description: 'o campo é achável pelo rótulo Nome, e o botão pelo papel e pelo texto',
            assertion: `const c = campo('Nome'); if (c.tagName !== 'INPUT') throw new Error('O rótulo Nome precisa estar ligado a um <input>.'); if (!document.querySelector('label')) throw new Error('Use um <label> — placeholder não é rótulo.'); const b = botao('Enviar'); if (b.tagName !== 'BUTTON') throw new Error('Enviar precisa ser um <button>, não uma div com onClick.');`,
          },
          {
            description: 'enviar vazio mostra o erro com role="alert"',
            assertion: `await clicar(botao('Enviar')); const alerta = document.querySelector('[role="alert"]'); if (!alerta || alerta.textContent.trim() !== 'Informe o nome.') throw new Error('Esperava um elemento com role="alert" e o texto "Informe o nome.".');`,
          },
          {
            description: 'com o nome, a confirmação tem role="status" e o erro some',
            assertion: `await digitar(campo('Nome'), 'Ana'); await clicar(botao('Enviar')); const status = document.querySelector('[role="status"]'); if (!status || status.textContent.trim() !== 'Enviado: Ana') throw new Error('Esperava um elemento com role="status" e o texto "Enviado: Ana".'); if (document.querySelector('[role="alert"]')) throw new Error('Com o nome preenchido, o erro deveria sumir.');`,
          },
        ],
        hints: [
          '`<label>Nome <input … /></label>`, `<button onClick={enviar}>Enviar</button>` — o comportamento é o mesmo, só o elemento muda.',
          'As mensagens: `<p role="alert">Informe o nome.</p>` e `<p role="status">Enviado: {enviado}</p>`.',
        ],
        solution: `function App() {
  const [nome, setNome] = React.useState('');
  const [erro, setErro] = React.useState(false);
  const [enviado, setEnviado] = React.useState<string | null>(null);

  function enviar() {
    if (nome.trim() === '') {
      setErro(true);
      return;
    }
    setErro(false);
    setEnviado(nome);
  }

  return (
    <div>
      <label>
        Nome <input value={nome} onChange={(e) => setNome(e.target.value)} />
      </label>
      <button onClick={enviar}>Enviar</button>
      {erro && <p role="alert">Informe o nome.</p>}
      {enviado && <p role="status">Enviado: {enviado}</p>}
    </div>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-13-lacuna-aria',
        type: 'fill-blank',
        prompt: 'Complete o que o leitor de tela (e o teste) precisam: o rótulo ligado por id, o nome do botão de ícone e o papel da confirmação.',
        concepts: ['react-testes'],
        difficulty: 'iniciante',
        tags: ['react', 'testes', 'acessibilidade'],
        template: `function App() {
  const [busca, setBusca] = React.useState('');
  const [limpo, setLimpo] = React.useState(false);

  return (
    <div>
      <label {{1}}="busca">Buscar</label>
      <input id="busca" value={busca} onChange={(e) => { setBusca(e.target.value); setLimpo(false); }} />
      <button {{2}}="Limpar busca" onClick={() => { setBusca(''); setLimpo(true); }}>×</button>
      {limpo && <p role="{{3}}">Busca limpa.</p>}
    </div>
  );
}`,
        blanks: [
          { placeholder: 'atributo', size: 7 },
          { placeholder: 'atributo', size: 10 },
          { placeholder: 'papel', size: 6 },
        ],
        tests: [
          {
            description: 'o campo é achável pelo rótulo Buscar (label ligado por id)',
            assertion: `const c = campo('Buscar'); if (c.id !== 'busca') throw new Error('O <label> precisa apontar para o input pelo id — em JSX o atributo tem outro nome.');`,
          },
          {
            description: 'o botão de ícone tem nome acessível',
            assertion: `const b = botao('Limpar busca'); if (b.textContent.trim() !== '×') throw new Error('O botão continua mostrando só o ícone; o nome vem do atributo.');`,
          },
          {
            description: 'limpar anuncia a confirmação com role="status"',
            assertion: `await digitar(campo('Buscar'), 'abc'); await clicar(botao('Limpar busca')); const s = document.querySelector('[role="status"]'); if (!s || s.textContent.trim() !== 'Busca limpa.') throw new Error('Esperava <p role="status">Busca limpa.</p>.'); if (campo('Buscar').value !== '') throw new Error('O campo deveria estar vazio.');`,
          },
        ],
        hints: [
          'Em JSX, o atributo que liga o rótulo ao campo não é `for` (palavra reservada): é a propriedade do DOM, com "html" na frente.',
          'O nome de um botão só de ícone vem de um atributo `aria-`; a confirmação que não interrompe tem um papel próprio, diferente do de erro.',
        ],
        solution: ['htmlFor', 'aria-label', 'status'],
        explanation:
          '`htmlFor` é o `for` do HTML em JSX — liga o `<label>` ao campo pelo `id`, e é assim que o teste e o leitor de tela sabem que "Buscar" é o rótulo daquele input. `aria-label` dá nome ao botão que só tem um ícone. `role="status"` faz a confirmação ser anunciada sem interromper; `alert` seria para erro.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-13-bug-dom',
        type: 'find-bug',
        prompt:
          'Este componente quebra na primeira montagem com `TypeError: Cannot read properties of null (reading \'focus\')`. Aponte a linha que precisa mudar.',
        concepts: ['react-testes'],
        difficulty: 'intermediario',
        tags: ['react', 'testes', 'depuracao'],
        code: `function App() {
  const [busca, setBusca] = React.useState('');

  document.getElementById('busca')!.focus();

  return (
    <label>
      Buscar
      <input id="busca" value={busca} onChange={(e) => setBusca(e.target.value)} />
    </label>
  );
}`,
        buggyLine: 4,
        fix: "  React.useEffect(() => { document.getElementById('busca')?.focus(); }, []);",
        explanation:
          'Durante a renderização o componente ainda está **calculando** o JSX — o `<input>` não existe no DOM, e `getElementById` devolve `null`. O `!` mentiu para o compilador, e o `focus` quebrou em execução. Tocar o DOM é efeito: no `useEffect`, o React já aplicou a renderização e o campo existe. (Um `ref` no input, com `ref.current?.focus()` no efeito, é ainda melhor: sem `id`, sem busca no documento.)',
        hints: [
          'Quando o `<input>` passa a existir no DOM: antes ou depois de o componente devolver o JSX?',
          'O que acontece fora da renderização tem um lugar próprio.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-13-o-que-testar',
        type: 'multiple-choice',
        prompt: 'Qual destes testes vale a pena escrever para um formulário de inscrição?',
        concepts: ['react-testes'],
        difficulty: 'intermediario',
        tags: ['react', 'testes'],
        options: [
          '"O estado `enviando` vira `true` e depois `false`"',
          '"Digitar um e-mail sem @ e enviar mostra a mensagem \'Informe um e-mail com @\' e não chama o servidor"',
          '"O `<form>` tem a classe `formulario-inscricao`"',
          '"`setErro` é chamado com o texto certo"',
        ],
        correctIndex: 1,
        explanation:
          'O único que descreve o que a pessoa vê e faz. Os outros três testam implementação: sobrevivem apenas enquanto os nomes e a estrutura forem exatamente estes, quebram em qualquer refatoração e não pegam o bug real — a mensagem não aparecer. Teste de comportamento é o contrato; a implementação é livre.',
        hints: ['Qual dos quatro continuaria válido se você reescrevesse o componente com outro estado e outras classes?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-13-inscricao',
        type: 'code',
        prompt:
          'Escreva o formulário de inscrição achável: campo com rótulo `E-mail`, botão `Inscrever` (que vira `Enviando…` e fica desabilitado durante o envio), erro `Informe um e-mail com @.` com `role="alert"` quando o e-mail não tem `@` (sem chamar o servidor), e a confirmação `Inscrição confirmada.` com `role="status"` depois do `POST` em `/api/inscricao`. O campo começa focado.',
        concepts: ['react-testes'],
        difficulty: 'avancado',
        tags: ['react', 'testes', 'formularios'],
        initialCode: `window.__servidor = {
  '/api/inscricao': (opcoes: { method?: string }) => (opcoes.method === 'POST' ? { ok: true } : null),
};

function App() {
  return (
    <form>
      <label>
        E-mail <input />
      </label>
      <button type="submit">Inscrever</button>
    </form>
  );
}
`,
        tests: [
          {
            description: 'o campo começa com o foco',
            assertion: `await esperar(); if (document.activeElement !== campo('E-mail')) throw new Error('O campo E-mail deveria começar focado (num efeito, por ref).');`,
          },
          {
            description: 'e-mail sem @ mostra o alerta e não chama o servidor',
            assertion: `let chamadas = 0; const original = window.__servidor['/api/inscricao']; window.__servidor['/api/inscricao'] = (o) => { chamadas += 1; return original(o); }; await digitar(campo('E-mail'), 'ana'); await enviar('form'); await esperar(100); const alerta = document.querySelector('[role="alert"]'); if (!alerta || alerta.textContent.trim() !== 'Informe um e-mail com @.') throw new Error('Esperava <p role="alert">Informe um e-mail com @.</p>.'); if (chamadas !== 0) throw new Error('Com e-mail inválido o servidor não deveria ser chamado.'); window.__servidor['/api/inscricao'] = original;`,
          },
          {
            description: 'e-mail válido: o botão desabilita durante o envio e depois vem a confirmação',
            assertion: `await digitar(campo('E-mail'), 'ana@x.com'); const form = document.querySelector('form'); form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); await esperar(5); const durante = botao('Enviando…'); if (!durante.disabled) throw new Error('Durante o envio o botão deveria estar desabilitado.'); await esperar(150); const status = document.querySelector('[role="status"]'); if (!status || status.textContent.trim() !== 'Inscrição confirmada.') throw new Error('Esperava <p role="status">Inscrição confirmada.</p>.'); if (document.querySelector('[role="alert"]')) throw new Error('O erro anterior deveria ter sumido.'); if (botao('Inscrever').disabled) throw new Error('Depois do envio o botão volta a habilitar.');`,
          },
        ],
        hints: [
          'Estados: `email`, `erro`, `enviando`, `confirmado`. Um `ref` no input e `React.useEffect(() => { ref.current?.focus(); }, [])`.',
          'No `onSubmit`: `preventDefault`; se não tem `@`, `setErro` e `return` antes do fetch; senão `setEnviando(true)`, `fetch` com `method: \'POST\'`, `setConfirmado(true)` no `ok`, e `finally` com `setEnviando(false)`.',
        ],
        solution: `window.__servidor = {
  '/api/inscricao': (opcoes: { method?: string }) => (opcoes.method === 'POST' ? { ok: true } : null),
};

function App() {
  const [email, setEmail] = React.useState('');
  const [erro, setErro] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);
  const [confirmado, setConfirmado] = React.useState(false);
  const campoRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    campoRef.current?.focus();
  }, []);

  async function inscrever(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) {
      setErro('Informe um e-mail com @.');
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const r = await fetch('/api/inscricao', { method: 'POST', body: email });
      if (!r.ok) throw new Error('status ' + r.status);
      setConfirmado(true);
    } catch {
      setErro('Não foi possível inscrever. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={inscrever}>
      <label>
        E-mail <input ref={campoRef} value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Inscrever'}</button>
      {erro && <p role="alert">{erro}</p>}
      {confirmado && <p role="status">Inscrição confirmada.</p>}
    </form>
  );
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `O teste acha as coisas como a pessoa: botão pelo papel e pelo texto, campo pelo rótulo, mensagem pelo papel (\`alert\`, \`status\`) — nunca por classe, id ou posição. O que o teste acha é o que o leitor de tela anuncia: testável e acessível são o mesmo componente. Teste comportamento, nunca implementação. E o DOM se toca no efeito ou pelo ref, não durante a renderização.`,
    },
  ],
};
