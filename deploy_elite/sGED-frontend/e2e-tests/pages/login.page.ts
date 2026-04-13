import { Page, expect } from '@playwright/test';

/**
 * Page Object para Login y Autenticación
 */
export class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
  }

  async fillUsername(username: string) {
    await this.page.fill('input[name="username"]', username);
  }

  async fillPassword(password: string) {
    await this.page.fill('input[name="password"]', password);
  }

  async clickLogin() {
    await this.page.click('button:has-text("Ingresar")');
  }

  async fillNewPassword(password: string) {
    await this.page.fill('input[name="newPassword"]', password);
  }

  async fillConfirmPassword(password: string) {
    await this.page.fill('input[name="confirmPassword"]', password);
  }

  async clickConfirmChangePassword() {
    await this.page.click('button:has-text("Confirmar")');
  }

  async isChangePasswordModalVisible() {
    return await this.page.isVisible('[data-testid="modal-change-password"]', { timeout: 5000 });
  }

  async getErrorMessage() {
    return await this.page.locator('[data-testid="error-message"]').textContent();
  }

  async login(username: string, password: string) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }
}
