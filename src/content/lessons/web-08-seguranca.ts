import type { Lesson } from '../types';

export const lessonSegurancaWeb: Lesson = {
  id: 'lesson-web-8',
  trackId: 'track-web',
  title: 'Segurança: Não Confie no Cliente',
  language: 'javascript',
  objective:
    'Reconhecer a forma comum das falhas de injeção, escapar dado que vem de fora, saber o que nunca vai para o navegador, e defender uma sessão com os atributos certos de cookie, proteção contra CSRF e limite de tentativas.',
  concepts: ['seguranca-web', 'seguranca-csrf-cookies', 'strings'],
  status: 'published',
  estimatedMinutes: 38,
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
      kind: 'exercise',
      exercise: {
        id: 'ex-web-8-escrever-teste',
        type: 'write-test',
        prompt: `Esta função de escape está **correta** — ela trata \`&\`, \`<\`, \`>\` e \`"\`.\n\nEscreva os testes dela com \`assert(condicao, mensagem)\`.\n\nNuma função de segurança, o teste importa mais que em qualquer outro lugar: um escape que falha em silêncio não quebra a tela, ele abre uma porta. Três versões quebradas vão ser testadas contra o que você escrever.`,
        concepts: ['seguranca-web', 'strings'],
        difficulty: 'avancado',
        tags: ['web', 'seguranca', 'testes'],
        subject: `function escaparHtml(valor) {
  return String(valor)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}`,
        initialCode: `// Escreva asserções sobre \`escaparHtml\`. Uma por linha.
//
// assert(escaparHtml('a') === 'a', 'texto comum nao muda');

`,
        mutants: [
          {
            description: 'troca só a primeira ocorrência de cada caractere',
            code: `function escaparHtml(valor) {
  return String(valor)
    .replace('&', '&amp;')
    .replace('<', '&lt;')
    .replace('>', '&gt;')
    .replace('"', '&quot;');
}`,
          },
          {
            description: 'escapa o & por último, escapando duas vezes o que ele mesmo criou',
            code: `function escaparHtml(valor) {
  return String(valor)
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('&', '&amp;');
}`,
          },
          {
            description: 'esquece de escapar as aspas duplas',
            code: `function escaparHtml(valor) {
  return String(valor)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}`,
          },
        ],
        hints: [
          'Um teste com uma tag só não separa as três versões: todas as três acertam `<b>`.',
          'Para a que troca só a primeira: use um texto com **duas** tags.',
          'Para a da ordem: escape um `<` sozinho e confira que o resultado não tem `&amp;` dentro.',
          "assert(escaparHtml('<a><b>') === '&lt;a&gt;&lt;b&gt;', 'todas'); assert(escaparHtml('<') === '&lt;', 'sem escapar duas vezes'); assert(escaparHtml('\\\"x\\\"') === '&quot;x&quot;', 'aspas');",
        ],
        solution: `assert(escaparHtml('<a><b>') === '&lt;a&gt;&lt;b&gt;', 'todas as ocorrencias');
assert(escaparHtml('<') === '&lt;', 'nao escapa duas vezes');
assert(escaparHtml('"x"') === '&quot;x&quot;', 'as aspas tambem');`,
        explanation:
          'O teste com uma tag só — `escaparHtml("<b>")` — passa nas **três** versões quebradas. É o teste que dá a sensação de cobertura sem cobrir nada, e é o mais fácil de escrever primeiro.\n\nCada um dos três que resolvem foi escolhido contra um defeito específico: duas tags para a que só troca a primeira, um `<` sozinho para a que escapa o `&` por último, e as aspas para a que as ignora. Num escape de segurança essa disciplina não é preciosismo — um caractere que escapa da função é uma tag que o navegador vai executar.',
      },
    },
    {
      kind: 'prose',
      markdown: `
## CSRF: o pedido que você não mandou

Depois de fazer login, o navegador guarda um cookie de sessão — e o navegador manda esse cookie em **todo** pedido para aquele site, de qualquer aba, de qualquer página que o tenha provocado. É esse comportamento que a **CSRF** (Cross-Site Request Forgery — falsificação de pedido entre sites) explora: um site malicioso faz seu navegador enviar um pedido para o site onde você está logado, e o cookie de sessão vai junto sozinho, sem você ter feito nada além de abrir uma página.

~~~html
<!-- Numa página completamente diferente, enquanto você está logado no seu banco -->
<img src="https://banco.com/transferir?para=atacante&valor=1000">
~~~

Se \`banco.com\` aceitar essa transferência só porque o cookie de sessão chegou válido, o pedido é processado como se você tivesse pedido — porque, do ponto de vista do servidor, veio autenticado. A defesa: exigir, além do cookie, um **token CSRF** — um valor que o servidor gerou e só a página legítima conhece, enviado no corpo do pedido (não como cookie, que iria junto de qualquer forma). Um site atacante não tem como adivinhar esse token, então o pedido forjado falha.

## Os três atributos que protegem um cookie de sessão

~~~
Set-Cookie: sessao=abc123; HttpOnly; Secure; SameSite=Strict
~~~

- **HttpOnly**: o JavaScript da página (inclusive um script injetado por XSS) não consegue ler esse cookie. Sem ele, um XSS que já rodou na sua origem rouba a sessão inteira com \`document.cookie\`.
- **Secure**: o cookie só viaja por HTTPS — nunca em texto puro por uma conexão HTTP comum, onde qualquer um na rede o leria.
- **SameSite**: controla se o cookie vai junto num pedido que **partiu de outro site** — \`Strict\` ou \`Lax\` reduzem exatamente o cenário de CSRF descrito acima, porque o cookie deixa de acompanhar o pedido nesses casos.

Os três resolvem problemas diferentes; um cookie de sessão sem os três está com uma porta aberta que os outros dois não cobrem.

## Rate limiting: um limite de tentativas

Uma tela de login sem limite de tentativas aceita qualquer número de senhas erradas, na velocidade que um script conseguir mandar — e uma senha comum cai em minutos por força bruta pura. **Rate limiting** barra isso: depois de um número de tentativas falhas (5, digamos) numa janela de tempo, o servidor recusa novas tentativas daquele IP ou daquela conta por um tempo. A mesma ideia protege a recuperação de senha e qualquer endpoint que aceite um segredo adivinhável aos poucos.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Simulação: um cookie de sessão sem os três atributos, e com eles.
const cookieFraco = 'sessao=abc123';
const cookieForte = 'sessao=abc123; HttpOnly; Secure; SameSite=Strict';

// Sem HttpOnly, um XSS que já rodou na página faz isto:
// document.cookie // 'sessao=abc123' — a sessão inteira, exposta ao script do atacante

// Rate limiting: recusar depois de N tentativas falhas na janela de tempo.
function podeTentar(tentativasFalhas, limite) {
  return tentativasFalhas < limite;
}
podeTentar(4, 5); // true  — ainda pode tentar
podeTentar(5, 5); // false — bloqueado até a janela passar`,
      caption: 'HttpOnly fecha a porta que XSS abriria; Secure e SameSite fecham as outras duas.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-8-o-que-e-csrf',
        type: 'multiple-choice',
        prompt: 'O que a CSRF (Cross-Site Request Forgery) explora, precisamente?',
        concepts: ['seguranca-csrf-cookies'],
        difficulty: 'intermediario',
        tags: ['web', 'seguranca', 'csrf'],
        options: [
          'O navegador manda o cookie de sessão em qualquer pedido para aquele site, mesmo quando o pedido foi provocado por outra página — e o servidor aceita porque o cookie chegou válido',
          'Uma senha fraca demais para resistir a tentativas repetidas',
          'Um SQL mal escapado que aceita comando dentro do dado',
          'Um certificado HTTPS expirado',
        ],
        correctIndex: 0,
        explanation:
          'CSRF usa o próprio comportamento normal do navegador — enviar o cookie de sessão em todo pedido para o site dono dele — para fazer o servidor aceitar um pedido que a vítima nunca pediu de propósito. A defesa central é um token que o cookie sozinho não carrega.',
        hints: ['Pense em qual informação o navegador manda automaticamente, sem perguntar, sempre que você acessa um site onde já está logado.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-8-atributos-do-cookie',
        type: 'order-steps',
        prompt: 'Associe cada atributo de cookie ao que ele especificamente impede — coloque na ordem: HttpOnly, depois Secure, depois SameSite.',
        concepts: ['seguranca-csrf-cookies'],
        difficulty: 'intermediario',
        tags: ['web', 'seguranca', 'cookies'],
        steps: [
          { id: 'httponly', text: 'HttpOnly: impede que JavaScript da página leia o cookie com document.cookie', ordem: 1 },
          { id: 'secure', text: 'Secure: impede que o cookie viaje por uma conexão HTTP comum, sem cifra', ordem: 2 },
          { id: 'samesite', text: 'SameSite: impede que o cookie acompanhe um pedido que partiu de outro site', ordem: 3 },
        ],
        explanation:
          'Os três atacam ameaças diferentes: HttpOnly fecha a porta que um XSS já rodando na página abriria; Secure fecha a escuta de rede; SameSite fecha o cenário de CSRF. Nenhum substitui o outro.',
        hints: ['Pense em quem cada atributo bloqueia: um script na própria página, alguém escutando a rede, ou um pedido vindo de fora.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-8-cookie-sem-httponly',
        type: 'find-bug',
        prompt: 'Este cookie de sessão está sendo criado sem um atributo essencial, e um XSS já confirmado no site consegue roubar a sessão inteira lendo `document.cookie`. Aponte a linha que precisa mudar.',
        concepts: ['seguranca-csrf-cookies'],
        difficulty: 'intermediario',
        tags: ['web', 'seguranca', 'cookies', 'bug'],
        code: `function montarCookieDeSessao(id) {
  const cookie = 'sessao=' + id + '; Secure; SameSite=Strict';
  if (cookie.indexOf('HttpOnly') === -1) throw new Error('cookie de sessao sem HttpOnly: XSS consegue ler document.cookie');
  return cookie;
}

montarCookieDeSessao('abc123');`,
        buggyLine: 2,
        fix: "  const cookie = 'sessao=' + id + '; HttpOnly; Secure; SameSite=Strict';",
        explanation:
          'O cookie tinha `Secure` e `SameSite`, mas não `HttpOnly` — o único atributo dos três que impede um script (inclusive um injetado por XSS) de ler o cookie via `document.cookie`. Sem ele, um XSS que já conseguiu rodar na página tem acesso direto à sessão inteira, mesmo com os outros dois atributos presentes.',
        hints: [
          'Dos três atributos que protegem um cookie de sessão, qual especificamente impede leitura por JavaScript?',
          'A mensagem de erro já nomeia o atributo que falta.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-8-rate-limiting',
        type: 'code',
        prompt: 'Escreva `podeTentar(tentativasFalhas, limite)`: devolve `true` se ainda for permitido tentar (o número de falhas é menor que o limite), `false` caso contrário.',
        concepts: ['seguranca-csrf-cookies'],
        difficulty: 'iniciante',
        tags: ['web', 'seguranca', 'rate-limiting'],
        initialCode: `function podeTentar(tentativasFalhas, limite) {
  // Seu código aqui
}`,
        tests: [
          {
            description: 'Abaixo do limite, ainda pode tentar',
            assertion: `const r = podeTentar(3, 5); if (r !== true) throw new Error('esperava true, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'No limite exato, não pode mais tentar',
            assertion: `const r = podeTentar(5, 5); if (r !== false) throw new Error('esperava false, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Acima do limite, não pode tentar',
            assertion: `const r = podeTentar(9, 5); if (r !== false) throw new Error('esperava false, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Zero tentativas falhas, pode tentar',
            assertion: `const r = podeTentar(0, 5); if (r !== true) throw new Error('esperava true, veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function podeTentar(tentativasFalhas, limite) {
  return tentativasFalhas < limite;
}`,
        hints: ['Uma comparação simples: o número de falhas precisa ser MENOR que o limite para ainda poder tentar — no limite exato, já não pode mais.'],
      },
    },
    {
      kind: 'summary',
      markdown: `Quase toda falha de segurança em web tem a mesma forma: **um dado foi lido como se fosse instrução**. Injeção de SQL e XSS são o mesmo mecanismo em interpretadores diferentes. A defesa boa não é caçar caracteres perigosos — essa lista nunca acaba —, é **separar o canal do dado do canal da instrução**: consulta parametrizada no banco, \`textContent\` em vez de \`innerHTML\` na tela. Quando precisar mesmo montar HTML, escape — e o \`&\` vem primeiro, porque ele aparece dentro das substituições dos outros. Do lado da confiança: validar no cliente é experiência, validar no servidor é proteção, e o servidor recalcula tudo que importa, porque o pedido não precisa vir da sua tela. E nada secreto vai para o navegador: tudo que chega ao cliente é público, e minificado não é escondido.

CSRF explora o cookie de sessão indo junto sozinho num pedido de outra origem — um token que só o site legítimo conhece resolve. Cookie de sessão pede HttpOnly (JavaScript não lê), Secure (só por HTTPS) e SameSite (não acompanha pedido de outro site) — os três, não um só. E rate limiting barra tentativa repetida antes que a força bruta funcione por paciência.`,
    },
  ],
};
