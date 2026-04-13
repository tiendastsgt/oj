import { Page } from '@playwright/test';

/**
 * Page Object para Detalle de Expediente
 */
export class ExpedientDetailPage {
  constructor(private page: Page) {}

  async getExpedientNumber() {
    return await this.page.locator('[data-testid="expedient-number"]').textContent();
  }

  async getExpedientStatus() {
    return await this.page.locator('[data-testid="expedient-status"]').textContent();
  }

  async getExpedientJuzgado() {
    return await this.page.locator('[data-testid="expedient-juzgado"]').textContent();
  }

  async clickDocumentsTab() {
    await this.page.click('[data-testid="tab-documents"]');
    await this.page.waitForTimeout(500);
  }

  async getDocumentCount() {
    return await this.page.locator('[data-testid="document-row"]').count();
  }

  async clickUploadDocument() {
    await this.page.click('[data-testid="btn-upload-document"]');
  }

  async goBack() {
    await this.page.click('[data-testid="btn-back"]');
  }

  async isDetailVisible() {
    return await this.page.isVisible('[data-testid="expedient-detail"]', { timeout: 5000 });
  }
}
