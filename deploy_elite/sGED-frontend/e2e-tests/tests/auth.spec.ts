import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('F1: Autenticación y Cambio de Contraseña Obligatorio (HU-001)', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigate();
  });

  test('F1.1: Login + Password Change Obligatorio', async ({ page }) => {
    // Arrange & Act
    await loginPage.login(TEST_USERS.admin.username, TEST_USERS.admin.password);

    // Assert: Modal de cambio de password debe aparecer
    const isChangePasswordModalVisible = await loginPage.isChangePasswordModalVisible();
    expect(isChangePasswordModalVisible).toBe(true);

    // Cambiar contraseña
    await loginPage.fillNewPassword('QAPasswordNew123!');
    await loginPage.fillConfirmPassword('QAPasswordNew123!');
    await loginPage.clickConfirmChangePassword();

    // Assert: Dashboard debe cargar
    await expect(page).toHaveURL(/\/dashboard/);
    const isLoaded = await dashboardPage.isLoaded();
    expect(isLoaded).toBe(true);

    // Assert: No debe haber modal
    const isModalVisible = await loginPage.isChangePasswordModalVisible().catch(() => false);
    expect(isModalVisible).toBe(false);
  });

  test('F1.2: Login Invalid Password', async ({ page }) => {
    // Act
    await loginPage.login(TEST_USERS.admin.username, 'WrongPassword123!');

    // Assert: Error debe aparecer
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Usuario o contraseña incorrectos');

    // URL debe seguir en login
    await expect(page).toHaveURL(/\/login/);
  });

  test('F1.3: Logout', async ({ page }) => {
    // Arrange: Login primero (sin cambio de password para este usuario)
    const userWithoutPasswordChange = { ...TEST_USERS.juez };
    await loginPage.login(userWithoutPasswordChange.username, userWithoutPasswordChange.password);

    // Esperar dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await dashboardPage.isLoaded();

    // Act: Logout
    await dashboardPage.clickLogout();

    // Assert: Redirige a login
    await expect(page).toHaveURL(/\/login/);
    
    // Token debe ser removido
    const localStorage = await page.evaluate(() => window.localStorage.getItem('token'));
    expect(localStorage).toBeNull();
  });

  test('F1.4: Validar debeCambiarPass flag en BD (conceptual)', async ({ page, context }) => {
    // Este test validaría que después de cambiar password, debeCambiarPass=0 en BD
    // Normalmente se haría via API call o query a BD
    
    // Arrange & Act
    await loginPage.login(TEST_USERS.secretario.username, TEST_USERS.secretario.password);
    
    // Esperar modal
    const isChangePasswordModalVisible = await loginPage.isChangePasswordModalVisible();
    expect(isChangePasswordModalVisible).toBe(true);
    
    // Cambiar password
    await loginPage.fillNewPassword('QAPasswordSecretario123!');
    await loginPage.fillConfirmPassword('QAPasswordSecretario123!');
    await loginPage.clickConfirmChangePassword();
    
    // Assert: Dashboard carga
    await expect(page).toHaveURL(/\/dashboard/);
    
    // NOTA: En un test real, haríamos una API call para validar debeCambiarPass
    // GET /api/v1/usuarios/current
    // expect(response.debeCambiarPass).toBe(false);
  });
});
