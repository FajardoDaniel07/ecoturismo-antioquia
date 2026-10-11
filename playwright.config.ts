import { defineConfig, devices } from '@playwright/test';
import { defaultScenario, urlOf } from './tests/e2e/scenarios';

// Los cinco proyectos corren sobre el escenario `completo`. Los demás escenarios los sirve
// global-setup en su puerto y las pruebas que los necesitan usan su URL (scenarios.ts).
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './.tmp/test-results',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: './.tmp/playwright-report' }]],
  use: {
    baseURL: urlOf(defaultScenario),
    locale: 'es-CO',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'escritorio',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'tableta',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'movil',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 360, height: 740 },
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'sin-javascript',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        javaScriptEnabled: false,
      },
    },
    {
      name: 'movimiento-reducido',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        reducedMotion: 'reduce',
      },
    },
  ],
});
