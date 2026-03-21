import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './src/tests/setup.ts',
  },
  resolve: {
    alias: {
      '@backend': resolve(__dirname, './src'),
      '@controllers': resolve(__dirname, './src/controllers'),
      '@services': resolve(__dirname, './src/services'),
      '@repositories': resolve(__dirname, './src/repositories'),
      '@middleware': resolve(__dirname, './src/middleware'),
      '@utils': resolve(__dirname, './src/utils'),
      '@lib': resolve(__dirname, './src/lib'),
      '@errors': resolve(__dirname, './src/errors'),
      '@routes': resolve(__dirname, './src/routes'),
      '@tests': resolve(__dirname, './src/tests'),
      '@shared': resolve(__dirname, '../shared/types'),
    },
  },
});
