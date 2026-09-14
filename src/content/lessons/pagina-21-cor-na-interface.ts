import type { Lesson } from '../types';

import { AJUDANTES_CSS } from './_ajudantes-css';

const AJUDANTES = `${AJUDANTES_CSS}
  function rgbDe(texto) {
    const t = String(texto || '').trim();
    let m = /^#([0-9a-f]{6})$/i.exec(t);
    if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
    m = /^#([0-9a-f]{3})$/i.exec(t);
    if (m) return m[1].split('').map((c) => parseInt(c + c, 16));
    m = /^rgba?\\((\\d+)[,\\s]+(\\d+)[,\\s]+(\\d+)/.exec(t);
    if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
    return null;
  }
  function luminancia(rgb) {
    const [r, g, b] = rgb.map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contraste(a, b) {
    const ra = rgbDe(a), rb = rgbDe(b);
    if (!ra || !rb) return null;
    const la = luminancia(ra), lb = luminancia(rb);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
`;

export const lessonCorNaInterface: Lesson = {
  id: 'lesson-pagina-21',
  trackId: 'track-pagina',
  title: 'Cor na Interface: Significado, Não Decoração',
  language: 'html',
  objective:
    'Usar cor para comunicar estado de forma consistente, manter links e mensagens reconhecíveis sem depender da cor, e oferecer um tema escuro que respeita o contraste.',
  concepts: ['ui-cor'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A aula de cores deu a paleta e o contraste. Esta é sobre o que a cor **diz** numa interface — e sobre as três situações em que ela costuma dizer a coisa errada.

## Cor de estado é um vocabulário

Vermelho é erro e perigo. Verde é sucesso. Âmbar é atenção. Azul ou a cor da marca é informação e ação. Esse vocabulário é quase universal, e a regra é **usá-lo só para isso**: um botão vermelho que não apaga nada, um destaque verde que não é sucesso, confundem — a pessoa aprendeu o código e você o quebrou.

O contrário também vale: cada estado tem **sempre a mesma cor**. Erro é sempre \`--perigo\`, em todo lugar do produto. Se a paleta tem os papéis certos, isso é automático.

## Nunca só a cor

Você já sabe: um em cada doze homens não distingue vermelho de verde. Então todo estado tem **dois sinais**: a cor e outra coisa — um ícone, um texto, um traço.

- Mensagem de erro: cor **e** o texto "Erro:" ou um ícone ✕.
- Campo inválido: borda **e** a mensagem embaixo.
- Gráfico: cores **e** formas ou rótulos diferentes.
- Link: cor **e** sublinhado.

O último é o mais esquecido. Um link só distinguível do texto pela cor é invisível para quem não vê a cor — e para quem está ao sol. \`text-decoration: underline\` no texto corrido, sempre. Em menus e botões, onde o contexto já diz "isto é clicável", o sublinhado pode sair.

## Contraste nos lugares que ninguém mede

Todo mundo mede o texto principal. Quase ninguém mede:

- **O placeholder** dos campos: por padrão vem num cinza de 2:1, e muita gente o usa como rótulo. Placeholder não é rótulo — some quando a pessoa digita. O rótulo é \`<label>\`, fora do campo, com contraste.
- **O texto sobre imagem**: a foto muda, o contraste muda. Um fundo escuro semitransparente por baixo do texto resolve.
- **Ícones sozinhos**: 3:1 contra o fundo, como texto grande.
- **Estados desabilitados**: são a exceção — podem ter contraste baixo, porque "apagado" é o significado.

## Tema escuro: a mesma paleta, outros valores

Se a paleta vive em variáveis, o tema escuro é um bloco:

~~~css
@media (prefers-color-scheme: dark) {
  :root {
    --fundo: #1c1c1a;
    --texto: #f0efe9;
    --texto-suave: #b8b7ae;
    --marca: #7fc3b9;   /* a marca clareia: teal escuro some no fundo escuro */
  }
}
~~~

Dois detalhes que separam um tema escuro bom de um invertido: a marca **clareia** (a cor original desaparece no fundo escuro) e o contraste se mede de novo — branco puro sobre preto puro dá 21:1 e cansa; \`#f0efe9\` sobre \`#1c1c1a\` dá 14.8:1 e descansa.

## Os erros

- Vermelho decorativo, verde que não é sucesso.
- Link sem sublinhado no meio do texto.
- Placeholder no lugar do rótulo.
- Tema escuro que só inverte, com a marca sumindo no fundo.
- Erro que é só uma borda vermelha.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  :root { --fundo: #f7f6f2; --texto: #1c1c1a; --texto-suave: #5f625d; --marca: #1f6660; --perigo: #b42318; --sucesso: #1f7a3f; }
  @media (prefers-color-scheme: dark) {
    :root { --fundo: #1c1c1a; --texto: #f0efe9; --texto-suave: #b8b7ae; --marca: #7fc3b9; --perigo: #ff8a80; --sucesso: #7ddba0; }
  }
  body { background: var(--fundo); color: var(--texto); font-family: system-ui, sans-serif; }
  a { color: var(--marca); text-decoration: underline; }
  label { display: block; }
  .erro { color: var(--perigo); }
  .ok { color: var(--sucesso); }
</style>

<p>Leia os <a href="#">termos de uso</a> antes de continuar.</p>

<label for="email">E-mail</label>
<input id="email" placeholder="voce@exemplo.com">
<p class="erro">✕ Erro: informe um e-mail válido.</p>

<p class="ok">✓ Salvo com sucesso.</p>`,
      caption:
        'O link é sublinhado; o rótulo é um `<label>` e o placeholder é só um exemplo; erro e sucesso têm cor **e** símbolo **e** palavra. O bloco de `prefers-color-scheme` troca os valores da paleta — e clareia a marca. Se o seu sistema está em modo escuro, a pré-visualização já está.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-21-vermelho',
        type: 'multiple-choice',
        prompt: 'Um botão "Ver detalhes" foi pintado de vermelho "para chamar atenção". Qual é o problema?',
        concepts: ['ui-cor'],
        difficulty: 'iniciante',
        tags: ['ui', 'cor'],
        options: [
          'Nenhum; vermelho chama atenção mesmo',
          'Vermelho é o vocabulário de erro e perigo: a pessoa hesita antes de clicar em algo que parece apagar — atenção se dá com hierarquia, não com o código de perigo',
          'Vermelho tem contraste baixo',
          'Botões só podem ter a cor da marca',
        ],
        correctIndex: 1,
        explanation:
          'As pessoas aprenderam que vermelho é "cuidado, isto apaga ou deu errado". Um botão inofensivo em vermelho gasta esse aprendizado: da próxima vez, o "Excluir" vermelho não avisa mais nada. Para destacar uma ação, promova-a na hierarquia — tamanho, posição, a cor da marca —, e deixe o vermelho para o perigo.',
        hints: ['O que a pessoa espera que aconteça ao clicar num botão vermelho?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-21-consertar-sinais',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Três consertos: o link no texto precisa de **sublinhado**; o campo precisa de um `<label for>` de verdade (o placeholder vira só um exemplo); e a mensagem de erro precisa de um segundo sinal além da cor — comece o texto com **Erro:**.',
        concepts: ['ui-cor'],
        difficulty: 'iniciante',
        tags: ['ui', 'cor', 'acessibilidade'],
        initialCode: `<style>
  :root { --marca: #1f6660; --perigo: #b42318; }
  a { color: var(--marca); text-decoration: none; }
  .erro { color: var(--perigo); }
</style>

<p>Leia os <a href="#">termos de uso</a> antes de continuar.</p>

<input id="email" placeholder="E-mail">
<p class="erro">informe um e-mail válido</p>
`,
        tests: [
          {
            description: 'o link no texto é sublinhado',
            assertion: `
              const td = getComputedStyle(document.querySelector('a')).textDecorationLine || getComputedStyle(document.querySelector('a')).textDecoration;
              if (!/underline/.test(td)) throw new Error('Um link no meio do texto precisa de text-decoration: underline — cor sozinha não basta para quem não a vê. Veio "' + td + '".');
            `,
          },
          {
            description: 'o campo tem um rótulo de verdade',
            assertion: `
              const campo = document.querySelector('#email');
              if (!campo.labels || campo.labels.length === 0 || !campo.labels[0].textContent.trim()) throw new Error('Placeholder não é rótulo: some ao digitar. Acrescente <label for="email">E-mail</label>.');
            `,
          },
          {
            description: 'o erro tem um segundo sinal além da cor',
            assertion: `
              const e = document.querySelector('.erro').textContent.trim();
              if (!/^Erro:/.test(e)) throw new Error('A mensagem de erro precisa começar com "Erro:" — um sinal que não depende de enxergar vermelho. Veio "' + e + '".');
            `,
          },
        ],
        hints: [
          'No CSS, `text-decoration: underline` no `a`.',
          'No HTML, um `<label for="email">E-mail</label>` antes do campo, e "Erro: " no começo da mensagem.',
        ],
        solution: `<style>
  :root { --marca: #1f6660; --perigo: #b42318; }
  a { color: var(--marca); text-decoration: underline; }
  .erro { color: var(--perigo); }
</style>

<p>Leia os <a href="#">termos de uso</a> antes de continuar.</p>

<label for="email">E-mail</label>
<input id="email" placeholder="voce@exemplo.com">
<p class="erro">Erro: informe um e-mail válido.</p>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-21-lacuna-estados',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt: 'Complete o vocabulário: cada mensagem com a variável do seu papel, e o símbolo que acompanha a cor.',
        concepts: ['ui-cor'],
        difficulty: 'iniciante',
        tags: ['ui', 'cor'],
        template: `<style>
  :root { --perigo: #b42318; --sucesso: #1f7a3f; --atencao: #92400e; }
  .erro { color: var({{1}}); }
  .salvo { color: var({{2}}); }
  .aviso { color: var({{3}}); }
</style>

<p class="erro">✕ Erro: o pagamento foi recusado.</p>
<p class="salvo">✓ Salvo com sucesso.</p>
<p class="aviso">⚠ Atenção: sua sessão expira em 2 minutos.</p>`,
        blanks: [
          { placeholder: 'papel', size: 9 },
          { placeholder: 'papel', size: 9 },
          { placeholder: 'papel', size: 9 },
        ],
        tests: [
          {
            description: 'cada mensagem usa a variável do seu papel',
            assertion: `${AJUDANTES}
              const pares = [['.erro', '--perigo'], ['.salvo', '--sucesso'], ['.aviso', '--atencao']];
              for (const [sel, v] of pares) {
                const c = declarado(sel, 'color');
                if (!c.includes('var(' + v + ')')) throw new Error(sel + ' precisa usar var(' + v + '); veio "' + c + '". Cada estado tem sempre a mesma cor, em todo lugar.');
              }
            `,
          },
        ],
        hints: ['Erro é perigo, salvo é sucesso, "sua sessão expira" é atenção.'],
        solution: ['--perigo', '--sucesso', '--atencao'],
        explanation:
          'Três papéis, três variáveis, e cada mensagem com o símbolo e a palavra que dizem o mesmo que a cor. Com a paleta assim, o vocabulário é consistente por construção: não existe um erro em laranja em alguma tela esquecida, porque não existe "laranja" — existe `--perigo`.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-21-ordenar-escuro',
        type: 'order-steps',
        prompt: 'Como montar um tema escuro que funciona. Coloque na ordem.',
        concepts: ['ui-cor'],
        difficulty: 'intermediario',
        tags: ['ui', 'cor'],
        steps: [
          { id: 'paleta', text: 'Ter a paleta em variáveis em `:root`, e nenhum hex solto no CSS', ordem: 1 },
          { id: 'media', text: 'Abrir um `@media (prefers-color-scheme: dark)` que redeclara as variáveis', ordem: 2 },
          { id: 'fundo', text: 'Fundo escuro que não é preto puro, texto claro que não é branco puro', ordem: 3 },
          { id: 'marca', text: 'Clarear a marca e as cores de estado, que somem no fundo escuro', ordem: 4 },
          { id: 'medir', text: 'Medir o contraste de cada par de novo, no escuro', ordem: 5 },
        ],
        explanation:
          'Sem o primeiro passo, os outros não existem — um tema escuro num CSS cheio de hex solto é reescrever tudo. E o último é o que a maioria pula: o contraste que passava no claro não vale no escuro, porque **os pares mudaram**. A marca clareada precisa ser medida contra o fundo novo.',
        hints: [
          'Um tema é uma troca de valores; a troca precisa de variáveis para trocar.',
          'O contraste se mede por último, sobre os pares finais.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-21-tema-escuro',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Acrescente o tema escuro: um `@media (prefers-color-scheme: dark)` que redeclara `--fundo`, `--texto` e `--marca` em `:root`. O texto precisa ter contraste de pelo menos **4.5:1** com o fundo escuro, e a marca precisa **clarear** (mais clara que `#1f6660`) para não sumir.',
        concepts: ['ui-cor'],
        difficulty: 'intermediario',
        tags: ['ui', 'cor'],
        initialCode: `<style>
  :root {
    --fundo: #f7f6f2;
    --texto: #1c1c1a;
    --marca: #1f6660;
  }

  /* @media (prefers-color-scheme: dark) { :root { … } } */

  body { background: var(--fundo); color: var(--texto); font-family: system-ui, sans-serif; }
  a { color: var(--marca); }
</style>

<h1>Tema</h1>
<p>Este texto e este <a href="#">link</a> precisam funcionar nos dois temas.</p>
`,
        tests: [
          {
            description: 'existe um bloco para o tema escuro redeclarando :root',
            assertion: `${AJUDANTES}
              const r = regraEmMedia((t) => /prefers-color-scheme:dark/.test(t), ':root');
              if (!r) throw new Error('Falta @media (prefers-color-scheme: dark) { :root { … } }.');
              for (const v of ['--fundo', '--texto', '--marca']) {
                if (!r.getPropertyValue(v).trim()) throw new Error('No tema escuro, ' + v + ' precisa ser redeclarada.');
              }
            `,
          },
          {
            description: 'o texto escuro tem contraste de 4.5:1 com o fundo escuro',
            assertion: `${AJUDANTES}
              const r = regraEmMedia((t) => /prefers-color-scheme:dark/.test(t), ':root');
              const fundo = r.getPropertyValue('--fundo').trim(), texto = r.getPropertyValue('--texto').trim();
              const c = contraste(texto, fundo);
              if (c === null) throw new Error('Use hexadecimal em --fundo e --texto do tema escuro.');
              if (c < 4.5) throw new Error('No escuro, --texto sobre --fundo dá ' + c.toFixed(1) + ':1; precisa de 4.5:1.');
              if (luminancia(rgbDe(fundo)) > luminancia(rgbDe(texto))) throw new Error('No tema escuro o fundo é escuro e o texto é claro — parece que ficou ao contrário.');
            `,
          },
          {
            description: 'a marca clareou, e contrasta com o fundo escuro',
            assertion: `${AJUDANTES}
              const r = regraEmMedia((t) => /prefers-color-scheme:dark/.test(t), ':root');
              const marca = r.getPropertyValue('--marca').trim(), fundo = r.getPropertyValue('--fundo').trim();
              if (luminancia(rgbDe(marca)) <= luminancia(rgbDe('#1f6660'))) throw new Error('A marca precisa clarear no tema escuro: #1f6660 some num fundo escuro. Veio ' + marca + '.');
              const c = contraste(marca, fundo);
              if (c < 4.5) throw new Error('A marca sobre o fundo escuro dá ' + c.toFixed(1) + ':1; um link precisa de 4.5:1.');
            `,
          },
        ],
        hints: [
          'Copie o bloco `:root` para dentro de `@media (prefers-color-scheme: dark) { … }` e troque os valores.',
          'Fundo `#1c1c1a`, texto `#f0efe9`, marca `#7fc3b9` — todos medidos.',
          '@media (prefers-color-scheme: dark) {\n  :root {\n    --fundo: #1c1c1a;\n    --texto: #f0efe9;\n    --marca: #7fc3b9;\n  }\n}',
        ],
        solution: `<style>
  :root {
    --fundo: #f7f6f2;
    --texto: #1c1c1a;
    --marca: #1f6660;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --fundo: #1c1c1a;
      --texto: #f0efe9;
      --marca: #7fc3b9;
    }
  }

  body { background: var(--fundo); color: var(--texto); font-family: system-ui, sans-serif; }
  a { color: var(--marca); }
</style>

<h1>Tema</h1>
<p>Este texto e este <a href="#">link</a> precisam funcionar nos dois temas.</p>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-21-placeholder',
        type: 'multiple-choice',
        prompt: 'Um formulário usa o placeholder como único rótulo dos campos ("Nome", "E-mail" dentro das caixas). Qual é o problema?',
        concepts: ['ui-cor'],
        difficulty: 'iniciante',
        tags: ['ui', 'cor', 'acessibilidade'],
        options: [
          'Nenhum; fica mais limpo',
          'O placeholder some quando a pessoa digita — ela não sabe mais o que era o campo — e vem num cinza sem contraste; rótulo é <label>, fora do campo',
          'Placeholder só funciona em campos de texto',
          'O problema é só de contraste; basta escurecer o placeholder',
        ],
        correctIndex: 1,
        explanation:
          'Quem preenche cinco campos e volta para conferir o terceiro encontra caixas cheias e nenhum nome. E o placeholder padrão tem uns 2:1 de contraste. Escurecê-lo resolve metade: ele continua sumindo ao digitar. O rótulo é o `<label>`, visível sempre; o placeholder, se existir, é um exemplo do formato.',
        hints: ['O que acontece com o placeholder depois que a pessoa digita?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Cor de estado é um vocabulário — vermelho é perigo, verde é sucesso, âmbar é atenção — usado só para isso e sempre igual. Todo estado tem dois sinais: a cor e um símbolo, palavra ou sublinhado. Contraste se mede também no placeholder (que não é rótulo), no texto sobre imagem e nos ícones. E o tema escuro é a mesma paleta com outros valores: fundo não preto, texto não branco, marca clareada, contraste medido de novo.`,
    },
  ],
};
