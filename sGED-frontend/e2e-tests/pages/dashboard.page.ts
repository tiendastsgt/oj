import { Page, expect } from '@playwright/test';

/**
 * Page Object para Dashboard y Navegación
 */
export class DashboardPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  }

  async isLoaded() {
    return await this.page.isVisible('[data-testid="dashboard-header"]', { timeout: 10000 });
  }

  async getWelcomeMessage() {
    return await this.page.locator('text=Bienvenido').textContent();
  }

  async clickLogout() {
    await this.page.click('[data-testid="menu-button"]');
    await this.page.click('text=Cerrar sesión');
  }

  async navigateTo(section: string) {
    // section = 'busqueda', 'expedientes', 'documentos', 'admin', 'auditoria'
    await this.page.click(`[data-testid="nav-${section}"]`);
  }

  async isMenuItemVisible(section: string) {
    return await this.page.isVisible(`[data-testid="nav-${section}"]`);
  }
}
