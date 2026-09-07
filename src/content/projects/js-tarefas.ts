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
  checkpoints: [
    {
      id: 'cp-tar-adicionar',
      title: 'Adicionar tarefa',
      description: 'adicionar cria a tarefa com id, titulo e concluida: false, e devolve ela.',
      tests: [
        {
          description: 'A funcao adicionar existe',
          assertion: `if (typeof adicionar !== 'function') throw new Error("Crie a funcao 'adicionar(titulo)'.");`,
        },
        {
          description: 'Devolve a tarefa com os tres campos',
          assertion: `const t = adicionar("Estudar");
if (!t || typeof t !== 'object') throw new Error('adicionar deveria devolver a tarefa criada, mas devolveu ' + JSON.stringify(t) + '.');
if (t.titulo !== "Estudar") throw new Error('A tarefa deveria ter titulo "Estudar", mas veio ' + JSON.stringify(t.titulo) + '.');
if (t.concluida !== false) throw new Error('Toda tarefa nasce com concluida: false. Veio ' + JSON.stringify(t.concluida) + '.');
if (t.id === undefined) throw new Error('A tarefa precisa de um id.');`,
        },
        {
          description: 'Ids nao se repetem',
          assertion: `const a = adicionar("Uma");
const b = adicionar("Outra");
if (a.id === b.id) throw new Error('Duas tarefas receberam o mesmo id. O contador precisa avancar.');`,
        },
      ],
    },
    {
      id: 'cp-tar-concluir',
      title: 'Concluir tarefa',
      description: 'concluir marca a tarefa como concluida pelo id.',
      tests: [
        {
          description: 'A funcao concluir existe',
          assertion: `if (typeof concluir !== 'function') throw new Error("Crie a funcao 'concluir(id)'.");`,
        },
        {
          description: 'Some das pendentes depois de concluida',
          assertion: `const t = adicionar("Para concluir");
concluir(t.id);
if (pendentes().some(x => x.id === t.id)) throw new Error('A tarefa concluida ainda aparece em pendentes().');`,
        },
      ],
    },
    {
      id: 'cp-tar-remover',
      title: 'Remover tarefa',
      description: 'remover tira a tarefa da lista sem afetar as outras.',
      tests: [
        {
          description: 'A funcao remover existe',
          assertion: `if (typeof remover !== 'function') throw new Error("Crie a funcao 'remover(id)'.");`,
        },
        {
          description: 'Remove so a tarefa pedida',
          assertion: `const a = adicionar("Fica");
const b = adicionar("Sai");
remover(b.id);
const restantes = pendentes();
if (restantes.some(x => x.id === b.id)) throw new Error('A tarefa removida ainda esta na lista.');
if (!restantes.some(x => x.id === a.id)) throw new Error('A remocao levou junto uma tarefa que deveria ficar. Cuidado com splice dentro de loop.');`,
        },
      ],
    },
    {
      id: 'cp-tar-pendentes',
      title: 'Listar pendentes',
      description: 'pendentes devolve apenas as tarefas nao concluidas.',
      tests: [
        {
          description: 'A funcao pendentes existe e devolve um array',
          assertion: `if (typeof pendentes !== 'function') throw new Error("Crie a funcao 'pendentes()'.");
if (!Array.isArray(pendentes())) throw new Error('pendentes() deveria devolver um array.');`,
        },
        {
          description: 'Nao inclui tarefas concluidas',
          assertion: `const t = adicionar("Concluida depois");
concluir(t.id);
if (pendentes().some(x => x.concluida)) throw new Error('pendentes() esta devolvendo tarefa com concluida: true.');`,
          hidden: true,
        },
      ],
    },
  ],
  referenceSolution: `function adicionar(titulo) {
  const tarefa = { id: proximoId++, titulo, concluida: false };
  tarefas.push(tarefa);
  return tarefa;
}

function concluir(id) {
  const tarefa = tarefas.find(t => t.id === id);
  if (!tarefa) return false;
  tarefa.concluida = true;
  return true;
}

function remover(id) {
  const antes = tarefas.length;
  tarefas = tarefas.filter(t => t.id !== id);
  return tarefas.length < antes;
}

function pendentes() {
  return tarefas.filter(t => !t.concluida);
}`,
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
