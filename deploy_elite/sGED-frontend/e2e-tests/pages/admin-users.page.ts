import { Page } from '@playwright/test';

/**
 * Page Object para Administración de Usuarios
 */
export class AdminUsersPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/admin/usuarios', { waitUntil: 'domcontentloaded' });
  }

  async clickNewUser() {
    await this.page.click('[data-testid="btn-new-user"]');
  }

  async fillUserForm(data: {
    username: string;
    nombreCompleto: string;
    email: string;
    rol: string;
    juzgado: string;
  }) {
    await this.page.fill('input[name="username"]', data.username);
    await this.page.fill('input[name="nombreCompleto"]', data.nombreCompleto);
    await this.page.fill('input[name="email"]', data.email);
    await this.page.selectOption('select[name="rol"]', data.rol);
    await this.page.selectOption('select[name="juzgado"]', data.juzgado);
  }

  async clickCreateUser() {
    await this.page.click('button:has-text("Crear")');
    await this.page.waitForTimeout(1000);
  }

  async findUserRow(username: string) {
    return this.page.locator(`text=${username}`).locator('..').locator('..');
  }

  async clickEditUser(username: string) {
    const row = await this.findUserRow(username);
    await row.locator('[data-testid="btn-edit"]').click();
  }

  async clickBlockUser(username: string) {
    const row = await this.findUserRow(username);
    await row.locator('[data-testid="btn-block"]').click();
    await this.page.click('button:has-text("Confirmar")');
    await this.page.waitForTimeout(1000);
  }

  async clickUnblockUser(username: string) {
    const row = await this.findUserRow(username);
    await row.locator('[data-testid="btn-unblock"]').click();
    await this.page.click('button:has-text("Confirmar")');
    await this.page.waitForTimeout(1000);
  }

  async clickResetPassword(username: string) {
    const row = await this.findUserRow(username);
    await row.locator('[data-testid="btn-reset-password"]').click();
    await this.page.click('button:has-text("Confirmar")');
    await this.page.waitForTimeout(1000);
  }

  async isUserBlocked(username: string) {
    const row = await this.findUserRow(username);
    return await row.locator('[data-testid="icon-blocked"]').isVisible();
  }

  async getUserCount() {
    return await this.page.locator('[data-testid="user-row"]').count();
  }
}
