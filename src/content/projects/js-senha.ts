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
  checkpoints: [
    {
      id: 'cp-senha-formato',
      title: 'Devolve o formato combinado',
      description: 'validarSenha devolve um objeto com valida (boolean) e problemas (array de textos).',
      tests: [
        {
          description: 'A funcao validarSenha existe',
          assertion: `if (typeof validarSenha !== 'function') throw new Error("Crie a funcao 'validarSenha(senha)'.");`,
        },
        {
          description: 'Devolve valida e problemas',
          assertion: `const r = validarSenha("abc");
if (!r || typeof r !== 'object') throw new Error('Deveria devolver um objeto, mas devolveu ' + JSON.stringify(r) + '.');
if (typeof r.valida !== 'boolean') throw new Error('O campo valida deveria ser boolean, mas veio ' + typeof r.valida + '.');
if (!Array.isArray(r.problemas)) throw new Error('O campo problemas deveria ser um array.');`,
        },
      ],
    },
    {
      id: 'cp-senha-regras',
      title: 'Verifica as cinco regras',
      description: 'Tamanho minimo, maiuscula, minuscula, numero e ausencia de espaco.',
      tests: [
        {
          description: 'Senha correta passa sem problemas',
          assertion: `const r = validarSenha("Senha123");
if (!r.valida) throw new Error('"Senha123" atende as cinco regras e deveria ser valida. Problemas apontados: ' + JSON.stringify(r.problemas));
if (r.problemas.length !== 0) throw new Error('Senha valida deveria ter problemas vazio, mas veio ' + JSON.stringify(r.problemas));`,
        },
        {
          description: 'Curta demais e recusada',
          assertion: `const r = validarSenha("Ab1");
if (r.valida) throw new Error('"Ab1" tem menos de 8 caracteres e nao deveria ser valida.');`,
        },
        {
          description: 'Espaco e recusado',
          assertion: `const r = validarSenha("Senha 123");
if (r.valida) throw new Error('"Senha 123" tem espaco e nao deveria ser valida.');`,
        },
        {
          description: 'Falta de numero e recusada',
          assertion: `const r = validarSenha("SenhaSemNumero");
if (r.valida) throw new Error('"SenhaSemNumero" nao tem digito e nao deveria ser valida.');`,
          hidden: true,
        },
      ],
    },
    {
      id: 'cp-senha-todos',
      title: 'Junta todos os problemas',
      description: 'Nao para no primeiro erro: uma senha ruim em varias regras lista todas.',
      tests: [
        {
          description: 'Senha vazia acumula varios problemas',
          assertion: `const r = validarSenha("");
if (r.problemas.length < 4) throw new Error('Uma senha vazia falha em pelo menos quatro regras, mas so ' + r.problemas.length + ' problema(s) foi(ram) apontado(s). Nao pare no primeiro erro.');`,
        },
        {
          description: 'Nao quebra com senha vazia',
          assertion: `if (validarSenha("").valida !== false) throw new Error('Senha vazia nao pode ser valida.');`,
          hidden: true,
        },
      ],
    },
  ],
  referenceSolution: `function validarSenha(senha) {
  const texto = String(senha == null ? "" : senha);
  const problemas = [];

  if (texto.length < 8) problemas.push("Use ao menos 8 caracteres.");

  let temMaiuscula = false;
  let temMinuscula = false;
  let temNumero = false;
  let temEspaco = false;

  for (const c of texto) {
    if (c === " ") temEspaco = true;
    else if (c >= "0" && c <= "9") temNumero = true;
    else if (c !== c.toLowerCase()) temMaiuscula = true;
    else if (c !== c.toUpperCase()) temMinuscula = true;
  }

  if (!temMaiuscula) problemas.push("Adicione ao menos uma letra maiuscula.");
  if (!temMinuscula) problemas.push("Adicione ao menos uma letra minuscula.");
  if (!temNumero) problemas.push("Adicione ao menos um numero.");
  if (temEspaco) problemas.push("Remova os espacos.");

  return { valida: problemas.length === 0, problemas };
}`,
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
