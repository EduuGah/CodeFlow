import type { Lesson } from '../types';

export const lessonDeployBancoDominioEHttps: Lesson = {
  id: 'lesson-deploy-4',
  trackId: 'track-deploy',
  title: 'Banco em Produção, Domínio e HTTPS',
  language: 'javascript',
  objective:
    'Entender por que mudar o schema de um banco em produção pede uma migration em vez de um comando direto, e o que existe entre digitar um domínio e o navegador receber a resposta cifrada.',
  concepts: ['deploy-banco-dominio'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Falta uma última peça: os dados que a aplicação guarda, e o endereço pelo qual alguém a encontra.

## Banco em produção: dado real muda a régua

Nas aulas de SQL, mudar uma tabela era digitar \`ALTER TABLE\` e rodar — sem risco, porque o banco de exemplo se recria a cada execução. Um banco de produção guarda dados reais, que ninguém pode se dar ao luxo de perder. Duas práticas nascem exatamente dessa diferença:

- **Migration**: em vez de digitar a mudança de schema direto no banco de produção, ela é escrita como um arquivo — um passo a passo versionado, revisável antes de rodar, e aplicado da mesma forma em todo ambiente (o seu computador, o de um colega, produção). A alternativa — mexer direto no banco de produção, sem esse registro — funciona até alguém perguntar "o que mudou, quando, e por quê", e a resposta ser "ninguém sabe".
- **Backup antes de mudança arriscada**: uma migration que apaga uma coluna, por exemplo, é irreversível sem um backup de antes — os dados daquela coluna somem de verdade, não “ficam escondidos” em algum lugar recuperável.

## O que existe entre um domínio e uma resposta

Quando alguém digita \`meuapp.com\` no navegador, uma cadeia de passos entra em ação antes de qualquer resposta chegar:

1. O **DNS** traduz o nome (\`meuapp.com\`) para o endereço IP do servidor que hospeda a aplicação — é literalmente uma agenda de contatos: nome legível de um lado, número de verdade do outro.
2. O navegador abre uma conexão com esse IP, na porta certa (a 443, por padrão, para HTTPS).
3. Se o site usa **HTTPS**, um certificado prova que o servidor é de fato quem diz ser, e toda a comunicação daí em diante é cifrada — ninguém no meio do caminho (o provedor de internet, uma rede Wi-Fi pública) consegue ler o conteúdo, só o servidor de destino e o navegador de quem pediu.

A maioria dos hosts modernos emite e renova esse certificado automaticamente assim que um domínio é apontado para eles — o trabalho manual que existia há alguns anos (comprar um certificado, instalar, lembrar de renovar antes de expirar) hoje é, na prática, invisível. Mas o conceito continua sendo o mesmo: sem HTTPS, uma senha digitada num formulário trafega em texto puro, legível por qualquer um no meio do caminho.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Simulação: uma migration é um passo a passo registrado, não um comando solto.
const migrations = [
  { id: '001', descricao: 'criar tabela usuarios', aplicada: true },
  { id: '002', descricao: 'adicionar coluna email em usuarios', aplicada: true },
  { id: '003', descricao: 'criar tabela pedidos', aplicada: false },
];

function proximaAAplicar(migrations) {
  return migrations.find((m) => !m.aplicada) ?? null;
}

proximaAAplicar(migrations); // { id: '003', descricao: 'criar tabela pedidos', aplicada: false }`,
      caption: 'Cada migration sabe se já rodou — é assim que o mesmo conjunto de mudanças se aplica sem repetir em nenhum ambiente.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-4-por-que-migration',
        type: 'multiple-choice',
        prompt: 'Por que mudar o schema de um banco de produção usa uma migration, em vez de rodar o `ALTER TABLE` direto, como se faz nos exercícios de SQL?',
        concepts: ['deploy-banco-dominio'],
        difficulty: 'intermediario',
        tags: ['deploy', 'banco', 'migration'],
        options: [
          'Porque a migration fica registrada e revisável antes de rodar, e se aplica da mesma forma em todo ambiente — um comando digitado direto no banco de produção não deixa esse rastro',
          'Porque `ALTER TABLE` não funciona em bancos de produção',
          'Porque uma migration é sempre mais rápida de executar',
          'Não há diferença real; migration é só um nome mais formal para o mesmo comando',
        ],
        correctIndex: 0,
        explanation:
          'O ganho da migration não é técnico no sentido do SQL em si — é de processo: ela vira um arquivo versionado, revisável antes de rodar, e reprodutível em qualquer ambiente. Um comando digitado direto no banco de produção muda o schema sem deixar esse registro, e sem alguém revisar antes de acontecer.',
        hints: ['Pense em quem consegue responder "o que mudou nesse banco, quando, e por quê" em cada uma das duas abordagens.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-4-backup-antes',
        type: 'multiple-choice',
        prompt: 'Uma migration vai remover uma coluna que não é mais usada. Antes de rodá-la em produção, o que se espera que aconteça primeiro?',
        concepts: ['deploy-banco-dominio'],
        difficulty: 'iniciante',
        tags: ['deploy', 'banco', 'backup'],
        options: [
          'Um backup do banco, porque remover uma coluna com dados reais é uma perda irreversível sem ele',
          'Nada em especial: remover uma coluna é uma operação segura por natureza',
          'Avisar os usuários de que o site vai sair do ar',
          'Rodar a migration primeiro em produção, e só depois testar num ambiente de teste',
        ],
        correctIndex: 0,
        explanation:
          'Uma coluna removida junto com os dados que ela guardava não é recuperável a não ser que exista um backup de antes da mudança. Testar a migration num ambiente de teste antes também importa, mas a pergunta é sobre o que protege o dado real que já existe em produção.',
        hints: ['Pense no que sobra dos dados de uma coluna depois que ela é removida — e como recuperá-los sem uma cópia de segurança.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-4-ordem-do-dominio',
        type: 'order-steps',
        prompt: 'Coloque na ordem certa o que acontece entre digitar um domínio no navegador e receber a página, com HTTPS.',
        concepts: ['deploy-banco-dominio'],
        difficulty: 'intermediario',
        tags: ['deploy', 'dns', 'https'],
        steps: [
          { id: 'dns', text: 'O DNS traduz o nome do domínio para o endereço IP do servidor', ordem: 1 },
          { id: 'conexao', text: 'O navegador abre uma conexão com esse IP, na porta do HTTPS', ordem: 2 },
          { id: 'certificado', text: 'O servidor apresenta um certificado que prova quem ele é', ordem: 3 },
          { id: 'cifrado', text: 'Navegador e servidor trocam a resposta já cifrada, ilegível para quem estiver no meio do caminho', ordem: 4 },
        ],
        explanation:
          'Sem o endereço IP (que o DNS fornece), não há com quem conectar; sem a conexão aberta, não há como apresentar certificado nenhum; e a cifra só começa a valer depois que o certificado prova a identidade do servidor.',
        hints: ['O navegador não sabe onde fica o servidor só pelo nome do domínio — algum passo antes precisa traduzir isso.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-4-sem-https',
        type: 'multiple-choice',
        prompt: 'Um site de login não usa HTTPS — só HTTP comum. O que isso significa na prática para quem digita a senha?',
        concepts: ['deploy-banco-dominio'],
        difficulty: 'iniciante',
        tags: ['deploy', 'https', 'seguranca'],
        options: [
          'A senha trafega em texto puro entre o navegador e o servidor, legível por qualquer um no meio do caminho — como uma rede Wi-Fi pública compartilhada',
          'Nada muda: HTTPS só afeta a velocidade da conexão',
          'A senha continua cifrada, só o restante da página que não é',
          'O navegador recusa enviar o formulário sem HTTPS',
        ],
        correctIndex: 0,
        explanation:
          'HTTPS é o que cifra a comunicação entre navegador e servidor. Sem ele, tudo o que trafega — incluindo uma senha digitada num formulário — vai em texto puro, e qualquer um capaz de observar o tráfego pelo caminho (um roteador comprometido, uma rede pública mal configurada) consegue lê-la.',
        hints: ['Pense no que "cifrado" quer dizer, e no que continua sendo verdade na ausência disso.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-4-proxima-migration',
        type: 'code',
        prompt: 'Escreva `proximaAAplicar(migrations)`: devolve a primeira migration (na ordem do array) cujo `aplicada` é `false`, ou `null` se todas já foram aplicadas.',
        concepts: ['deploy-banco-dominio'],
        difficulty: 'iniciante',
        tags: ['deploy', 'banco', 'migration'],
        initialCode: `function proximaAAplicar(migrations) {
  // Seu código aqui
}`,
        tests: [
          {
            description: 'Devolve a primeira não aplicada, na ordem do array',
            assertion: `const r = proximaAAplicar([
  { id: '001', aplicada: true },
  { id: '002', aplicada: false },
  { id: '003', aplicada: false },
]);
if (r?.id !== '002') throw new Error('esperava a migration 002, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Todas aplicadas devolve null',
            assertion: `const r = proximaAAplicar([{ id: '001', aplicada: true }, { id: '002', aplicada: true }]);
if (r !== null) throw new Error('esperava null, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Lista vazia devolve null',
            assertion: `const r = proximaAAplicar([]);
if (r !== null) throw new Error('esperava null para lista vazia, veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function proximaAAplicar(migrations) {
  return migrations.find((m) => !m.aplicada) ?? null;
}`,
        hints: [
          '`Array.prototype.find` devolve o primeiro item que satisfaz uma condição, ou `undefined` se nenhum satisfizer.',
          '`undefined` não é `null` — o `??` (nullish coalescing) troca um pelo outro quando `find` não encontra nada.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um banco de produção muda de schema por **migration** — um passo a passo registrado e revisável, nunca um comando digitado direto — e uma mudança arriscada pede backup antes, porque dado real perdido não volta. Um domínio existe porque o **DNS** traduz nome em endereço, e **HTTPS** cifra o que trafega depois que um certificado prova a identidade do servidor — sem ele, uma senha digitada num formulário vai em texto puro.

Com isso fecha a trilha de Deploy: ambientes e build, onde um segredo mora, como o frontend e o backend chegam ao ar, e o que sustenta um domínio com HTTPS por trás dele.
`.trim(),
    },
  ],
};
