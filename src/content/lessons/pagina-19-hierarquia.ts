import type { Lesson } from '../types';

import { AJUDANTES_CSS } from './_ajudantes-css';

const AJUDANTES = `${AJUDANTES_CSS}
  // Tamanho de fonte declarado, em rem, para comparar níveis. px vira rem a 16.
  function tamanhoRem(seletor) {
    const v = declarado(seletor, 'font-size');
    const m = /^(\\d*\\.?\\d+)(rem|px)$/.exec(v);
    if (!m) return null;
    return m[2] === 'px' ? Number(m[1]) / 16 : Number(m[1]);
  }
`;

export const lessonHierarquia: Lesson = {
  id: 'lesson-pagina-19',
  trackId: 'track-pagina',
  title: 'Hierarquia: O que a Tela Diz Primeiro',
  language: 'html',
  objective:
    'Decidir o que a pessoa vê primeiro, segundo e por último — uma ação principal por tela, títulos em escala, grupos por proximidade — e consertar telas em que tudo grita ao mesmo tempo.',
  concepts: ['ui-hierarquia'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Você já sabe montar a página, estilizar e fazer reagir. As oito aulas deste bloco são sobre outra coisa: **decidir** o que vai nela. E a primeira decisão de toda tela é a mesma: **o que a pessoa vê primeiro?**

Ela não lê a tela; ela **varre**. O olho pousa no que é maior, mais escuro, mais contrastante, mais isolado — e só depois, se valer a pena, lê o resto. Hierarquia é organizar a tela para que essa varredura encontre as coisas na ordem certa: a mais importante primeiro.

## Uma ação principal por tela

Toda tela existe para uma coisa. Na tela de pagamento, é pagar; na de cadastro, é criar a conta; na lista, é adicionar. Essa ação é o **botão primário**: o único com fundo forte na cor da marca. Tudo o que não é ela — cancelar, voltar, "saiba mais" — é secundário: contorno, ou só texto.

Três botões primários lado a lado não são três ações importantes; são nenhuma. O olho não sabe para onde ir, e a pessoa hesita. Se duas ações parecem igualmente importantes, uma delas não é.

## Os títulos são uma escala, não decoração

Você viu a escala tipográfica: \`h1\` em \`2rem\`, \`h2\` em \`1.5rem\`, texto em \`1rem\`. O ponto aqui é **usá-la para dizer a estrutura**: o \`h1\` é o assunto da tela, os \`h2\` são as seções, e a diferença entre eles precisa ser visível de longe. Dois níveis com tamanhos parecidos são um nível só.

E um \`h1\` por tela. Se há dois, a tela está tentando ser duas.

## Perto é junto

O olho lê proximidade como relação: coisas próximas pertencem ao mesmo grupo. É a ferramenta mais barata de organização — e a mais ignorada. Rua, número e CEP ficam juntos, com pouco espaço entre eles; o bloco de endereço fica **longe** do bloco de pagamento. O espaço entre grupos deve ser claramente maior que o espaço dentro deles:

~~~css
.campo + .campo { margin-top: 8px; }     /* dentro do grupo */
.grupo + .grupo { margin-top: 32px; }    /* entre grupos */
~~~

Em formulários, o grupo tem uma tag: \`<fieldset>\` com um \`<legend>\`. O leitor de tela anuncia "Endereço, grupo", e o CSS tem o que estilizar.

## Espaço é hierarquia

Quando uma tela parece "cheia", o instinto é acrescentar bordas e caixas para separar. É o contrário: o que separa é **espaço**. Tire bordas, aumente as margens entre grupos, e a tela respira — e as coisas importantes, agora isoladas, aparecem.

## Demover é tão importante quanto promover

Hierarquia não é só destacar; é **rebaixar**. Legendas em cinza suave, ações secundárias sem fundo, metadados em \`0.875rem\`. Se tudo é escuro e grande, nada se destaca. O texto suave da paleta existe para isso.

## O teste do olho semicerrado

Semicerre os olhos até a tela virar borrões. O que ainda se distingue é a hierarquia real: o borrão maior e mais escuro é o que a pessoa vê primeiro. Se o borrão mais forte é o botão "Cancelar", ou se não há borrão nenhum, a hierarquia está errada — e nenhuma cor bonita conserta.

## Os erros

- Três botões primários.
- Dois \`h1\`, ou \`h2\` do tamanho do \`h1\`.
- Mesmo espaço entre tudo: nada está junto de nada.
- Bordas e caixas onde faltava espaço.
- Tudo em negrito, tudo escuro — e nada se destaca.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  :root { --marca: #1f6660; --texto: #1c1c1a; --texto-suave: #5f625d; }
  body { font-family: system-ui, sans-serif; color: var(--texto); line-height: 1.5; max-width: 40rem; }
  h1 { font-size: 2rem; line-height: 1.1; margin: 0 0 4px; }
  h2 { font-size: 1.25rem; margin: 0 0 8px; }
  .legenda { color: var(--texto-suave); margin: 0 0 32px; }
  .grupo + .grupo { margin-top: 32px; }
  .campo + .campo { margin-top: 8px; }
  label { display: block; font-size: 0.875rem; }
  input { display: block; width: 100%; padding: 8px; }
  .acoes { margin-top: 32px; display: flex; gap: 8px; }
  .primario { background: var(--marca); color: white; border: 0; padding: 12px 16px; font-weight: 700; }
  .secundario { background: none; border: 1px solid #cbd5d1; padding: 12px 16px; }
</style>

<h1>Finalizar compra</h1>
<p class="legenda">Confira o endereço e escolha como pagar.</p>

<section class="grupo">
  <h2>Endereço</h2>
  <div class="campo"><label for="rua">Rua</label><input id="rua"></div>
  <div class="campo"><label for="numero">Número</label><input id="numero"></div>
</section>

<section class="grupo">
  <h2>Pagamento</h2>
  <div class="campo"><label for="cartao">Cartão</label><input id="cartao"></div>
</section>

<div class="acoes">
  <button class="primario">Pagar R$ 89,90</button>
  <button class="secundario">Voltar ao carrinho</button>
</div>`,
      caption:
        'Um `h1`, dois `h2` visivelmente menores, uma legenda rebaixada em cinza. Os campos de um grupo a 8px; os grupos a 32px — perto é junto. E um único botão com fundo: pagar. Semicerre os olhos: o borrão mais forte é ele.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-19-primario',
        type: 'multiple-choice',
        prompt:
          'Tela de pagamento com três botões: "Pagar", "Salvar para depois" e "Cancelar". Qual deve ser o primário?',
        concepts: ['ui-hierarquia'],
        difficulty: 'iniciante',
        tags: ['ui', 'hierarquia'],
        options: [
          'Os três, para a pessoa ver todas as opções',
          '"Pagar" e "Cancelar", os dois mais usados',
          'Só "Pagar" — a tela existe para isso; os outros são secundários',
          '"Cancelar", para evitar compras por engano',
        ],
        correctIndex: 2,
        explanation:
          'Toda tela existe para uma ação, e o botão primário é ela. Com dois ou três, o olho não sabe para onde ir e a pessoa hesita. "Cancelar" e "salvar para depois" continuam existindo — como contorno ou texto, visíveis, mas rebaixados. Evitar compras por engano é trabalho da confirmação, não do botão principal.',
        hints: ['Por que a pessoa abriu esta tela?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-19-consertar-botoes',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Conserte a tela: os três botões estão com a classe `primario`. Só **Pagar** pode ser primário; os outros dois recebem `secundario` (e perdem `primario`). O CSS já existe; mexa só no HTML.',
        concepts: ['ui-hierarquia'],
        difficulty: 'iniciante',
        tags: ['ui', 'hierarquia'],
        initialCode: `<style>
  :root { --marca: #1f6660; }
  .acoes { display: flex; gap: 8px; }
  .primario { background: var(--marca); color: white; border: 0; padding: 12px 16px; font-weight: 700; }
  .secundario { background: none; border: 1px solid #cbd5d1; padding: 12px 16px; }
</style>

<h1>Finalizar compra</h1>

<div class="acoes">
  <button class="primario">Cancelar</button>
  <button class="primario">Salvar para depois</button>
  <button class="primario">Pagar R$ 89,90</button>
</div>
`,
        tests: [
          {
            description: 'há um único botão primário',
            assertion: `
              const n = document.querySelectorAll('.primario').length;
              if (n !== 1) throw new Error('Uma ação principal por tela: exatamente um .primario. Há ' + n + '.');
            `,
          },
          {
            description: 'o primário é o Pagar',
            assertion: `
              const p = document.querySelector('.primario');
              if (!/Pagar/.test(p.textContent)) throw new Error('O primário precisa ser o botão de pagar; é "' + p.textContent.trim() + '".');
            `,
          },
          {
            description: 'os outros dois continuam visíveis, como secundários',
            assertion: `
              const sec = [...document.querySelectorAll('.secundario')].map((b) => b.textContent.trim());
              if (sec.length !== 2) throw new Error('Cancelar e Salvar para depois continuam na tela, com a classe secundario. Encontrei ' + sec.length + '.');
              for (const b of document.querySelectorAll('.secundario')) if (b.classList.contains('primario')) throw new Error('Um botão não pode ser primario e secundario ao mesmo tempo.');
            `,
          },
        ],
        hints: [
          'Mexa nas classes dos botões, não no CSS.',
          'Dois trocam `primario` por `secundario`; um fica.',
        ],
        solution: `<style>
  :root { --marca: #1f6660; }
  .acoes { display: flex; gap: 8px; }
  .primario { background: var(--marca); color: white; border: 0; padding: 12px 16px; font-weight: 700; }
  .secundario { background: none; border: 1px solid #cbd5d1; padding: 12px 16px; }
</style>

<h1>Finalizar compra</h1>

<div class="acoes">
  <button class="secundario">Cancelar</button>
  <button class="secundario">Salvar para depois</button>
  <button class="primario">Pagar R$ 89,90</button>
</div>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-19-lacuna-escala',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete a escala e o espaçamento: o `h1` bem maior que o `h2`, a legenda rebaixada com a cor suave, e os grupos mais afastados entre si do que os campos dentro deles.',
        concepts: ['ui-hierarquia'],
        difficulty: 'iniciante',
        tags: ['ui', 'hierarquia'],
        template: `<style>
  :root { --texto: #1c1c1a; --texto-suave: #5f625d; }
  body { color: var(--texto); }
  h1 { font-size: {{1}}; }
  h2 { font-size: 1.25rem; }
  .legenda { color: var({{2}}); }
  .campo + .campo { margin-top: 8px; }
  .grupo + .grupo { margin-top: {{3}}; }
</style>

<h1>Finalizar compra</h1>
<p class="legenda">Confira e pague.</p>
<section class="grupo"><h2>Endereço</h2><div class="campo">Rua</div><div class="campo">Número</div></section>
<section class="grupo"><h2>Pagamento</h2><div class="campo">Cartão</div></section>`,
        blanks: [
          { placeholder: 'tamanho', size: 6 },
          { placeholder: 'variável', size: 12 },
          { placeholder: 'espaço', size: 5 },
        ],
        tests: [
          {
            description: 'o h1 é claramente maior que o h2',
            assertion: `${AJUDANTES}
              const h1 = tamanhoRem('h1'), h2 = tamanhoRem('h2');
              if (h1 === null) throw new Error('O font-size do h1 precisa ser um valor em rem (por exemplo 2rem).');
              if (h1 < h2 * 1.4) throw new Error('O h1 precisa ser visivelmente maior que o h2 (1.25rem): pelo menos uns 1.75rem. Veio ' + h1 + 'rem.');
            `,
          },
          {
            description: 'a legenda está rebaixada com a cor suave',
            assertion: `${AJUDANTES}
              const v = declarado('.legenda', 'color');
              if (!/var\\(--texto-suave\\)/.test(v)) throw new Error('A legenda é secundária: color: var(--texto-suave). Veio "' + v + '".');
            `,
          },
          {
            description: 'o espaço entre grupos é bem maior que o espaço dentro deles',
            assertion: `${AJUDANTES}
              const v = declarado('.grupo + .grupo', 'margin-top');
              const px = /^(\\d*\\.?\\d+)px$/.test(v) ? Number(v.replace('px', '')) : (/^(\\d*\\.?\\d+)rem$/.test(v) ? Number(v.replace('rem', '')) * 16 : null);
              if (px === null || px < 24) throw new Error('Entre grupos, o espaço precisa ser claramente maior que os 8px de dentro: 24px ou mais (32px é a medida da aula). Veio "' + (v || '(nada)') + '".');
            `,
          },
        ],
        hints: [
          'A escala da aula de tipografia: o h1 é o dobro do texto corrido.',
          'A variável da paleta para texto secundário; e quatro vezes o espaço de dentro do grupo, em px.',
        ],
        solution: ['2rem', '--texto-suave', '32px'],
        explanation:
          'Três decisões que o olho lê antes de qualquer palavra: o `h1` em 2rem contra 1.25rem do `h2` diz "isto é o assunto, aquilo é uma seção"; a legenda em cinza suave diz "leia depois"; e 32px entre grupos contra 8px dentro deles diz "rua e número são uma coisa; endereço e pagamento são duas".',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-19-ordenar-decisao',
        type: 'order-steps',
        prompt: 'Como decidir a hierarquia de uma tela nova. Coloque na ordem.',
        concepts: ['ui-hierarquia'],
        difficulty: 'intermediario',
        tags: ['ui', 'hierarquia'],
        steps: [
          { id: 'uma', text: 'Descobrir a única coisa que a pessoa veio fazer nesta tela', ordem: 1 },
          { id: 'promover', text: 'Fazer dessa coisa o elemento mais visível: o botão primário, o h1', ordem: 2 },
          { id: 'agrupar', text: 'Juntar o que pertence junto, com pouco espaço dentro e muito entre os grupos', ordem: 3 },
          { id: 'rebaixar', text: 'Rebaixar o resto: cor suave, sem fundo, tamanho menor', ordem: 4 },
          { id: 'testar', text: 'Semicerrar os olhos e conferir se o borrão mais forte é a ação principal', ordem: 5 },
        ],
        explanation:
          'A ordem começa por uma pergunta, não por um estilo — e a maioria das telas ruins nasce de pular o primeiro passo. Promover e rebaixar são o mesmo movimento visto de dois lados: um botão só se destaca se os outros foram rebaixados. O teste do fim é o que pega o erro quando o CSS parecia certo.',
        hints: [
          'Antes de destacar qualquer coisa, é preciso saber o que destacar.',
          'O teste só faz sentido depois de tudo decidido.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-19-agrupar',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Os cinco campos estão soltos, todos com o mesmo espaço. Agrupe-os: um `<fieldset>` com `<legend>` **Endereço** contendo rua, número e CEP, e outro com `<legend>` **Pagamento** contendo cartão e validade. O CSS dos grupos já existe.',
        concepts: ['ui-hierarquia'],
        difficulty: 'intermediario',
        tags: ['ui', 'hierarquia'],
        initialCode: `<style>
  fieldset { border: 0; padding: 0; margin: 0; }
  fieldset + fieldset { margin-top: 32px; }
  legend { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; }
  label { display: block; margin-top: 8px; }
</style>

<h1>Finalizar compra</h1>

<label>Rua <input name="rua"></label>
<label>Número <input name="numero"></label>
<label>CEP <input name="cep"></label>
<label>Cartão <input name="cartao"></label>
<label>Validade <input name="validade"></label>
`,
        tests: [
          {
            description: 'há um grupo Endereço com rua, número e CEP',
            assertion: `
              const grupos = [...document.querySelectorAll('fieldset')];
              const endereco = grupos.find((f) => f.querySelector('legend') && /Endereço/.test(f.querySelector('legend').textContent));
              if (!endereco) throw new Error('Falta um <fieldset> com <legend>Endereço</legend>.');
              for (const nome of ['rua', 'numero', 'cep']) {
                if (!endereco.querySelector('[name="' + nome + '"]')) throw new Error('O campo ' + nome + ' precisa estar dentro do fieldset Endereço.');
              }
            `,
          },
          {
            description: 'há um grupo Pagamento com cartão e validade',
            assertion: `
              const grupos = [...document.querySelectorAll('fieldset')];
              const pagamento = grupos.find((f) => f.querySelector('legend') && /Pagamento/.test(f.querySelector('legend').textContent));
              if (!pagamento) throw new Error('Falta um <fieldset> com <legend>Pagamento</legend>.');
              for (const nome of ['cartao', 'validade']) {
                if (!pagamento.querySelector('[name="' + nome + '"]')) throw new Error('O campo ' + nome + ' precisa estar dentro do fieldset Pagamento.');
              }
              if (pagamento.querySelector('[name="cep"]')) throw new Error('CEP é endereço, não pagamento.');
            `,
          },
          {
            description: 'nenhum campo ficou solto fora de um grupo',
            assertion: `
              for (const input of document.querySelectorAll('input')) {
                if (!input.closest('fieldset')) throw new Error('O campo ' + input.name + ' ficou fora de qualquer fieldset.');
              }
            `,
            hidden: true,
          },
        ],
        hints: [
          '`<fieldset><legend>Endereço</legend> …os três labels… </fieldset>`.',
          'A legenda é o primeiro filho do fieldset; o CSS já afasta um fieldset do outro.',
          '<fieldset>\n  <legend>Endereço</legend>\n  <label>Rua <input name="rua"></label>\n  <label>Número <input name="numero"></label>\n  <label>CEP <input name="cep"></label>\n</fieldset>\n<fieldset>\n  <legend>Pagamento</legend>\n  <label>Cartão <input name="cartao"></label>\n  <label>Validade <input name="validade"></label>\n</fieldset>',
        ],
        solution: `<style>
  fieldset { border: 0; padding: 0; margin: 0; }
  fieldset + fieldset { margin-top: 32px; }
  legend { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; }
  label { display: block; margin-top: 8px; }
</style>

<h1>Finalizar compra</h1>

<fieldset>
  <legend>Endereço</legend>
  <label>Rua <input name="rua"></label>
  <label>Número <input name="numero"></label>
  <label>CEP <input name="cep"></label>
</fieldset>

<fieldset>
  <legend>Pagamento</legend>
  <label>Cartão <input name="cartao"></label>
  <label>Validade <input name="validade"></label>
</fieldset>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-19-cheia',
        type: 'multiple-choice',
        prompt: 'A tela "parece cheia demais". Qual é o primeiro conserto a tentar?',
        concepts: ['ui-hierarquia'],
        difficulty: 'iniciante',
        tags: ['ui', 'hierarquia'],
        options: [
          'Pôr cada seção dentro de um cartão com borda, para separar',
          'Aumentar o espaço entre os grupos e tirar bordas — o que separa é espaço',
          'Diminuir a fonte para caber mais',
          'Colorir cada seção de uma cor',
        ],
        correctIndex: 1,
        explanation:
          'Bordas e cartões acrescentam linhas a uma tela que já tem coisa demais. Espaço faz o contrário: separa sem acrescentar nada, e ainda isola o que importa. Fonte menor piora a leitura, e cor por seção cria uma hierarquia falsa — tudo passa a gritar em cores diferentes.',
        hints: ['O que separa dois grupos numa tela: uma linha entre eles, ou o vazio entre eles?'],
      },
    },
    {
      kind: 'summary',
      markdown: `A pessoa varre, não lê: hierarquia é organizar a tela para a varredura achar as coisas na ordem certa. Uma ação principal por tela — um botão com fundo, o resto rebaixado. Títulos em escala, com um único \`h1\`. Perto é junto: pouco espaço dentro dos grupos, muito entre eles, e \`<fieldset>\` para formulários. Espaço no lugar de bordas. E o teste do olho semicerrado no fim.`,
    },
  ],
};
