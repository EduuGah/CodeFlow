import type { Project } from '../types';

export const projetoTarefas: Project = {
  id: 'proj-js-tarefas',
  title: 'Lista de Tarefas (v1)',
  description:
    'O CRUD mais clássico que existe: adicionar, concluir, remover e filtrar — sem interface, só a lógica.',
  difficulty: 'intermediario',
  language: 'javascript',
  concepts: ['arrays', 'objetos', 'funcoes', 'condicoes'],
  status: 'published',
  initialCode: `let tarefas = [];
let proximoId = 1;

function adicionar(titulo) {
  // Deve criar { id, titulo, concluida: false } e devolver a tarefa criada
}

function concluir(id) {
  // Marca como concluída. E se o id não existir?
}

function remover(id) {
  // Tira da lista
}

function pendentes() {
  // Só as que ainda não foram concluídas
}

adicionar("Estudar loops");
adicionar("Fazer o projeto");
concluir(1);
console.log(pendentes());
`,
  brief: `
Toda aplicação que guarda dados faz as mesmas quatro operações: criar, ler, atualizar e apagar. Este projeto é isso no menor formato possível — sem tela, sem banco, só a lógica que sustenta o resto.

## Requisitos

1. \`adicionar(titulo)\` — cria \`{ id, titulo, concluida: false }\`, com id crescente, e devolve a tarefa criada.
2. \`concluir(id)\` — marca a tarefa como concluída.
3. \`remover(id)\` — tira a tarefa da lista.
4. \`pendentes()\` — devolve apenas as não concluídas.

## As decisões que este projeto força

O enunciado não diz o que fazer quando o id não existe. Isso é de propósito — é o tipo de lacuna que aparece em requisito real. Concluir uma tarefa inexistente deve devolver \`false\`? Lançar erro? Ignorar em silêncio?

Escolha uma e seja **consistente** nas três funções. Consistência vale mais do que a escolha específica: quem for usar seu código precisa conseguir prever o comportamento.

## Uma armadilha de verdade

Para remover, é tentador usar \`splice\` dentro de um loop que percorre o mesmo array. Isso pula itens, porque os índices mudam durante a iteração. Rode e observe — depois pense em \`filter\`, que devolve uma lista nova em vez de mexer na original.

## Antes de submeter

- Adicionar duas tarefas gera ids diferentes?
- \`pendentes()\` com a lista vazia devolve \`[]\`, e não \`undefined\`?
- Remover uma tarefa e adicionar outra reaproveita um id já usado? Isso é problema?
`.trim(),
};
