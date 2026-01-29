import { Page } from '@playwright/test';

/**
 * Page Object para Auditoría
 */
export class AuditPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/admin/auditoria', { waitUntil: 'domcontentloaded' });
  }

  async filterByUser(username: string) {
    await this.page.fill('input[name="usuario"]', username);
    await this.page.click('button:has-text("Buscar")');
    await this.page.waitForTimeout(1000);
  }

  async filterByModule(module: string) {
    await this.page.selectOption('select[name="modulo"]', module);
    await this.page.click('button:has-text("Buscar")');
    await this.page.waitForTimeout(1000);
  }

  async filterByAction(action: string) {
    await this.page.selectOption('select[name="accion"]', action);
    await this.page.click('button:has-text("Buscar")');
    await this.page.waitForTimeout(1000);
  }

  async filterByDateRange(desde: string, hasta: string) {
    await this.page.fill('input[name="fechaDesde"]', desde);
    await this.page.fill('input[name="fechaHasta"]', hasta);
    await this.page.click('button:has-text("Buscar")');
    await this.page.waitForTimeout(1000);
  }

  async clearFilters() {
    await this.page.click('[data-testid="btn-clear-filters"]');
    await this.page.waitForTimeout(500);
  }

  async getAuditoryCount() {
    return await this.page.locator('[data-testid="audit-row"]').count();
  }

  async clickAuditDetail(index: number = 0) {
    const rows = await this.page.locator('[data-testid="audit-row"]');
    await rows.nth(index).click();
  }

  async getDetailUser() {
    return await this.page.locator('[data-testid="detail-usuario"]').textContent();
  }

  async getDetailAction() {
    return await this.page.locator('[data-testid="detail-accion"]').textContent();
  }

  async getDetailModule() {
    return await this.page.locator('[data-testid="detail-modulo"]').textContent();
  }

  async closeDetail() {
    await this.page.click('[data-testid="btn-close-detail"]');
  }
}
