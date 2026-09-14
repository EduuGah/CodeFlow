import type { Lesson } from '../types';

import { AJUDANTES_CSS } from './_ajudantes-css';

const AJUDANTES = `${AJUDANTES_CSS}
  function px(valor) {
    const v = String(valor || '').trim();
    if (/^(\\d*\\.?\\d+)px$/.test(v)) return Number(v.replace('px', ''));
    if (/^(\\d*\\.?\\d+)rem$/.test(v)) return Number(v.replace('rem', '')) * 16;
    return null;
  }
`;

export const lessonPolegar: Lesson = {
  id: 'lesson-pagina-26',
  trackId: 'track-pagina',
  title: 'O Polegar: Feito para a Mão',
  language: 'html',
  objective:
    'Desenhar para quem segura o telefone com uma mão: alvos de 44px, ações principais ao alcance do polegar, espaço entre toques, e campos que não fazem a tela pular.',
  concepts: ['ui-polegar'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A maior parte das pessoas usa a sua página num telefone, segurando com uma mão, apertando com o polegar — no ônibus, andando, com a outra mão ocupada. O polegar é largo, impreciso, e não chega a todo lugar da tela. Esta aula é sobre desenhar para ele. É a última da trilha, e junta tudo o que veio antes num só critério: **dá para usar com uma mão?**

## 44 pixels

Um polegar cobre uns 44 pixels. Um alvo menor que isso recebe toques errados — o link ao lado, o botão de baixo. A regra, que este aplicativo segue em todos os controles: **nenhum alvo de toque menor que 44×44px**. Não é o ícone que precisa ter 44; é a área que responde ao toque:

~~~css
button, a.botao {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}
~~~

E **espaço entre alvos**: dois botões de 44px colados são um alvo de 88 com uma fronteira invisível no meio. \`gap: 8px\`, no mínimo.

## Onde o polegar chega

Com o telefone numa mão, o polegar alcança com conforto o **terço inferior** da tela e o canto do lado da mão. O topo e o canto oposto exigem reposicionar o aparelho — ou a outra mão. Então:

- **A ação principal fica embaixo**, numa barra fixa no rodapé: "Pagar", "Continuar", "Salvar". É onde o botão de avançar deste aplicativo está, e por isso.
- **Navegação principal embaixo**, com no máximo cinco itens.
- **O que é destrutivo ou raro fica no topo**: excluir conta, configurações. Longe do toque acidental.

~~~css
.rodape-fixo {
  position: sticky;
  bottom: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: white;
}
~~~

\`env(safe-area-inset-bottom)\` é o espaço da barra do sistema nos telefones sem botão físico — sem ele, o botão fica escondido atrás.

## O teclado que sobe

Ao tocar num campo, metade da tela vira teclado. Duas coisas quebram: o campo some atrás dele (o navegador rola, mas nem sempre bem), e o botão de enviar fica inalcançável. Mantenha o formulário curto o suficiente para o campo ativo e o botão coexistirem, e — no iPhone — dê **16px de fonte** aos campos: menos que isso, o sistema dá zoom na página inteira ao focar, e ela fica cortada.

~~~css
input, select, textarea { font-size: 16px; }
~~~

## O toque tem que responder

O polegar não tem hover. O que ele tem é o \`:active\`: o instante do toque. Sem resposta visual — um escurecimento, uma leve escala —, a pessoa não sabe se tocou, e toca de novo. Uma transição de 100ms no \`:active\` resolve.

## O que não cabe no polegar

- **Menus que abrem no hover**: não existem no toque.
- **Arrastar para revelar** como única forma de fazer algo: ninguém descobre. Pode existir como atalho; a ação precisa de um botão também.
- **Texto pequeno como link**: um "saiba mais" de 12px no meio do parágrafo é um alvo de 12px.
- **Tabelas largas**: viram cartões empilhados no celular.

## Teste no aparelho

Nenhum emulador segura o telefone. Antes de dar por pronto, abra no seu telefone, com uma mão, andando pela sala. O que você não consegue apertar, ninguém consegue.

## Os erros

- Alvos menores que 44px, ou colados sem espaço.
- Ação principal no topo da tela.
- Campo com fonte menor que 16px no iPhone.
- Botão que não responde ao toque.
- Ação que só existe no hover ou no arrastar.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  body { margin: 0; font-family: system-ui, sans-serif; }
  main { padding: 16px; padding-bottom: 96px; }
  input { display: block; width: 100%; padding: 12px; font-size: 16px; margin-bottom: 16px; }
  button { min-height: 44px; min-width: 44px; padding: 12px 16px; border: 0; border-radius: 8px; transition: transform 100ms ease; }
  button:active { transform: scale(0.97); }
  .primario { background: #1f6660; color: white; font-weight: 700; width: 100%; }
  .icone { background: none; font-size: 1.25rem; }
  .acoes-topo { display: flex; justify-content: flex-end; gap: 8px; padding: 8px; }
  .rodape-fixo { position: sticky; bottom: 0; background: white; padding: 12px 16px; padding-bottom: calc(12px + env(safe-area-inset-bottom)); border-top: 1px solid #cbd5d1; }
</style>

<div class="acoes-topo">
  <button class="icone" aria-label="Configurações">⚙</button>
  <button class="icone" aria-label="Excluir conta">🗑</button>
</div>

<main>
  <h1>Endereço de entrega</h1>
  <label>Rua <input autocomplete="address-line1"></label>
  <label>Número <input inputmode="numeric"></label>
</main>

<div class="rodape-fixo">
  <button class="primario">Continuar</button>
</div>`,
      caption:
        'A ação principal embaixo, numa barra fixa com espaço para a barra do sistema; o raro e o destrutivo no topo. Todo botão com 44px de alvo, os de ícone com nome, e um `:active` que responde ao toque. Os campos têm 16px para o iPhone não dar zoom.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-26-onde',
        type: 'multiple-choice',
        prompt: 'Numa tela de pagamento no celular, onde vai o botão "Pagar"?',
        concepts: ['ui-polegar'],
        difficulty: 'iniciante',
        tags: ['ui', 'polegar'],
        options: [
          'No topo, para ser a primeira coisa vista',
          'Numa barra fixa no rodapé, onde o polegar chega sem reposicionar o telefone',
          'No canto superior direito, como nos aplicativos de desktop',
          'No meio da tela',
        ],
        correctIndex: 1,
        explanation:
          'Com o telefone numa mão, o polegar alcança o terço inferior da tela com conforto; o topo exige mudar a pegada. A ação principal — a que a pessoa vai tocar em toda visita — fica onde o toque é fácil e seguro. O topo é para o raro e o destrutivo, longe do toque acidental.',
        hints: ['Segure o seu telefone com uma mão: onde o polegar chega sem esforço?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-26-alvos',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Conserte os alvos de toque: todo `button` com `min-height` e `min-width` de **44px**; **8px** de `gap` entre os botões do `.acoes`; e os campos com `font-size` de **16px** para o iPhone não dar zoom.',
        concepts: ['ui-polegar'],
        difficulty: 'iniciante',
        tags: ['ui', 'polegar'],
        initialCode: `<style>
  .acoes { display: flex; }
  button { padding: 4px 8px; font-size: 12px; }
  input { font-size: 13px; }
</style>

<label>Cupom <input></label>
<div class="acoes">
  <button>Aplicar</button>
  <button>Remover</button>
</div>
`,
        tests: [
          {
            description: 'os botões têm alvo de 44px',
            assertion: `${AJUDANTES}
              const h = px(declarado('button', 'min-height')), w = px(declarado('button', 'min-width'));
              if (h === null || h < 44) throw new Error('button precisa de min-height: 44px — o tamanho de um polegar. Veio "' + (declarado('button', 'min-height') || '(nada)') + '".');
              if (w === null || w < 44) throw new Error('button precisa de min-width: 44px. Veio "' + (declarado('button', 'min-width') || '(nada)') + '".');
            `,
          },
          {
            description: 'há espaço entre os botões',
            assertion: `${AJUDANTES}
              const g = px(getComputedStyle(document.querySelector('.acoes')).gap);
              if (g === null || g < 8) throw new Error('Dois alvos colados são um alvo com uma fronteira invisível: gap: 8px no .acoes. Veio ' + getComputedStyle(document.querySelector('.acoes')).gap + '.');
            `,
          },
          {
            description: 'os campos têm 16px de fonte',
            assertion: `${AJUDANTES}
              const f = px(declarado('input', 'font-size'));
              if (f === null || f < 16) throw new Error('Campos com fonte menor que 16px fazem o iPhone dar zoom na página ao focar. Veio "' + (declarado('input', 'font-size') || '(nada)') + '".');
            `,
          },
        ],
        hints: ['Três regras, quatro propriedades: `min-height`, `min-width`, `gap`, `font-size`.'],
        solution: `<style>
  .acoes { display: flex; gap: 8px; }
  button { min-height: 44px; min-width: 44px; padding: 12px 16px; font-size: 1rem; }
  input { font-size: 16px; }
</style>

<label>Cupom <input></label>
<div class="acoes">
  <button>Aplicar</button>
  <button>Remover</button>
</div>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-26-lacuna-rodape',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt: 'Complete a barra fixa do rodapé: grudada embaixo, com espaço para a barra do sistema, e o toque que responde.',
        concepts: ['ui-polegar'],
        difficulty: 'iniciante',
        tags: ['ui', 'polegar'],
        template: `<style>
  .rodape-fixo {
    position: {{1}};
    bottom: 0;
    padding: 12px 16px;
    padding-bottom: calc(12px + env({{2}}));
    background: white;
  }
  .primario { min-height: 44px; width: 100%; transition: transform 100ms ease; }
  .primario:{{3}} { transform: scale(0.97); }
</style>

<main style="height: 600px">Conteúdo longo…</main>
<div class="rodape-fixo"><button class="primario">Continuar</button></div>`,
        blanks: [
          { placeholder: 'posição', size: 6 },
          { placeholder: 'área segura', size: 22 },
          { placeholder: 'ao tocar', size: 6 },
        ],
        tests: [
          {
            description: 'a barra fica grudada embaixo',
            assertion: `
              const p = getComputedStyle(document.querySelector('.rodape-fixo')).position;
              if (p !== 'sticky' && p !== 'fixed') throw new Error('position: sticky (ou fixed) com bottom: 0 mantém a barra no rodapé enquanto o conteúdo rola. Veio ' + p + '.');
            `,
          },
          {
            description: 'há espaço para a barra do sistema',
            assertion: `${AJUDANTES}
              const v = declarado('.rodape-fixo', 'padding-bottom');
              if (!/safe-area-inset-bottom/.test(v)) throw new Error('env(safe-area-inset-bottom) é o espaço da barra do sistema nos telefones sem botão físico. Veio "' + v + '".');
            `,
          },
          {
            description: 'o toque tem resposta',
            assertion: `${AJUDANTES}
              const r = regraBase('.primario:active');
              if (!r || !/scale/.test(r.getPropertyValue('transform'))) throw new Error('A resposta ao toque vai em :active — o polegar não tem hover.');
            `,
          },
        ],
        hints: ['A posição que gruda; a variável de ambiente da área segura de baixo; e a pseudo-classe do instante do toque.'],
        solution: ['sticky', 'safe-area-inset-bottom', 'active'],
        explanation:
          '`sticky` com `bottom: 0` prende a barra ao rodapé sem tirá-la do fluxo; `env(safe-area-inset-bottom)` empurra o botão para cima da barra do sistema, que em muitos telefones cobriria a metade de baixo dele; e `:active` é o único estado que o polegar dispara — a resposta visual que diz "recebi o toque".',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-26-ordenar-toque',
        type: 'order-steps',
        prompt: 'Uma pessoa preenche um formulário no telefone e envia. Coloque na ordem o que uma tela feita para o polegar faz.',
        concepts: ['ui-polegar'],
        difficulty: 'intermediario',
        tags: ['ui', 'polegar'],
        steps: [
          { id: 'toca', text: 'Ela toca num campo de 44px de altura, com 16px de fonte: o teclado sobe e a página não dá zoom', ordem: 1 },
          { id: 'teclado', text: 'O campo ativo continua visível acima do teclado, e o teclado é o certo para o campo', ordem: 2 },
          { id: 'proximo', text: 'Ela avança de campo em campo sem fechar o teclado', ordem: 3 },
          { id: 'rodape', text: 'O botão "Enviar" está na barra fixa do rodapé, ao alcance do polegar', ordem: 4 },
          { id: 'responde', text: 'Ao tocar, o botão responde no `:active`, e a tela mostra o estado de envio', ordem: 5 },
        ],
        explanation:
          'Cada passo é uma decisão de CSS ou HTML que você já viu: o tamanho do alvo, os 16px, o `inputmode`, a barra `sticky`, o `:active`. Juntas, elas fazem o formulário inteiro caber numa mão. Faltando uma, aparece um dos sintomas: zoom inesperado, botão escondido, toque sem resposta.',
        hints: ['O teclado sobe antes de qualquer digitação; o envio é o último toque.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-26-tela-inteira',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'A tela final: mova a ação principal para uma barra `.rodape-fixo` com `position: sticky; bottom: 0`; deixe os botões de ícone no topo com `aria-label` e **44px** de alvo; e dê ao `main` um `padding-bottom` de pelo menos **80px**, para o conteúdo não terminar escondido atrás da barra.',
        concepts: ['ui-polegar'],
        difficulty: 'intermediario',
        tags: ['ui', 'polegar'],
        initialCode: `<style>
  body { margin: 0; }
  main { padding: 16px; }
  button { min-height: 44px; min-width: 44px; padding: 12px 16px; border: 0; }
  .primario { background: #1f6660; color: white; width: 100%; }
  .icone { background: none; }
  /* .rodape-fixo */
</style>

<button class="primario">Continuar</button>

<div class="acoes-topo">
  <button class="icone">⚙</button>
  <button class="icone">🗑</button>
</div>

<main>
  <h1>Endereço de entrega</h1>
  <p>Conteúdo da tela.</p>
</main>
`,
        tests: [
          {
            description: 'a ação principal está numa barra fixa no rodapé, depois do conteúdo',
            assertion: `${AJUDANTES}
              const barra = document.querySelector('.rodape-fixo');
              if (!barra) throw new Error('Falta o elemento .rodape-fixo.');
              if (!barra.querySelector('.primario')) throw new Error('O botão .primario precisa estar dentro do .rodape-fixo.');
              const s = getComputedStyle(barra);
              if (s.position !== 'sticky' && s.position !== 'fixed') throw new Error('.rodape-fixo precisa de position: sticky (ou fixed) e bottom: 0. Veio position ' + s.position + '.');
              if (s.bottom !== '0px') throw new Error('bottom: 0 na .rodape-fixo. Veio ' + s.bottom + '.');
              const main = document.querySelector('main');
              if (!(main.compareDocumentPosition(barra) & Node.DOCUMENT_POSITION_FOLLOWING)) throw new Error('A barra vem depois do main no HTML: a ordem do Tab é a ordem do código, e o conteúdo vem antes da ação.');
            `,
          },
          {
            description: 'os botões de ícone têm nome e 44px',
            assertion: `${AJUDANTES}
              for (const b of document.querySelectorAll('.icone')) {
                if (!b.getAttribute('aria-label')) throw new Error('Cada botão de ícone precisa de aria-label — "Configurações", "Excluir conta".');
              }
              if ((px(declarado('button', 'min-height')) || 0) < 44) throw new Error('Os botões precisam manter 44px de alvo.');
            `,
          },
          {
            description: 'o conteúdo não termina atrás da barra',
            assertion: `${AJUDANTES}
              const pb = px(declarado('main', 'padding-bottom'));
              if (pb === null || pb < 80) throw new Error('main precisa de padding-bottom de pelo menos 80px, senão o fim do conteúdo fica escondido atrás da barra fixa. Veio "' + (declarado('main', 'padding-bottom') || '(nada)') + '".');
            `,
          },
        ],
        hints: [
          'No HTML: mova o botão para `<div class="rodape-fixo">` depois do `main`; ponha `aria-label` nos ícones.',
          'No CSS: `.rodape-fixo { position: sticky; bottom: 0; background: white; padding: 12px 16px; }` e `main { padding-bottom: 96px; }`.',
        ],
        solution: `<style>
  body { margin: 0; }
  main { padding: 16px; padding-bottom: 96px; }
  button { min-height: 44px; min-width: 44px; padding: 12px 16px; border: 0; }
  .primario { background: #1f6660; color: white; width: 100%; }
  .icone { background: none; }
  .rodape-fixo { position: sticky; bottom: 0; background: white; padding: 12px 16px; border-top: 1px solid #cbd5d1; }
</style>

<div class="acoes-topo">
  <button class="icone" aria-label="Configurações">⚙</button>
  <button class="icone" aria-label="Excluir conta">🗑</button>
</div>

<main>
  <h1>Endereço de entrega</h1>
  <p>Conteúdo da tela.</p>
</main>

<div class="rodape-fixo">
  <button class="primario">Continuar</button>
</div>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-26-arrastar',
        type: 'multiple-choice',
        prompt: 'Numa lista, a única forma de excluir um item é arrastá-lo para a esquerda. Qual é o problema?',
        concepts: ['ui-polegar'],
        difficulty: 'iniciante',
        tags: ['ui', 'polegar'],
        options: [
          'Nenhum; é um padrão conhecido',
          'Ninguém descobre um gesto invisível, e quem usa teclado ou leitor de tela não consegue arrastar — o gesto pode ser atalho, mas a ação precisa de um botão',
          'Arrastar é lento demais',
          'Só funciona no iPhone',
        ],
        correctIndex: 1,
        explanation:
          'Um gesto não tem sinal na tela: quem não conhece, não acha. E arrastar não existe para teclado nem para leitor de tela. O gesto é um bom atalho para quem já sabe; a ação precisa existir também como botão — visível, de 44px, com nome.',
        hints: ['Como uma pessoa que nunca usou a sua lista descobre que dá para arrastar?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Dá para usar com uma mão? Alvos de 44×44px com 8px entre eles; a ação principal numa barra fixa no rodapé, com espaço para a barra do sistema; o raro e o destrutivo no topo; campos com 16px; \`:active\` respondendo ao toque; nada que só exista no hover ou no arrastar. E o teste que nenhum emulador faz: o seu telefone, na sua mão, andando pela sala.`,
    },
  ],
};
