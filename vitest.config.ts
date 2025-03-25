
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // We don't need the alias as all imports have been updated
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
