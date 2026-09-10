import type { Lesson } from '../types';

export const lessonCabecalhos: Lesson = {
  id: 'lesson-web-3',
  trackId: 'track-web',
  title: 'Cabeçalhos: Os Metadados que Decidem Tudo',
  language: 'javascript',
  objective:
    'Ler e escrever cabeçalhos HTTP, e reconhecer os que causam a maior parte dos problemas de integração.',
  concepts: ['http'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
O corpo de um pedido carrega o **dado**. Os cabeçalhos carregam tudo o que se precisa saber **sobre** o dado — e, na prática, é neles que mora a maioria dos problemas de integração.

Cada um é uma linha \`Nome: valor\`. Os que você vai encontrar toda semana:

| Cabeçalho | Quem manda | Diz o quê |
|---|---|---|
| \`Content-Type\` | os dois | o formato do corpo **desta** mensagem |
| \`Accept\` | cliente | o formato que eu **gostaria** de receber |
| \`Authorization\` | cliente | quem eu sou |
| \`Cache-Control\` | os dois | por quanto tempo isso pode ser guardado |
| \`Location\` | servidor | para onde ir (nos \`3xx\` e no \`201\`) |

## \`Content-Type\` é uma promessa, não um pedido

Este é o cabeçalho que mais causa confusão, e a razão é uma troca de papéis. \`Content-Type\` **descreve o corpo que está indo junto**. Ele não pede nada; ele avisa.

~~~javascript
await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nome: 'Ana' }),
});
~~~

Aqui você está dizendo ao servidor: "o texto que segue é JSON, interprete assim". Se você mandar o \`JSON.stringify\` sem o cabeçalho, muitos servidores vão tratar o corpo como texto comum e devolver \`400\`. E se mandar o cabeçalho sem o \`stringify\` — passando o objeto direto —, o corpo vira a string \`"[object Object]"\`, que é JSON inválido. Os dois erros dão o mesmo \`400\` com mensagens diferentes.

Quem pede formato é o **\`Accept\`**: "me responda em JSON, se puder".

## Nomes não diferenciam maiúsculas

\`Content-Type\`, \`content-type\` e \`CONTENT-TYPE\` são o mesmo cabeçalho. O padrão manda tratá-los assim, e servidores costumam devolver tudo em minúsculas.

Isso importa quando você lê cabeçalhos por conta própria: comparar \`nome === 'Content-Type'\` funciona no seu teste e falha em produção, porque o servidor mandou \`content-type\`. **Normalize antes de comparar** — é o mesmo cuidado da aula de textos, agora com consequência de integração.

No \`fetch\`, o objeto \`Headers\` já resolve isso: \`resposta.headers.get('content-type')\` acha o cabeçalho independentemente de como ele veio escrito.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const resposta = await fetch(url);

// Ler: a busca ignora maiúsculas e devolve null quando não existe
const tipo = resposta.headers.get('content-type');
console.log(tipo);   // "application/json; charset=utf-8"

// Repare no "; charset=utf-8": o valor tem parâmetros depois do ponto e vírgula.
// Comparar com === falha; o que se quer saber é se COMEÇA com o tipo.
if (tipo && tipo.startsWith('application/json')) {
  const dados = await resposta.json();
}

// Escrever: um objeto simples basta
await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + token,
  },
  body: JSON.stringify({ nome: 'Ana' }),
});`,
      caption:
        'O `; charset=utf-8` grudado no valor é a pegadinha mais comum aqui: `tipo === "application/json"` dá falso para uma resposta perfeitamente normal. Use `startsWith`.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-3-content-type',
        type: 'multiple-choice',
        prompt:
          'Você manda um `POST` com `body: JSON.stringify({...})` mas **sem** o cabeçalho `Content-Type`, e o servidor responde `400`. Por quê?',
        concepts: ['http'],
        difficulty: 'iniciante',
        tags: ['web', 'http'],
        options: [
          'Porque `JSON.stringify` produz um formato que o servidor não entende',
          'Porque o servidor recebeu um texto sem saber que deveria interpretá-lo como JSON',
          'Porque falta o cabeçalho `Accept: application/json`',
          'Porque `POST` exige sempre um cabeçalho `Authorization`',
        ],
        correctIndex: 1,
        explanation:
          'O corpo de um pedido é sempre texto — o servidor precisa que alguém diga em que formato ele está, e é isso que `Content-Type` faz. Sem ele, o servidor trata o corpo como texto comum, não encontra os campos que esperava, e responde `400`. `Accept` não resolveria: ele fala do formato da **resposta**, não do que está indo. E `Authorization` é outro assunto — faltando ele o status seria `401`, não `400`.',
        hints: [
          '`Content-Type` descreve o corpo que está indo, ou o que você quer receber?',
          'O servidor tem como adivinhar o formato do texto que chegou?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-3-prever-caixa',
        type: 'predict-output',
        prompt:
          'Um servidor devolveu os cabeçalhos em minúsculas, como quase todos fazem. O que este programa imprime?',
        concepts: ['http', 'strings'],
        difficulty: 'iniciante',
        tags: ['web', 'http'],
        code: `const cabecalhos = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

console.log(cabecalhos['Content-Type']);
console.log(cabecalhos['content-type'] === 'application/json');
console.log(cabecalhos['content-type'].startsWith('application/json'));`,
        expectedOutput: 'undefined\nfalse\ntrue',
        explanation:
          'Duas armadilhas seguidas. A primeira: um objeto comum **diferencia** maiúsculas, então `Content-Type` não acha a chave `content-type` e o resultado é `undefined` — o cabeçalho existe, mas você procurou pelo nome errado. A segunda: o valor traz `; charset=utf-8` grudado, então a comparação exata dá falso mesmo sendo JSON. `startsWith` é o que responde a pergunta que realmente se está fazendo.',
        hints: [
          'Buscar `obj["Content-Type"]` num objeto que tem a chave `content-type` acha o quê?',
          'O valor é exatamente `"application/json"`, ou tem mais coisa depois?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-3-lacuna-buscar',
        type: 'fill-blank',
        prompt:
          'Complete a busca de cabeçalho que funciona independentemente de como o nome veio escrito. Devolve `null` quando não existe.',
        concepts: ['http', 'strings'],
        difficulty: 'intermediario',
        tags: ['web', 'strings'],
        template: `function buscarCabecalho(cabecalhos, nome) {
  const procurado = nome.{{1}}();

  for (const chave of Object.keys(cabecalhos)) {
    if (chave.{{1}}() === procurado) return cabecalhos[chave];
  }

  return {{2}};
}`,
        blanks: [
          { placeholder: 'iguala caixa', size: 12 },
          { placeholder: 'não achou', size: 5 },
        ],
        tests: [
          {
            description: 'acha o cabeçalho escrito em outra caixa',
            assertion: `
              const h = { 'content-type': 'application/json' };
              const r = buscarCabecalho(h, 'Content-Type');
              if (r !== 'application/json') throw new Error("Deveria achar mesmo com a caixa diferente. Veio " + JSON.stringify(r) + ".");
            `,
          },
          {
            description: 'acha quando as duas caixas coincidem',
            assertion: `
              const h = { 'Cache-Control': 'no-store' };
              const r = buscarCabecalho(h, 'Cache-Control');
              if (r !== 'no-store') throw new Error("Esperava 'no-store', veio " + JSON.stringify(r) + ".");
            `,
          },
          {
            description: 'devolve null quando o cabeçalho não existe',
            assertion: `
              const r = buscarCabecalho({ 'content-type': 'text/html' }, 'Authorization');
              if (r !== null) throw new Error("Cabeçalho ausente deveria devolver null, veio " + JSON.stringify(r) + ".");
            `,
          },
          {
            description: 'objeto de cabeçalhos vazio devolve null',
            assertion: `
              const r = buscarCabecalho({}, 'Content-Type');
              if (r !== null) throw new Error("Sem nenhum cabeçalho, o resultado é null. Veio " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
          {
            description: 'o nome procurado também pode vir em qualquer caixa',
            assertion: `
              const h = { 'Content-Type': 'application/json' };
              if (buscarCabecalho(h, 'CONTENT-TYPE') !== 'application/json') throw new Error("Os DOIS lados da comparação precisam ser normalizados.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'acha o cabeçalho seja qual for a caixa dos dois lados',
            generate: `
              const nomes = ['content-type', 'authorization', 'cache-control', 'accept'];
              const nome = nomes[Math.floor(rnd() * nomes.length)];

              const embaralhar = (t) => {
                let saida = '';
                for (let i = 0; i < t.length; i++) {
                  saida += rnd() < 0.5 ? t[i].toUpperCase() : t[i];
                }
                return saida;
              };

              const cabecalhos = {};
              cabecalhos[embaralhar(nome)] = 'valor-' + nome;

              return { cabecalhos: cabecalhos, procurado: embaralhar(nome), esperado: 'valor-' + nome };
            `,
            check: `
              const obtido = buscarCabecalho(caso.cabecalhos, caso.procurado);
              if (obtido !== caso.esperado) {
                throw new Error("procurando " + JSON.stringify(caso.procurado) + " em " + JSON.stringify(caso.cabecalhos) + " esperava " + JSON.stringify(caso.esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        explanation:
          'Os **dois** lados precisam ser normalizados: o nome que você procura e a chave que veio do servidor. Normalizar só um deles funciona nos seus testes — em que você escreve os dois — e falha em produção, onde metade do par vem de outra pessoa. É o mesmo cuidado da aula de textos, agora com consequência de integração.',
        hints: [
          'O método que deixa tudo na mesma caixa já apareceu na aula de textos, e ele entra nas duas lacunas iguais.',
          'A última lacuna é o valor que significa "procurei e não achei".',
        ],
        solution: ['toLowerCase', 'null'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-3-ler-cabecalhos',
        type: 'code',
        prompt: `Crie \`lerCabecalhos(texto)\`, que **retorna** um objeto a partir do bloco de cabeçalhos de uma resposta HTTP.\n\n- Uma linha por cabeçalho, no formato \`Nome: valor\`.\n- As chaves saem **em minúsculas**, que é como o padrão manda tratá-las.\n- O espaço depois dos dois-pontos não faz parte do valor.\n- Linhas em branco são ignoradas; linhas sem \`:\` também.\n- O valor pode conter dois-pontos (uma URL, por exemplo): só o **primeiro** separa.`,
        concepts: ['http', 'strings'],
        difficulty: 'intermediario',
        tags: ['web', 'strings'],
        initialCode: `function lerCabecalhos(texto) {
  // Uma linha por cabeçalho. O primeiro ":" separa nome de valor.
}

const bruto = [
  'Content-Type: application/json',
  'Cache-Control: no-store',
  'Location: https://exemplo.com/pedidos/42',
].join('\\n');

console.log(lerCabecalhos(bruto));`,
        hints: [
          'Quebre o texto em linhas antes de qualquer coisa.',
          'Em cada linha, `indexOf(":")` marca onde o nome termina — e `-1` significa linha inválida, para pular.',
          'O nome vai do começo até o dois-pontos; o valor, do caractere seguinte até o fim.',
          'Limpe as pontas do valor com trim, e passe o nome para minúsculas antes de guardar.',
        ],
        tests: [
          {
            description: 'A função lerCabecalhos existe',
            assertion: `if (typeof lerCabecalhos !== 'function') throw new Error("Crie uma função chamada 'lerCabecalhos'.");`,
          },
          {
            description: 'lê dois cabeçalhos simples',
            assertion: `
              const r = lerCabecalhos('Content-Type: application/json' + String.fromCharCode(10) + 'Cache-Control: no-store');
              if (r === null || typeof r !== 'object') throw new Error("Deveria devolver um objeto, veio " + JSON.stringify(r) + ".");
              if (r['content-type'] !== 'application/json') throw new Error("Esperava r['content-type'] === 'application/json', veio " + JSON.stringify(r['content-type']) + ". As chaves saem em minúsculas.");
              if (r['cache-control'] !== 'no-store') throw new Error("Esperava r['cache-control'] === 'no-store', veio " + JSON.stringify(r['cache-control']) + ".");
            `,
          },
          {
            description: 'o valor pode conter dois-pontos',
            assertion: `
              const r = lerCabecalhos('Location: https://exemplo.com/pedidos/42');
              if (r.location !== 'https://exemplo.com/pedidos/42') throw new Error("O valor tem ':' dentro, e só o PRIMEIRO separa. Veio " + JSON.stringify(r.location) + ".");
            `,
          },
          {
            description: 'linhas em branco e sem dois-pontos são ignoradas',
            assertion: `
              const nl = String.fromCharCode(10);
              const r = lerCabecalhos('Accept: text/html' + nl + nl + 'linha sem separador' + nl + 'Server: nginx');
              if (Object.keys(r).length !== 2) throw new Error("Deveria haver 2 cabeçalhos, veio " + Object.keys(r).length + ": " + JSON.stringify(r));
              if (r.server !== 'nginx') throw new Error("Esperava r.server === 'nginx', veio " + JSON.stringify(r.server) + ".");
            `,
            hidden: true,
          },
          {
            description: 'texto vazio devolve objeto vazio',
            assertion: `
              const r = lerCabecalhos('');
              if (r === null || typeof r !== 'object') throw new Error("Deveria devolver um objeto, veio " + JSON.stringify(r) + ".");
              if (Object.keys(r).length !== 0) throw new Error("Sem cabeçalhos, o objeto é vazio. Veio " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
          {
            description: 'os espaços em volta do valor não entram',
            assertion: `
              const r = lerCabecalhos('X-Teste:    com espaços   ');
              if (r['x-teste'] !== 'com espaços') throw new Error("Esperava 'com espaços' sem as pontas, veio " + JSON.stringify(r['x-teste']) + ".");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'toda linha bem formada vira uma chave em minúsculas',
            generate: `
              const nomes = ['Content-Type', 'Cache-Control', 'Accept', 'Server', 'X-Pedido'];
              const valores = ['application/json', 'no-store', 'text/html', 'nginx', 'https://x.com/a:b'];

              const quantos = 1 + Math.floor(rnd() * 4);
              const escolhidos = [];
              const linhas = [];

              for (let i = 0; i < quantos; i++) {
                const nome = nomes[i];
                const valor = valores[Math.floor(rnd() * valores.length)];
                escolhidos.push({ nome: nome, valor: valor });
                linhas.push(nome + ':' + (rnd() < 0.5 ? ' ' : '  ') + valor);
              }

              return { texto: linhas.join(String.fromCharCode(10)), esperados: escolhidos };
            `,
            check: `
              const r = lerCabecalhos(caso.texto);

              if (r === null || typeof r !== 'object') {
                throw new Error("devolveu " + JSON.stringify(r) + " em vez de um objeto.");
              }
              if (Object.keys(r).length !== caso.esperados.length) {
                throw new Error("eram " + caso.esperados.length + " cabeçalhos e vieram " + Object.keys(r).length + ": " + JSON.stringify(r));
              }

              for (const esperado of caso.esperados) {
                const chave = esperado.nome.toLowerCase();
                if (r[chave] !== esperado.valor) {
                  throw new Error("a chave " + chave + " veio " + JSON.stringify(r[chave]) + ", esperava " + JSON.stringify(esperado.valor) + ".");
                }
              }
            `,
          },
        ],
        solution: `function lerCabecalhos(texto) {
  const saida = {};

  for (const linha of texto.split(String.fromCharCode(10))) {
    const separador = linha.indexOf(':');
    if (separador === -1) continue;

    const nome = linha.slice(0, separador).trim().toLowerCase();
    if (nome === '') continue;

    saida[nome] = linha.slice(separador + 1).trim();
  }

  return saida;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Cabeçalhos são pares \`Nome: valor\` que descrevem a mensagem, e é neles que mora a maior parte dos problemas de integração. \`Content-Type\` **descreve o corpo que está indo** — não é um pedido, é um aviso —, enquanto \`Accept\` é que pede formato de resposta; confundir os dois rende um \`400\` difícil de entender. Nomes de cabeçalho não diferenciam maiúsculas, então normalize os **dois** lados antes de comparar: normalizar só um funciona no seu teste e falha em produção. E o valor de \`Content-Type\` quase sempre traz \`; charset=utf-8\` grudado, o que faz a comparação exata falhar — pergunte com \`startsWith\`.`,
    },
  ],
};
