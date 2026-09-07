import type { Project } from '../types';

export const projetoBoletim: Project = {
  id: 'proj-js-boletim',
  title: 'Boletim da Turma',
  description:
    'Calcule médias a partir de uma lista de alunos e descubra quem ficou acima da média geral.',
  difficulty: 'intermediario',
  language: 'javascript',
  concepts: ['arrays', 'loops', 'funcoes', 'condicoes'],
  status: 'published',
  initialCode: `const turma = [
  { nome: "Ana", notas: [8, 7, 9] },
  { nome: "Bruno", notas: [5, 6, 4] },
  { nome: "Carla", notas: [10, 9, 10] },
  { nome: "Diego", notas: [6, 7, 7] },
];

function mediaDoAluno(aluno) {
  // Seu código aqui
}

function mediaDaTurma(turma) {
  // Seu código aqui
}

function acimaDaMedia(turma) {
  // Deve retornar um array com os NOMES dos alunos acima da média da turma
}

console.log(mediaDoAluno(turma[0]));
console.log(mediaDaTurma(turma));
console.log(acimaDaMedia(turma));
`,
  brief: `
Este é o primeiro projeto em que os dados não são três variáveis soltas: é uma lista de objetos, o formato em que dados reais quase sempre chegam.

## Requisitos

1. \`mediaDoAluno(aluno)\` — recebe um aluno e retorna a média das notas dele.
2. \`mediaDaTurma(turma)\` — retorna a média de todas as médias individuais.
3. \`acimaDaMedia(turma)\` — retorna um **array com os nomes** dos alunos cuja média é maior que a média da turma.

## Divida antes de escrever

Repare que a terceira função depende das duas primeiras. Essa é a ideia central aqui: resolver um problema grande combinando pedaços pequenos que já funcionam, em vez de escrever tudo de uma vez.

Comece pela \`mediaDoAluno\` e só siga adiante quando ela estiver certa. Cada aluno tem \`aluno.nome\` e \`aluno.notas\`, que é um array.

## Perguntas para se fazer no fim

- O que sua função faz se um aluno tiver um array de notas vazio?
- E se a turma inteira tirar a mesma nota — quem fica "acima da média"?

Não existe uma única resposta certa para essas duas. O que importa é você **decidir** conscientemente, em vez de descobrir por acidente.
`.trim(),
};
