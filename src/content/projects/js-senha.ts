import type { Project } from '../types';

export const projetoSenha: Project = {
  id: 'proj-js-senha',
  title: 'Validador de Senha',
  description:
    'Verifique regras de segurança e devolva mensagens que ajudem o usuário a corrigir, em vez de só dizer "inválida".',
  difficulty: 'intermediario',
  language: 'javascript',
  concepts: ['strings', 'condicoes', 'arrays', 'funcoes'],
  status: 'published',
  initialCode: `function validarSenha(senha) {
  // Deve devolver { valida: boolean, problemas: string[] }
}

console.log(validarSenha("abc"));
console.log(validarSenha("Senha123"));
`,
  brief: `
Quase todo formulário de cadastro faz isso — e quase todo faz mal. Uma mensagem "senha inválida" sem dizer o motivo obriga o usuário a adivinhar.

## Requisitos

\`validarSenha(senha)\` devolve um objeto \`{ valida, problemas }\`, onde \`problemas\` é um array de mensagens. As regras:

1. no mínimo 8 caracteres
2. ao menos uma letra maiúscula
3. ao menos uma letra minúscula
4. ao menos um número
5. não pode conter espaços

## O ponto do projeto

Não pare no primeiro problema encontrado. Junte **todos** e devolva de uma vez — quem digita uma senha ruim costuma errar em mais de uma regra, e revelar uma por vez é uma experiência frustrante.

As mensagens devem dizer o que fazer: "adicione ao menos um número" funciona melhor que "falta número".

## Como verificar cada regra

Percorrer os caracteres com um loop resolve tudo, comparando cada um. Para saber se um caractere é dígito, \`c >= "0" && c <= "9"\` funciona. Para maiúscula, compare o caractere com a versão minúscula dele: se forem diferentes, era maiúscula.

## Casos para testar antes de submeter

- senha vazia \`""\` — deve listar vários problemas de uma vez, sem quebrar
- \`"SENHA123"\` — só falta minúscula
- \`"Senha 123"\` — o espaço no meio é detectado?
- uma senha que atende tudo — \`problemas\` volta como array vazio?
`.trim(),
};
