import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    clearMocks: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
    exclude: ['tests/e2e/**', 'node_modules/**', '.next/**'],
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
    ],
    restoreMocks: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    unstubEnvs: true,
    unstubGlobals: true,
  },
});
