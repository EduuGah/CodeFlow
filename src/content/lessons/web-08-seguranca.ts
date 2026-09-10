import type { Lesson } from '../types';

export const lessonSegurancaWeb: Lesson = {
  id: 'lesson-web-8',
  trackId: 'track-web',
  title: 'Segurança: Não Confie no Cliente',
  language: 'javascript',
  objective:
    'Reconhecer a forma comum das falhas de injeção, escapar dado que vem de fora, e saber o que nunca vai para o navegador.',
  concepts: ['seguranca-web', 'strings'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Quase toda falha de segurança em aplicações web tem a mesma forma:

> **Um dado foi lido como se fosse instrução.**

O nome muda conforme o lugar — injeção de SQL, XSS, injeção de comando —, mas o mecanismo é sempre esse. Alguém digitou um texto, esse texto foi colado no meio de um código, e o interpretador do outro lado não teve como distinguir o que era dado do que era comando.

~~~javascript
// SQL: o nome foi colado dentro da consulta
const sql = "SELECT * FROM usuarios WHERE nome = '" + nome + "'";

// Se nome for:  ' OR '1'='1
// A consulta vira:  ... WHERE nome = '' OR '1'='1'
// e devolve a tabela inteira.
~~~

O aspas que o usuário digitou **fechou** a aspas do programador, e o resto do texto virou lógica. Não houve invasão nenhuma: o programa fez exatamente o que foi mandado fazer.

A correção não é procurar aspas no texto — essa é a defesa que sempre perde, porque a lista de caracteres perigosos nunca acaba. A correção é **nunca colar**:

~~~javascript
// A consulta e os dados viajam separados. O banco recebe o texto
// como valor, e não há como ele virar código.
banco.query('SELECT * FROM usuarios WHERE nome = ?', [nome]);
~~~

Essa é a ideia geral, e ela vale em toda parte: **separe o canal do dado do canal da instrução**. Quando isso não for possível, escape — mas prefira separar.

## O mesmo bug, na tela

Na página, o interpretador é o navegador e a linguagem é HTML:

~~~javascript
elemento.innerHTML = 'Olá, ' + nome;
~~~

Se o nome for \`<img src=x onerror="roubar(document.cookie)">\`, o navegador não vê um nome: vê uma tag. Ele a executa, com todos os poderes da sua página — inclusive os cookies e a sessão de quem estiver olhando. Isso se chama **XSS**, e o ponto essencial é que o código do atacante roda **na sua origem**, ou seja, com as permissões que a aula de CORS acabou de descrever.

Duas defesas, nesta ordem:

**Não construa HTML com dado de fora.** \`elemento.textContent = nome\` põe o texto como texto, e a tag aparece escrita na tela em vez de virar elemento. É a versão de "separar o canal" para a tela, e resolve a maioria dos casos sozinha.

**Quando precisar mesmo montar HTML, escape.** Trocar cada caractere especial pela entidade correspondente faz o navegador desenhar o caractere em vez de interpretá-lo.

| Caractere | Vira |
|---|---|
| \`&\` | \`&amp;\` |
| \`<\` | \`&lt;\` |
| \`>\` | \`&gt;\` |
| \`"\` | \`&quot;\` |
| \`'\` | \`&#39;\` |

**A ordem importa.** O \`&\` tem que ser o primeiro: se você trocar \`<\` por \`&lt;\` antes, a próxima passagem vai encontrar o \`&\` que você mesmo acabou de criar e produzir \`&amp;lt;\` — texto quebrado na tela.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// A regra que vale mais que todas as outras juntas:
// validação no cliente é experiência; validação no servidor é proteção.

// Cliente — para a pessoa saber logo, antes de mandar
if (preco < 0) mostrarAviso('Preço não pode ser negativo');

// Servidor — porque o cliente pode ser qualquer coisa, inclusive um curl
function criarProduto(corpo, usuario) {
  if (!usuario) return { status: 401 };
  if (typeof corpo.preco !== 'number' || corpo.preco < 0) {
    return { status: 400, erro: 'preço inválido' };
  }
  // ...
}

// O que NUNCA vai para o navegador, por mais conveniente que pareça:
// - chave de API de serviço pago
// - senha ou hash de senha
// - regra de negócio que decide dinheiro
//
// Tudo que chega ao cliente é público. "Ofuscado" não é "escondido":
// o código minificado continua legível para quem quiser ler.`,
      caption:
        'A validação do cliente e a do servidor não são redundantes — elas resolvem problemas diferentes. Uma dá retorno rápido; a outra é a única que ainda existe quando o pedido não vem da sua tela.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-8-onde-validar',
        type: 'multiple-choice',
        prompt:
          'Sua loja calcula o total no navegador e manda `{ itens, total }` para a API. Qual é o problema?',
        concepts: ['seguranca-web', 'cliente-servidor'],
        difficulty: 'iniciante',
        tags: ['web', 'seguranca'],
        options: [
          'Nenhum, desde que o JavaScript do cálculo esteja minificado',
          'Quem manda o pedido escolhe o total: basta trocar o valor antes de enviar',
          'O problema é de desempenho — calcular no cliente deixa a página lenta',
          'Só é problema se a loja aceitar cartão de crédito',
        ],
        correctIndex: 1,
        explanation:
          'O pedido não precisa vir da sua tela. Qualquer pessoa monta um `POST` com `{ itens: [...], total: 1 }` e manda direto — sem passar pelo seu JavaScript, sem abrir a sua página. Minificar não muda nada: o código continua no navegador, e o atacante nem precisa lê-lo. A regra é que **o servidor recalcula tudo que importa**: ele recebe os itens, busca os preços na própria base, e ignora qualquer total que tenha vindo junto. Calcular no cliente continua valendo — para mostrar o valor na hora, o que é experiência, não confiança.',
        hints: [
          'O pedido só pode ser feito a partir da sua página?',
          'O que acontece se alguém montar o mesmo pedido com outro valor no campo total?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-8-prever-ordem-escape',
        type: 'predict-output',
        prompt:
          'Estas duas funções escapam os mesmos caracteres, só que em ordens diferentes. O que cada uma devolve?',
        concepts: ['seguranca-web', 'strings'],
        difficulty: 'intermediario',
        tags: ['web', 'seguranca'],
        code: `function certo(texto) {
  return texto.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
}

function errado(texto) {
  return texto.replaceAll('<', '&lt;').replaceAll('&', '&amp;');
}

console.log(certo('<b>'));
console.log(errado('<b>'));
console.log(certo('a & b'));`,
        expectedOutput: '&lt;b>\n&amp;lt;b>\na &amp; b',
        explanation:
          'A segunda função troca `<` por `&lt;` e **depois** varre o texto atrás de `&` — encontrando o que ela mesma acabou de criar, e transformando `&lt;` em `&amp;lt;`. O resultado aparece na tela como o texto literal `&lt;b>` em vez do `<b>` que se queria mostrar. Por isso o `&` vem sempre primeiro: ele é o único caractere que aparece nas substituições dos outros. Repare também que só o `<` foi escapado aqui — o `>` sozinho não é perigoso, mas escapá-lo é o hábito seguro.',
        hints: [
          'O que a substituição de `<` produz? Esse resultado contém algum dos caracteres que ainda serão trocados?',
          'Na segunda função, quantas vezes o texto criado pela primeira substituição é alterado de novo?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-8-lacuna-escape',
        type: 'fill-blank',
        prompt:
          'Complete o escape. A primeira lacuna é o caractere que precisa ser trocado **antes** de todos os outros; a segunda garante que **todas** as ocorrências sejam trocadas.',
        concepts: ['seguranca-web', 'strings'],
        difficulty: 'intermediario',
        tags: ['web', 'seguranca'],
        template: `function escapar(texto) {
  return String(texto)
    .replaceAll('{{1}}', '&amp;')
    .{{2}}('<', '&lt;')
    .replaceAll('>', '&gt;');
}`,
        blanks: [
          { placeholder: 'primeiro de todos', size: 3 },
          { placeholder: 'todas as vezes', size: 11 },
        ],
        tests: [
          {
            description: 'escapa os sinais de menor e maior',
            assertion: `const r = escapar('<b>'); if (r !== '&lt;b&gt;') throw new Error("Esperava '&lt;b&gt;', veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'escapa o e comercial sem escapar duas vezes',
            assertion: `
              const r = escapar('a & b');
              if (r !== 'a &amp; b') throw new Error("Esperava 'a &amp; b', veio " + JSON.stringify(r) + ".");
              const r2 = escapar('<');
              if (r2 !== '&lt;') throw new Error("Esperava '&lt;', veio " + JSON.stringify(r2) + ". Se veio '&amp;lt;', a ordem das substituições está trocada.");
            `,
          },
          {
            description: 'todas as ocorrências são trocadas, não só a primeira',
            assertion: `
              const r = escapar('<a><b>');
              if (r !== '&lt;a&gt;&lt;b&gt;') throw new Error("Esperava todas as trocas, veio " + JSON.stringify(r) + ". Um método que troca só a primeira ocorrência deixa tags para trás.");
            `,
          },
          {
            description: 'texto sem caractere especial não muda',
            assertion: `const r = escapar('Ana Silva'); if (r !== 'Ana Silva') throw new Error("Texto comum deveria passar intacto, veio " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
          {
            description: 'a tag de ataque deixa de ser uma tag',
            assertion: `
              const r = escapar('<img src=x onerror=alert(1)>');
              if (r.indexOf('<') !== -1) throw new Error("Sobrou um '<' no resultado: " + JSON.stringify(r) + ". Ele ainda seria interpretado como início de tag.");
              if (r.indexOf('>') !== -1) throw new Error("Sobrou um '>' no resultado: " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'nenhum sinal de tag sobrevive, e nada é escapado duas vezes',
            generate: `
              const pedacos = ['Ana', '<b>', '&', 'x > y', '<img src=x>', ' ', 'a&b'];
              const quantos = 1 + Math.floor(rnd() * 4);

              let texto = '';
              for (let i = 0; i < quantos; i++) {
                texto += pedacos[Math.floor(rnd() * pedacos.length)];
              }

              return { texto: texto };
            `,
            check: `
              const obtido = escapar(caso.texto);

              if (obtido.indexOf('<') !== -1 || obtido.indexOf('>') !== -1) {
                throw new Error("para " + JSON.stringify(caso.texto) + " sobrou sinal de tag em " + JSON.stringify(obtido) + ".");
              }

              const esperado = caso.texto
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;');

              if (obtido !== esperado) {
                throw new Error("para " + JSON.stringify(caso.texto) + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(obtido) + ". Escapar duas vezes é o defeito mais provável.");
              }
            `,
          },
        ],
        explanation:
          'O `&` vem primeiro porque ele é o único caractere que aparece **dentro** das substituições dos outros: `&lt;` e `&gt;` começam com ele. Trocá-lo depois faria a função reescrever o próprio trabalho. E o método precisa alcançar todas as ocorrências: com o que troca só a primeira, a segunda tag de um texto passaria intacta — o que é exatamente o suficiente para um ataque.',
        hints: [
          'Qual caractere aparece dentro de `&lt;` e de `&gt;`? Esse precisa ser tratado antes.',
          'A segunda lacuna é o método que alcança todas as ocorrências, não só a primeira — ele apareceu na aula de textos.',
        ],
        solution: ['&', 'replaceAll'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-8-sanitizar',
        type: 'code',
        prompt: `Crie \`escaparHtml(valor)\`, que **retorna** o texto pronto para ser inserido em HTML sem virar código.\n\nTroque, **nesta ordem**: \`&\` por \`&amp;\`, \`<\` por \`&lt;\`, \`>\` por \`&gt;\`, \`"\` por \`&quot;\` e \`'\` por \`&#39;\`.\n\n- Todas as ocorrências, não só a primeira.\n- Entrada que não é texto vira texto antes (um número, \`null\`, um objeto).\n- Escapar duas vezes o mesmo texto **não** é igual a escapar uma: isso é esperado, e o teste confere que uma passagem está certa.`,
        concepts: ['seguranca-web', 'strings'],
        difficulty: 'intermediario',
        tags: ['web', 'seguranca'],
        initialCode: `function escaparHtml(valor) {
  // A ordem não é detalhe: o & precisa ser o primeiro.
}

console.log(escaparHtml('<b>Ana</b>'));
console.log(escaparHtml('a & b'));
console.log(escaparHtml(42));`,
        hints: [
          'Converta para texto antes de tudo — a entrada pode não ser uma string.',
          'Encadeie as substituições, com o & na frente.',
          'Cada troca precisa alcançar todas as ocorrências.',
          'Para a aspas simples, o código da entidade é &#39;.',
        ],
        tests: [
          {
            description: 'A função escaparHtml existe',
            assertion: `if (typeof escaparHtml !== 'function') throw new Error("Crie uma função chamada 'escaparHtml'.");`,
          },
          {
            description: 'escapa os sinais de tag',
            assertion: `
              const r = escaparHtml('<b>Ana</b>');
              if (r !== '&lt;b&gt;Ana&lt;/b&gt;') throw new Error("Esperava '&lt;b&gt;Ana&lt;/b&gt;', veio " + JSON.stringify(r) + ".");
            `,
          },
          {
            description: 'escapa o e comercial na ordem certa',
            assertion: `
              const r = escaparHtml('a & b');
              if (r !== 'a &amp; b') throw new Error("Esperava 'a &amp; b', veio " + JSON.stringify(r) + ".");
              const r2 = escaparHtml('<');
              if (r2 === '&amp;lt;') throw new Error("Escapou duas vezes: o & precisa ser trocado ANTES do <.");
              if (r2 !== '&lt;') throw new Error("Esperava '&lt;', veio " + JSON.stringify(r2) + ".");
            `,
          },
          {
            description: 'escapa as duas aspas',
            assertion: `
              const r = escaparHtml('diz "oi"');
              if (r !== 'diz &quot;oi&quot;') throw new Error("Esperava 'diz &quot;oi&quot;', veio " + JSON.stringify(r) + ".");
              const apostrofo = String.fromCharCode(39);
              const r2 = escaparHtml('n' + apostrofo + 'a');
              if (r2 !== 'n&#39;a') throw new Error("A aspas simples vira &#39;. Veio " + JSON.stringify(r2) + ".");
            `,
          },
          {
            description: 'a tag de ataque deixa de ser executável',
            assertion: `
              const r = escaparHtml('<img src=x onerror=alert(1)>');
              if (r.indexOf('<') !== -1 || r.indexOf('>') !== -1) throw new Error("Sobrou sinal de tag: " + JSON.stringify(r) + ".");
              if (r.indexOf('onerror') === -1) throw new Error("O texto em si deve continuar visível; o que muda é ele não ser mais interpretado.");
            `,
            hidden: true,
          },
          {
            description: 'entrada que não é texto não derruba a função',
            assertion: `
              for (const entrada of [42, null, undefined, true]) {
                let r;
                try { r = escaparHtml(entrada); }
                catch (e) { throw new Error("Lançou com a entrada " + JSON.stringify(entrada) + ": " + e.message); }
                if (typeof r !== 'string') throw new Error("Para " + JSON.stringify(entrada) + " deveria devolver texto, veio " + JSON.stringify(r) + ".");
              }
              if (escaparHtml(42) !== '42') throw new Error("O número 42 vira o texto '42'.");
            `,
            hidden: true,
          },
          {
            description: 'texto comum passa intacto',
            assertion: `
              const r = escaparHtml('Ana Silva 30 anos');
              if (r !== 'Ana Silva 30 anos') throw new Error("Sem caractere especial, nada muda. Veio " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'nenhum caractere perigoso sobrevive, e nada é escapado duas vezes',
            generate: `
              const apostrofo = String.fromCharCode(39);
              const pedacos = ['Ana', '<b>', '&', 'x > y', '"aspas"', apostrofo, '<img src=x>', ' ', '&amp;'];
              const quantos = 1 + Math.floor(rnd() * 5);

              let texto = '';
              for (let i = 0; i < quantos; i++) {
                texto += pedacos[Math.floor(rnd() * pedacos.length)];
              }

              return { texto: texto };
            `,
            check: `
              const obtido = escaparHtml(caso.texto);

              for (const perigoso of ['<', '>', '"', String.fromCharCode(39)]) {
                if (obtido.indexOf(perigoso) !== -1) {
                  throw new Error("para " + JSON.stringify(caso.texto) + " sobrou " + JSON.stringify(perigoso) + " em " + JSON.stringify(obtido) + ".");
                }
              }

              const esperado = String(caso.texto)
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll(String.fromCharCode(39), '&#39;');

              if (obtido !== esperado) {
                throw new Error("para " + JSON.stringify(caso.texto) + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        solution: `function escaparHtml(valor) {
  return String(valor)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll(String.fromCharCode(39), '&#39;');
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Quase toda falha de segurança em web tem a mesma forma: **um dado foi lido como se fosse instrução**. Injeção de SQL e XSS são o mesmo mecanismo em interpretadores diferentes. A defesa boa não é caçar caracteres perigosos — essa lista nunca acaba —, é **separar o canal do dado do canal da instrução**: consulta parametrizada no banco, \`textContent\` em vez de \`innerHTML\` na tela. Quando precisar mesmo montar HTML, escape — e o \`&\` vem primeiro, porque ele aparece dentro das substituições dos outros. Do lado da confiança: validar no cliente é experiência, validar no servidor é proteção, e o servidor recalcula tudo que importa, porque o pedido não precisa vir da sua tela. E nada secreto vai para o navegador: tudo que chega ao cliente é público, e minificado não é escondido.`,
    },
  ],
};
