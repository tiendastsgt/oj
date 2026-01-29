import { FullConfig } from '@playwright/test';

/**
 * Teardown global: Limpieza después de tests
 */
async function globalTeardown(config: FullConfig) {
  console.log(`\n✓ All E2E tests completed`);
  console.log(`📊 Report: playwright-report/index.html`);
  console.log(`📋 Results: test-results.json\n`);
}

export default globalTeardown;
