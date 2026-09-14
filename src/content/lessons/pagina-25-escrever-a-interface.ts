import type { Lesson } from '../types';

export const lessonEscreverAInterface: Lesson = {
  id: 'lesson-pagina-25',
  trackId: 'track-pagina',
  title: 'Escrever a Interface: As Palavras Também São Design',
  language: 'html',
  objective:
    'Escrever os textos curtos de uma interface — botões, títulos, erros, confirmações, estados vazios — de forma que a pessoa saiba o que vai acontecer antes de clicar.',
  concepts: ['ui-texto-interface'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
"OK". "Enviar". "Erro 0x42". "Tem certeza?". Metade do que uma interface diz é dito em três palavras, e essas três palavras são a diferença entre uma pessoa que sabe o que vai acontecer e uma que clica com medo. Escrever esses textos é design — e tem regras tão claras quanto as de contraste.

## Botões dizem o que fazem

O rótulo de um botão é **o verbo da ação, no infinitivo, com o objeto quando ajuda**: "Salvar alterações", "Criar conta", "Pagar R$ 89,90", "Excluir tarefa". Não "OK", não "Enviar", não "Sim". Teste: lendo só o botão, sem o resto da tela, dá para saber o que acontece? "OK" não passa; "Excluir tarefa" passa.

E o botão que **não** faz nada de irreversível — voltar, fechar, cancelar — é o secundário, e diz isso: "Cancelar", "Voltar", "Manter".

## Confirmações nomeiam a consequência

"Tem certeza?" com "Sim" e "Não" obriga a pessoa a reler tudo para lembrar o que "sim" faz. A confirmação diz **o que vai acontecer** e oferece a ação pelo nome:

~~~
Excluir 3 tarefas?
Isto não pode ser desfeito.

[Excluir 3 tarefas]  [Manter]
~~~

O número é concreto. A consequência está na segunda linha. E os botões repetem a ação — dá para decidir só pelos botões. Confirme só o que é irreversível; para o resto, faça e ofereça desfazer.

## Erros: o que houve e o que fazer

Você já sabe a estrutura. Vale repetir porque é onde mais se erra:

| Ruim | Bom |
| --- | --- |
| Erro 0x42 | Não foi possível salvar. Tente de novo em alguns segundos. |
| Campo inválido | Falta o @ no e-mail. |
| Algo deu errado | Sem conexão. Verifique a internet e tente de novo. |
| Senha incorreta | A senha não confere. Esqueceu? Redefina por aqui. |

Sem culpa ("você digitou errado"), sem jargão ("exceção", "timeout"), sem exclamação. E com o próximo passo, sempre.

## Títulos dizem o que a tela é

O \`h1\` de uma tela é a resposta a "onde estou?": "Finalizar compra", "Suas tarefas", "Editar perfil". Substantivo ou verbo no infinitivo, curto, sem ponto final. Não "Bem-vindo!" — isso não diz onde a pessoa está.

## Estados vazios convidam

"Nenhum item encontrado" é uma parede. "Você ainda não tem tarefas. Crie a primeira." é uma porta. O estado vazio diz o que falta **e** oferece o próximo passo — de preferência, com o botão ali.

## As mesmas palavras, sempre

Se é "tarefa" no menu, é "tarefa" no botão, no título, no erro e na confirmação — nunca "item", "atividade" ou "to-do" no meio do caminho. Cada sinônimo é uma dúvida: "é a mesma coisa?". Um glossário de dez palavras, e todo mundo usa as mesmas.

## Os erros

- "OK", "Enviar", "Sim/Não".
- "Tem certeza?" sem dizer certeza de quê.
- Erro em código ou jargão, sem próximo passo.
- Ponto de exclamação para dar ânimo.
- Três nomes para a mesma coisa.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  .primario { background: #1f6660; color: white; border: 0; padding: 12px 16px; }
  .perigo { background: #b42318; color: white; border: 0; padding: 12px 16px; }
  .secundario { background: none; border: 1px solid #cbd5d1; padding: 12px 16px; }
  .dialogo { border: 1px solid #cbd5d1; padding: 16px; max-width: 24rem; }
  .suave { color: #5f625d; }
</style>

<h1>Suas tarefas</h1>
<p class="suave">Você ainda não tem tarefas. Crie a primeira.</p>
<button class="primario">Nova tarefa</button>

<div class="dialogo" role="dialog" aria-labelledby="titulo-dialogo">
  <h2 id="titulo-dialogo">Excluir 3 tarefas?</h2>
  <p>Isto não pode ser desfeito.</p>
  <button class="perigo">Excluir 3 tarefas</button>
  <button class="secundario">Manter</button>
</div>

<p role="alert">Não foi possível salvar. Tente de novo em alguns segundos.</p>`,
      caption:
        'Cada texto responde a uma pergunta: o título, "onde estou?"; o botão, "o que acontece se eu clicar?"; a confirmação, "o que vou perder?"; o erro, "e agora?". Nenhum "OK", nenhum "Tem certeza?", nenhuma exclamação.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-25-botao',
        type: 'multiple-choice',
        prompt: 'Qual rótulo é o certo para o botão que confirma a exclusão de uma tarefa?',
        concepts: ['ui-texto-interface'],
        difficulty: 'iniciante',
        tags: ['ui', 'texto'],
        options: ['OK', 'Sim', 'Excluir tarefa', 'Confirmar'],
        correctIndex: 2,
        explanation:
          'Lendo só o botão, sem o resto da tela, "Excluir tarefa" diz o que acontece; "OK", "Sim" e "Confirmar" dependem de a pessoa lembrar a pergunta. O verbo com o objeto é a regra: quem lê o botão sozinho sabe a consequência — e é exatamente o que se quer numa ação irreversível.',
        hints: ['Cubra o resto da tela: só com o botão, você sabe o que vai acontecer?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-25-consertar-textos',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Reescreva os textos: o `h1` diz onde a pessoa está (**Suas tarefas**); o `#vazio` convida (**Você ainda não tem tarefas. Crie a primeira.**); o botão primário diz o que faz (**Nova tarefa**); e o erro diz o que houve e o que fazer (**Não foi possível salvar. Tente de novo.**).',
        concepts: ['ui-texto-interface'],
        difficulty: 'iniciante',
        tags: ['ui', 'texto'],
        initialCode: `<style>
  .primario { background: #1f6660; color: white; border: 0; padding: 12px 16px; }
</style>

<h1>Bem-vindo!</h1>
<p id="vazio">Nenhum item encontrado</p>
<button class="primario">OK</button>
<p id="erro" role="alert">Erro 0x42</p>
`,
        tests: [
          {
            description: 'o título diz onde a pessoa está',
            assertion: `const t = document.querySelector('h1').textContent.trim(); if (t !== 'Suas tarefas') throw new Error('O h1 responde "onde estou?": "Suas tarefas". Veio "' + t + '".');`,
          },
          {
            description: 'o estado vazio convida',
            assertion: `const v = document.querySelector('#vazio').textContent.trim(); if (v !== 'Você ainda não tem tarefas. Crie a primeira.') throw new Error('O vazio diz o que falta e o próximo passo: "Você ainda não tem tarefas. Crie a primeira." Veio "' + v + '".');`,
          },
          {
            description: 'o botão diz o que faz',
            assertion: `const b = document.querySelector('.primario').textContent.trim(); if (b !== 'Nova tarefa') throw new Error('O botão é o verbo da ação com o objeto: "Nova tarefa". Veio "' + b + '".');`,
          },
          {
            description: 'o erro diz o que houve e o que fazer',
            assertion: `const e = document.querySelector('#erro').textContent.trim(); if (e !== 'Não foi possível salvar. Tente de novo.') throw new Error('O erro tem duas frases, em linguagem de gente: "Não foi possível salvar. Tente de novo." Veio "' + e + '".');`,
          },
        ],
        hints: ['Só os textos mudam; as tags e as classes ficam.'],
        solution: `<style>
  .primario { background: #1f6660; color: white; border: 0; padding: 12px 16px; }
</style>

<h1>Suas tarefas</h1>
<p id="vazio">Você ainda não tem tarefas. Crie a primeira.</p>
<button class="primario">Nova tarefa</button>
<p id="erro" role="alert">Não foi possível salvar. Tente de novo.</p>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-25-lacuna-confirmacao',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt: 'Complete a confirmação: o título com o número concreto, a consequência, e os botões pelo nome da ação.',
        concepts: ['ui-texto-interface'],
        difficulty: 'iniciante',
        tags: ['ui', 'texto'],
        template: `<div role="dialog" aria-labelledby="t">
  <h2 id="t">Excluir {{1}} tarefas?</h2>
  <p>Isto não pode ser {{2}}.</p>
  <button id="confirmar">Excluir 3 tarefas</button>
  <button id="cancelar">{{3}}</button>
</div>`,
        blanks: [
          { placeholder: 'quantas', size: 2 },
          { placeholder: 'consequência', size: 8 },
          { placeholder: 'o contrário', size: 6 },
        ],
        tests: [
          {
            description: 'o título tem o número concreto',
            assertion: `if (document.querySelector('#t').textContent.trim() !== 'Excluir 3 tarefas?') throw new Error('O título repete o número que o botão confirma: "Excluir 3 tarefas?".');`,
          },
          {
            description: 'a consequência está dita',
            assertion: `if (!/não pode ser desfeit[oa]\\./i.test(document.querySelector('p').textContent)) throw new Error('A segunda linha diz a consequência: "Isto não pode ser desfeito."');`,
          },
          {
            description: 'o botão de cancelar diz o que faz, e não "Não"',
            assertion: `const c = document.querySelector('#cancelar').textContent.trim(); if (!/^(Manter|Cancelar)$/.test(c)) throw new Error('O secundário nomeia a ação de não fazer: "Manter" (ou "Cancelar"), nunca "Não". Veio "' + c + '".');`,
          },
        ],
        hints: ['O número do botão de confirmar; o particípio de "desfazer"; e o verbo de não excluir.'],
        solution: ['3', 'desfeito', 'Manter'],
        explanation:
          'Título, consequência, botões pelo nome: a pessoa consegue decidir lendo só os botões, e sabe exatamente quantas tarefas vão embora e que não há volta. Compare com "Tem certeza? [Sim] [Não]": mesma pergunta, nenhuma informação.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-25-ordenar-erro',
        type: 'order-steps',
        prompt: 'Como escrever uma mensagem de erro. Coloque as decisões na ordem.',
        concepts: ['ui-texto-interface'],
        difficulty: 'intermediario',
        tags: ['ui', 'texto'],
        steps: [
          { id: 'houve', text: 'Dizer o que aconteceu, em linguagem de gente: "Não foi possível salvar"', ordem: 1 },
          { id: 'porque', text: 'Se a causa ajuda a corrigir, dizer a causa: "Sem conexão"', ordem: 2 },
          { id: 'fazer', text: 'Dizer o que fazer: "Verifique a internet e tente de novo"', ordem: 3 },
          { id: 'tirar', text: 'Tirar o que não ajuda: códigos, jargão, exclamação, culpa', ordem: 4 },
          { id: 'onde', text: 'Colocar a mensagem perto do que falhou, num `role="alert"`', ordem: 5 },
        ],
        explanation:
          'O que houve e o que fazer são obrigatórios; a causa entra só quando muda o que a pessoa faz ("sem conexão" muda; "erro 500" não). E o passo de tirar é uma edição: quase toda mensagem nasce com um código, um "ops!" ou um "você" acusatório que só atrapalha.',
        hints: ['Primeiro o que dizer; depois o que cortar; por último, onde pôr.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-25-glossario',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'A tela chama a mesma coisa de três nomes: "tarefa", "item" e "atividade". Padronize: **tarefa** em todo lugar — no título, no botão, no estado vazio e no `aria-label` do botão de remover.',
        concepts: ['ui-texto-interface'],
        difficulty: 'intermediario',
        tags: ['ui', 'texto'],
        initialCode: `<h1>Suas atividades</h1>
<p id="vazio">Você ainda não tem itens. Crie o primeiro.</p>
<button class="primario">Nova atividade</button>
<ul>
  <li>Comprar pão <button aria-label="Remover item">×</button></li>
</ul>
`,
        tests: [
          {
            description: 'nenhum "item" ou "atividade" sobrou',
            assertion: `
              // Só o texto visível: o jsdom não implementa innerText, e o
              // textContent do body traria os scripts da página (getItem…).
              const partes = [];
              const andarilho = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
              let no;
              while ((no = andarilho.nextNode())) {
                const pai = no.parentElement;
                if (pai && (pai.tagName === 'SCRIPT' || pai.tagName === 'STYLE')) continue;
                partes.push(no.textContent);
              }
              const texto = partes.join(' ') + ' ' + [...document.querySelectorAll('[aria-label]')].map((e) => e.getAttribute('aria-label')).join(' ');
              if (/(item|itens|atividade)/i.test(texto)) throw new Error('Ainda há "item" ou "atividade" na tela. A coisa se chama tarefa em todo lugar.');
            `,
          },
          {
            description: 'título, botão, vazio e aria-label usam "tarefa"',
            assertion: `
              if (!/tarefas/i.test(document.querySelector('h1').textContent)) throw new Error('O título: "Suas tarefas".');
              if (!/tarefa/i.test(document.querySelector('.primario').textContent)) throw new Error('O botão: "Nova tarefa".');
              if (!/tarefas?/i.test(document.querySelector('#vazio').textContent)) throw new Error('O vazio: "Você ainda não tem tarefas. Crie a primeira."');
              if (!/tarefa/i.test(document.querySelector('li button').getAttribute('aria-label') || '')) throw new Error('O aria-label: "Remover tarefa" (ou com o nome dela).');
            `,
          },
        ],
        hints: ['Quatro lugares, uma palavra. Repare que o gênero muda: "a primeira", não "o primeiro".'],
        solution: `<h1>Suas tarefas</h1>
<p id="vazio">Você ainda não tem tarefas. Crie a primeira.</p>
<button class="primario">Nova tarefa</button>
<ul>
  <li>Comprar pão <button aria-label="Remover tarefa Comprar pão">×</button></li>
</ul>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-25-exclamacao',
        type: 'multiple-choice',
        prompt: '"Ops! Algo deu errado! Tente novamente!" — o que há de errado com esta mensagem?',
        concepts: ['ui-texto-interface'],
        difficulty: 'iniciante',
        tags: ['ui', 'texto'],
        options: [
          'Nada; é simpática',
          'Não diz o que houve nem o que fazer de concreto, e as exclamações fingem ânimo numa hora em que a pessoa está frustrada',
          'Falta um código de erro',
          'Deveria estar em maiúsculas',
        ],
        correctIndex: 1,
        explanation:
          '"Algo" não é informação; "tente novamente" sem dizer quando ou o quê é um chute; e três exclamações num erro soam como alguém sorrindo enquanto a sua compra falha. O tom certo é calmo e específico: "Não foi possível concluir o pagamento. Confira os dados do cartão e tente de novo."',
        hints: ['O que a pessoa consegue fazer depois de ler isso?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Botões dizem o que fazem: verbo com objeto, nunca "OK". Confirmações nomeiam a consequência e o número, com os botões pelo nome da ação — e só para o irreversível. Erros dizem o que houve e o que fazer, sem código, jargão, culpa nem exclamação. Títulos dizem onde a pessoa está; estados vazios convidam. E a mesma coisa tem sempre o mesmo nome.`,
    },
  ],
};
