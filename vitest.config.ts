import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // O conteudo e o nucleo do sandbox sao codigo puro: nao precisam de DOM.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
