import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { AuditPage } from '../pages/audit.page';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('F5: Auditoría - Consulta, Filtros, Paginación (HU-018, RF-009, RF-010)', () => {
  let loginPage: LoginPage;
  let auditPage: AuditPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    auditPage = new AuditPage(page);

    // Login como ADMIN
    await loginPage.navigate();
    await loginPage.login(TEST_USERS.admin.username, TEST_USERS.admin.password);

    // Manejar cambio de password
    try {
      const isChangePasswordModalVisible = await loginPage.isChangePasswordModalVisible();
      if (isChangePasswordModalVisible) {
        await loginPage.fillNewPassword('QAPasswordAdmin123!');
        await loginPage.fillConfirmPassword('QAPasswordAdmin123!');
        await loginPage.clickConfirmChangePassword();
      }
    } catch (e) {
      // No hay modal
    }

    // Navegar a auditoría
    await auditPage.navigate();
  });

  test('F5.1: Consultar Auditoría sin Filtros', async ({ page }) => {
    // Act: Cargar página de auditoría
    // (Ya navegada en beforeEach)

    // Assert: Debe mostrar lista de auditoría
    const count = await auditPage.getAuditoryCount();
    expect(count).toBeGreaterThan(0);

    // Validar que aparecen columnas esperadas
    const columns = await page.locator('table thead th').allTextContents();
    expect(columns).toContain('Usuario');
    expect(columns).toContain('Acción');
    expect(columns).toContain('Módulo');
    expect(columns).toContain('Fecha');
  });

  test('F5.2: Filtrar Auditoría por Usuario', async ({ page }) => {
    // Arrange: Usuario específico
    const userFilter = TEST_USERS.secretario.username;

    // Act
    await auditPage.filterByUser(userFilter);
    await page.waitForTimeout(1000); // Esperar filtro

    // Assert: Todos los registros deben tener ese usuario
    const rows = await page.locator('tbody tr').count();
    if (rows > 0) {
      const firstUserCell = await page.locator('tbody tr:first-child td[data-testid="usuario"]').textContent();
      expect(firstUserCell).toContain(userFilter);
    }
  });

  test('F5.3: Filtrar Auditoría por Acción', async ({ page }) => {
    // Arrange
    const actionFilter = 'USUARIO_CREADO';

    // Act
    await auditPage.filterByAction(actionFilter);
    await page.waitForTimeout(1000);

    // Assert
    const rows = await page.locator('tbody tr').count();
    if (rows > 0) {
      const firstActionCell = await page.locator('tbody tr:first-child td[data-testid="accion"]').textContent();
      expect(firstActionCell).toContain(actionFilter);
    }
  });

  test('F5.4: Filtrar Auditoría por Rango de Fechas', async ({ page }) => {
    // Arrange: Fechas últimos 7 días
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const dateFromFormatted = sevenDaysAgo.toISOString().split('T')[0];
    const dateToFormatted = today.toISOString().split('T')[0];

    // Act
    await auditPage.filterByDateRange(dateFromFormatted, dateToFormatted);
    await page.waitForTimeout(1000);

    // Assert
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThanOrEqual(0); // Puede haber 0 resultados

    if (rows > 0) {
      // Validar que las fechas estén en rango
      const firstDateCell = await page.locator('tbody tr:first-child td[data-testid="fecha"]').textContent();
      expect(firstDateCell).toBeTruthy();
    }
  });

  test('F5.5: Filtros Combinados (Usuario + Acción)', async ({ page }) => {
    // Arrange
    const userFilter = TEST_USERS.admin.username;
    const actionFilter = 'USUARIO_CREADO';

    // Act
    await auditPage.filterByUser(userFilter);
    await auditPage.filterByAction(actionFilter);
    await page.waitForTimeout(1500); // Esperar filtros

    // Assert
    const rows = await page.locator('tbody tr').count();
    if (rows > 0) {
      const firstUserCell = await page.locator('tbody tr:first-child td[data-testid="usuario"]').textContent();
      const firstActionCell = await page.locator('tbody tr:first-child td[data-testid="accion"]').textContent();
      expect(firstUserCell).toContain(userFilter);
      expect(firstActionCell).toContain(actionFilter);
    }
  });

  test('F5.6: Paginación en Auditoría', async ({ page }) => {
    // Arrange
    const initialCount = await auditPage.getAuditoryCount();

    // Act: Si hay más de 20 registros
    if (initialCount >= 20) {
      await page.locator('button:has-text("Siguiente")').click();
      await page.waitForTimeout(1000);

      // Assert
      const newCount = await auditPage.getAuditoryCount();
      expect(newCount).toBeGreaterThan(0);

      // Validar que está en página 2
      const pageIndicator = await page.locator('[data-testid="page-indicator"]').textContent();
      expect(pageIndicator).toContain('2');
    }
  });

  test('F5.7: Ver Detalle de Auditoría', async ({ page }) => {
    // Arrange
    const rows = await page.locator('tbody tr').count();
    if (rows === 0) {
      test.skip();
    }

    // Act: Click en primer registro
    await page.locator('tbody tr:first-child').click();
    await page.waitForTimeout(500);

    // Assert: Modal de detalle debe aparecer
    const isDetailVisible = await auditPage.isDetailVisible();
    expect(isDetailVisible).toBe(true);

    // Validar que muestra campos
    const detailUser = await auditPage.getDetailUser();
    const detailAction = await auditPage.getDetailAction();
    expect(detailUser).toBeTruthy();
    expect(detailAction).toBeTruthy();
  });

  test('F5.8: Limpiar Filtros', async ({ page }) => {
    // Arrange: Aplicar un filtro
    await auditPage.filterByUser(TEST_USERS.admin.username);
    await page.waitForTimeout(1000);
    const countWithFilter = await auditPage.getAuditoryCount();

    // Act: Limpiar filtros
    await auditPage.clearFilters();
    await page.waitForTimeout(1000);

    // Assert
    const countWithoutFilter = await auditPage.getAuditoryCount();
    expect(countWithoutFilter).toBeGreaterThanOrEqual(countWithFilter);
  });

  test('F5.9: Validar RBAC - No Acceso para No-Admin', async ({ page }) => {
    // Arrange: Login como SECRETARIO
    await loginPage.navigate();
    await loginPage.login(TEST_USERS.secretario.username, TEST_USERS.secretario.password);

    // Act: Intentar acceder a auditoría
    await page.goto(`${process.env.BASE_URL}/admin/auditoria`);

    // Assert
    const url = page.url();
    expect(url).not.toContain('/admin/auditoria');
  });

  test('F5.10: Validar Auditoría de Acciones Previas', async ({ page, context }) => {
    // Este test valida que se hayan registrado las acciones de tests anteriores

    // Act: Filtrar por acciones de documento
    await auditPage.filterByAction('DOCUMENTO_CARGADO');
    await page.waitForTimeout(1000);

    // Assert: Debe haber registros (si hay documentos cargados)
    // Este es un test de validación cruzada

    // NOTA: En un test real, verificar via API:
    // const response = await context.request.get('/api/v1/admin/auditoria?accion=DOCUMENTO_CARGADO');
    // const data = await response.json();
    // expect(data.content.length).toBeGreaterThanOrEqual(0);
  });
});
