import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Logica pura roda em node, que e mais rapido. Teste de componente precisa
    // de DOM, e o sufixo .tsx e o que distingue os dois.
    environment: 'node',
    environmentMatchGlobs: [['**/*.test.tsx', 'jsdom']],
    setupFiles: ['./src/test-setup.ts'],
    // As migrações também são testadas: uma view citando coluna inexistente só
    // aparece quando alguém cola o arquivo no SQL Editor, no meio da configuração.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'supabase/**/*.test.ts'],
  },
});
