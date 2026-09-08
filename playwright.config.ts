import { defineConfig, devices } from '@playwright/test';

/**
 * E2E no navegador de verdade.
 *
 * O Vitest com jsdom cobre lógica e semântica, mas jsdom não tem layout nem CSS:
 * não sabe dizer se o cabeçalho fixo cobre o conteúdo, se o editor cabe na tela
 * do celular, ou se o anel de foco aparece. Tudo isso só se mede num navegador.
 *
 * O Supabase é dublado por interceptação de rede (`e2e/fixtures.ts`), com uma URL
 * de projeto inexistente. Assim a suíte não precisa de segredo nenhum no CI e não
 * depende de um backend de verdade estar de pé — e, principalmente, um teste
 * nunca escreve no banco de um aluno real.
 */

const PORTA = 3100;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',

  use: {
    baseURL: `http://localhost:${PORTA}`,
    trace: 'retain-on-failure',
  },

  projects: [
    // O celular vem primeiro porque o produto é mobile-first: se algo quebrar,
    // é o resultado que aparece antes no relatório.
    { name: 'celular', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],

  webServer: {
    command: `npx vite --port ${PORTA} --strictPort`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: !process.env.CI,
    env: {
      // Formato válido, projeto inexistente: o client instancia e toda chamada
      // cai na interceptação. Uma URL real correria o risco de um teste escrever
      // no banco de produção.
      VITE_SUPABASE_URL: 'https://e2e-codeflow.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'sb_publishable_e2e_somente_para_testes',
    },
  },
});
