import type { Lesson } from '../types';

export const lessonFormularios: Lesson = {
  id: 'lesson-pagina-16',
  trackId: 'track-pagina',
  title: 'Formulários: Receber Dados de Gente',
  language: 'html',
  objective:
    'Montar um formulário acessível, interceptar o envio, ler os campos com FormData, validar com mensagens que ajudam, e impedir o envio duplo.',
  concepts: ['dom-formularios'],
  status: 'published',
  estimatedMinutes: 32,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Formulário é onde a pessoa **entrega alguma coisa**: um cadastro, um comentário, um pagamento. É a parte da interface em que errar custa mais — para ela, que perde o que digitou, e para você, que recebe lixo. Por isso ele tem regras próprias, e a maior parte delas o HTML já resolve, se você deixar.

## O HTML de um formulário

~~~html
<form id="cadastro">
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required>

  <label for="senha">Senha</label>
  <input id="senha" name="senha" type="password" minlength="8" required>

  <button type="submit">Criar conta</button>
</form>
~~~

Cada peça tem motivo:

- **\`<label for>\`** ligado ao \`id\` do campo: clicar no rótulo foca o campo, e o leitor de tela lê "E-mail, campo de texto" em vez de "campo de texto".
- **\`name\`** é o nome com que o valor sai do formulário. Sem \`name\`, o campo não existe para o envio.
- **\`type\`** certo: \`email\` valida o formato e abre o teclado com @; \`password\` esconde; \`number\`, \`date\`, \`tel\` cada um dá o teclado e a validação que cabe.
- **\`required\`**, **\`minlength\`**, **\`pattern\`**: validação nativa, sem JavaScript. O navegador não envia e mostra a mensagem.
- **\`<button type="submit">\`** dentro do form: Enter em qualquer campo envia — é o que as pessoas esperam.

## O evento submit

Um formulário enviado do jeito antigo recarrega a página. Numa aplicação, você intercepta:

~~~js
const form = document.querySelector('#cadastro');

form.addEventListener('submit', (evento) => {
  evento.preventDefault();         // sem isto, a página recarrega

  const dados = new FormData(form);
  const email = dados.get('email');
  const senha = dados.get('senha');
  // …enviar, salvar, mostrar
});
~~~

\`submit\` é o único evento a escutar — não o \`click\` do botão. O \`submit\` dispara pelo clique **e** pelo Enter, e só depois da validação nativa passar. \`FormData\` lê todos os campos pelo \`name\`, de uma vez.

## Validar com mensagens que ajudam

A validação nativa pega o formato; a sua pega o **significado** — "esse e-mail já está cadastrado", "as senhas não conferem". A mensagem vai num elemento **perto do campo**, em texto (cor é reforço, lembra?), e num \`role="alert"\` para o leitor de tela anunciar:

~~~html
<p id="erro-email" role="alert"></p>
~~~

~~~js
if (!email.endsWith('@empresa.com')) {
  document.querySelector('#erro-email').textContent = 'Use o e-mail da empresa.';
  return;
}
~~~

Limpe a mensagem quando a pessoa corrigir — no \`input\` do campo —, senão ela fica lendo um erro que já resolveu.

## Enviar uma vez só

Entre clicar e a resposta chegar, a pessoa clica de novo. Dois cadastros, dois pagamentos. O padrão: **desabilite o botão** ao enviar, e reabilite quando terminar — no sucesso e no erro:

~~~js
const botao = form.querySelector('button[type="submit"]');
botao.disabled = true;
try {
  await enviar(dados);
  form.reset();
} finally {
  botao.disabled = false;
}
~~~

\`form.reset()\` limpa os campos depois de um envio bem-sucedido.

## Os erros

- Escutar o \`click\` do botão em vez do \`submit\` do form: Enter não funciona.
- Esquecer o \`preventDefault\` e ver a página recarregar.
- Campo sem \`name\`: some do \`FormData\`.
- \`<div>\` fazendo papel de botão, \`placeholder\` fazendo papel de \`label\`.
- Botão que continua clicável enquanto a resposta não chega.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<form id="contato">
  <label for="nome">Nome</label>
  <input id="nome" name="nome" required>

  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required>
  <p id="erro-email" role="alert"></p>

  <button type="submit">Enviar</button>
</form>
<p id="resultado" role="status"></p>

<script>
  const form = document.querySelector('#contato');
  const erro = document.querySelector('#erro-email');

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = new FormData(form);
    const email = dados.get('email');

    if (!email.endsWith('.com') && !email.endsWith('.br')) {
      erro.textContent = 'Use um e-mail terminado em .com ou .br.';
      return;
    }

    erro.textContent = '';
    document.querySelector('#resultado').textContent = 'Obrigado, ' + dados.get('nome') + '! Vamos escrever para ' + email + '.';
    form.reset();
  });

  document.querySelector('#email').addEventListener('input', () => {
    erro.textContent = '';
  });
</script>`,
      caption:
        'Rótulos ligados por `for`/`id`, `name` em cada campo, validação nativa por `type` e `required`, e a validação de significado no `submit` com mensagem em `role="alert"`. O erro some quando a pessoa volta a digitar. Preencha e envie na pré-visualização — inclusive com Enter.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-16-submit',
        type: 'multiple-choice',
        prompt: 'Por que escutar o `submit` do formulário, e não o `click` do botão?',
        concepts: ['dom-formularios'],
        difficulty: 'iniciante',
        tags: ['dom', 'formularios'],
        options: [
          'Porque `click` não funciona em botões',
          'Porque `submit` dispara pelo clique e pelo Enter, e só depois da validação nativa — `click` perde o Enter e ignora o `required`',
          'Porque `submit` é mais rápido',
          'Tanto faz, os dois fazem o mesmo',
        ],
        correctIndex: 1,
        explanation:
          'Enter num campo envia o formulário — as pessoas contam com isso — e dispara `submit`, não `click`. E o navegador só dispara `submit` se a validação nativa (`required`, `type="email"`, `minlength`) passou. Escutando o `click`, você perde os dois: o Enter e a validação de graça.',
        hints: ['O que acontece quando a pessoa aperta Enter num campo?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-16-ler',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Intercepte o envio: no `submit`, impeça o recarregamento, leia `nome` e `email` com `FormData`, e escreva **Obrigado, <nome>! Vamos escrever para <email>.** no `#resultado`.',
        concepts: ['dom-formularios'],
        difficulty: 'iniciante',
        tags: ['dom', 'formularios'],
        initialCode: `<form id="contato">
  <label for="nome">Nome</label>
  <input id="nome" name="nome" required>

  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required>

  <button type="submit">Enviar</button>
</form>
<p id="resultado" role="status"></p>

<script>
  // submit em #contato: preventDefault, FormData, e o texto em #resultado
</script>
`,
        tests: [
          {
            description: 'o envio é interceptado e não recarrega a página',
            assertion: `
              const form = document.querySelector('#contato');
              form.querySelector('#nome').value = 'Ana';
              form.querySelector('#email').value = 'ana@exemplo.com';
              const ev = new Event('submit', { bubbles: true, cancelable: true });
              form.dispatchEvent(ev);
              if (!ev.defaultPrevented) throw new Error('Sem evento.preventDefault() a página recarrega e o resultado some.');
            `,
          },
          {
            description: 'o resultado usa o nome e o e-mail digitados',
            assertion: `
              const r = document.querySelector('#resultado').textContent.trim();
              if (r !== 'Obrigado, Ana! Vamos escrever para ana@exemplo.com.') throw new Error('Esperava "Obrigado, Ana! Vamos escrever para ana@exemplo.com."; veio "' + r + '".');
            `,
          },
          {
            description: 'os valores vêm do FormData, pelo name',
            assertion: `
              for (const s of document.querySelectorAll('script')) {
                if (/__codeflow|new Function/.test(s.textContent)) continue;
                if (!/FormData/.test(s.textContent)) throw new Error('Leia os campos com new FormData(form) e dados.get("nome").');
                if (!/addEventListener\\(\\s*['"]submit['"]/.test(s.textContent)) throw new Error('O evento a escutar é o submit do formulário.');
              }
            `,
            hidden: true,
          },
        ],
        hints: [
          'Primeira linha do manipulador: `evento.preventDefault()`.',
          '`const dados = new FormData(form); dados.get("nome")`.',
          "const form = document.querySelector('#contato');\nform.addEventListener('submit', (evento) => {\n  evento.preventDefault();\n  const dados = new FormData(form);\n  document.querySelector('#resultado').textContent = 'Obrigado, ' + dados.get('nome') + '! Vamos escrever para ' + dados.get('email') + '.';\n});",
        ],
        solution: `<form id="contato">
  <label for="nome">Nome</label>
  <input id="nome" name="nome" required>

  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required>

  <button type="submit">Enviar</button>
</form>
<p id="resultado" role="status"></p>

<script>
  const form = document.querySelector('#contato');

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = new FormData(form);
    document.querySelector('#resultado').textContent =
      'Obrigado, ' + dados.get('nome') + '! Vamos escrever para ' + dados.get('email') + '.';
  });
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-16-lacuna-html',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete o HTML do campo: o atributo que liga o rótulo ao campo, o atributo com que o valor sai no envio, e o tipo que valida o formato.',
        concepts: ['dom-formularios'],
        difficulty: 'iniciante',
        tags: ['dom', 'formularios'],
        template: `<form id="cadastro">
  <label {{1}}="email">E-mail</label>
  <input id="email" {{2}}="email" type="{{3}}" required>
  <button type="submit">Entrar</button>
</form>

<script>
  document.querySelector('#cadastro').addEventListener('submit', (e) => e.preventDefault());
</script>`,
        blanks: [
          { placeholder: 'liga ao id', size: 3 },
          { placeholder: 'nome no envio', size: 4 },
          { placeholder: 'tipo', size: 5 },
        ],
        tests: [
          {
            description: 'o rótulo está ligado ao campo',
            assertion: `
              const campo = document.querySelector('#email');
              if (!campo.labels || campo.labels.length === 0) throw new Error('O <label> precisa de for="email", o id do campo — é o que faz o clique no rótulo focar o campo e o leitor de tela ler o nome dele.');
            `,
          },
          {
            description: 'o campo sai no envio com o nome email',
            assertion: `
              const dados = new FormData(document.querySelector('#cadastro'));
              document.querySelector('#email').value = 'a@b.com';
              const dados2 = new FormData(document.querySelector('#cadastro'));
              if (dados2.get('email') !== 'a@b.com') throw new Error('Sem name="email", o campo não existe para o FormData.');
            `,
          },
          {
            description: 'o tipo valida o formato de e-mail',
            assertion: `
              const campo = document.querySelector('#email');
              if (campo.type !== 'email') throw new Error('type="email" valida o formato e abre o teclado certo no celular. Veio type="' + campo.type + '".');
              campo.value = 'nao-e-email';
              if (campo.checkValidity()) throw new Error('Com type="email", "nao-e-email" precisa ser inválido.');
            `,
          },
        ],
        hints: [
          'O rótulo aponta para o `id` do campo com um atributo de três letras.',
          'O nome com que o valor viaja no envio; e o tipo que tem @ no teclado.',
        ],
        solution: ['for', 'name', 'email'],
        explanation:
          'Três atributos, três funções que o HTML faz sozinho: `for` liga o rótulo (clique foca, leitor de tela nomeia), `name` dá ao valor um nome no envio (sem ele, o campo não existe para o `FormData`), e `type="email"` valida o formato e troca o teclado do celular. Nenhuma linha de JavaScript para isso.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-16-ordenar-envio',
        type: 'order-steps',
        prompt: 'A pessoa aperta Enter num campo do formulário. Coloque na ordem o que acontece.',
        concepts: ['dom-formularios'],
        difficulty: 'intermediario',
        tags: ['dom', 'formularios'],
        steps: [
          { id: 'nativa', text: 'O navegador roda a validação nativa (`required`, `type`, `minlength`); se falha, mostra a mensagem e para aqui', ordem: 1 },
          { id: 'submit', text: 'Passando, dispara o evento `submit` no formulário', ordem: 2 },
          { id: 'prevent', text: 'O manipulador chama `preventDefault()`: a página não vai recarregar', ordem: 3 },
          { id: 'le', text: '`FormData` lê os campos pelo `name`, e a validação de significado roda', ordem: 4 },
          { id: 'envia', text: 'O botão é desabilitado, os dados são enviados, e no fim o botão volta e o form é limpo', ordem: 5 },
        ],
        explanation:
          'A validação nativa vem **antes** do `submit`: seu manipulador nunca vê um formulário com campo obrigatório vazio. É por isso que vale usar `required` e `type` — metade da validação some do seu código. E o `preventDefault` precisa ser a primeira coisa: se alguma linha antes dele lançar, a página recarrega.',
        hints: [
          'O que o navegador confere antes de avisar o seu código?',
          'Impedir o recarregamento vem antes de ler qualquer coisa.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-16-validar',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'No `submit`: se as duas senhas forem diferentes, escreva **As senhas não conferem.** no `#erro` e pare; se conferirem, limpe o `#erro` e escreva **Conta criada.** no `#resultado`. E ao digitar em qualquer senha, limpe o `#erro`.',
        concepts: ['dom-formularios'],
        difficulty: 'intermediario',
        tags: ['dom', 'formularios'],
        initialCode: `<form id="cadastro">
  <label for="senha">Senha</label>
  <input id="senha" name="senha" type="password" required>

  <label for="confirmar">Confirmar senha</label>
  <input id="confirmar" name="confirmar" type="password" required>
  <p id="erro" role="alert"></p>

  <button type="submit">Criar conta</button>
</form>
<p id="resultado" role="status"></p>

<script>
  const form = document.querySelector('#cadastro');

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    // compare senha e confirmar; erro ou resultado
  });

  // input em #senha e #confirmar: limpe #erro
</script>
`,
        tests: [
          {
            description: 'senhas diferentes mostram o erro e não criam a conta',
            assertion: `
              const form = document.querySelector('#cadastro');
              form.querySelector('#senha').value = 'segredo123';
              form.querySelector('#confirmar').value = 'segredo124';
              form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
              if (document.querySelector('#erro').textContent.trim() !== 'As senhas não conferem.') throw new Error('Com senhas diferentes, #erro precisa dizer "As senhas não conferem."; veio "' + document.querySelector('#erro').textContent.trim() + '".');
              if (document.querySelector('#resultado').textContent.trim() !== '') throw new Error('Com erro, #resultado fica vazio.');
            `,
          },
          {
            description: 'digitar de novo limpa o erro',
            assertion: `
              const c = document.querySelector('#confirmar');
              c.value = 'segredo12';
              c.dispatchEvent(new Event('input', { bubbles: true }));
              if (document.querySelector('#erro').textContent.trim() !== '') throw new Error('Ao digitar numa senha, #erro precisa ser limpo — senão a pessoa lê um erro que já está corrigindo.');
            `,
          },
          {
            description: 'senhas iguais criam a conta',
            assertion: `
              const form = document.querySelector('#cadastro');
              form.querySelector('#senha').value = 'segredo123';
              form.querySelector('#confirmar').value = 'segredo123';
              form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
              if (document.querySelector('#erro').textContent.trim() !== '') throw new Error('Com senhas iguais, #erro fica vazio.');
              if (document.querySelector('#resultado').textContent.trim() !== 'Conta criada.') throw new Error('Com senhas iguais, #resultado precisa dizer "Conta criada."; veio "' + document.querySelector('#resultado').textContent.trim() + '".');
            `,
          },
        ],
        hints: [
          '`FormData` com `get("senha")` e `get("confirmar")`; compare com `!==`.',
          'Dois `addEventListener("input", …)` — ou um só, com delegação no form.',
          "form.addEventListener('submit', (evento) => {\n  evento.preventDefault();\n  const dados = new FormData(form);\n  const erro = document.querySelector('#erro');\n  if (dados.get('senha') !== dados.get('confirmar')) {\n    erro.textContent = 'As senhas não conferem.';\n    return;\n  }\n  erro.textContent = '';\n  document.querySelector('#resultado').textContent = 'Conta criada.';\n});\nform.addEventListener('input', () => { document.querySelector('#erro').textContent = ''; });",
        ],
        solution: `<form id="cadastro">
  <label for="senha">Senha</label>
  <input id="senha" name="senha" type="password" required>

  <label for="confirmar">Confirmar senha</label>
  <input id="confirmar" name="confirmar" type="password" required>
  <p id="erro" role="alert"></p>

  <button type="submit">Criar conta</button>
</form>
<p id="resultado" role="status"></p>

<script>
  const form = document.querySelector('#cadastro');
  const erro = document.querySelector('#erro');

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = new FormData(form);

    if (dados.get('senha') !== dados.get('confirmar')) {
      erro.textContent = 'As senhas não conferem.';
      return;
    }

    erro.textContent = '';
    document.querySelector('#resultado').textContent = 'Conta criada.';
  });

  form.addEventListener('input', () => {
    erro.textContent = '';
  });
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-16-duplo',
        type: 'multiple-choice',
        prompt:
          'A pessoa clica em "Pagar", a resposta demora, ela clica de novo. Dois pagamentos. Qual é a correção?',
        concepts: ['dom-formularios'],
        difficulty: 'intermediario',
        tags: ['dom', 'formularios'],
        options: [
          'Mostrar um aviso "não clique duas vezes"',
          'Desabilitar o botão ao enviar (`botao.disabled = true`) e reabilitar quando a resposta chegar — no sucesso e no erro',
          'Deixar a página mais rápida',
          'Trocar o `submit` por `click`',
        ],
        correctIndex: 1,
        explanation:
          'Um botão desabilitado não dispara `submit`, por clique nem por Enter. Reabilitar no `finally` é o detalhe que importa: se o envio falhar e o botão ficar travado, a pessoa não consegue tentar de novo. O aviso em texto não impede nada; a velocidade nunca é garantida.',
        hints: ['O que impede fisicamente o segundo envio?'],
      },
    },
    {
      kind: 'summary',
      markdown: `\`<label for>\`, \`name\`, \`type\` e \`required\` fazem metade do trabalho sem JavaScript. Escute o \`submit\` do form (clique e Enter, depois da validação nativa), chame \`preventDefault()\` primeiro, leia com \`FormData\`. Erros em texto, perto do campo, num \`role="alert"\`, e limpos quando a pessoa volta a digitar. Desabilite o botão enquanto envia e reabilite sempre.`,
    },
  ],
};
