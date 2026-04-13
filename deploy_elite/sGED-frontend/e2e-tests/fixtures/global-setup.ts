import { chromium, FullConfig } from '@playwright/test';

/**
 * Setup global: Valida que el entorno QA esté disponible
 */
async function globalSetup(config: FullConfig) {
  const baseURL = process.env.BASE_URL || 'http://localhost:4200';
  
  console.log(`\n========================================`);
  console.log(`🧪 SGED E2E Tests - Fase 7 (QA)`);
  console.log(`========================================`);
  console.log(`Base URL: ${baseURL}`);
  console.log(`Browser: Chromium + Firefox`);
  console.log(`Timeout: 30s`);
  console.log(`Workers: ${process.env.CI ? '1 (CI mode)' : 'Auto (local)'}`);
  console.log(`========================================\n`);

  // Verificar que la aplicación está disponible
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const response = await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!response || !response.ok()) {
      throw new Error(`Failed to load ${baseURL}: ${response?.status()}`);
    }
    console.log(`✓ Application available at ${baseURL}`);
  } catch (error) {
    console.error(`✗ Cannot reach ${baseURL}`);
    console.error(`  Make sure the QA environment is running.`);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
