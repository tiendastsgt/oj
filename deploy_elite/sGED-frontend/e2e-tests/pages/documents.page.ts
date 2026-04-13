import { Page } from '@playwright/test';

/**
 * Page Object para Documentos
 */
export class DocumentsPage {
  constructor(private page: Page) {}

  async uploadDocument(filePath: string, tipo: string) {
    await this.page.click('[data-testid="btn-new-document"]');

    // Llenar formulario
    await this.page.selectOption('select[name="tipo"]', tipo);
    await this.page.fill('input[name="fecha"]', new Date().toISOString().split('T')[0]);

    // Upload file
    await this.page.setInputFiles('input[type="file"]', filePath);

    // Submit
    await this.page.click('button:has-text("Cargar")');
    await this.page.waitForTimeout(2000); // Esperar respuesta
  }

  async getDocumentRow(nombre: string) {
    return this.page.locator(`text=${nombre}`).locator('..').locator('..');
  }

  async clickViewDocument(index: number = 0) {
    const rows = await this.page.locator('[data-testid="document-row"]');
    await rows.nth(index).locator('[data-testid="btn-view"]').click();
  }

  async isPdfViewerVisible() {
    return await this.page.isVisible('[data-testid="pdf-viewer"]', { timeout: 5000 });
  }

  async clickDownloadDocument(index: number = 0) {
    const rows = await this.page.locator('[data-testid="document-row"]');
    
    // Esperar download
    const downloadPromise = this.page.waitForEvent('download');
    await rows.nth(index).locator('[data-testid="btn-download"]').click();
    const download = await downloadPromise;
    return download.suggestedFilename();
  }

  async clickPrintDocument(index: number = 0) {
    const rows = await this.page.locator('[data-testid="document-row"]');
    await rows.nth(index).locator('[data-testid="btn-print"]').click();
  }

  async isPrintDialogVisible() {
    return await this.page.isVisible('[data-testid="print-dialog"]', { timeout: 5000 });
  }

  async closePrintDialog() {
    await this.page.click('button:has-text("Cancelar")');
  }

  async getDocumentCount() {
    return await this.page.locator('[data-testid="document-row"]').count();
  }
}
