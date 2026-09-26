import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Lint mínimo, com um motivo por regra.
 *
 * - `react-hooks`: `exhaustive-deps` como erro aponta a dependência
 *   **esquecida** de um efeito — a closure velha que lê o estado de antes.
 *   Não aponta o contrário: depender do objeto `user` inteiro quando só o id
 *   é usado passa (conferido). Essa armadilha, que voltou em cinco lugares
 *   até a auditoria de 2026-09-26, fica com o `AuthContext`, que mantém a
 *   referência do usuário entre renovações do token (`mesmoUsuario`).
 * - `typescript-eslint` recomendado: o que o `tsc` não cobre (promessa
 *   esquecida, `any` explícito, `@ts-ignore` sem motivo).
 *
 * Variáveis sem uso ficam com o `tsc` (`noUnusedLocals`), que já reprova.
 */
export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'playwright-report', 'test-results', 'public'] },
  {
    files: ['**/*.{ts,tsx,js}'],
    extends: [tseslint.configs.recommended],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    // O `use` das fixtures do Playwright não é o hook do React.
    files: ['e2e/**'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  }
);
