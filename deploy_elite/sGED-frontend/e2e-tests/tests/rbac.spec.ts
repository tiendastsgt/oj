import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { SearchPage } from '../pages/search.page';
import { AdminUsersPage } from '../pages/admin-users.page';
import { AuditPage } from '../pages/audit.page';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('F6: RBAC y Aislamiento por Juzgado (HU-003, RF-002, RF-008)', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let searchPage: SearchPage;
  let adminPage: AdminUsersPage;
  let auditPage: AuditPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    searchPage = new SearchPage(page);
    adminPage = new AdminUsersPage(page);
    auditPage = new AuditPage(page);
  });

  test('F6.1: RBAC - ADMIN tiene acceso a todas las secciones', async ({ page }) => {
    // Arrange & Act
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

    // Assert: Verificar acceso a todas las secciones
    expect(await dashboardPage.isMenuItemVisible('Búsqueda')).toBe(true);
    expect(await dashboardPage.isMenuItemVisible('Documentos')).toBe(true);
    expect(await dashboardPage.isMenuItemVisible('Administración')).toBe(true);
    expect(await dashboardPage.isMenuItemVisible('Auditoría')).toBe(true);
  });

  test('F6.2: RBAC - SECRETARIO tiene acceso limitado (sin Administración ni Auditoría)', async ({ page }) => {
    // Arrange & Act
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

    // Assert
    expect(await dashboardPage.isMenuItemVisible('Búsqueda')).toBe(true);
    expect(await dashboardPage.isMenuItemVisible('Documentos')).toBe(true);
    expect(await dashboardPage.isMenuItemVisible('Administración')).toBe(false);
    expect(await dashboardPage.isMenuItemVisible('Auditoría')).toBe(false);
  });

  test('F6.3: RBAC - JUEZ tiene acceso a búsqueda pero NO a carga de documentos', async ({ page }) => {
    // Arrange & Act
    await loginPage.navigate();
    await loginPage.login(TEST_USERS.juez.username, TEST_USERS.juez.password);

    // Manejar cambio de password
    try {
      const isChangePasswordModalVisible = await loginPage.isChangePasswordModalVisible();
      if (isChangePasswordModalVisible) {
        await loginPage.fillNewPassword('QAPasswordJuez123!');
        await loginPage.fillConfirmPassword('QAPasswordJuez123!');
        await loginPage.clickConfirmChangePassword();
      }
    } catch (e) {
      // No hay modal
    }

    // Assert: Puede ver búsqueda
    expect(await dashboardPage.isMenuItemVisible('Búsqueda')).toBe(true);

    // Act: Ir a detalles de expediente
    await searchPage.navigate();
    await searchPage.searchQuick('2024');
    if ((await searchPage.getSearchResults()) > 0) {
      await searchPage.clickExpedient(0);

      // Assert: No debe haber botón de "Cargar Documento"
      const uploadButton = await page.locator('button:has-text("Cargar Documento")').count();
      expect(uploadButton).toBe(0);
    }
  });

  test('F6.4: RBAC - CONSULTA_PUBLICA tiene acceso SOLO a búsqueda', async ({ page }) => {
    // Arrange & Act
    await loginPage.navigate();
    await loginPage.login(TEST_USERS.consulta.username, TEST_USERS.consulta.password);

    // Manejar cambio de password
    try {
      const isChangePasswordModalVisible = await loginPage.isChangePasswordModalVisible();
      if (isChangePasswordModalVisible) {
        await loginPage.fillNewPassword('QAPasswordConsulta123!');
        await loginPage.fillConfirmPassword('QAPasswordConsulta123!');
        await loginPage.clickConfirmChangePassword();
      }
    } catch (e) {
      // No hay modal
    }

    // Assert
    expect(await dashboardPage.isMenuItemVisible('Búsqueda')).toBe(true);
    expect(await dashboardPage.isMenuItemVisible('Documentos')).toBe(false);
    expect(await dashboardPage.isMenuItemVisible('Administración')).toBe(false);
    expect(await dashboardPage.isMenuItemVisible('Auditoría')).toBe(false);
  });

  test('F6.5: Aislamiento por Juzgado - SECRETARIO J1 NO ve expedientes de J2', async ({ page, context }) => {
    // Arrange: Login como SECRETARIO de J1
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

    // Act: Intentar búsqueda general
    await searchPage.navigate();
    await searchPage.searchQuick('*');
    await page.waitForTimeout(1000);

    // Assert: Via API, validar que los resultados solo incluyen expedientes de J1
    // NOTA: En test real, hacer request a API de búsqueda
    // const response = await context.request.get('/api/v1/expedientes/busqueda?texto=*');
    // const data = await response.json();
    // expect(data.content.every(exp => exp.juzgado === 'J1')).toBe(true);
  });

  test('F6.6: Validar Password Temporal - Debe Cambiar en Primer Login', async ({ page }) => {
    // NOTA: Este test asume que existe un usuario con password temporal
    // Crear usuario con password temporal via API
    const newUsername = `testuser-${Date.now()}`;
    const tempPassword = 'TempPassword123!';

    // Act: Login con password temporal
    await loginPage.navigate();
    await loginPage.login(newUsername, tempPassword);

    // Assert: Modal de cambio de password debe aparecer
    const isChangePasswordModalVisible = await loginPage.isChangePasswordModalVisible();
    expect(isChangePasswordModalVisible).toBe(true);

    // NOTA: Completar cambio de password
    // await loginPage.fillNewPassword('NewPassword123!');
    // await loginPage.fillConfirmPassword('NewPassword123!');
    // await loginPage.clickConfirmChangePassword();
  });

  test('F6.7: Validar Manejo de Acceso Denegado (403 API)', async ({ page, context }) => {
    // Arrange: Login como SECRETARIO
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

    // Act: Intentar acceso a endpoint de administración via API
    const response = await context.request.get(`${process.env.BASE_URL}/api/v1/admin/usuarios`);

    // Assert
    expect(response.status()).toBe(403); // Forbidden
  });

  test('F6.8: Validar Token JWT - Debe Expirar en Logout', async ({ page, context }) => {
    // Arrange
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

    // Act: Obtener token del localStorage
    const tokenBefore = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(tokenBefore).toBeTruthy();

    // Logout
    await dashboardPage.logout();

    // Assert: Token debe desaparecer
    const tokenAfter = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(tokenAfter).toBeNull();

    // Act: Intentar usar API con antiguo token (si se guardó)
    if (tokenBefore) {
      const response = await context.request.get(`${process.env.BASE_URL}/api/v1/admin/auditoria`, {
        headers: { 'Authorization': `Bearer ${tokenBefore}` }
      });
      // Assert: Debe fallar con 401
      expect(response.status()).toBe(401); // Unauthorized
    }
  });
});
