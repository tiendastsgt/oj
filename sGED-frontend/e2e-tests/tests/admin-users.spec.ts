import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { AdminUsersPage } from '../pages/admin-users.page';
import { TEST_USERS, TEST_DATA } from '../fixtures/test-data';

test.describe('F4: Administración de Usuarios - CRUD, Bloqueo, Reset Password (HU-016, HU-017)', () => {
  let loginPage: LoginPage;
  let adminPage: AdminUsersPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    adminPage = new AdminUsersPage(page);

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

    // Navegar a admin usuarios
    await adminPage.navigate();
  });

  test('F4.1: Crear Nuevo Usuario', async ({ page, context }) => {
    // Arrange
    const newUser = TEST_DATA.nuevoUsuario;
    const initialCount = await adminPage.getUserCount();

    // Act
    await adminPage.clickNewUser();
    await adminPage.fillUserForm({
      username: newUser.username,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      email: newUser.email,
      rol: newUser.rol, // 'SECRETARIO'
      juzgado: newUser.juzgado, // 'J1'
      passwordGenerada: true // Sistema genera password temporal
    });
    await adminPage.clickCreateUser();

    // Assert
    await page.waitForTimeout(1000); // Esperar creación
    const finalCount = await adminPage.getUserCount();
    expect(finalCount).toBe(initialCount + 1);

    // Validar que usuario aparece en la tabla
    const userRow = await adminPage.findUserRow(newUser.username);
    expect(userRow).toBeTruthy();

    // NOTA: Validar auditoría USUARIO_CREADO via API
    // const response = await context.request.get(`/api/v1/admin/auditoria?accion=USUARIO_CREADO`);
    // expect(response.ok()).toBe(true);
  });

  test('F4.2: Editar Usuario', async ({ page }) => {
    // Arrange
    const usuario = TEST_DATA.nuevoUsuario;
    
    // Act
    const userRow = await adminPage.findUserRow(usuario.username);
    await adminPage.clickEditUser(userRow!);

    await adminPage.fillUserForm({
      nombre: 'NombreActualizado',
      email: 'actualizado@juzgado.mx'
    });
    await adminPage.clickSaveUser();

    // Assert
    await page.waitForTimeout(1000);
    const updatedRow = await adminPage.findUserRow(usuario.username);
    const updatedEmail = await updatedRow!.locator('data-testid=email').textContent();
    expect(updatedEmail).toContain('actualizado@juzgado.mx');

    // NOTA: Validar auditoría USUARIO_ACTUALIZADO
  });

  test('F4.3: Bloquear Usuario', async ({ page }) => {
    // Arrange
    const usuario = TEST_DATA.nuevoUsuario;
    const userRow = await adminPage.findUserRow(usuario.username);

    // Act
    await adminPage.clickBlockUser(userRow!);
    await page.locator('button:has-text("Confirmar")').click(); // Confirmar bloqueo

    // Assert
    await page.waitForTimeout(1000);
    const isBlocked = await adminPage.isUserBlocked(usuario.username);
    expect(isBlocked).toBe(true);

    // Validar que usuario NO puede loguear
    await loginPage.navigate();
    await loginPage.login(usuario.username, usuario.password);
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Usuario bloqueado');

    // NOTA: Validar auditoría USUARIO_BLOQUEADO
  });

  test('F4.4: Desbloquear Usuario', async ({ page }) => {
    // Arrange: Usuario debe estar bloqueado
    const usuario = TEST_DATA.nuevoUsuario;
    const userRow = await adminPage.findUserRow(usuario.username);
    const isBlockedBefore = await adminPage.isUserBlocked(usuario.username);
    expect(isBlockedBefore).toBe(true);

    // Act
    await adminPage.clickUnblockUser(userRow!);
    await page.locator('button:has-text("Confirmar")').click();

    // Assert
    await page.waitForTimeout(1000);
    const isBlockedAfter = await adminPage.isUserBlocked(usuario.username);
    expect(isBlockedAfter).toBe(false);

    // NOTA: Validar auditoría USUARIO_DESBLOQUEADO
  });

  test('F4.5: Reset Password de Usuario', async ({ page, context }) => {
    // Arrange
    const usuario = TEST_DATA.nuevoUsuario;
    const userRow = await adminPage.findUserRow(usuario.username);

    // Act
    await adminPage.clickResetPassword(userRow!);
    await page.locator('button:has-text("Confirmar")').click();

    // Assert
    const successMessage = await page.locator('.success-message').textContent();
    expect(successMessage).toContain('Password temporal enviado');

    // NOTA: Validar que se envió email con nueva password
    // NOTA: Validar auditoría USUARIO_PASSWORD_RESET
    // const response = await context.request.get(`/api/v1/admin/auditoria?accion=USUARIO_PASSWORD_RESET`);
    // expect(response.ok()).toBe(true);
  });

  test('F4.6: Validar RBAC - No Acceso para No-Admin', async ({ page }) => {
    // Arrange: Login como SECRETARIO
    await loginPage.navigate();
    await loginPage.login(TEST_USERS.secretario.username, TEST_USERS.secretario.password);

    // Act: Intentar acceder a admin/usuarios
    await page.goto(`${process.env.BASE_URL}/admin/usuarios`);

    // Assert: Debe redirigir a dashboard o mostrar 403
    const url = page.url();
    expect(url).not.toContain('/admin/usuarios');
  });
});
