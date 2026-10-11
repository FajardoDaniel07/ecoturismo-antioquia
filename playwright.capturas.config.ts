import { defineConfig, devices } from '@playwright/test';

// Capturas del punto de control CA-124 (T-057): `npm run test:capturas`.
// Aparte de `playwright.config.ts` para no construir ni servir escenarios extra en `test:e2e`.
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'capturas.spec.ts',
  outputDir: './.tmp/capturas/test-results',
  globalSetup: './tests/e2e/capturas-setup.ts',
  workers: 1,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    locale: 'es-CO',
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  },
});
