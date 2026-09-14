import type { Lesson } from '../types';

import { AJUDANTES_CSS } from './_ajudantes-css';

/**
 * Cor é onde os dois motores mais divergem, e os testes foram escritos com
 * isso medido: o jsdom não resolve `var(--x)` no estilo computado (devolve o
 * texto "var(--x)"), mas expõe as variáveis na folha de estilo; e os dois
 * normalizam cores literais para `rgb()`. Então: o que passa por variável é
 * lido na folha (`declarado`), e o contraste é calculado sobre hex declarado
 * ou sobre `rgb()` computado — nunca sobre um `var()`.
 */
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
    const [r, g, b] = rgb.map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contraste(a, b) {
    const ra = rgbDe(a), rb = rgbDe(b);
    if (!ra || !rb) return null;
    const la = luminancia(ra), lb = luminancia(rb);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
`;

export const lessonCores: Lesson = {
  id: 'lesson-pagina-7',
  trackId: 'track-pagina',
  title: 'Cores: Uma Paleta com Papéis',
  language: 'html',
  objective:
    'Montar uma paleta pequena em que cada cor tem um papel, guardá-la em variáveis, e garantir que todo texto tem contraste para ser lido.',
  concepts: ['css-cores'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Cor é a decisão mais visível de uma página e a que menos precisa de talento: existem regras, e elas são poucas.

## Como se escreve uma cor

Três formatos, o mesmo resultado:

- \`#1f6660\` — **hexadecimal**: dois dígitos para vermelho, dois para verde, dois para azul. É o formato que você mais vai ler em código alheio.
- \`rgb(31 102 96)\` — os mesmos três canais, em decimal, de 0 a 255.
- \`hsl(172 53% 26%)\` — **matiz** (o "nome" da cor, em graus), **saturação** (quão viva) e **luminosidade** (quão clara). É o formato em que se **pensa**: para uma versão mais escura da mesma cor, baixe a luminosidade e pronto.

Um quarto valor, opcional, é a opacidade: \`rgb(31 102 96 / 0.5)\`.

## Uma paleta é uma lista de papéis

O erro de quem começa é escolher cores. O certo é escolher **papéis**, e dar uma cor a cada um:

| Papel | Para quê | Exemplo |
| --- | --- | --- |
| fundo | a página | \`#f7f6f2\` |
| superfície | cartões, sobre o fundo | \`#ffffff\` |
| texto | o texto corrido | \`#1c1c1a\` |
| texto suave | legendas, ajuda | \`#5f625d\` |
| marca | a ação principal, links | \`#1f6660\` |
| perigo | erros, o que apaga | \`#b42318\` |
| sucesso | acertos, o que salvou | \`#1f7a3f\` |

Sete papéis bastam para um produto inteiro. Cada vez que você quiser uma cor nova, pergunte primeiro: **que papel é este?** Se já existe um, use a cor dele.

## Guarde a paleta em variáveis

CSS tem variáveis — chamam-se **propriedades personalizadas**, começam com dois hífens, e vivem em \`:root\` para valerem na página inteira:

~~~css
:root {
  --fundo: #f7f6f2;
  --texto: #1c1c1a;
  --marca: #1f6660;
  --marca-escura: #164d48;
}

body   { background: var(--fundo); color: var(--texto); }
.botao { background: var(--marca); color: white; }
.botao:hover { background: var(--marca-escura); }
~~~

\`var(--marca)\` lê a variável. A vantagem não é só não repetir: quando a marca mudar de cor, muda-se **uma linha**, e cada botão, link e borda acompanha. É também o que torna um tema escuro possível — outro \`:root\` com outros valores, e o resto do CSS nem fica sabendo.

## Contraste: a regra que não se negocia

Texto precisa se destacar do fundo, e "destacar" tem número: a razão de contraste, de 1:1 (invisível) a 21:1 (preto no branco). A regra de acessibilidade pede **pelo menos 4.5:1** para texto normal, e 3:1 para texto grande. Cinza claro sobre branco — \`#b8b8b8\` em \`#ffffff\` — dá 2.0:1: bonito na maquete, ilegível no sol. \`#5f625d\` no mesmo branco dá 6.2:1.

Não é preciso calcular de cabeça: qualquer ferramenta de contraste diz o número. O que é preciso é **conferir**, sempre que escolher um par texto/fundo.

## Cor nunca é o único sinal

Cerca de um em cada doze homens não distingue vermelho de verde. Um campo de formulário que só fica com borda vermelha para dizer "erro" é invisível para eles — e para quem está numa tela mal calibrada, ou ao sol. A cor **reforça**; o sinal é o texto ("Preencha o e-mail") ou um ícone. Vale para "vermelho é erro", "verde é sucesso" e "azul é link".

## Os erros

- Cinza claro sobre branco porque "fica elegante". Meça o contraste.
- Vinte cores porque cada tela pediu uma. Sete papéis; o resto é variação de luminosidade.
- Cor como único sinal de estado.
- Hex repetido em quarenta lugares, e a marca muda de tom num trabalho de uma tarde.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  :root {
    --fundo: #f7f6f2;
    --superficie: #ffffff;
    --texto: #1c1c1a;
    --texto-suave: #5f625d;
    --marca: #1f6660;
    --marca-escura: #164d48;
    --perigo: #b42318;
  }

  body { background: var(--fundo); color: var(--texto); font-family: system-ui, sans-serif; }

  .cartao { background: var(--superficie); padding: 16px; border: 1px solid #ddd; }
  .legenda { color: var(--texto-suave); font-size: 0.875rem; }

  .botao { background: var(--marca); color: white; padding: 12px 16px; border: 0; }
  .botao:hover { background: var(--marca-escura); }

  .erro { color: var(--perigo); }
</style>

<div class="cartao">
  <h2>Cadastro</h2>
  <p class="legenda">Leva menos de um minuto.</p>
  <p class="erro">✕ Preencha o e-mail para continuar.</p>
  <button class="botao">Criar conta</button>
</div>`,
      caption:
        'Sete papéis em `:root`, e nenhum hex fora dali. O erro tem cor **e** um símbolo com texto; o botão tem estado de hover na versão escura da mesma marca. Se a marca mudar, muda-se uma linha.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-7-contraste',
        type: 'multiple-choice',
        prompt: 'Qual destes pares de texto e fundo passa na regra de contraste para texto normal (4.5:1)?',
        concepts: ['css-cores'],
        difficulty: 'iniciante',
        tags: ['css', 'cores'],
        options: [
          '`#b8b8b8` sobre `#ffffff` (cinza claro no branco)',
          '`#5f625d` sobre `#ffffff` (cinza escuro no branco)',
          '`#1f6660` sobre `#164d48` (marca sobre a marca escura)',
          '`#ffffff` sobre `#f7f6f2` (branco no quase branco)',
        ],
        correctIndex: 1,
        explanation:
          'Cinza escuro no branco dá 6.2:1 — passa com folga. O cinza claro dá 2.0:1: é o "elegante" ilegível. Marca sobre marca escura são duas cores parecidas (1.4:1), e branco no quase branco nem chega a 1.1:1. O olho engana; o número, não — meça sempre.',
        hints: ['Contraste é distância entre claro e escuro. Qual par tem a maior distância?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-7-paleta',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Monte a paleta em `:root` com quatro variáveis em hexadecimal — `--fundo`, `--texto`, `--marca` e `--marca-escura` — e use-as: o `body` com o fundo e o texto da paleta, o `.botao` com a marca no fundo.\n\nO texto precisa ter contraste de pelo menos **4.5:1** com o fundo. Os valores da tabela da aula servem.',
        concepts: ['css-cores'],
        difficulty: 'iniciante',
        tags: ['css', 'cores'],
        initialCode: `<style>
  :root {
    /* --fundo, --texto, --marca, --marca-escura */
  }

  body {
    font-family: system-ui, sans-serif;
    /* fundo e texto da paleta */
  }

  .botao {
    color: white;
    padding: 12px 16px;
    border: 0;
    /* a marca */
  }
</style>

<h1>Minha loja</h1>
<p>Uma página com paleta.</p>
<button class="botao">Comprar</button>
`,
        tests: [
          {
            description: ':root define as quatro variáveis, em hexadecimal',
            assertion: `${AJUDANTES}
              for (const nome of ['--fundo', '--texto', '--marca', '--marca-escura']) {
                const v = declarado(':root', nome);
                if (!v) throw new Error('Falta a variável ' + nome + ' em :root.');
                if (!rgbDe(v) || !/^#/.test(v)) throw new Error(nome + ' precisa ser uma cor em hexadecimal (#rrggbb). Veio "' + v + '".');
              }
            `,
          },
          {
            description: 'o body usa o fundo e o texto da paleta',
            assertion: `${AJUDANTES}
              const bg = declarado('body', 'background') || declarado('body', 'background-color');
              const cor = declarado('body', 'color');
              if (!/var\\(--fundo\\)/.test(bg)) throw new Error('O fundo do body precisa vir da paleta: background: var(--fundo). Veio "' + (bg || '(nada)') + '".');
              if (!/var\\(--texto\\)/.test(cor)) throw new Error('A cor do texto do body precisa vir da paleta: color: var(--texto). Veio "' + (cor || '(nada)') + '".');
            `,
          },
          {
            description: 'o botão usa a marca',
            assertion: `${AJUDANTES}
              const bg = declarado('.botao', 'background') || declarado('.botao', 'background-color');
              if (!/var\\(--marca\\)/.test(bg)) throw new Error('O fundo do botão é a marca: background: var(--marca). Veio "' + (bg || '(nada)') + '".');
            `,
          },
          {
            description: 'o texto tem contraste de pelo menos 4.5:1 com o fundo',
            assertion: `${AJUDANTES}
              const c = contraste(declarado(':root', '--texto'), declarado(':root', '--fundo'));
              if (c === null) throw new Error('Não consegui ler --texto e --fundo como cores hexadecimais.');
              if (c < 4.5) throw new Error('O contraste entre --texto e --fundo é ' + c.toFixed(1) + ':1; a regra pede 4.5:1. Escureça o texto ou clareie o fundo.');
            `,
          },
          {
            description: 'nenhum hex solto fora de :root',
            assertion: `${AJUDANTES}
              for (const sel of ['body', '.botao']) {
                const r = regraBase(sel);
                if (r && /#[0-9a-f]{3,6}\\b/i.test(r.cssText)) throw new Error('A regra ' + sel + ' tem uma cor em hex solta; toda cor sai da paleta, por var().');
              }
            `,
            hidden: true,
          },
        ],
        hints: [
          'Variáveis começam com dois hífens e ficam em `:root`; para usar, `var(--nome)`.',
          'Os valores da tabela da aula já foram medidos: `#f7f6f2`, `#1c1c1a`, `#1f6660`, `#164d48`.',
          ':root {\n  --fundo: #f7f6f2;\n  --texto: #1c1c1a;\n  --marca: #1f6660;\n  --marca-escura: #164d48;\n}\nbody { background: var(--fundo); color: var(--texto); }\n.botao { background: var(--marca); }',
        ],
        solution: `<style>
  :root {
    --fundo: #f7f6f2;
    --texto: #1c1c1a;
    --marca: #1f6660;
    --marca-escura: #164d48;
  }

  body {
    font-family: system-ui, sans-serif;
    background: var(--fundo);
    color: var(--texto);
  }

  .botao {
    color: white;
    padding: 12px 16px;
    border: 0;
    background: var(--marca);
  }
</style>

<h1>Minha loja</h1>
<p>Uma página com paleta.</p>
<button class="botao">Comprar</button>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-7-lacuna-estados',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete com o **nome da variável** certa em cada lugar: o fundo da página, o botão ao passar o mouse, e a cor da mensagem de sucesso.',
        concepts: ['css-cores'],
        difficulty: 'iniciante',
        tags: ['css', 'cores'],
        template: `<style>
  :root {
    --fundo: #f7f6f2;
    --texto: #1c1c1a;
    --marca: #1f6660;
    --marca-escura: #164d48;
    --sucesso: #1f7a3f;
  }

  body { background: var({{1}}); color: var(--texto); }

  .botao { background: var(--marca); color: white; }
  .botao:hover { background: var({{2}}); }

  .salvo { color: var({{3}}); }
</style>

<p class="salvo">✓ Alterações salvas.</p>
<button class="botao">Salvar</button>`,
        blanks: [
          { placeholder: 'a página', size: 8 },
          { placeholder: 'ao passar o mouse', size: 14 },
          { placeholder: 'deu certo', size: 9 },
        ],
        tests: [
          {
            description: 'o fundo da página vem de --fundo',
            assertion: `${AJUDANTES}
              const v = declarado('body', 'background') || declarado('body', 'background-color');
              if (!/var\\(--fundo\\)/.test(v)) throw new Error('O papel "fundo da página" é a variável --fundo. Veio "' + v + '".');
            `,
          },
          {
            description: 'ao passar o mouse, o botão escurece',
            assertion: `${AJUDANTES}
              const v = declarado('.botao:hover', 'background') || declarado('.botao:hover', 'background-color');
              if (!/var\\(--marca-escura\\)/.test(v)) throw new Error('O hover é a versão escura da mesma marca: --marca-escura. Veio "' + v + '".');
            `,
          },
          {
            description: 'a mensagem de sucesso usa o papel sucesso',
            assertion: `${AJUDANTES}
              const v = declarado('.salvo', 'color');
              if (!/var\\(--sucesso\\)/.test(v)) throw new Error('"Deu certo" é o papel sucesso: --sucesso. Veio "' + v + '".');
            `,
          },
        ],
        hints: [
          'Cada lacuna é um nome que já está declarado em `:root`, com os dois hífens.',
          'Hover não é uma cor nova: é a mesma marca, mais escura.',
        ],
        solution: ['--fundo', '--marca-escura', '--sucesso'],
        explanation:
          'Três papéis, três variáveis — e nenhuma cor decidida na hora. O hover em particular: não se inventa um tom novo para o botão pressionado; usa-se a variação escura da mesma marca, que já existe na paleta para isso. Se um dia a marca mudar, o hover muda junto.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-7-ordenar-variavel',
        type: 'order-steps',
        prompt:
          'Como `var(--marca)` vira uma cor na tela. Coloque na ordem.',
        concepts: ['css-cores'],
        difficulty: 'intermediario',
        tags: ['css', 'cores'],
        steps: [
          { id: 'declara', text: '`:root { --marca: #1f6660 }` declara a variável no elemento raiz', ordem: 1 },
          { id: 'herda', text: 'Como qualquer propriedade herdável, `--marca` desce da raiz para todos os descendentes', ordem: 2 },
          { id: 'pede', text: '`.botao { background: var(--marca) }` pede o valor da variável', ordem: 3 },
          { id: 'resolve', text: 'O navegador substitui `var(--marca)` pelo valor herdado e calcula a cor', ordem: 4 },
          { id: 'muda', text: 'Se `--marca` for redeclarada (um tema escuro, por exemplo), tudo que a usa muda junto', ordem: 5 },
        ],
        explanation:
          'Variáveis de CSS são propriedades comuns que se herdam: declarar em `:root` é o que faz o valor chegar a qualquer elemento. E como a substituição acontece na hora de calcular o estilo, redeclarar a variável num escopo — `.tema-escuro { --marca: … }` — muda todos os `var(--marca)` dali para dentro sem tocar em nenhuma regra. É o mecanismo de todo tema.',
        hints: [
          'Primeiro alguém precisa dizer o que `--marca` vale.',
          'A variável precisa chegar ao botão antes de o botão poder pedi-la.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-7-consertar-contraste',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'A legenda está em `#b8b8b8` sobre branco: 2.0:1, ilegível. Troque a cor de `.legenda` por uma que tenha **pelo menos 4.5:1** de contraste com o branco — e que continue **mais clara** que o texto principal, porque é uma legenda.',
        concepts: ['css-cores'],
        difficulty: 'intermediario',
        tags: ['css', 'cores'],
        initialCode: `<style>
  body { background: #ffffff; color: #1c1c1a; font-family: system-ui, sans-serif; }
  .legenda { color: #b8b8b8; font-size: 0.875rem; }
</style>

<h2>Cadastro</h2>
<p class="legenda">Leva menos de um minuto, e você pode cancelar quando quiser.</p>
`,
        tests: [
          {
            description: 'a legenda tem contraste de pelo menos 4.5:1 com o branco',
            assertion: `${AJUDANTES}
              const el = document.querySelector('.legenda');
              if (!el) throw new Error('O elemento .legenda sumiu.');
              const c = contraste(getComputedStyle(el).color, '#ffffff');
              if (c === null) throw new Error('Não consegui ler a cor da legenda.');
              if (c < 4.5) throw new Error('O contraste da legenda com o branco é ' + c.toFixed(1) + ':1; precisa de 4.5:1. Escureça a cor.');
            `,
          },
          {
            description: 'a legenda continua mais clara que o texto principal',
            assertion: `${AJUDANTES}
              const legenda = rgbDe(getComputedStyle(document.querySelector('.legenda')).color);
              const texto = rgbDe('#1c1c1a');
              if (luminancia(legenda) <= luminancia(texto)) throw new Error('Passou do ponto: a legenda ficou tão escura quanto o texto principal (ou mais). Uma legenda é mais clara — algo como #5f625d.');
            `,
          },
        ],
        hints: [
          'Mais escuro que #b8b8b8, mais claro que #1c1c1a. O cinza da tabela da aula está nessa faixa.',
          'Se você preferir calcular: um cinza de #767676 já dá 4.5:1 exatos com o branco; abaixo dele (mais escuro), passa com folga.',
          '.legenda { color: #5f625d; font-size: 0.875rem; }',
        ],
        solution: `<style>
  body { background: #ffffff; color: #1c1c1a; font-family: system-ui, sans-serif; }
  .legenda { color: #5f625d; font-size: 0.875rem; }
</style>

<h2>Cadastro</h2>
<p class="legenda">Leva menos de um minuto, e você pode cancelar quando quiser.</p>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-7-so-cor',
        type: 'multiple-choice',
        prompt:
          'Um campo de formulário inválido fica com a borda vermelha, e só. O que falta?',
        concepts: ['css-cores'],
        difficulty: 'iniciante',
        tags: ['css', 'cores', 'acessibilidade'],
        options: [
          'Um vermelho mais forte',
          'Um texto (ou ícone) dizendo o que está errado: cor nunca é o único sinal',
          'Trocar a borda por fundo vermelho',
          'Nada: vermelho é universalmente entendido como erro',
        ],
        correctIndex: 1,
        explanation:
          'Um em cada doze homens não distingue vermelho de verde; e todo mundo, ao sol ou numa tela ruim, perde cor antes de perder texto. A borda vermelha **reforça**; o sinal é a mensagem "Preencha o e-mail", que também diz o que fazer — coisa que cor nenhuma diz.',
        hints: ['Quem não vê a diferença entre vermelho e verde: como fica sabendo?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Uma paleta é uma lista de papéis — fundo, texto, marca, perigo, sucesso —, não uma lista de cores; sete bastam. Ela vive em variáveis em \`:root\`, e o resto do CSS só diz \`var(--marca)\`: mudar a marca é mudar uma linha, e um tema é outro \`:root\`. Todo texto tem contraste de 4.5:1 com o fundo, medido e não estimado. E cor nunca é o único sinal: o erro tem texto, o sucesso tem texto, o link tem sublinhado.`,
    },
  ],
};
