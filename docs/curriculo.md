# Currículo: até a base de um dev júnior

Roadmap de conteúdo **e** de plataforma. A versão navegável está publicada como
artifact; este arquivo é a fonte canônica e deve ser atualizado no mesmo commit
que conclui uma fase.

## Onde estamos

**Fase 1 de 8 · Bloco de JavaScript: 10 de 10 aulas · Bloco da web: 0 de 8**

```
Fase 0  Fundamentos e lógica      ██████████████████████  13/13  pronto
Fase 1  JavaScript real          ██████████████████████  10/10  pronto
        Como a web funciona      ░░░░░░░░░░░░░░░░░░░░░░   0/8
        Plataforma                █████░░░░░░░░░░░░░░░░░   2/7
Fase 2  A página                 ░░░░░░░░░░░░░░░░░░░░░░   0/26
Fase 3  Tipos e componentes      ░░░░░░░░░░░░░░░░░░░░░░   0/24
Fase 4  Back-end e dados         ░░░░░░░░░░░░░░░░░░░░░░   0/20
Fase 5  Profissionalização       ░░░░░░░░░░░░░░░░░░░░░░   0/19
Fase 6  Python                   ░░░░░░░░░░░░░░░░░░░░░░   0/10
Fase 7  Projeto final            ░░░░░░░░░░░░░░░░░░░░░░   0/5
```

| | Hoje | Previsto | Feito |
| --- | ---: | ---: | ---: |
| Aulas | **23** | 135 | 17% |
| Exercícios | **74** | ~700 | 11% |
| Tipos de exercício | **4** | 11 | 36% |
| Motores de execução | **1** | 7 | 14% |
| Projetos | **7** | ~30 | 23% |

**Últimas aulas concluídas**, da mais recente para a mais antiga: expressões
regulares, datas e fuso, imutabilidade, JSON, falhas assíncronas, async/await,
promises, callbacks, closures, escopo.

## Aprofundamento das aulas antigas

As primeiras aulas nasceram magras e foram ficando melhores com o tempo — o que
significa que o iniciante encontrava as piores. Medido: a aula 1 tinha 77
palavras e **um** exercício para 12 minutos; a aula 20 tem 435 e três.

O padrão novo é: 500 a 900 palavras, e cinco a seis exercícios em dificuldade
crescente — múltipla escolha ou prever saída para verificar a compreensão, lacuna
para dar a estrutura, e código do zero por último.

```
Aula 1  Variáveis                ██████████  77 → 508 palavras,  1 → 5 exercícios
Aula 2  Tipos e operadores       ██████████  82 → 700 palavras,  2 → 5 exercícios
Aula 3  Condições                ██████████  135 → 429 palavras, 2 → 4 exercícios
Aula 4  Loops                    ██████████  132 → 304 palavras, 2 → 4 exercícios
Aula 5  Funções                  ██████████  119 → 327 palavras, 3 → 5 exercícios
Aula 6  Arrays                   ██████████  124 → 317 palavras, 2 → 4 exercícios
Aula 7  Objetos                  ██████████  171 → 375 palavras, 2 → 4 exercícios
Aula 8  map, filter e reduce     █████░░░░░  167 palavras, 2 → 4 exercícios
Aula 9  Strings                  ░░░░░░░░░░  143 palavras, 2 exercícios
Aula 10 Erros                    ░░░░░░░░░░  210 palavras, 2 exercícios
Lógica 1 a 3                     ░░░░░░░░░░  ~180 palavras, 2 exercícios cada
```

_Atualizado em 2026-09-09, no mesmo commit que concluiu a última aula. Este bloco
é atualizado sempre que um item muda de estado._

## A restrição que ordena tudo

O código do aluno roda num Web Worker descartável, com 3s de limite e **sem
acesso ao DOM**. Ótimo para lógica pura — um laço infinito não congela a tela — e
por isso mesmo inútil para DOM, HTML, CSS ou React: não existe página lá dentro.

Cada ambiente novo exige um executor próprio, e um executor destrava vários
blocos de uma vez. As fases estão na ordem em que os motores se pagam, do mais
barato para o mais caro. Construir na ordem errada é pagar duas vezes.

## Aceitar soluções diversas

**O que já funciona.** Exercício de código é corrigido por asserções sobre o
comportamento, nunca sobre o texto escrito. Quem resolve com `for`, `reduce` ou
recursão passa igual.

**O que falha.** As asserções são casos fixos (`somar(2, 3) !== 5`). Deixa passar
quem chuta o caso específico e recompensa decorar o teste.

Quatro mudanças, em ordem de impacto:

1. **Testes por propriedade** — sorteia dezenas de entradas e compara com uma
   regra, em vez de conferir três casos escolhidos a dedo. Acaba com o chute.
2. **Múltiplas saídas válidas** — o exercício declara o conjunto do aceitável.
3. **Reconhecer a abordagem** — o retorno comenta qual caminho o aluno tomou e o
   que ele troca. Não é nota.
4. **Restrição opcional** — o mesmo exercício, sem usar `for`. Segundo desafio
   sobre um problema já entendido.

## Tipos de exercício

Existem: escrever o código, múltipla escolha, prever a saída.

A construir: completar a lacuna, encontrar o bug, ordenar os passos, refatorar,
escrever o teste, consertar a tela, consulta ao banco, construir do zero.

Cada exercício em três níveis de apoio: **guiado** (esqueleto quase pronto),
**livre** (enunciado e testes) e **desafio** (caso extremo ou restrição, sempre
opcional).

## Fases

### Fase 0 — Fundamentos e lógica · PRONTO
13 aulas, 7 projetos. Motor: Web Worker sem DOM.

### Fase 1 — Aprofundar o que já roda · 18 aulas · EM ANDAMENTO
Motor: **nenhum novo**.

**JavaScript real — 10 de 10, concluído**

| Aula | Estado |
| --- | --- |
| Escopo | feita |
| Closures | feita |
| Callbacks | feita |
| Promises | feita |
| async e await | feita |
| Falhas assíncronas | feita |
| JSON | feita |
| Imutabilidade | feita |
| Datas e fuso | feita |
| Expressões regulares | feita |

Módulos saiu do bloco: `import`/`export` é erro de sintaxe no sandbox, porque
`new Function` não aceita módulos. Volta quando houver um executor que entenda,
ou entra como aula conceitual. O lugar dele na contagem foi ocupado por escopo e
closures, que a versão original tratava como uma aula só e na prática pediam duas.

**Como a web funciona — 0 de 8**: cliente e servidor, HTTP, cabeçalhos, REST,
autenticação, tokens, CORS, segurança básica.

**Plataforma**

| Item | Estado |
| --- | --- |
| Testes por propriedade | feito |
| Exercício de lacuna | feito |
| Encontrar o bug, ordenar passos, refatorar, escrever o teste | — |
| Publicar de verdade | — |
| Servir o editor do próprio domínio | — |

Duas correções que a Fase 1 exigiu e que não estavam previstas: o sandbox era
síncrono, e uma asserção assíncrona reportava sucesso antes de a promise resolver
— qualquer exercício de assíncrono diria ao aluno que a resposta errada estava
certa. E não havia prazo por teste, então um exercício de callback travava para
sempre quando o aluno esquecia de chamar o callback.

### Fase 2 — A página · 26 aulas
Motor **1: executor em iframe isolado**. Destrava três blocos, sem download extra.

- **HTML e CSS** (10): semântica, caixa, flexbox, grid, responsivo, tipografia,
  cores, pseudo-classes, transições, CSS moderno.
- **DOM e eventos** (8): selecionar, criar e remover, classes, eventos,
  delegação, formulários, armazenamento local, buscar dados e desenhar.
- **UI e UX** (8): hierarquia, tipografia legível, cor e contraste, estados,
  acessibilidade por teclado, formulários, escrever a interface, polegar.

Plataforma: exercício julgado pela tela renderizada; mapa de tópicos e busca.

### Fase 3 — Tipos e componentes · 24 aulas
Motores **2 (transpilador)** e **3 (React no iframe)**.

- **TypeScript** (10): por que tipar, inferência, interfaces, narrowing, funções,
  genéricos, utilitários, tipar API, erros do compilador, quando não tipar.
- **React** (14): componentes, estado, listas, formulários, efeitos, buscar
  dados, estados de erro, composição, contexto, hooks próprios, rotas,
  re-render, testar componente, projeto.

Plataforma: tutor com IA; painel do aluno.

### Fase 4 — Back-end e dados · 20 aulas
Motores **4 (servidor simulado)** e **5 (sql.js, ~1,5 MB)**.

- **Node e back-end** (10): Node fora do navegador, pacotes, servidor HTTP,
  rotas, corpo da requisição, middleware, erros e status, autenticação, variáveis
  de ambiente, projeto de API.
- **SQL e modelagem** (10): tabelas, SELECT/WHERE, ordenar, JOIN, agregação,
  subconsultas, escrita, modelar domínio, normalização, índices.

Plataforma: exercício julgado pelo conjunto de linhas devolvido.

### Fase 5 — Profissionalização · 19 aulas
Motor: **nenhum novo**. Encaixa em qualquer buraco entre as outras fases.

- **Testes e qualidade** (8), **Git e equipe** (6), **Terminal e ferramentas** (5).

### Fase 6 — Python · 10 aulas
Motor **6: Pyodide, ~10 MB**. Por último pelo peso, não pela importância.

### Fase 7 — Projeto final · 5 aulas, 3 capstones
Front-end, API, banco, testes e publicação. O aluno sai com algo que dá para
mostrar numa entrevista.

Plataforma: fechar as pontas do CodeFlow — desempenho do pacote, revisão num
telefone real, passagem final de acessibilidade.

## Sobre tamanho

As 13 aulas de hoje levaram bastante tempo para ficar no padrão do projeto. As
122 restantes são muitas vezes esse trabalho, e os ~675 exercícios novos são a
maior parte dele. Por isso a unidade é a fase: cada uma termina numa versão do
produto que dá para usar. O roadmap escolhe a ordem; não promete prazo.

A Fase 1 é o melhor primeiro passo por um motivo concreto: é a única que não
precisa de motor nenhum, e é onde estão os testes por propriedade — que mudam a
qualidade de todos os exercícios que vierem depois.
