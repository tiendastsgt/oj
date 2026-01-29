import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { SearchPage } from '../pages/search.page';
import { DocumentsPage } from '../pages/documents.page';
import { ExpedientDetailPage } from '../pages/expedient-detail.page';
import { TEST_USERS, TEST_DATA } from '../fixtures/test-data';
import * as fs from 'fs';
import * as path from 'path';

test.describe('F3: Documentos - Carga, Visualización, Descarga, Impresión (HU-005)', () => {
  let loginPage: LoginPage;
  let searchPage: SearchPage;
  let documentsPage: DocumentsPage;
  let detailPage: ExpedientDetailPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    searchPage = new SearchPage(page);
    documentsPage = new DocumentsPage(page);
    detailPage = new ExpedientDetailPage(page);

    // Login como SECRETARIO
    await loginPage.navigate();
    await loginPage.login(TEST_USERS.secretario.username, TEST_USERS.secretario.password);

    // Manejar cambio de password
    try {
      const isChangePasswordModalVisible = await loginPage.isChangePasswordModalVisible();
      if (isChangePasswordModalVisible) {
        await loginPage.fillNewPassword('QAPasswordSecre123!');
        await loginPage.fillConfirmPassword('QAPasswordSecre123!');
        await loginPage.clickConfirmChangePassword();
      }
    } catch (e) {
      // No hay modal
    }

    // Navegar a expediente
    await searchPage.navigate();
    await searchPage.searchQuick(TEST_DATA.expedientes[0].numero);
    await searchPage.clickExpedient(0);

    // Ir a tab documentos
    await detailPage.clickDocumentsTab();
  });

  test('F3.1: Cargar Documento', async ({ page, context }) => {
    // Arrange: Crear un PDF dummy
    const testFile = path.join(__dirname, '../fixtures/test-document.pdf');
    if (!fs.existsSync(testFile)) {
      // Crear un archivo de prueba simple (en QA real, usar un PDF válido)
      fs.mkdirSync(path.dirname(testFile), { recursive: true });
      fs.writeFileSync(testFile, 'PDF dummy content');
    }

    const initialCount = await documentsPage.getDocumentCount();

    // Act
    await documentsPage.uploadDocument(testFile, 'Demanda');

    // Assert
    await page.waitForTimeout(2000); // Esperar que se registre
    const finalCount = await documentsPage.getDocumentCount();
    expect(finalCount).toBe(initialCount + 1);

    // Validar que aparece en la tabla
    const docRow = await documentsPage.getDocumentRow('test-document.pdf').catch(() => null);
    expect(docRow).toBeTruthy();

    // NOTA: Validar auditoría DOCUMENTO_CARGADO via API
    // const response = await context.request.get('/api/v1/admin/auditoria?accion=DOCUMENTO_CARGADO');
    // expect(response.ok()).toBe(true);
  });

  test('F3.2: Visualizar Documento (PDF Viewer)', async ({ page }) => {
    // Act: Click en primer documento
    await documentsPage.clickViewDocument(0);

    // Assert: PDF viewer debe cargar en < 2s
    const isPdfViewerVisible = await documentsPage.isPdfViewerVisible();
    expect(isPdfViewerVisible).toBe(true);

    // NOTA: Validar auditoría DOCUMENTO_VISUALIZADO
  });

  test('F3.3: Descargar Documento', async ({ page }) => {
    // Act
    const filename = await documentsPage.clickDownloadDocument(0);

    // Assert
    expect(filename).toBeTruthy();
    expect(filename).toMatch(/\.(pdf|doc|docx)$/i);

    // NOTA: Validar que archivo existe y auditoría DOCUMENTO_DESCARGADO
  });

  test('F3.4: Imprimir Documento', async ({ page }) => {
    // Act
    await documentsPage.clickPrintDocument(0);

    // Assert: Print dialog debe aparecer
    const isPrintDialogVisible = await documentsPage.isPrintDialogVisible();
    expect(isPrintDialogVisible).toBe(true);

    // Cerrar dialog
    await documentsPage.closePrintDialog();

    // NOTA: Validar auditoría DOCUMENTO_IMPRESO
  });

  test('F3.5: Validar Tiempos de Respuesta', async ({ page }) => {
    // Este test mide tiempos de respuesta
    const startTime = Date.now();

    await documentsPage.clickViewDocument(0);
    const isPdfViewerVisible = await documentsPage.isPdfViewerVisible();

    const elapsedTime = Date.now() - startTime;

    expect(isPdfViewerVisible).toBe(true);
    expect(elapsedTime).toBeLessThan(3000); // < 3s
  });
});
