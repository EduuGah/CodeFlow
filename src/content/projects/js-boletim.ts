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
  checkpoints: [
    {
      id: 'cp-bol-aluno',
      title: 'Média de um aluno',
      description: 'mediaDoAluno recebe um aluno e devolve a média das notas dele.',
      tests: [
        {
          description: 'A função existe',
          assertion: `if (typeof mediaDoAluno !== 'function') throw new Error("Crie a função 'mediaDoAluno(aluno)'.");`,
        },
        {
          description: 'Calcula a média das notas',
          assertion: `const r = mediaDoAluno({ nome: "X", notas: [8, 7, 9] });
if (Math.abs(r - 8) > 1e-9) throw new Error('A média de [8, 7, 9] é 8, mas veio ' + r + '.');`,
        },
      ],
    },
    {
      id: 'cp-bol-turma',
      title: 'Média da turma',
      description: 'mediaDaTurma devolve a média das médias individuais.',
      tests: [
        {
          description: 'A função existe',
          assertion: `if (typeof mediaDaTurma !== 'function') throw new Error("Crie a função 'mediaDaTurma(turma)'.");`,
        },
        {
          description: 'Combina as médias individuais',
          assertion: `const t = [{ nome: "A", notas: [10, 10] }, { nome: "B", notas: [6, 6] }];
const r = mediaDaTurma(t);
if (Math.abs(r - 8) > 1e-9) throw new Error('Médias 10 e 6 dão média de turma 8, mas veio ' + r + '.');`,
        },
      ],
    },
    {
      id: 'cp-bol-acima',
      title: 'Quem está acima da média',
      description: 'acimaDaMedia devolve um array com os NOMES dos alunos acima da média da turma.',
      tests: [
        {
          description: 'A função existe',
          assertion: `if (typeof acimaDaMedia !== 'function') throw new Error("Crie a função 'acimaDaMedia(turma)'.");`,
        },
        {
          description: 'Devolve nomes, não objetos',
          assertion: `const t = [{ nome: "Alta", notas: [10, 10] }, { nome: "Baixa", notas: [4, 4] }];
const r = acimaDaMedia(t);
if (!Array.isArray(r)) throw new Error('Deveria devolver um array, mas veio ' + typeof r + '.');
if (JSON.stringify(r) !== JSON.stringify(["Alta"])) throw new Error('Esperado ["Alta"], mas veio ' + JSON.stringify(r) + '. Devolva os nomes, não os objetos.');`,
        },
        {
          description: 'Turma inteira empatada não tem ninguém acima',
          assertion: `const t = [{ nome: "A", notas: [7] }, { nome: "B", notas: [7] }];
const r = acimaDaMedia(t);
if (r.length !== 0) throw new Error('Com todos na mesma nota, ninguém está ACIMA da média. Veio ' + JSON.stringify(r) + '.');`,
          hidden: true,
        },
      ],
    },
  ],
  referenceSolution: `function mediaDoAluno(aluno) {
  let soma = 0;
  for (const n of aluno.notas) soma += n;
  return soma / aluno.notas.length;
}

function mediaDaTurma(turma) {
  let soma = 0;
  for (const a of turma) soma += mediaDoAluno(a);
  return soma / turma.length;
}

function acimaDaMedia(turma) {
  const geral = mediaDaTurma(turma);
  return turma.filter(a => mediaDoAluno(a) > geral).map(a => a.nome);
}`,
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
