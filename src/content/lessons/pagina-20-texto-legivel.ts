import type { Lesson } from '../types';

import { AJUDANTES_CSS } from './_ajudantes-css';

const AJUDANTES = AJUDANTES_CSS;

export const lessonTextoLegivel: Lesson = {
  id: 'lesson-pagina-20',
  trackId: 'track-pagina',
  title: 'Texto Legível: Como as Pessoas Leem de Verdade',
  language: 'html',
  objective:
    'Escrever e formatar texto de interface para quem lê depressa e no celular — alinhamento, parágrafos, listas, números — e consertar telas que cansam antes da segunda linha.',
  concepts: ['ui-texto'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A aula de tipografia deu as medidas: \`rem\`, entrelinha, \`60ch\`. Esta é sobre o **uso**: como um texto se comporta quando alguém tenta lê-lo numa tela, com pressa, no ônibus. As pessoas leem menos do que você imagina e pulam mais do que você gostaria — e o texto que funciona é o que foi feito para isso.

## Alinhado à esquerda, sempre

Texto corrido centralizado é bonito em convite de casamento e ilegível em qualquer outro lugar: cada linha começa num ponto diferente, e o olho perde o começo da próxima. Parágrafos são alinhados ao **início** da linha (\`text-align: start\`, ou simplesmente o padrão). Centralize títulos curtos, se quiser; parágrafos, nunca. E justificado (\`justify\`) na web é pior que os dois — os rios de espaço entre palavras cansam mais que a margem irregular.

## Parágrafos curtos, separados por espaço

Na tela, um parágrafo tem **três a cinco linhas**. Mais que isso vira um bloco cinza que o olho pula inteiro. A separação entre parágrafos é **espaço** (\`margin-block\`), nunca dois \`<br>\` — o \`<br>\` é uma quebra dentro de um parágrafo (um endereço, um poema), não a divisão entre dois.

## Se é uma lista, é uma lista

Três passos, quatro requisitos, cinco opções: tudo o que se enumera vira \`<ul>\` ou \`<ol>\`, não um parágrafo com vírgulas. A lista dá ritmo à varredura, o leitor de tela anuncia "lista de 4 itens", e a pessoa sabe quanto falta.

## Números alinhados

Numa tabela ou lista de preços, os algarismos precisam ter a mesma largura — senão as colunas dançam. Uma linha de CSS: \`font-variant-numeric: tabular-nums\`. E números à **direita**, para as unidades e as centenas ficarem alinhadas; texto à esquerda.

## Maiúsculas só em rótulos

TEXTO EM MAIÚSCULAS PERDE O DESENHO DAS PALAVRAS — a pessoa lê letra por letra. Maiúsculas ficam para rótulos de uma ou duas palavras, com \`letter-spacing\`, como você viu. Nunca para uma frase.

## Cortar ou quebrar

Um título longo num cartão estreito: quebrar linha, ou cortar com reticências? A regra: **quebre**, a menos que a altura fixa importe (uma linha de tabela). Cortar esconde informação, e "Relatório de vendas do…" pode ser três relatórios diferentes. Se cortar, o texto completo tem que estar em algum lugar acessível — um \`title\`, um tooltip, a página de detalhe.

~~~css
.uma-linha {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
~~~

## No celular

Tudo isso vale dobrado a 360px de largura: a medida de linha já é curta por natureza, então o que sobra é não estragar — parágrafos curtos, listas, nenhum texto centralizado, nenhuma tabela larga (vire-a em cartões).

## Os erros

- Parágrafo centralizado ou justificado.
- \`<br><br>\` separando parágrafos.
- Enumeração dentro de um parágrafo.
- Números com algarismos de largura variável numa coluna.
- Frase inteira em maiúsculas.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 60ch; }
  h1 { font-size: 1.75rem; line-height: 1.2; }
  p { margin-block: 0 1em; }
  .rotulo { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #5f625d; }
  table { border-collapse: collapse; }
  td { padding: 4px 12px; }
  td.numero { text-align: right; font-variant-numeric: tabular-nums; }
</style>

<p class="rotulo">Pedido 4821</p>
<h1>Seu pedido saiu para entrega</h1>
<p>Ele deve chegar até as 18h. Se ninguém estiver em casa, o entregador tenta de novo no dia seguinte.</p>
<p>Para acompanhar:</p>
<ol>
  <li>Abra o aplicativo.</li>
  <li>Toque em Pedidos.</li>
  <li>Escolha o pedido 4821.</li>
</ol>

<table>
  <tr><td>Pão</td><td class="numero">8,00</td></tr>
  <tr><td>Café</td><td class="numero">15,50</td></tr>
  <tr><td>Total</td><td class="numero">23,50</td></tr>
</table>`,
      caption:
        'Parágrafos curtos alinhados à esquerda e separados por margem; os três passos numa lista numerada; o rótulo em maiúsculas com espaçamento; os preços à direita com algarismos tabulares — repare que as vírgulas ficam na mesma coluna.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-20-centralizado',
        type: 'multiple-choice',
        prompt: 'Por que texto corrido centralizado é difícil de ler?',
        concepts: ['ui-texto'],
        difficulty: 'iniciante',
        tags: ['ui', 'texto'],
        options: [
          'Porque fica menor',
          'Porque cada linha começa num ponto diferente, e o olho perde o começo da próxima linha ao voltar',
          'Porque centralizar não funciona em celular',
          'Não é: centralizado fica mais elegante e igualmente legível',
        ],
        correctIndex: 1,
        explanation:
          'Ler é ir e voltar: o olho chega ao fim de uma linha e salta para o começo da seguinte. Com o texto alinhado à esquerda, esse começo está sempre no mesmo lugar; centralizado, ele muda a cada linha e o olho precisa procurar. Em três linhas não se nota; em dez, cansa.',
        hints: ['O que o olho faz no fim de cada linha?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-20-consertar-paragrafos',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Conserte o artigo: os parágrafos estão centralizados e separados por `<br><br>`. Alinhe o texto ao início da linha, separe os parágrafos em `<p>` distintos com margem, e transforme a enumeração de passos numa `<ol>`.',
        concepts: ['ui-texto'],
        difficulty: 'iniciante',
        tags: ['ui', 'texto'],
        initialCode: `<style>
  body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 60ch; }
  .artigo { text-align: center; }
  .artigo p { margin-block: 0 1em; }
</style>

<article class="artigo">
  <h1>Como devolver um produto</h1>
  <p>Você tem sete dias a partir da entrega para pedir a devolução. O valor volta na mesma forma de pagamento.<br><br>Os passos são: abra o aplicativo, toque em Pedidos, escolha o pedido, toque em Devolver.<br><br>Se tiver dúvida, fale com a gente pelo chat.</p>
</article>
`,
        tests: [
          {
            description: 'o texto está alinhado ao início da linha',
            assertion: `
              const p = document.querySelector('.artigo p');
              const ta = getComputedStyle(p).textAlign;
              if (ta === 'center' || ta === 'justify') throw new Error('Parágrafos não se centralizam nem se justificam: text-align: start (ou left). Veio ' + ta + '.');
            `,
          },
          {
            description: 'os parágrafos são <p> separados, sem <br><br>',
            assertion: `
              const ps = document.querySelectorAll('.artigo p');
              if (ps.length < 3) throw new Error('Esperava pelo menos 3 <p> no artigo (um por parágrafo); há ' + ps.length + '.');
              if (document.querySelector('.artigo br')) throw new Error('Nenhum <br> no artigo: parágrafo se separa com <p> e margem, não com quebra de linha.');
            `,
          },
          {
            description: 'os passos viraram uma lista numerada',
            assertion: `
              const ol = document.querySelector('.artigo ol');
              if (!ol) throw new Error('Os quatro passos são uma enumeração: uma <ol> com um <li> por passo.');
              if (ol.querySelectorAll('li').length !== 4) throw new Error('A lista precisa ter os 4 passos; há ' + ol.querySelectorAll('li').length + '.');
            `,
          },
        ],
        hints: [
          'No CSS, tire o `text-align: center` (ou troque por `start`).',
          'No HTML: três `<p>`, e no meio uma `<ol>` com quatro `<li>`.',
        ],
        solution: `<style>
  body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 60ch; }
  .artigo { text-align: start; }
  .artigo p { margin-block: 0 1em; }
</style>

<article class="artigo">
  <h1>Como devolver um produto</h1>
  <p>Você tem sete dias a partir da entrega para pedir a devolução. O valor volta na mesma forma de pagamento.</p>
  <p>Os passos são:</p>
  <ol>
    <li>Abra o aplicativo.</li>
    <li>Toque em Pedidos.</li>
    <li>Escolha o pedido.</li>
    <li>Toque em Devolver.</li>
  </ol>
  <p>Se tiver dúvida, fale com a gente pelo chat.</p>
</article>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-20-lacuna-numeros',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt: 'Complete a coluna de preços: alinhada à direita, com algarismos de largura igual, e o rótulo em maiúsculas espaçadas.',
        concepts: ['ui-texto'],
        difficulty: 'iniciante',
        tags: ['ui', 'texto'],
        template: `<style>
  td.numero { text-align: {{1}}; font-variant-numeric: {{2}}; }
  .rotulo { text-transform: uppercase; letter-spacing: {{3}}; font-size: 0.75rem; }
</style>

<p class="rotulo">Resumo</p>
<table>
  <tr><td>Pão</td><td class="numero">8,00</td></tr>
  <tr><td>Café</td><td class="numero">15,50</td></tr>
  <tr><td>Total</td><td class="numero">123,50</td></tr>
</table>`,
        blanks: [
          { placeholder: 'lado', size: 5 },
          { placeholder: 'algarismos', size: 12 },
          { placeholder: 'espaço', size: 6 },
        ],
        tests: [
          {
            description: 'os números estão à direita',
            assertion: `
              const ta = getComputedStyle(document.querySelector('td.numero')).textAlign;
              if (ta !== 'right' && ta !== 'end') throw new Error('Números se alinham à direita, para as vírgulas e as centenas ficarem na mesma coluna. Veio ' + ta + '.');
            `,
          },
          {
            description: 'os algarismos têm a mesma largura',
            assertion: `${AJUDANTES}
              const v = declarado('td.numero', 'font-variant-numeric');
              if (!/tabular-nums/.test(v)) throw new Error('font-variant-numeric: tabular-nums dá a todos os algarismos a mesma largura. Veio "' + (v || '(nada)') + '".');
            `,
          },
          {
            description: 'o rótulo em maiúsculas tem espaçamento',
            assertion: `${AJUDANTES}
              const v = declarado('.rotulo', 'letter-spacing');
              const m = /^(\\d*\\.?\\d+)em$/.exec(v);
              if (!m || Number(m[1]) < 0.04) throw new Error('Maiúsculas pedem letter-spacing de uns 0.05em a 0.1em. Veio "' + (v || '(nada)') + '".');
            `,
          },
        ],
        hints: [
          'O lado em que as unidades se alinham; o valor de `font-variant-numeric` da aula; e o espaçamento das maiúsculas da aula de tipografia.',
        ],
        solution: ['right', 'tabular-nums', '0.08em'],
        explanation:
          'Três decisões pequenas que separam uma tabela que se lê de uma que se decifra: à direita, as unidades ficam embaixo das unidades; `tabular-nums` faz um 1 ocupar o mesmo espaço que um 8, então as colunas não dançam; e o `letter-spacing` devolve ao rótulo em maiúsculas o ar que as maiúsculas juntas tiram.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-20-ordenar-leitura',
        type: 'order-steps',
        prompt: 'O que uma pessoa faz ao abrir uma tela com texto, na ordem em que acontece.',
        concepts: ['ui-texto'],
        difficulty: 'intermediario',
        tags: ['ui', 'texto'],
        steps: [
          { id: 'varre', text: 'Varre a tela procurando o que interessa — títulos, listas, números, o botão', ordem: 1 },
          { id: 'decide', text: 'Decide em um ou dois segundos se vale a pena ler alguma coisa', ordem: 2 },
          { id: 'le', text: 'Lê o pedaço que a varredura achou: um título, uma lista, o primeiro parágrafo', ordem: 3 },
          { id: 'pula', text: 'Pula os blocos longos e cinzas sem ler', ordem: 4 },
          { id: 'age', text: 'Age — ou vai embora, se não achou o que veio buscar', ordem: 5 },
        ],
        explanation:
          'Ninguém lê uma tela de cima a baixo. A varredura vem primeiro, e ela só encontra o que tem forma: títulos, listas, números alinhados, parágrafos curtos. Um bloco de dez linhas centralizadas não tem forma nenhuma — e é pulado inteiro, por mais importante que seja o que diz.',
        hints: [
          'Ler vem depois de olhar.',
          'A decisão de ir embora é a última coisa.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-20-cortar',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Os títulos dos cartões estouram a caixa. Deixe cada `.titulo` numa **linha só**, cortado com reticências quando não couber — e garanta que o texto completo continue acessível no atributo `title` de cada um.',
        concepts: ['ui-texto'],
        difficulty: 'intermediario',
        tags: ['ui', 'texto'],
        initialCode: `<style>
  .cartao { width: 180px; padding: 12px; border: 1px solid #cbd5d1; margin-bottom: 8px; }
  .titulo {
    font-weight: 700;
    /* uma linha só, com reticências */
  }
</style>

<div class="cartao"><p class="titulo">Relatório de vendas do primeiro trimestre</p></div>
<div class="cartao"><p class="titulo">Relatório de vendas do segundo trimestre</p></div>

<script>
  // dê a cada .titulo um atributo title com o próprio texto
</script>
`,
        tests: [
          {
            description: 'o título fica numa linha só, cortado com reticências',
            assertion: `${AJUDANTES}
              const s = getComputedStyle(document.querySelector('.titulo'));
              if (s.whiteSpace !== 'nowrap') throw new Error('white-space: nowrap impede a quebra de linha. Veio ' + s.whiteSpace + '.');
              if (s.overflow !== 'hidden' && s.overflowX !== 'hidden') throw new Error('overflow: hidden esconde o que não cabe. Veio ' + s.overflow + '.');
              if (s.textOverflow !== 'ellipsis') throw new Error('text-overflow: ellipsis mostra as reticências. Veio ' + s.textOverflow + '.');
            `,
          },
          {
            description: 'o texto completo está no title de cada título',
            assertion: `
              for (const t of document.querySelectorAll('.titulo')) {
                if (t.getAttribute('title') !== t.textContent.trim()) throw new Error('Cada .titulo precisa de title igual ao próprio texto — cortar sem dar acesso ao completo esconde informação. Veio title="' + (t.getAttribute('title') || '') + '".');
              }
            `,
          },
        ],
        hints: [
          'As três propriedades da aula: `white-space`, `overflow`, `text-overflow`.',
          'No script: `for (const t of document.querySelectorAll(".titulo")) t.title = t.textContent.trim();`.',
        ],
        solution: `<style>
  .cartao { width: 180px; padding: 12px; border: 1px solid #cbd5d1; margin-bottom: 8px; }
  .titulo {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

<div class="cartao"><p class="titulo">Relatório de vendas do primeiro trimestre</p></div>
<div class="cartao"><p class="titulo">Relatório de vendas do segundo trimestre</p></div>

<script>
  for (const t of document.querySelectorAll('.titulo')) {
    t.title = t.textContent.trim();
  }
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-20-maiusculas',
        type: 'multiple-choice',
        prompt: 'Um aviso importante foi escrito TODO EM MAIÚSCULAS "para chamar atenção". O que acontece?',
        concepts: ['ui-texto'],
        difficulty: 'iniciante',
        tags: ['ui', 'texto'],
        options: [
          'Funciona: maiúsculas são mais legíveis',
          'As palavras perdem o desenho e a pessoa lê letra por letra — mais devagar, e com a sensação de estar sendo gritada',
          'Só é problema em celular',
          'É a forma correta para avisos',
        ],
        correctIndex: 1,
        explanation:
          'Reconhecemos palavras pela silhueta — as ascendentes e descendentes das minúsculas. Em maiúsculas, todas as palavras viram retângulos iguais, e a leitura cai para letra por letra. Para chamar atenção, use a hierarquia: posição, um ícone, o peso. Maiúsculas ficam para rótulos de uma ou duas palavras.',
        hints: ['Como você reconhece uma palavra sem ler cada letra?'],
      },
    },
    {
      kind: 'summary',
      markdown: `As pessoas varrem antes de ler, e só leem o que tem forma. Parágrafos curtos, alinhados ao início, separados por margem — nunca centralizados, justificados ou com \`<br><br>\`. Enumeração vira lista. Números à direita com \`tabular-nums\`. Maiúsculas só em rótulos curtos. E, ao cortar um texto, o completo fica acessível em algum lugar.`,
    },
  ],
};
