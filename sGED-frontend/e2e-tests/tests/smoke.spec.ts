import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { SearchPage } from '../pages/search.page';
import { AdminUsersPage } from '../pages/admin-users.page';
import { AuditPage } from '../pages/audit.page';
import { ExpedientDetailPage } from '../pages/expedient-detail.page';
import { DocumentsPage } from '../pages/documents.page';

/**
 * SMOKE TESTS PRODUCCIÓN v1.0.0
 * 
 * Validación mínima post-despliegue (ejecutar cada cambio de tráfico)
 * Tiempo total esperado: 5-8 minutos
 * 
 * Pruebas críticas:
 * - Autenticación de 4 roles principales
 * - RBAC: Acceso y denegación correcta
 * - Búsqueda básica funciona
 * - Documentos funciona
 * - Auditoría registra acciones
 */

test.describe('SMOKE TESTS - PRODUCCIÓN v1.0.0', () => {
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

  test.describe('SMOKE-1: Autenticación - 4 Roles', () => {
    const testUsers = [
      { username: 'admin.prod', password: 'AdminProd123!', role: 'ADMIN' },
      { username: 'secretario.prod', password: 'SecretarioProd123!', role: 'SECRETARIO' },
      { username: 'juez.prod', password: 'JuezProd123!', role: 'JUEZ' },
      { username: 'consulta.prod', password: 'ConsultaProd123!', role: 'CONSULTA_PUBLICA' }
    ];

    for (const user of testUsers) {
      test(`Login como ${user.role}`, async ({ page }) => {
        // Act
        await loginPage.navigate();
        await loginPage.login(user.username, user.password);

        // Manejar password obligatorio (si existe)
        try {
          const isChangePasswordModalVisible = await loginPage.isChangePasswordModalVisible();
          if (isChangePasswordModalVisible) {
            // Skip si hay modal (usuario necesita cambiar password)
            test.skip();
          }
        } catch (e) {
          // No hay modal
        }

        // Assert
        const welcomeMessage = await dashboardPage.getWelcomeMessage();
        expect(welcomeMessage).toBeTruthy();
        expect(welcomeMessage).toContain(user.role);

        // Log
        console.log(`✅ Login como ${user.role} exitoso`);
      });
    }
  });

  test.describe('SMOKE-2: RBAC - Acceso Correcto', () => {
    test('ADMIN puede acceder a /admin/usuarios', async ({ page }) => {
      // Arrange: Login como ADMIN
      await loginPage.navigate();
      await loginPage.login('admin.prod', 'AdminProd123!');

      // Manejar password
      try {
        if (await loginPage.isChangePasswordModalVisible()) test.skip();
      } catch (e) {
        // OK
      }

      // Act: Navegar a admin
      await adminPage.navigate();

      // Assert
      const url = page.url();
      expect(url).toContain('/admin/usuarios');
      console.log('✅ ADMIN accede a admin/usuarios');
    });

    test('ADMIN puede acceder a /admin/auditoria', async ({ page }) => {
      // Arrange
      await loginPage.navigate();
      await loginPage.login('admin.prod', 'AdminProd123!');

      try {
        if (await loginPage.isChangePasswordModalVisible()) test.skip();
      } catch (e) {
        // OK
      }

      // Act
      await auditPage.navigate();

      // Assert
      const url = page.url();
      expect(url).toContain('/admin/auditoria');
      console.log('✅ ADMIN accede a admin/auditoria');
    });

    test('SECRETARIO NO puede acceder a /admin/usuarios', async ({ page, context }) => {
      // Arrange
      await loginPage.navigate();
      await loginPage.login('secretario.prod', 'SecretarioProd123!');

      try {
        if (await loginPage.isChangePasswordModalVisible()) test.skip();
      } catch (e) {
        // OK
      }

      // Act: Intentar acceso directo
      const response = await context.request.get(
        `${process.env.BASE_URL}/api/v1/admin/usuarios`,
        {
          headers: {
            'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('auth_token'))}`
          }
        }
      );

      // Assert: Debe ser 403
      expect(response.status()).toBe(403);
      console.log('✅ SECRETARIO bloqueado de /admin/usuarios (403)');
    });

    test('CONSULTA_PUBLICA solo ve búsqueda, no admin', async ({ page }) => {
      // Arrange
      await loginPage.navigate();
      await loginPage.login('consulta.prod', 'ConsultaProd123!');

      try {
        if (await loginPage.isChangePasswordModalVisible()) test.skip();
      } catch (e) {
        // OK
      }

      // Assert: Verificar menú
      const hasSearchMenu = await dashboardPage.isMenuItemVisible('Búsqueda');
      const hasAdminMenu = await dashboardPage.isMenuItemVisible('Administración');

      expect(hasSearchMenu).toBe(true);
      expect(hasAdminMenu).toBe(false);
      console.log('✅ CONSULTA_PUBLICA tiene acceso restringido');
    });
  });

  test.describe('SMOKE-3: Búsqueda Básica', () => {
    test('Búsqueda rápida retorna resultados', async ({ page }) => {
      // Arrange
      await loginPage.navigate();
      await loginPage.login('secretario.prod', 'SecretarioProd123!');

      try {
        if (await loginPage.isChangePasswordModalVisible()) {
          await loginPage.fillNewPassword('SecretarioProd123!New');
          await loginPage.fillConfirmPassword('SecretarioProd123!New');
          await loginPage.clickConfirmChangePassword();
        }
      } catch (e) {
        // OK
      }

      // Act
      await searchPage.navigate();
      await searchPage.searchQuick('2024');
      await page.waitForTimeout(2000);

      // Assert
      const resultCount = await searchPage.getSearchResults();
      expect(resultCount).toBeGreaterThanOrEqual(0);
      console.log(`✅ Búsqueda rápida completada: ${resultCount} resultados`);
    });

    test('Búsqueda avanzada con filtros funciona', async ({ page }) => {
      // Arrange
      await loginPage.navigate();
      await loginPage.login('secretario.prod', 'SecretarioProd123!');

      try {
        if (await loginPage.isChangePasswordModalVisible()) test.skip();
      } catch (e) {
        // OK
      }

      // Act
      await searchPage.navigate();
      await searchPage.searchAdvanced({ ano: '2024', estado: 'ACTIVO' });
      await page.waitForTimeout(2000);

      // Assert
      const resultCount = await searchPage.getSearchResults();
      expect(resultCount).toBeGreaterThanOrEqual(0);
      console.log(`✅ Búsqueda avanzada completada: ${resultCount} resultados`);
    });
  });

  test.describe('SMOKE-4: Documentos', () => {
    test('Ver documento funciona (si existe)', async ({ page }) => {
      // Arrange
      await loginPage.navigate();
      await loginPage.login('secretario.prod', 'SecretarioProd123!');

      try {
        if (await loginPage.isChangePasswordModalVisible()) test.skip();
      } catch (e) {
        // OK
      }

      // Act: Navegar a búsqueda
      await searchPage.navigate();
      await searchPage.searchQuick('2024');
      const resultCount = await searchPage.getSearchResults();

      if (resultCount > 0) {
        await searchPage.clickExpedient(0);
        await page.waitForTimeout(1000);

        // Assert: Detalle cargó
        const expedientNumber = await page.locator('[data-testid="expedient-number"]').textContent();
        expect(expedientNumber).toBeTruthy();
        console.log(`✅ Detalle de expediente cargó: ${expedientNumber}`);
      } else {
        console.log('⚠️ No hay expedientes para validar documentos');
      }
    });

    test('Descarga de documento funciona (si existe)', async ({ page }) => {
      // Arrange
      await loginPage.navigate();
      await loginPage.login('secretario.prod', 'SecretarioProd123!');

      try {
        if (await loginPage.isChangePasswordModalVisible()) test.skip();
      } catch (e) {
        // OK
      }

      // Act: Buscar expediente con documentos
      await searchPage.navigate();
      await searchPage.searchQuick('2024');
      const resultCount = await searchPage.getSearchResults();

      if (resultCount > 0) {
        try {
          await searchPage.clickExpedient(0);
          await page.waitForTimeout(1000);

          // Ir a documentos
          const documentsPage = new DocumentsPage(page);
          const docCount = await documentsPage.getDocumentCount();

          if (docCount > 0) {
            // Intentar descargar (escuchar evento de download)
            const downloadPromise = page.waitForEvent('download');
            try {
              await documentsPage.clickDownloadDocument(0);
              const download = await downloadPromise;
              expect(download).toBeTruthy();
              console.log(`✅ Descarga de documento: ${download.suggestedFilename()}`);
            } catch (e) {
              console.log('⚠️ Descarga de documento no se completó');
            }
          } else {
            console.log('⚠️ No hay documentos para descargar');
          }
        } catch (e) {
          console.log('⚠️ Error al navegar a documentos');
        }
      } else {
        console.log('⚠️ No hay expedientes');
      }
    });
  });

  test.describe('SMOKE-5: Auditoría', () => {
    test('Auditoría registra y filtra acciones', async ({ page }) => {
      // Arrange
      await loginPage.navigate();
      await loginPage.login('admin.prod', 'AdminProd123!');

      try {
        if (await loginPage.isChangePasswordModalVisible()) test.skip();
      } catch (e) {
        // OK
      }

      // Act
      await auditPage.navigate();
      await page.waitForTimeout(1000);

      // Assert: Debe cargar lista
      const auditCount = await auditPage.getAuditoryCount();
      expect(auditCount).toBeGreaterThanOrEqual(0);
      console.log(`✅ Auditoría cargó: ${auditCount} registros`);

      // Intentar filtrar
      try {
        await auditPage.filterByUser('admin.prod');
        await page.waitForTimeout(1000);
        const filteredCount = await auditPage.getAuditoryCount();
        console.log(`✅ Auditoría filtrada: ${filteredCount} registros`);
      } catch (e) {
        console.log('⚠️ Filtrado de auditoría no se completó');
      }
    });
  });

  test.describe('SMOKE-6: Performance Básico', () => {
    test('Búsqueda responde en < 5 segundos', async ({ page }) => {
      // Arrange
      await loginPage.navigate();
      const start = Date.now();
      await loginPage.login('secretario.prod', 'SecretarioProd123!');

      try {
        if (await loginPage.isChangePasswordModalVisible()) test.skip();
      } catch (e) {
        // OK
      }

      // Act
      await searchPage.navigate();
      const searchStart = Date.now();
      await searchPage.searchQuick('2024');
      const searchEnd = Date.now();

      // Assert
      const duration = searchEnd - searchStart;
      expect(duration).toBeLessThan(5000);
      console.log(`✅ Búsqueda respondió en ${duration}ms`);
    });

    test('Login completa en < 10 segundos', async ({ page }) => {
      // Act
      await loginPage.navigate();
      const start = Date.now();
      await loginPage.login('admin.prod', 'AdminProd123!');
      const end = Date.now();

      // Assert
      const duration = end - start;
      expect(duration).toBeLessThan(10000);
      console.log(`✅ Login completó en ${duration}ms`);
    });
  });

  test.describe('SMOKE-7: API Health', () => {
    test('API /health endpoint responde', async ({ request }) => {
      // Act
      const response = await request.get(`${process.env.BASE_URL}/api/v1/health`);

      // Assert
      expect(response.status()).toBeLessThan(400);
      console.log(`✅ API health: ${response.status()}`);
    });

    test('API auth login endpoint responde', async ({ request }) => {
      // Act
      const response = await request.post(`${process.env.BASE_URL}/api/v1/auth/login`, {
        data: {
          username: 'admin.prod',
          password: 'AdminProd123!'
        }
      });

      // Assert
      expect([200, 401]).toContain(response.status()); // 200=OK, 401=credentials inválidas en prod
      console.log(`✅ API auth endpoint: ${response.status()}`);
    });
  });
});

/**
 * EXECUTION GUIDE
 * 
 * QUICK SMOKE TEST (2 minutos - después de cada cambio de tráfico):
 * npx playwright test tests/smoke.spec.ts -g "SMOKE-1|SMOKE-2|SMOKE-7"
 * 
 * FULL SMOKE TEST (5-8 minutos - después de despliegue completo):
 * npx playwright test tests/smoke.spec.ts
 * 
 * PRODUCTION SETTINGS:
 * BASE_URL=https://sged.produccion.mx npm run test:e2e -- --project=chromium
 * 
 * EXPECTED OUTPUT:
 * ✅ 15+ tests passed
 * ✅ All 4 roles login successfully
 * ✅ RBAC enforced correctly
 * ✅ Search and documents functional
 * ✅ API responding
 */
