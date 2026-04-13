import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para pruebas E2E SGED Fase 7 (QA)
 * 
 * Uso:
 * - Local: npm run test:e2e (contra http://localhost:4200)
 * - QA: BASE_URL=https://qa-sged.example.com npm run test:e2e
 * - Headless (CI): npm run test:e2e
 * - Modo debug local: npm run test:e2e:debug
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:4200';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api/v1';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  webServer: {
    command: process.env.CI ? '' : 'npm start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    // En QA, no iniciar servidor (usar el que ya está levantado)
    ignoreHTTPSErrors: true,
  },

  globalSetup: require.resolve('./fixtures/global-setup.ts'),
  globalTeardown: require.resolve('./fixtures/global-teardown.ts'),
});
