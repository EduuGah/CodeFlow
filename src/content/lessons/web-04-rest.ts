import type { Lesson } from '../types';

export const lessonRest: Lesson = {
  id: 'lesson-web-4',
  trackId: 'track-web',
  title: 'REST: Endereços que se Explicam',
  language: 'javascript',
  objective:
    'Desenhar caminhos e escolher métodos que descrevem recursos, em vez de inventar um verbo para cada ação.',
  concepts: ['rest', 'http'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Você já tem os métodos e os status. Falta a decisão que sobra: **como nomear os endereços**.

Sem uma regra, cada programador inventa a sua, e uma API vira isto:

~~~
GET  /pegarPedido?id=42
POST /criarNovoPedido
POST /atualizaPedidoExistente
GET  /listarTodosOsPedidosDoUsuario?u=7
POST /deletarPedido
~~~

Cinco endereços, cinco verbos inventados, e nada previsível: para saber como apagar um pedido você precisa procurar na documentação, porque não há como deduzir.

**REST** é a convenção que resolve isso, e ela cabe numa frase: **o caminho nomeia uma coisa, o método diz o que fazer com ela.**

~~~
GET    /pedidos          lista
POST   /pedidos          cria
GET    /pedidos/42       lê um
PUT    /pedidos/42       substitui
PATCH  /pedidos/42       altera alguns campos
DELETE /pedidos/42       apaga
~~~

Dois endereços, seis operações. E, mais importante: sabendo isso para \`pedidos\`, você já sabe para \`usuarios\`, \`produtos\` e qualquer outro recurso. É previsível por construção.

## As regras que caem dessa ideia

**Substantivo, não verbo.** O verbo já está no método. \`POST /criarPedido\` repete a informação, e o dia em que alguém escrever \`POST /novoPedido\` você terá dois nomes para a mesma coisa.

**Plural.** \`/pedidos\` é a coleção; \`/pedidos/42\` é um item dela. Misturar singular e plural obriga a decorar qual é qual em cada recurso.

**Hierarquia quando há posse.** Os pedidos de um usuário são \`/usuarios/7/pedidos\`. O caminho conta a relação, e nenhum parâmetro precisa explicá-la.

**Consulta para filtrar, não para identificar.** \`/pedidos?status=aberto&pagina=2\` filtra uma coleção. Já \`/pedidos?id=42\` está usando a consulta para identificar — e para isso existe o caminho, \`/pedidos/42\`.

Essa última separação tem uma consequência prática: \`/pedidos/42\` é **um endereço estável**. Dá para copiar, guardar num favorito, mandar por mensagem, guardar em cache. Um identificador escondido na consulta perde tudo isso.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const API = 'https://api.exemplo.com';

// Coleção: listar e criar
await fetch(API + '/pedidos');                                  // GET
await fetch(API + '/pedidos', { method: 'POST', body: corpo }); // POST

// Item: ler, alterar, apagar
await fetch(API + '/pedidos/42');
await fetch(API + '/pedidos/42', { method: 'PATCH', body: corpo });
await fetch(API + '/pedidos/42', { method: 'DELETE' });

// Coleção aninhada: os pedidos DESTE usuário
await fetch(API + '/usuarios/7/pedidos');

// Filtro e paginação vão na consulta
await fetch(API + '/pedidos?status=aberto&pagina=2');

// E o que não é um recurso? Um sub-recurso resolve quase sempre:
await fetch(API + '/pedidos/42/pagamento', { method: 'POST' });`,
      caption:
        'Ações que não são "criar/ler/alterar/apagar" costumam virar sub-recursos: pagar um pedido é **criar um pagamento** dentro dele. Quando nem isso encaixa, um `POST /pedidos/42/acoes/cancelar` é honesto — melhor um caso explicitamente fora do padrão do que torcer o resto para caber.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-4-desenhar',
        type: 'multiple-choice',
        prompt:
          'Você precisa de um endereço para **listar os pedidos em aberto do usuário 7, página 2**. Qual escolha segue a convenção?',
        concepts: ['rest'],
        difficulty: 'intermediario',
        tags: ['web', 'rest'],
        options: [
          '`GET /listarPedidos?usuario=7&status=aberto&pagina=2`',
          '`GET /usuarios/7/pedidos?status=aberto&pagina=2`',
          '`GET /pedidos/7/aberto/2`',
          '`POST /pedidos/buscar` com os filtros no corpo',
        ],
        correctIndex: 1,
        explanation:
          'O caminho conta a **relação** — os pedidos pertencem ao usuário 7 —, e a consulta traz o que **filtra** uma coleção: status e página. A primeira opção repete o verbo que já está no método e esconde a hierarquia num parâmetro. A terceira empilha três valores no caminho sem dizer o que cada um significa: `/pedidos/7/aberto/2` é indecifrável daqui a um mês. E a quarta usa `POST` para ler, o que joga fora tudo que o `GET` dá de graça — cache, favorito, link compartilhável — sem nada em troca.',
        hints: [
          'O que é hierarquia (uma coisa pertence a outra) e o que é filtro (peneirar uma lista)?',
          'Uma das opções usa POST para uma operação que não muda nada. O que se perde com isso?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-4-prever-caminho',
        type: 'predict-output',
        prompt:
          'Esta função monta caminhos REST. O que ela imprime nos três casos?',
        concepts: ['rest', 'strings'],
        difficulty: 'iniciante',
        tags: ['web', 'rest'],
        code: `function caminho(recurso, id) {
  return id === undefined ? '/' + recurso : '/' + recurso + '/' + id;
}

console.log(caminho('pedidos'));
console.log(caminho('pedidos', 42));
console.log(caminho('pedidos', 0));`,
        expectedOutput: '/pedidos\n/pedidos/42\n/pedidos/0',
        explanation:
          'A comparação com `undefined` é o que separa a coleção do item. Repare no terceiro caso: o id `0` é um identificador legítimo, e comparar com `undefined` o trata corretamente. Se a condição fosse `if (!id)` — a forma que muitos escrevem por hábito —, o zero cairia no lado errado e a função devolveria a coleção inteira quando o pedido era pelo item `0`. É a mesma armadilha dos valores falsos da aula de condições, agora decidindo qual endereço será chamado.',
        hints: [
          'O que separa "listar a coleção" de "ler um item" nesta função?',
          'O terceiro caso passa `0`. Ele é `undefined`?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-4-lacuna-plural',
        type: 'fill-blank',
        prompt:
          'Complete o montador de caminhos. Sem `id`, devolve a coleção; com `id`, devolve o item. Lembre que `0` é um id válido.',
        concepts: ['rest', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['web', 'rest'],
        template: `function caminhoDe(recurso, id) {
  const base = '/' + recurso;

  if (id === {{1}} || id === {{2}}) return base;

  return base + '/' + id;
}`,
        blanks: [
          { placeholder: 'não passado', size: 9 },
          { placeholder: 'passado vazio', size: 5 },
        ],
        tests: [
          {
            description: 'sem id, devolve a coleção',
            assertion: `const r = caminhoDe('pedidos'); if (r !== '/pedidos') throw new Error("Esperava '/pedidos', veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'com id, devolve o item',
            assertion: `const r = caminhoDe('pedidos', 42); if (r !== '/pedidos/42') throw new Error("Esperava '/pedidos/42', veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'o id zero é um id de verdade',
            assertion: `const r = caminhoDe('pedidos', 0); if (r !== '/pedidos/0') throw new Error("0 é um identificador legítimo: esperava '/pedidos/0', veio " + JSON.stringify(r) + ". Comparar com os valores explícitos evita a armadilha do valor falso.");`,
          },
          {
            description: 'id nulo também devolve a coleção',
            assertion: `const r = caminhoDe('usuarios', null); if (r !== '/usuarios') throw new Error("Sem identificador, o caminho é o da coleção. Veio " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
          {
            description: 'id em texto funciona igual',
            assertion: `const r = caminhoDe('usuarios', 'ana'); if (r !== '/usuarios/ana') throw new Error("Esperava '/usuarios/ana', veio " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'o caminho do item é sempre o da coleção mais barra e id',
            generate: `
              const recursos = ['pedidos', 'usuarios', 'produtos'];
              const recurso = recursos[Math.floor(rnd() * recursos.length)];

              const sorteio = rnd();
              const id = sorteio < 0.3 ? undefined : sorteio < 0.4 ? null : Math.floor(rnd() * 100);

              return { recurso: recurso, id: id, temId: sorteio >= 0.4 };
            `,
            check: `
              const obtido = caminhoDe(caso.recurso, caso.id);
              const esperado = caso.temId ? '/' + caso.recurso + '/' + caso.id : '/' + caso.recurso;

              if (obtido !== esperado) {
                throw new Error("para (" + caso.recurso + ", " + JSON.stringify(caso.id) + ") esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        explanation:
          'Comparar com os dois valores explícitos — em vez de escrever `if (!id)` — é o que faz o id `0` funcionar. Parece detalhe até o dia em que a sua numeração começa do zero, e aí a diferença é entre buscar um item e baixar a coleção inteira. Vale o mesmo para o texto vazio, que `!id` também trataria como ausente.',
        hints: [
          'São os dois valores que significam "não veio nada" em JavaScript.',
          'Um é o que uma função recebe quando o argumento não foi passado; o outro é o "vazio" que se passa de propósito.',
        ],
        solution: ['undefined', 'null'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-4-montar-rota',
        type: 'code',
        prompt: `Crie \`montarRota(partes, filtros)\`, que **retorna** o caminho REST completo.\n\n- \`partes\` é uma lista alternando recurso e id: \`["usuarios", 7, "pedidos"]\` → \`/usuarios/7/pedidos\`.\n- \`filtros\` é um objeto que vira a consulta, em pares \`chave=valor\` unidos por \`&\`, depois de um \`?\`.\n- Filtros com valor \`undefined\` ou \`null\` **não entram** — é assim que se monta um filtro opcional sem \`if\`.\n- Sem nenhum filtro válido, não há \`?\` no fim.\n- A ordem dos filtros é a ordem das chaves do objeto.`,
        concepts: ['rest', 'objetos'],
        difficulty: 'intermediario',
        tags: ['web', 'rest'],
        initialCode: `function montarRota(partes, filtros) {
  // Junte as partes com barra, depois acrescente a consulta se houver.
}

console.log(montarRota(['usuarios', 7, 'pedidos'], { status: 'aberto', pagina: 2 }));
// "/usuarios/7/pedidos?status=aberto&pagina=2"

console.log(montarRota(['pedidos', 42], {}));
// "/pedidos/42"

console.log(montarRota(['pedidos'], { status: 'aberto', busca: undefined }));
// "/pedidos?status=aberto"`,
        hints: [
          'O caminho é uma barra seguida das partes unidas por barra.',
          'Para a consulta, percorra as chaves do objeto e descarte as que têm valor ausente.',
          'Cada par vira `chave + "=" + valor`; depois junte tudo com "&".',
          'Só acrescente o "?" se sobrou pelo menos um par.',
        ],
        tests: [
          {
            description: 'A função montarRota existe',
            assertion: `if (typeof montarRota !== 'function') throw new Error("Crie uma função chamada 'montarRota'.");`,
          },
          {
            description: 'monta caminho aninhado com filtros',
            assertion: `
              const r = montarRota(['usuarios', 7, 'pedidos'], { status: 'aberto', pagina: 2 });
              if (r !== '/usuarios/7/pedidos?status=aberto&pagina=2') throw new Error("Esperava '/usuarios/7/pedidos?status=aberto&pagina=2', veio " + JSON.stringify(r) + ".");
            `,
          },
          {
            description: 'sem filtros, não há interrogação',
            assertion: `
              const r = montarRota(['pedidos', 42], {});
              if (r !== '/pedidos/42') throw new Error("Sem filtro nenhum não existe consulta. Esperava '/pedidos/42', veio " + JSON.stringify(r) + ".");
            `,
          },
          {
            description: 'filtro ausente não entra na consulta',
            assertion: `
              const r = montarRota(['pedidos'], { status: 'aberto', busca: undefined });
              if (r !== '/pedidos?status=aberto') throw new Error("Filtro com valor ausente é descartado. Esperava '/pedidos?status=aberto', veio " + JSON.stringify(r) + ".");
            `,
          },
          {
            description: 'todos os filtros ausentes deixam a rota sem interrogação',
            assertion: `
              const r = montarRota(['pedidos'], { status: undefined, busca: null });
              if (r !== '/pedidos') throw new Error("Nenhum filtro sobrou, então não há '?'. Veio " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
          {
            description: 'o id zero continua no caminho',
            assertion: `
              const r = montarRota(['pedidos', 0], {});
              if (r !== '/pedidos/0') throw new Error("0 é um id legítimo e faz parte do caminho. Veio " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
          {
            description: 'filtro com valor zero ou vazio é mantido',
            assertion: `
              const r = montarRota(['pedidos'], { pagina: 0, busca: '' });
              if (r !== '/pedidos?pagina=0&busca=') throw new Error("Só undefined e null são descartados; 0 e texto vazio são valores. Esperava '/pedidos?pagina=0&busca=', veio " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'o caminho vem das partes e a consulta só dos filtros presentes',
            generate: `
              const recursos = ['usuarios', 'pedidos', 'produtos'];
              const partes = [recursos[Math.floor(rnd() * 3)]];

              if (rnd() < 0.6) {
                partes.push(Math.floor(rnd() * 50));
                if (rnd() < 0.5) partes.push(recursos[Math.floor(rnd() * 3)]);
              }

              const filtros = {};
              const presentes = [];

              if (rnd() < 0.7) { filtros.status = 'aberto'; presentes.push('status=aberto'); }
              if (rnd() < 0.5) { filtros.pagina = Math.floor(rnd() * 10); presentes.push('pagina=' + filtros.pagina); }
              if (rnd() < 0.5) filtros.busca = rnd() < 0.5 ? undefined : null;

              return { partes: partes, filtros: filtros, presentes: presentes };
            `,
            check: `
              const esperado =
                '/' + caso.partes.join('/') +
                (caso.presentes.length === 0 ? '' : '?' + caso.presentes.join('&'));

              const obtido = montarRota(caso.partes, caso.filtros);

              if (obtido !== esperado) {
                throw new Error("para " + JSON.stringify(caso.partes) + " e " + JSON.stringify(caso.filtros) + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        solution: `function montarRota(partes, filtros) {
  const caminho = '/' + partes.join('/');

  const pares = [];
  for (const chave of Object.keys(filtros)) {
    const valor = filtros[chave];
    if (valor === undefined || valor === null) continue;
    pares.push(chave + '=' + valor);
  }

  if (pares.length === 0) return caminho;
  return caminho + '?' + pares.join('&');
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `REST cabe numa frase: **o caminho nomeia uma coisa, o método diz o que fazer com ela.** Daí caem as regras — substantivo no plural, porque o verbo já está no método; hierarquia no caminho quando há posse (\`/usuarios/7/pedidos\`); e consulta para **filtrar** uma coleção, nunca para identificar um item, porque \`/pedidos/42\` é um endereço estável que dá para guardar, compartilhar e colocar em cache. Ações que não são criar/ler/alterar/apagar viram sub-recursos: pagar um pedido é criar um pagamento dentro dele. E quando nada encaixa, um caminho explicitamente fora do padrão é melhor do que torcer o resto para caber.`,
    },
  ],
};
