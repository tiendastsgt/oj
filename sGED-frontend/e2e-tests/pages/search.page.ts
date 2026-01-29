import { Page } from '@playwright/test';

/**
 * Page Object para Búsqueda y Listado de Expedientes
 */
export class SearchPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/expedientes', { waitUntil: 'domcontentloaded' });
  }

  async searchQuick(query: string) {
    await this.page.fill('input[placeholder="Buscar expediente..."]', query);
    await this.page.click('button:has-text("Buscar")');
    await this.page.waitForTimeout(1000); // Esperar respuesta
  }

  async searchAdvanced(filters: { estado?: string; juzgado?: string; ano?: string }) {
    await this.page.click('[data-testid="btn-advanced-search"]');

    if (filters.estado) {
      await this.page.selectOption('select[name="estado"]', filters.estado);
    }
    if (filters.juzgado) {
      await this.page.selectOption('select[name="juzgado"]', filters.juzgado);
    }
    if (filters.ano) {
      await this.page.fill('input[name="ano"]', filters.ano);
    }

    await this.page.click('button:has-text("Buscar")');
    await this.page.waitForTimeout(1000);
  }

  async getSearchResults() {
    return await this.page.locator('table tbody tr').count();
  }

  async clickExpedient(index: number = 0) {
    const rows = await this.page.locator('table tbody tr');
    await rows.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  async getFirstExpedientNumber() {
    return await this.page.locator('table tbody tr:first-child td:first-child').textContent();
  }

  async isPaginationVisible() {
    return await this.page.isVisible('[data-testid="pagination"]');
  }

  async goToNextPage() {
    await this.page.click('button[aria-label="Siguiente"]');
  }
}
