# Currículo: até a base de um dev júnior

Roadmap de conteúdo. A versão navegável está publicada como artifact; **este
arquivo é a fonte canônica** e deve ser atualizado no mesmo commit que conclui um
bloco.

## A restrição que ordena tudo

O código do aluno roda num Web Worker descartável, com 3s de limite e **sem
acesso ao DOM**. Isso é ótimo para lógica pura — um laço infinito não congela a
tela — e é exatamente por isso que ele não serve para DOM, HTML, CSS ou React:
não existe página para manipular lá dentro.

Cada linguagem ou ambiente novo exige um executor próprio. Os blocos abaixo estão
na ordem em que os motores se destravam, do mais barato para o mais caro. Um
motor destrava vários blocos; construir na ordem errada significa pagar duas
vezes.

## Blocos

| # | Bloco | Motor necessário | Aulas | Estado |
| --- | --- | --- | --- | --- |
| 00 | Fundamentos e lógica | worker atual | 13 | **pronto** |
| 01 | JavaScript que resolve problema real | nenhum | ~7 | |
| 02 | A página: HTML, CSS e DOM | 1 — iframe isolado | ~9 | |
| 03 | UI e UX na prática | 1 (reaproveita) | ~6 | |
| 04 | TypeScript | 2 — transpilador em memória | ~7 | |
| 05 | React | 1 + 2 + runtime do React | ~10 | |
| 06 | Como a web funciona | nenhum | ~6 | |
| 07 | Qualidade e otimização | nenhum | ~7 | |
| — | Dados: SQL e modelagem | 4 — sql.js (~1,5 MB) | ~8 | ramo independente |
| — | Python | 5 — Pyodide (~10 MB) | ~8 | ramo independente |

Total previsto: **81 aulas**, das quais 13 existem.

## Ordem sugerida

`01 → 02 → 03 → 04 → 05 → SQL e Python`

Os blocos 06 e 07 não exigem motor e encaixam em qualquer buraco — servem para
intercalar enquanto um motor está sendo construído.

## Detalhe por bloco

**01 · JavaScript que resolve problema real** — escopo e closures, callbacks,
promises, async/await, erros em código assíncrono, JSON, módulos.
O aluno entende código que espera. Maior ganho por esforço: nenhuma engenharia.

**02 · A página** — HTML semântico, caixas e espaçamento, flexbox, grid,
responsivo, selecionar elementos, mudar o DOM, eventos, formulários.
O exercício deixa de ser "qual o retorno" e passa a ser "clique e a lista aparece".

**03 · UI e UX** — hierarquia visual, tipografia, cor e contraste, estados
(vazio/carregando/erro), acessibilidade por teclado, escrever a interface.
O exercício é consertar uma tela ruim e defender a mudança.

**04 · TypeScript** — por que tipar, primitivos e inferência, objetos e
interfaces, união e narrowing, funções tipadas, genéricos, tipos utilitários.
Depois de assíncrono de propósito: tipar promise sem entender promise é decorar
sintaxe.

**05 · React** — componentes e props, estado, listas e chaves, formulários
controlados, efeitos, buscar dados, composição, hooks próprios, rotas, projeto.
Só faz sentido depois de DOM e TypeScript: React é resposta a problemas que só
quem passou por eles sente.

**06 · Como a web funciona** — cliente e servidor, HTTP, REST, autenticação,
CORS, segurança básica. Separa quem consome uma API de quem depura quando ela
falha.

**07 · Qualidade e otimização** — ler o erro, depurar com método, custo de um
algoritmo, escrever testes, performance no navegador, Git, pull request.
O que costuma faltar em quem aprendeu sozinho.

**SQL e modelagem** — tabelas e tipos, SELECT/WHERE, ordenar, JOIN, agregação,
modelar um domínio, normalização, índices. O motor roda o banco inteiro no
navegador, então o exercício tem dados de verdade.

**Python** — sintaxe e indentação, listas e dicionários, funções, compreensões,
arquivos, módulos, exceções, projeto. Por último não por importar menos: o motor
pesa mais que todo o resto do aplicativo somado.

## Sobre tamanho

As 13 aulas de hoje levaram um bom tempo para ficar no padrão do projeto — cada
exercício com dica, solução de referência e testes que o CI prova que passam. As
68 restantes são muitas vezes esse trabalho. O roadmap serve para escolher a
ordem, não para prometer prazo.
