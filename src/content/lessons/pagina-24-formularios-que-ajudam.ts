import type { Lesson } from '../types';

export const lessonFormulariosQueAjudam: Lesson = {
  id: 'lesson-pagina-24',
  trackId: 'track-pagina',
  title: 'Formulários que Ajudam: Pedir Menos, Explicar Melhor',
  language: 'html',
  objective:
    'Desenhar formulários que as pessoas terminam — menos campos, uma coluna, rótulos visíveis, teclado certo no celular, erros no lugar e na hora certos.',
  concepts: ['ui-formularios'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A aula de formulários ensinou a mecânica: \`submit\`, \`FormData\`, validação. Esta é sobre a **experiência** — e o dado que a orienta: cada campo a mais é gente a menos terminando. Formulário bom é o que pede o mínimo e explica o máximo.

## Peça menos

Antes de cada campo, a pergunta: **preciso disto agora?** Telefone "para contato" que nunca é usado, "como nos conheceu", confirmação de e-mail (a pessoa cola o mesmo erro duas vezes). Cada um custa abandono. Peça o essencial; o resto, depois, quando fizer falta.

## Uma coluna, rótulo em cima

Duas colunas de campos obrigam o olho a ziguezaguear e quebram na tela estreita. Uma coluna, na ordem em que a pessoa pensa. O rótulo **em cima** do campo, não ao lado: alinha em qualquer largura, e o olho lê rótulo e campo num movimento só.

~~~css
label { display: block; margin-bottom: 4px; }
input { display: block; width: 100%; }
.campo + .campo { margin-top: 16px; }
~~~

## O teclado certo

No celular, o \`type\` e o \`inputmode\` decidem que teclado abre:

- \`type="email"\`: teclado com @ e ponto.
- \`type="tel"\` ou \`inputmode="numeric"\`: teclado numérico — para CEP, cartão, código.
- \`autocomplete\`: \`"email"\`, \`"name"\`, \`"postal-code"\`, \`"one-time-code"\` — o navegador preenche sozinho o que já sabe. É a diferença entre digitar um endereço inteiro e tocar uma vez.

~~~html
<input id="cep" name="cep" inputmode="numeric" autocomplete="postal-code">
~~~

## Quando validar

- **Enquanto digita, antes de terminar**: nunca. "E-mail inválido" na segunda letra é irritante e errado.
- **Ao sair do campo** (\`change\` ou \`blur\`): bom para formatos — e-mail, CEP.
- **No envio**: sempre, para tudo. E, com erro, o foco vai para o **primeiro campo errado**.
- **Depois do primeiro erro**: aí sim, a cada tecla, para a mensagem sumir assim que a pessoa corrigir.

## Onde e como dizer o erro

Embaixo do campo, em texto, ligado ao campo por \`aria-describedby\` — assim o leitor de tela lê a mensagem junto com o campo:

~~~html
<label for="email">E-mail</label>
<input id="email" name="email" type="email" aria-describedby="erro-email" aria-invalid="true">
<p id="erro-email" class="erro">Erro: falta o @ no e-mail.</p>
~~~

A mensagem diz **o que está errado e como consertar**: "falta o @", "o CEP tem 8 números", não "campo inválido". E o formulário **nunca apaga** o que a pessoa já digitou por causa de um erro — é a forma mais rápida de fazê-la desistir.

## O botão

"Criar conta", "Pagar R$ 89,90", "Enviar mensagem" — o botão diz o que vai acontecer, não "Enviar" ou "OK". E não comece com ele desabilitado "até o formulário estar válido": a pessoa clica, nada acontece, e ela não sabe por quê. Deixe clicar, e mostre os erros.

## Os erros

- Campos "para o caso de". Cada um custa gente.
- Duas colunas; rótulo ao lado; rótulo só no placeholder.
- Teclado errado no celular: alfabético para CEP.
- Validar enquanto digita, antes de terminar.
- "Campo inválido", sem dizer o quê; e apagar o que já foi digitado.
- Botão desabilitado sem explicação.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  label { display: block; margin-bottom: 4px; font-weight: 600; }
  input { display: block; width: 100%; padding: 10px; }
  .campo + .campo { margin-top: 16px; }
  .erro { color: #b42318; margin: 4px 0 0; font-size: 0.875rem; }
  button { margin-top: 24px; padding: 12px 16px; background: #1f6660; color: white; border: 0; }
</style>

<form id="cadastro" novalidate>
  <div class="campo">
    <label for="nome">Nome</label>
    <input id="nome" name="nome" autocomplete="name" required>
  </div>
  <div class="campo">
    <label for="email">E-mail</label>
    <input id="email" name="email" type="email" autocomplete="email" required aria-describedby="erro-email">
    <p id="erro-email" class="erro" role="alert"></p>
  </div>
  <div class="campo">
    <label for="cep">CEP</label>
    <input id="cep" name="cep" inputmode="numeric" autocomplete="postal-code" required>
  </div>
  <button type="submit">Criar conta</button>
</form>

<script>
  const form = document.querySelector('#cadastro');
  const email = document.querySelector('#email');
  const erro = document.querySelector('#erro-email');

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!email.value.includes('@')) {
      erro.textContent = 'Erro: falta o @ no e-mail.';
      email.setAttribute('aria-invalid', 'true');
      email.focus();
      return;
    }
    erro.textContent = '';
    email.removeAttribute('aria-invalid');
  });

  email.addEventListener('input', () => {
    if (erro.textContent) { erro.textContent = ''; email.removeAttribute('aria-invalid'); }
  });
</script>`,
      caption:
        'Uma coluna, rótulos em cima e visíveis, `autocomplete` em tudo, teclado numérico no CEP. O erro só aparece no envio, embaixo do campo, ligado por `aria-describedby`, com o foco levado até lá — e some assim que a pessoa volta a digitar. O botão diz o que faz e nunca começa desabilitado.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-24-quando',
        type: 'multiple-choice',
        prompt: 'Quando mostrar "e-mail inválido" pela primeira vez?',
        concepts: ['ui-formularios'],
        difficulty: 'iniciante',
        tags: ['ui', 'formularios'],
        options: [
          'A cada tecla, desde a primeira letra',
          'Ao sair do campo ou no envio — nunca enquanto a pessoa ainda está digitando o e-mail pela primeira vez',
          'Só depois de três tentativas',
          'Nunca; o servidor avisa',
        ],
        correctIndex: 1,
        explanation:
          '"Inválido" na segunda letra de um e-mail que ainda nem tem @ é acusar antes da hora. A primeira validação espera a pessoa terminar: ao sair do campo, ou no envio. Depois que um erro apareceu, aí sim vale reagir a cada tecla — para a mensagem sumir no instante em que ela corrige.',
        hints: ['Um e-mail pela metade é um e-mail errado ou um e-mail incompleto?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-24-consertar-campos',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Conserte os campos para o celular e para o preenchimento automático: o e-mail com `type="email"` e `autocomplete="email"`; o CEP com `inputmode="numeric"` e `autocomplete="postal-code"`; o nome com `autocomplete="name"`. E os rótulos em cima: `label` como bloco.',
        concepts: ['ui-formularios'],
        difficulty: 'iniciante',
        tags: ['ui', 'formularios'],
        initialCode: `<style>
  /* label como bloco, em cima do campo */
  input { display: block; width: 100%; padding: 10px; }
  .campo + .campo { margin-top: 16px; }
</style>

<form>
  <div class="campo">
    <label for="nome">Nome</label>
    <input id="nome" name="nome">
  </div>
  <div class="campo">
    <label for="email">E-mail</label>
    <input id="email" name="email" type="text">
  </div>
  <div class="campo">
    <label for="cep">CEP</label>
    <input id="cep" name="cep" type="text">
  </div>
</form>
`,
        tests: [
          {
            description: 'o e-mail abre o teclado certo e se preenche sozinho',
            assertion: `
              const e = document.querySelector('#email');
              if (e.type !== 'email') throw new Error('type="email" abre o teclado com @ e valida o formato.');
              if (e.getAttribute('autocomplete') !== 'email') throw new Error('autocomplete="email" deixa o navegador preencher.');
            `,
          },
          {
            description: 'o CEP abre o teclado numérico e se preenche sozinho',
            assertion: `
              const c = document.querySelector('#cep');
              if (c.getAttribute('inputmode') !== 'numeric') throw new Error('inputmode="numeric" abre o teclado numérico no celular para o CEP.');
              if (c.getAttribute('autocomplete') !== 'postal-code') throw new Error('autocomplete="postal-code" é o nome padronizado para CEP.');
            `,
          },
          {
            description: 'o nome se preenche sozinho',
            assertion: `if (document.querySelector('#nome').getAttribute('autocomplete') !== 'name') throw new Error('autocomplete="name" no campo de nome.');`,
          },
          {
            description: 'os rótulos ficam em cima dos campos',
            assertion: `
              const d = getComputedStyle(document.querySelector('label')).display;
              if (d !== 'block') throw new Error('label { display: block } põe o rótulo em cima do campo. Veio ' + d + '.');
            `,
          },
        ],
        hints: [
          'Três atributos novos nos inputs, um `type` trocado, e uma regra de CSS para o `label`.',
        ],
        solution: `<style>
  label { display: block; margin-bottom: 4px; }
  input { display: block; width: 100%; padding: 10px; }
  .campo + .campo { margin-top: 16px; }
</style>

<form>
  <div class="campo">
    <label for="nome">Nome</label>
    <input id="nome" name="nome" autocomplete="name">
  </div>
  <div class="campo">
    <label for="email">E-mail</label>
    <input id="email" name="email" type="email" autocomplete="email">
  </div>
  <div class="campo">
    <label for="cep">CEP</label>
    <input id="cep" name="cep" type="text" inputmode="numeric" autocomplete="postal-code">
  </div>
</form>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-24-lacuna-erro',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt: 'Complete a ligação entre o campo e a mensagem de erro, para o leitor de tela lê-la junto com o campo — e a marcação de inválido.',
        concepts: ['ui-formularios'],
        difficulty: 'iniciante',
        tags: ['ui', 'formularios', 'acessibilidade'],
        template: `<label for="email">E-mail</label>
<input id="email" name="email" type="email" {{1}}="erro-email" {{2}}="true">
<p {{3}}="erro-email" class="erro">Erro: falta o @ no e-mail.</p>`,
        blanks: [
          { placeholder: 'descrito por', size: 16 },
          { placeholder: 'inválido', size: 12 },
          { placeholder: 'âncora', size: 2 },
        ],
        tests: [
          {
            description: 'o campo aponta para a mensagem',
            assertion: `
              const c = document.querySelector('#email');
              if (c.getAttribute('aria-describedby') !== 'erro-email') throw new Error('aria-describedby="erro-email" liga o campo à mensagem.');
              if (!document.getElementById('erro-email')) throw new Error('A mensagem precisa de id="erro-email" para ser o alvo.');
            `,
          },
          {
            description: 'o campo está marcado como inválido',
            assertion: `if (document.querySelector('#email').getAttribute('aria-invalid') !== 'true') throw new Error('aria-invalid="true" diz ao leitor de tela que o campo tem erro.');`,
          },
        ],
        hints: [
          'O `aria-` que diz "este elemento é descrito por aquele id"; o `aria-` de inválido; e o atributo que dá o id à mensagem.',
        ],
        solution: ['aria-describedby', 'aria-invalid', 'id'],
        explanation:
          'Sem `aria-describedby`, o leitor de tela lê "E-mail, campo de texto, inválido" e a mensagem fica solta na página, em outro lugar. Com ele, lê "E-mail, campo de texto, inválido, Erro: falta o @ no e-mail" — tudo no campo, na hora em que a pessoa chega nele. Dois atributos, e o erro existe para quem não vê.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-24-ordenar-envio',
        type: 'order-steps',
        prompt: 'A pessoa envia um formulário com dois campos errados. Coloque na ordem o que uma boa tela faz.',
        concepts: ['ui-formularios'],
        difficulty: 'intermediario',
        tags: ['ui', 'formularios'],
        steps: [
          { id: 'valida', text: 'Valida todos os campos de uma vez, sem enviar', ordem: 1 },
          { id: 'mostra', text: 'Mostra a mensagem embaixo de cada campo errado, dizendo o que corrigir', ordem: 2 },
          { id: 'foco', text: 'Move o foco para o primeiro campo com erro', ordem: 3 },
          { id: 'mantem', text: 'Mantém tudo o que a pessoa já digitou — nada é apagado', ordem: 4 },
          { id: 'limpa', text: 'Conforme ela corrige cada campo, a mensagem dele some na hora', ordem: 5 },
        ],
        explanation:
          'Validar tudo de uma vez evita o pior dos jogos: corrigir um erro, enviar, descobrir o próximo. O foco no primeiro erro poupa a procura — especialmente num formulário longo, no celular. E manter o que foi digitado é a regra que mais gente quebra sem perceber: um recarregamento, e a pessoa recomeça do zero.',
        hints: [
          'Antes de mostrar qualquer erro, é preciso saber todos.',
          'A correção acontece por último, campo a campo.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-24-validar-bem',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'No `submit`: se o e-mail não tiver `@`, mostre **Erro: falta o @ no e-mail.** no `#erro-email`, marque o campo com `aria-invalid="true"` e leve o foco a ele; se estiver certo, limpe o erro e escreva **Conta criada.** no `#resultado`. E ao digitar no campo, limpe o erro. O que a pessoa digitou nunca é apagado.',
        concepts: ['ui-formularios'],
        difficulty: 'intermediario',
        tags: ['ui', 'formularios'],
        initialCode: `<style>
  label { display: block; }
  .erro { color: #b42318; }
</style>

<form id="cadastro" novalidate>
  <label for="nome">Nome</label>
  <input id="nome" name="nome" autocomplete="name">
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" autocomplete="email" aria-describedby="erro-email">
  <p id="erro-email" class="erro" role="alert"></p>
  <button type="submit">Criar conta</button>
</form>
<p id="resultado" role="status"></p>

<script>
  const form = document.querySelector('#cadastro');
  const email = document.querySelector('#email');
  const erro = document.querySelector('#erro-email');

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    // valide o e-mail; erro (mensagem, aria-invalid, foco) ou resultado
  });

  // input no e-mail: limpe o erro
</script>
`,
        tests: [
          {
            description: 'e-mail sem @: mensagem, campo inválido, foco no campo, nada apagado',
            assertion: `
              document.querySelector('#nome').value = 'Ana';
              const email = document.querySelector('#email');
              email.value = 'ana.exemplo.com';
              document.querySelector('#cadastro').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
              const erro = document.querySelector('#erro-email').textContent.trim();
              if (erro !== 'Erro: falta o @ no e-mail.') throw new Error('Esperava "Erro: falta o @ no e-mail."; veio "' + erro + '".');
              if (email.getAttribute('aria-invalid') !== 'true') throw new Error('O campo precisa de aria-invalid="true" enquanto está errado.');
              if (document.activeElement !== email) throw new Error('O foco precisa ir para o campo com erro.');
              if (document.querySelector('#nome').value !== 'Ana' || email.value !== 'ana.exemplo.com') throw new Error('Nada do que a pessoa digitou pode ser apagado por causa de um erro.');
            `,
          },
          {
            description: 'ao digitar de novo, o erro some',
            assertion: `
              const email = document.querySelector('#email');
              email.value = 'ana@exemplo.com';
              email.dispatchEvent(new Event('input', { bubbles: true }));
              if (document.querySelector('#erro-email').textContent.trim() !== '') throw new Error('Ao digitar, a mensagem de erro precisa sumir.');
            `,
          },
          {
            description: 'e-mail certo: conta criada, campo sem marca de inválido',
            assertion: `
              document.querySelector('#cadastro').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
              if (document.querySelector('#resultado').textContent.trim() !== 'Conta criada.') throw new Error('Com o e-mail certo, #resultado precisa dizer "Conta criada.".');
              if (document.querySelector('#email').getAttribute('aria-invalid') === 'true') throw new Error('Com o e-mail certo, aria-invalid precisa sair (ou ser "false").');
            `,
          },
        ],
        hints: [
          'No erro: `erro.textContent = …; email.setAttribute("aria-invalid", "true"); email.focus(); return;`.',
          'No sucesso: limpe o erro, `removeAttribute("aria-invalid")`, escreva o resultado. No `input`: limpe o erro e tire o `aria-invalid`.',
          "form.addEventListener('submit', (evento) => {\n  evento.preventDefault();\n  if (!email.value.includes('@')) {\n    erro.textContent = 'Erro: falta o @ no e-mail.';\n    email.setAttribute('aria-invalid', 'true');\n    email.focus();\n    return;\n  }\n  erro.textContent = '';\n  email.removeAttribute('aria-invalid');\n  document.querySelector('#resultado').textContent = 'Conta criada.';\n});\nemail.addEventListener('input', () => { erro.textContent = ''; email.removeAttribute('aria-invalid'); });",
        ],
        solution: `<style>
  label { display: block; }
  .erro { color: #b42318; }
</style>

<form id="cadastro" novalidate>
  <label for="nome">Nome</label>
  <input id="nome" name="nome" autocomplete="name">
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" autocomplete="email" aria-describedby="erro-email">
  <p id="erro-email" class="erro" role="alert"></p>
  <button type="submit">Criar conta</button>
</form>
<p id="resultado" role="status"></p>

<script>
  const form = document.querySelector('#cadastro');
  const email = document.querySelector('#email');
  const erro = document.querySelector('#erro-email');

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!email.value.includes('@')) {
      erro.textContent = 'Erro: falta o @ no e-mail.';
      email.setAttribute('aria-invalid', 'true');
      email.focus();
      return;
    }
    erro.textContent = '';
    email.removeAttribute('aria-invalid');
    document.querySelector('#resultado').textContent = 'Conta criada.';
  });

  email.addEventListener('input', () => {
    erro.textContent = '';
    email.removeAttribute('aria-invalid');
  });
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-24-desabilitado',
        type: 'multiple-choice',
        prompt: 'O botão "Criar conta" começa desabilitado e só liga quando todos os campos estão válidos. Qual é o problema?',
        concepts: ['ui-formularios'],
        difficulty: 'intermediario',
        tags: ['ui', 'formularios'],
        options: [
          'Nenhum; evita envios inválidos',
          'A pessoa clica, nada acontece e ela não sabe por quê — deixe clicar e mostre os erros, com o foco no primeiro',
          'Botões desabilitados não funcionam em celular',
          'Deveria começar escondido, em vez de desabilitado',
        ],
        correctIndex: 1,
        explanation:
          'Um botão desabilitado não explica nada: a pessoa não sabe qual campo falta, nem se é um bug. Deixar clicar transforma o clique numa pergunta que o formulário responde — com as mensagens de erro no lugar certo. Desabilitar fica para o momento **depois** do clique, enquanto o envio está em andamento.',
        hints: ['O que a pessoa aprende quando clica num botão desabilitado?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Cada campo a mais é gente a menos: peça o essencial. Uma coluna, rótulo em cima e visível, \`type\`, \`inputmode\` e \`autocomplete\` para o teclado e o preenchimento certos. Valide ao sair do campo ou no envio — nunca enquanto a pessoa ainda digita a primeira vez —, mostre o erro embaixo do campo, ligado por \`aria-describedby\`, dizendo o que corrigir, com o foco no primeiro; e nunca apague o que foi digitado. O botão diz o que faz e não começa desabilitado.`,
    },
  ],
};
