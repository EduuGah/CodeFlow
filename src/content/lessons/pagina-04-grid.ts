import type { Lesson } from '../types';

/**
 * Os testes de grid leem o CSS de dois jeitos, e o motivo vale registrar.
 *
 * `getComputedStyle` devolve `grid-template-columns` **resolvido** no navegador
 * (`"128px 128px 128px"`) e **declarado** no jsdom (`"repeat(3, 1fr)"`). Contar
 * colunas precisa expandir o `repeat()` antes de dividir — é o `trilhas()` que
 * aparece nas asserções. Já `grid-area` num item vem diferente nos dois motores
 * quando computado, então esse é lido da **folha de estilo** (`cssRules`), onde
 * o valor é o que o aluno escreveu nos dois lugares.
 */
const TRILHAS = `
  function trilhas(valor) {
    const expandido = String(valor).replace(/repeat\\((\\d+),\\s*([^)]+)\\)/g, (_, n, x) => Array(Number(n)).fill(x.trim()).join(' '));
    return expandido.trim().split(/\\s+/).filter(Boolean);
  }
`;

const REGRA = `
  function regra(seletor) {
    for (const folha of document.styleSheets) {
      for (const r of folha.cssRules) {
        if (r.selectorText && r.selectorText.replace(/\\s+/g, ' ').trim() === seletor) return r.style;
      }
    }
    return null;
  }
`;

export const lessonGrid: Lesson = {
  id: 'lesson-pagina-4',
  trackId: 'track-pagina',
  title: 'Grid: Linhas e Colunas de Uma Vez',
  language: 'html',
  objective:
    'Montar layouts em duas dimensões com grid — colunas iguais, uma coluna fixa e outra flexível, e a página inteira desenhada com áreas nomeadas.',
  concepts: ['css-grid'],
  status: 'published',
  estimatedMinutes: 32,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Flexbox distribui itens **numa direção**: uma fila, ou uma pilha. Quando o que você quer é uma **tabela de espaços** — três colunas iguais, uma página com cabeçalho em cima, menu à esquerda, conteúdo à direita e rodapé embaixo —, a ferramenta é o grid. A regra prática: uma dimensão, flex; duas, grid.

## As colunas

Tudo começa no contêiner, como no flexbox:

~~~css
.galeria {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}
~~~

\`grid-template-columns\` diz **quantas colunas** e **de que tamanho**. \`1fr\` é "uma fração do espaço livre": três \`1fr\` são três colunas iguais. \`repeat(3, 1fr)\` é a mesma coisa escrita curta. E os tamanhos podem misturar: \`200px 1fr\` é uma coluna fixa de 200 pixels e outra que fica com o resto — a barra lateral da aula passada, sem \`flex\` nenhum.

As **linhas** você normalmente não declara: o grid cria quantas precisar, conforme os itens chegam. Cada filho direto do contêiner cai na próxima célula livre, da esquerda para a direita, de cima para baixo.

## Espalhando um item

Às vezes um item precisa de mais de uma célula — o destaque que ocupa duas colunas. \`grid-column\` diz de qual linha de grade até qual:

~~~css
.destaque {
  grid-column: 1 / 3;   /* da linha 1 até a linha 3: duas colunas */
}
~~~

As linhas de grade são numeradas a partir de 1, e há uma a mais do que colunas: três colunas têm quatro linhas de grade. \`1 / 3\` ocupa as duas primeiras colunas; \`1 / -1\` vai de ponta a ponta, não importa quantas colunas existam.

## A página inteira, desenhada

O recurso mais bonito do grid é este: você **desenha** o layout com palavras.

~~~css
.pagina {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "cabecalho cabecalho"
    "menu      conteudo"
    "rodape    rodape";
}

header { grid-area: cabecalho; }
nav    { grid-area: menu; }
main   { grid-area: conteudo; }
footer { grid-area: rodape; }
~~~

Cada string é uma linha; cada palavra, uma célula. Repetir a palavra funde as células — \`cabecalho cabecalho\` ocupa as duas colunas. Cada elemento se coloca na área pelo nome. Para mudar o layout no celular, basta reescrever as strings numa media query (assunto da próxima aula); o HTML não muda.

## Cartões que se adaptam sozinhos

Uma linha resolve a grade de cartões responsiva:

~~~css
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
~~~

Leia assim: "quantas colunas de pelo menos 200px couberem; o que sobrar, divida entre elas". Numa tela larga viram quatro colunas; no celular, uma. Sem nenhuma media query.

## Os erros

- **Esquecer que só filhos diretos viram itens.** Um \`div\` a mais em volta dos cartões, e a grade some.
- **Usar grid para uma fila simples.** Flexbox é mais simples para isso, e centraliza melhor.
- **Fixar alturas de linha.** Deixe o conteúdo decidir; \`grid-template-rows\` quase nunca é necessário.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  .pagina {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 16px;
    grid-template-areas:
      "cabecalho cabecalho"
      "menu      conteudo"
      "rodape    rodape";
  }

  header { grid-area: cabecalho; }
  nav    { grid-area: menu; }
  main   { grid-area: conteudo; }
  footer { grid-area: rodape; }

  .galeria {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
</style>

<div class="pagina">
  <header>Cabeçalho</header>
  <nav>Menu</nav>
  <main>
    <section class="galeria">
      <img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23cbd5d1'/%3E%3C/svg%3E">
      <img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23cbd5d1'/%3E%3C/svg%3E">
      <img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23cbd5d1'/%3E%3C/svg%3E">
    </section>
  </main>
  <footer>Rodapé</footer>
</div>`,
      caption:
        'Dois grids, um dentro do outro. A página é desenhada com áreas nomeadas — três linhas de texto que qualquer pessoa lê como um esboço; a galeria dentro do `main` é um grid de três colunas iguais. As imagens são SVG embutido: a página do exercício não tem rede.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-4-quando',
        type: 'multiple-choice',
        prompt: 'Qual destes layouts pede grid em vez de flexbox?',
        concepts: ['css-grid'],
        difficulty: 'iniciante',
        tags: ['css', 'grid'],
        options: [
          'Um menu horizontal com quatro links',
          'Um botão com um ícone à esquerda do texto',
          'Uma galeria de fotos em três colunas iguais, que cresce para baixo',
          'Um título centralizado numa barra',
        ],
        correctIndex: 2,
        explanation:
          'Os três outros são **uma dimensão**: uma fila. Flexbox resolve com uma linha e centraliza melhor. A galeria é **duas dimensões** — colunas e linhas ao mesmo tempo, com alinhamento vertical entre as fotos de linhas diferentes — e é exatamente o que grid faz e flexbox não: no flex com `wrap`, a segunda linha não sabe onde a primeira dividiu as colunas.',
        hints: ['Conte as dimensões: só largura, ou largura e altura ao mesmo tempo?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-4-galeria',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Transforme a lista de fotos numa galeria de **três colunas iguais**, com **16px** entre as células.\n\nEscreva a regra `.galeria`. O HTML está pronto.',
        concepts: ['css-grid'],
        difficulty: 'iniciante',
        tags: ['css', 'grid'],
        initialCode: `<style>
  .galeria {
    /* três colunas iguais, 16px entre elas */
  }

  .galeria img {
    width: 100%;
    display: block;
  }
</style>

<section class="galeria">
  <img alt="Foto 1" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23a7b8b3'/%3E%3C/svg%3E">
  <img alt="Foto 2" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23cbd5d1'/%3E%3C/svg%3E">
  <img alt="Foto 3" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%237f9691'/%3E%3C/svg%3E">
  <img alt="Foto 4" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23a7b8b3'/%3E%3C/svg%3E">
  <img alt="Foto 5" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23cbd5d1'/%3E%3C/svg%3E">
  <img alt="Foto 6" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%237f9691'/%3E%3C/svg%3E">
</section>
`,
        tests: [
          {
            description: 'a galeria é um grid',
            assertion: `
              const g = document.querySelector('.galeria');
              if (!g) throw new Error('O elemento .galeria sumiu do HTML.');
              if (getComputedStyle(g).display !== 'grid') throw new Error('A galeria precisa de display: grid.');
            `,
          },
          {
            description: 'há exatamente três colunas',
            assertion: `${TRILHAS}
              const colunas = trilhas(getComputedStyle(document.querySelector('.galeria')).gridTemplateColumns);
              if (colunas.length !== 3) throw new Error('Esperava 3 colunas em grid-template-columns (por exemplo repeat(3, 1fr)); encontrei ' + colunas.length + '.');
            `,
          },
          {
            description: 'as colunas são iguais',
            assertion: `${TRILHAS}
              const colunas = trilhas(getComputedStyle(document.querySelector('.galeria')).gridTemplateColumns);
              // O navegador resolve 1fr em pixels, com diferenças de centésimos
              // entre colunas (196.656px, 196.672px); o jsdom devolve "1fr".
              const numeros = colunas.map(parseFloat);
              const iguais = numeros.some(Number.isNaN)
                ? new Set(colunas).size === 1
                : Math.max(...numeros) - Math.min(...numeros) < 1;
              if (!iguais) throw new Error('As três colunas precisam ter o mesmo tamanho: use 1fr para cada uma. Vieram ' + colunas.join(', ') + '.');
            `,
          },
          {
            description: 'há 16px entre as células',
            assertion: `const g = getComputedStyle(document.querySelector('.galeria')).gap; if (g !== '16px') throw new Error('O espaço entre as células é gap: 16px. Veio ' + g + '.');`,
          },
        ],
        hints: [
          'Três propriedades no contêiner: o `display`, as colunas, o espaço.',
          'Colunas iguais são frações iguais do espaço: `1fr 1fr 1fr`, ou `repeat(3, 1fr)`.',
          '.galeria {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}',
        ],
        solution: `<style>
  .galeria {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .galeria img {
    width: 100%;
    display: block;
  }
</style>

<section class="galeria">
  <img alt="Foto 1" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23a7b8b3'/%3E%3C/svg%3E">
  <img alt="Foto 2" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23cbd5d1'/%3E%3C/svg%3E">
  <img alt="Foto 3" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%237f9691'/%3E%3C/svg%3E">
  <img alt="Foto 4" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23a7b8b3'/%3E%3C/svg%3E">
  <img alt="Foto 5" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23cbd5d1'/%3E%3C/svg%3E">
  <img alt="Foto 6" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%237f9691'/%3E%3C/svg%3E">
</section>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-4-lacuna-destaque',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete: um grid com uma coluna fixa de **200px** e outra com o resto, e um destaque que ocupa **as duas colunas** — da linha de grade 1 até a linha de grade 3.',
        concepts: ['css-grid'],
        difficulty: 'iniciante',
        tags: ['css', 'grid'],
        template: `<style>
  .painel {
    display: {{1}};
    grid-template-columns: {{2}} 1fr;
    gap: 12px;
  }

  .destaque {
    grid-column: 1 / {{3}};
    padding: 16px;
    background: #e6efec;
  }
</style>

<div class="painel">
  <p class="destaque">Este destaque atravessa as duas colunas.</p>
  <p>Coluna fixa</p>
  <p>Coluna que cresce</p>
</div>`,
        blanks: [
          { placeholder: 'display', size: 5 },
          { placeholder: 'largura', size: 6 },
          { placeholder: 'linha', size: 2 },
        ],
        tests: [
          {
            description: 'o painel é um grid',
            assertion: `if (getComputedStyle(document.querySelector('.painel')).display !== 'grid') throw new Error('O display que cria colunas e linhas é grid.');`,
          },
          {
            description: 'a primeira coluna tem 200px',
            assertion: `${TRILHAS}
              const colunas = trilhas(getComputedStyle(document.querySelector('.painel')).gridTemplateColumns);
              if (colunas[0] !== '200px') throw new Error('A primeira coluna precisa medir 200px. Veio ' + colunas[0] + '.');
            `,
          },
          {
            description: 'o destaque vai da linha de grade 1 até a 3',
            assertion: `
              const gc = getComputedStyle(document.querySelector('.destaque')).gridColumn.replace(/\\s+/g, ' ');
              if (gc !== '1 / 3') throw new Error('Duas colunas são três linhas de grade: o destaque vai de 1 até 3. Veio grid-column ' + gc + '.');
            `,
          },
        ],
        hints: [
          'A primeira lacuna é o mesmo `display` da galeria.',
          'Três linhas de grade cercam duas colunas: 1, 2 e 3. Onde o destaque termina?',
        ],
        solution: ['grid', '200px', '3'],
        explanation:
          '`200px 1fr` é a barra lateral em grid: a primeira coluna fixa, a segunda com o que sobrar. E `grid-column: 1 / 3` lê-se "da linha de grade 1 até a linha de grade 3" — as linhas de grade são as **bordas** das colunas, por isso são sempre uma a mais que as colunas. Escrever `1 / 2` ocuparia só a primeira.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-4-ordenar-colocacao',
        type: 'order-steps',
        prompt:
          'Como o grid decide onde cada item fica. Coloque na ordem, do primeiro passo ao último.',
        concepts: ['css-grid'],
        difficulty: 'intermediario',
        tags: ['css', 'grid'],
        steps: [
          {
            id: 'container',
            text: '`display: grid` no contêiner: os filhos diretos viram itens da grade',
            ordem: 1,
          },
          {
            id: 'colunas',
            text: '`grid-template-columns` define quantas colunas existem e o tamanho de cada uma',
            ordem: 2,
          },
          {
            id: 'explicitos',
            text: 'Itens com posição explícita (`grid-column`, `grid-area`) são colocados primeiro, nas células que pediram',
            ordem: 3,
          },
          {
            id: 'automaticos',
            text: 'Os demais itens preenchem as células livres, da esquerda para a direita e de cima para baixo',
            ordem: 4,
          },
          {
            id: 'linhas',
            text: 'Linhas são criadas automaticamente até todos os itens terem lugar',
            ordem: 5,
          },
        ],
        explanation:
          'Colocação explícita antes da automática: é por isso que um `.destaque` com `grid-column: 1 / 3` empurra os vizinhos, e não o contrário. E as linhas nascem por demanda — declarar `grid-template-rows` quase nunca é necessário, porque o grid cria quantas o conteúdo pedir.',
        hints: [
          'Antes de colocar qualquer item, o grid precisa saber quantas colunas tem.',
          'Quem pediu lugar específico é atendido antes de quem aceita qualquer lugar.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-4-areas',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Desenhe a página com áreas nomeadas. O grid `.pagina` tem duas colunas (**200px** e **1fr**) e três linhas de áreas:\n\n- `cabecalho` ocupando as duas colunas\n- `menu` à esquerda e `conteudo` à direita\n- `rodape` ocupando as duas colunas\n\nDepois coloque cada elemento na sua área com `grid-area`.',
        concepts: ['css-grid'],
        difficulty: 'intermediario',
        tags: ['css', 'grid'],
        initialCode: `<style>
  .pagina {
    display: grid;
    gap: 12px;
    /* as colunas e o desenho das áreas */
  }

  /* header, nav, main e footer: cada um na sua área */
</style>

<div class="pagina">
  <header>Cabeçalho</header>
  <nav>Menu</nav>
  <main>Conteúdo</main>
  <footer>Rodapé</footer>
</div>
`,
        tests: [
          {
            description: 'a página tem duas colunas, a primeira de 200px',
            assertion: `${TRILHAS}
              const colunas = trilhas(getComputedStyle(document.querySelector('.pagina')).gridTemplateColumns);
              if (colunas.length !== 2) throw new Error('Esperava 2 colunas (200px 1fr); encontrei ' + colunas.length + '.');
              if (colunas[0] !== '200px') throw new Error('A primeira coluna precisa medir 200px. Veio ' + colunas[0] + '.');
            `,
          },
          {
            description: 'as áreas desenham cabeçalho, menu + conteúdo, e rodapé',
            assertion: `
              const areas = getComputedStyle(document.querySelector('.pagina')).gridTemplateAreas.replace(/\\s+/g, ' ').trim();
              const esperado = '"cabecalho cabecalho" "menu conteudo" "rodape rodape"';
              if (areas !== esperado) throw new Error('Esperava grid-template-areas com três linhas: "cabecalho cabecalho" / "menu conteudo" / "rodape rodape". Veio ' + (areas || '(nada)') + '.');
            `,
          },
          {
            description: 'cada elemento está na sua área',
            assertion: `${REGRA}
              const pares = [['header', 'cabecalho'], ['nav', 'menu'], ['main', 'conteudo'], ['footer', 'rodape']];
              for (const [seletor, area] of pares) {
                const r = regra(seletor);
                const valor = r ? r.getPropertyValue('grid-area').replace(/\\s*\\/\\s*/g, '/').split('/')[0].trim() : '';
                if (valor !== area) throw new Error('A regra de ' + seletor + ' precisa ter grid-area: ' + area + '. ' + (r ? 'Veio "' + (r.getPropertyValue('grid-area') || '(nada)') + '".' : 'Não encontrei uma regra com o seletor ' + seletor + '.'));
              }
            `,
          },
        ],
        hints: [
          'Cada string de `grid-template-areas` é uma linha; cada palavra, uma célula. Repetir a palavra funde as células.',
          'Quatro regras curtas depois do `.pagina`: `header { grid-area: cabecalho; }` e assim por diante.',
          '.pagina {\n  display: grid;\n  gap: 12px;\n  grid-template-columns: 200px 1fr;\n  grid-template-areas:\n    "cabecalho cabecalho"\n    "menu conteudo"\n    "rodape rodape";\n}\nheader { grid-area: cabecalho; }\nnav { grid-area: menu; }\nmain { grid-area: conteudo; }\nfooter { grid-area: rodape; }',
        ],
        solution: `<style>
  .pagina {
    display: grid;
    gap: 12px;
    grid-template-columns: 200px 1fr;
    grid-template-areas:
      "cabecalho cabecalho"
      "menu      conteudo"
      "rodape    rodape";
  }

  header { grid-area: cabecalho; }
  nav    { grid-area: menu; }
  main   { grid-area: conteudo; }
  footer { grid-area: rodape; }
</style>

<div class="pagina">
  <header>Cabeçalho</header>
  <nav>Menu</nav>
  <main>Conteúdo</main>
  <footer>Rodapé</footer>
</div>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-4-fr',
        type: 'multiple-choice',
        prompt: 'Num grid de `grid-template-columns: 200px 1fr 1fr` com 800px de largura, quanto mede cada coluna `1fr`?',
        concepts: ['css-grid'],
        difficulty: 'intermediario',
        tags: ['css', 'grid'],
        options: ['800px', '400px', '300px', '266px'],
        correctIndex: 2,
        explanation:
          '`fr` é uma fração do **espaço livre**, não da largura total. Dos 800px, 200 já estão tomados pela coluna fixa; sobram 600, divididos em duas frações iguais: 300px cada. (Com `gap`, o espaço entre colunas também sai antes da divisão.)',
        hints: ['Primeiro tire o que é fixo; só o que sobra vira fração.'],
      },
    },
    {
      kind: 'summary',
      markdown: `Uma dimensão, flex; duas, grid. \`display: grid\` no contêiner e \`grid-template-columns\` definem as colunas — \`1fr\` é uma fração do espaço livre, \`repeat(3, 1fr)\` são três iguais, \`200px 1fr\` é fixa mais flexível. Itens caem na próxima célula livre; \`grid-column: 1 / 3\` espalha um por duas colunas, contando linhas de grade. E \`grid-template-areas\` desenha a página com palavras, cada elemento se colocando pelo nome com \`grid-area\`.`,
    },
  ],
};
