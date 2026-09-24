/**
 * Contas de demonstração.
 *
 * Quem chega pelo portfólio quer ver a plataforma por dentro sem entregar a
 * conta Google. A migração `0008_contas_demo.sql` cria as duas contas; a tela
 * de entrada oferece um botão para cada uma e aceita o usuário digitado.
 *
 * As senhas são públicas de propósito: estão impressas na tela de login.
 */
export const DEMO_EMAIL_DOMAIN = 'demo.codeflow.app';

export const DEMO_ACCOUNTS = [
  {
    usuario: 'aluno',
    senha: 'aluno',
    rotulo: 'Entrar como aluno',
    descricao: 'Trilhas, aulas e exercícios com o código rodando no navegador',
  },
  {
    usuario: 'admin',
    senha: 'admin',
    rotulo: 'Entrar como admin',
    descricao: 'O painel de uso e desempenho dos alunos, só leitura',
  },
] as const;

/**
 * O Supabase só entende e-mail. Um usuário curto ("admin") vira o endereço
 * interno da conta de demonstração, que nunca recebe mensagem.
 */
export function emailDoUsuario(entrada: string): string {
  const valor = entrada.trim().toLowerCase();
  return valor.includes('@') ? valor : `${valor}@${DEMO_EMAIL_DOMAIN}`;
}
