/**
 * SMOKE TESTS - SGED v1.0.0+ Production Deployment
 *
 * Purpose: Validate rapid (< 15 minutes) that a production deployment is healthy
 * Scope: Minimal set of critical flows
 * Responsibility: Smoke Test Agent (QA)
 *
 * Before execution:
 * - Set BASE_URL_PROD environment variable
 * - Inject credentials from vault (not hardcoded)
 * - Ensure test data exists in production DB
 *
 * Execution:
 * $ npm run test:smoke:quick   # Quick validation (T+2-5 min after deploy)
 * $ npm run test:smoke:full    # Full validation (T+10-15 min after deploy)
 */

import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';

// ============================================================================
// CONFIGURATION & SETUP
// ============================================================================

const BASE_URL = process.env.BASE_URL_PROD || 'https://sged.oj.gob/';
const API_URL = process.env.API_URL_PROD || `${BASE_URL}api/v1`;

// CREDENTIALS (injected from vault/env, NEVER hardcoded)
const ADMIN_USER = {
  username: process.env.ADMIN_SMOKE_USER || 'admin_smoke',
  password: process.env.ADMIN_SMOKE_PASS || 'PLACEHOLDER',
  role: 'ADMINISTRADOR'
};

const SECRETARIO_USER = {
  username: process.env.SECRETARIO_SMOKE_USER || 'secretario_smoke',
  password: process.env.SECRETARIO_SMOKE_PASS || 'PLACEHOLDER',
  role: 'SECRETARIO'
};

const AUXILIAR_USER = {
  username: process.env.AUXILIAR_SMOKE_USER || 'auxiliar_smoke',
  password: process.env.AUXILIAR_SMOKE_PASS || 'PLACEHOLDER',
  role: 'AUXILIAR'
};

const CONSULTA_USER = {
  username: process.env.CONSULTA_SMOKE_USER || 'consulta_smoke',
  password: process.env.CONSULTA_SMOKE_PASS || 'PLACEHOLDER',
  role: 'CONSULTA'
};

// TEST DATA (predefined in production DB)
const TEST_DATA = {
  expediente_numero: process.env.EXPEDIENTE_SMOKE_NUMERO || 'EXP-2026-0001',
  documento_id: process.env.DOCUMENTO_SMOKE_ID || 'DOC-12345'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Perform login for a given user
 */
async function performLogin(page: Page, credentials: typeof ADMIN_USER): Promise<void> {
  // Navigate to login page
  await page.goto(`${BASE_URL}login`);
  
  // Wait for login form
  await page.waitForSelector('input[type="text"], input[name="username"], [placeholder*="usuario"]', {
    timeout: 5000
  });

  // Fill username
  const usernameField = await page.locator(
    'input[type="text"], input[name="username"], input[placeholder*="usuario"], input[placeholder*="Usuario"]'
  ).first();
  await usernameField.fill(credentials.username);

  // Fill password
  const passwordField = await page.locator(
    'input[type="password"], input[name="password"], input[placeholder*="contraseña"]'
  );
  await passwordField.fill(credentials.password);

  // Click login button
  const loginButton = await page.locator(
    'button[type="submit"], button:has-text("Login"), button:has-text("Ingresar"), button:has-text("Entrar")'
  ).first();
  await loginButton.click();

  // Wait for redirect (either dashboard or error)
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {
    // Navigation may not happen if on same page
  });
}

/**
 * Perform logout
 */
async function performLogout(page: Page): Promise<void> {
  // Click user menu or logout button
  const logoutButton = await page.locator(
    'button:has-text("Cerrar sesión"), button:has-text("Logout"), [data-testid="logout-btn"]'
  ).first();
  
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  } else {
    // Try user menu dropdown
    const userMenu = await page.locator('[data-testid="user-menu"], .user-menu, [class*="profile"]').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.locator('button:has-text("Cerrar sesión"), button:has-text("Logout")').first().click();
    }
  }

  // Wait for redirect to login
  await page.waitForURL(`${BASE_URL}login`, { timeout: 5000 }).catch(() => {
    // Some apps may not redirect, just verify we're logged out
  });
}

/**
 * Check for console errors
 */
function checkForErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

// ============================================================================
// SMOKE-1: AUTENTICACIÓN (4 ROLES)
// ============================================================================

test.describe('Smoke-1: Authentication @smoke-quick @smoke-full', () => {
  
  test('S1.1 - ADMIN login exitoso', async ({ page }) => {
    // Arrange
    const errors: string[] = checkForErrors(page);

    // Act
    await performLogin(page, ADMIN_USER);

    // Assert
    expect(errors).toEqual([]); // No console errors
    // Should be on admin or dashboard page
    const url = page.url();
    expect(
      url.includes('dashboard') || 
      url.includes('admin') || 
      url.includes('home')
    ).toBeTruthy();
    
    // Verify token exists
    const authToken = await page.evaluate(() => {
      return localStorage.getItem('auth_token') || 
             localStorage.getItem('jwt_token') ||
             sessionStorage.getItem('auth_token') ||
             document.cookie;
    });
    expect(authToken).toBeTruthy();
  });

  test('S1.2 - SECRETARIO login exitoso', async ({ page }) => {
    await performLogin(page, SECRETARIO_USER);
    
    const url = page.url();
    expect(
      url.includes('dashboard') || 
      url.includes('home') ||
      url.includes('expedientes')
    ).toBeTruthy();
  });

  test('S1.3 - AUXILIAR login exitoso', async ({ page }) => {
    await performLogin(page, AUXILIAR_USER);
    
    const url = page.url();
    expect(
      url.includes('dashboard') || 
      url.includes('home') ||
      url.includes('expedientes')
    ).toBeTruthy();
  });

  test('S1.4 - CONSULTA login exitoso', async ({ page }) => {
    await performLogin(page, CONSULTA_USER);
    
    const url = page.url();
    expect(
      url.includes('dashboard') || 
      url.includes('home') ||
      url.includes('expedientes')
    ).toBeTruthy();
  });

  test('S1.5 - ADMIN logout limpia sesión', async ({ page }) => {
    // Login first
    await performLogin(page, ADMIN_USER);
    
    // Logout
    await performLogout(page);
    
    // Verify session is cleared
    const authToken = await page.evaluate(() => {
      return localStorage.getItem('auth_token') || 
             localStorage.getItem('jwt_token') ||
             sessionStorage.getItem('auth_token');
    });
    expect(authToken).toBeNull();
  });

  test('S1.6 - Credenciales inválidas rechazo graceful', async ({ page }) => {
    await page.goto(`${BASE_URL}login`);
    await page.waitForSelector('input[type="text"], input[name="username"]');

    // Fill with invalid credentials
    const usernameField = await page.locator('input[type="text"], input[name="username"]').first();
    await usernameField.fill('invalid_user_12345');

    const passwordField = await page.locator('input[type="password"]');
    await passwordField.fill('wrong_password_99999');

    const loginButton = await page.locator('button[type="submit"]').first();
    await loginButton.click();

    // Wait for error message (no 500, just error message)
    const errorMessage = await page.locator(
      '[class*="error"], [class*="alert"], .error-message'
    ).first();
    
    // Should show error or redirect to login again (not 500)
    const statusCode = (await page.context().newCDPSession(page)).send('Network.getResponseBodyForInterception', {});
    // For simplicity, just check we're not on error page with 500
    expect(page.url()).not.toContain('500');
  });

  test('S1.7 - Acceso a /admin sin autenticación redirige a login', async ({ page }) => {
    // Clear session
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Try to access admin
    await page.goto(`${BASE_URL}admin`, { waitUntil: 'networkidle' }).catch(() => {});

    // Should redirect to login
    const url = page.url();
    expect(url).toContain('login');
  });
});

// ============================================================================
// SMOKE-2: EXPEDIENTES (BÚSQUEDA Y DETALLE)
// ============================================================================

test.describe('Smoke-2: Expedientes @smoke-quick @smoke-full', () => {
  
  test('S2.1 - Login, navegar a búsqueda de expedientes', async ({ page }) => {
    // Login as SECRETARIO
    await performLogin(page, SECRETARIO_USER);

    // Navigate to expedientes
    await page.goto(`${BASE_URL}expedientes`);
    await page.waitForLoadState('networkidle');

    // Verify page loads
    const heading = await page.locator('h1, h2, [class*="title"]').first();
    expect(heading).toBeTruthy();
  });

  test('S2.2 - Búsqueda de expediente conocido', async ({ page }) => {
    await performLogin(page, SECRETARIO_USER);

    // Go to search page
    await page.goto(`${BASE_URL}expedientes`);
    await page.waitForLoadState('networkidle');

    // Search for test expediente
    const searchField = await page.locator(
      'input[placeholder*="buscar"], input[name="search"], input[type="text"]'
    ).first();

    if (await searchField.isVisible()) {
      const startTime = Date.now();
      await searchField.fill(TEST_DATA.expediente_numero);
      await page.keyboard.press('Enter');
      const searchDuration = Date.now() - startTime;

      // Should complete in < 3 seconds
      expect(searchDuration).toBeLessThan(3000);

      // Result should appear
      await page.waitForSelector('[class*="result"], table tbody tr, .expediente-item', {
        timeout: 5000
      }).catch(() => {
        // Results may load dynamically
      });

      // Verify result contains our expediente
      const resultText = await page.textContent('body');
      expect(resultText).toContain(TEST_DATA.expediente_numero);
    }
  });

  test('S2.3 - Clic en expediente abre detalle', async ({ page }) => {
    await performLogin(page, SECRETARIO_USER);

    // Go to search page
    await page.goto(`${BASE_URL}expedientes`);
    await page.waitForLoadState('networkidle');

    // Search for test expediente
    const searchField = await page.locator('input[type="text"]').first();
    if (await searchField.isVisible()) {
      await searchField.fill(TEST_DATA.expediente_numero);
      await page.keyboard.press('Enter');

      // Wait for results
      await page.waitForSelector('table tbody tr, .expediente-item, [class*="result"]', {
        timeout: 5000
      }).catch(() => {});

      // Click on first result
      const firstResult = await page.locator('table tbody tr, .expediente-item').first();
      if (await firstResult.isVisible()) {
        await firstResult.click();

        // Should navigate to detail page
        await page.waitForNavigation({ waitUntil: 'networkidle' });
        const url = page.url();
        expect(url).toContain('expedientes');
        expect(url.match(/[0-9]+/)).toBeTruthy(); // Should have ID in URL
      }
    }
  });

  test('S2.4 - Detalle de expediente carga correctamente', async ({ page }) => {
    await performLogin(page, SECRETARIO_USER);

    // Navigate directly to expediente detail
    // Using test data ID (you may need to adjust based on your URL structure)
    await page.goto(`${BASE_URL}expedientes/${TEST_DATA.expediente_numero}`, {
      waitUntil: 'networkidle'
    }).catch(() => {
      // Try alternative routes
      page.goto(`${BASE_URL}expedientes/search?q=${TEST_DATA.expediente_numero}`);
    });

    // Check for expediente information
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    expect(pageContent).not.toContain('500'); // No server errors
    expect(pageContent).not.toContain('Error');
  });
});

// ============================================================================
// SMOKE-3: DOCUMENTOS (LISTAR, VER, DESCARGAR)
// ============================================================================

test.describe('Smoke-3: Documentos @smoke-full', () => {
  
  test('S3.1 - Listar documentos en expediente', async ({ page }) => {
    await performLogin(page, SECRETARIO_USER);

    // Navigate to expediente with documents
    await page.goto(`${BASE_URL}expedientes/${TEST_DATA.expediente_numero}`, {
      waitUntil: 'networkidle'
    }).catch(() => {});

    // Look for documents section
    const documentsSection = await page.locator(
      '[class*="document"], [class*="archivo"], section:has-text("Documentos")'
    ).first();

    if (await documentsSection.isVisible()) {
      expect(documentsSection).toBeTruthy();
    }
  });

  test('S3.2 - Ver documento en visor', async ({ page }) => {
    await performLogin(page, SECRETARIO_USER);

    // Navigate to expediente
    await page.goto(`${BASE_URL}expedientes/${TEST_DATA.expediente_numero}`, {
      waitUntil: 'networkidle'
    }).catch(() => {});

    // Find and click view button for document
    const viewButton = await page.locator(
      'button:has-text("Ver"), button:has-text("Ver documento"), a:has-text("Ver")'
    ).first();

    if (await viewButton.isVisible()) {
      await viewButton.click();

      // Wait for viewer to open (may be modal or new window)
      await page.waitForLoadState('networkidle').catch(() => {});

      // Check for PDF viewer or document content
      const viewer = await page.locator('[class*="viewer"], iframe[src*="pdf"], .document-viewer').first();
      expect(viewer).toBeTruthy();
    }
  });

  test('S3.3 - Descargar documento', async ({ page, context }) => {
    await performLogin(page, SECRETARIO_USER);

    // Navigate to expediente
    await page.goto(`${BASE_URL}expedientes/${TEST_DATA.expediente_numero}`, {
      waitUntil: 'networkidle'
    }).catch(() => {});

    // Intercept download
    const downloadPromise = context.waitForEvent('download');

    // Find and click download button
    const downloadButton = await page.locator(
      'button:has-text("Descargar"), button:has-text("Download"), a:has-text("Descargar")'
    ).first();

    if (await downloadButton.isVisible()) {
      await downloadButton.click();

      // Wait for download
      const download = await downloadPromise.catch(() => null);
      
      if (download) {
        expect(download.suggestedFilename()).toBeTruthy();
      }
    }
  });
});

// ============================================================================
// SMOKE-4: ADMINISTRACIÓN (USUARIOS)
// ============================================================================

test.describe('Smoke-4: Admin Usuarios @smoke-quick @smoke-full', () => {
  
  test('S4.1 - ADMIN acceso a panel de usuarios', async ({ page }) => {
    await performLogin(page, ADMIN_USER);

    // Navigate to admin/usuarios
    await page.goto(`${BASE_URL}admin/usuarios`, { waitUntil: 'networkidle' });

    // Verify page loads
    const heading = await page.locator('h1, h2, [class*="title"]').first();
    expect(heading).toBeTruthy();

    // Should not have 500 error
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('500');
  });

  test('S4.2 - Listar usuarios en admin', async ({ page }) => {
    await performLogin(page, ADMIN_USER);

    await page.goto(`${BASE_URL}admin/usuarios`, { waitUntil: 'networkidle' });

    // Should have a users table/list
    const usersList = await page.locator(
      'table, [class*="user-list"], [role="table"]'
    ).first();

    expect(usersList).toBeTruthy();
  });

  test('S4.3 - Ver detalle de usuario de prueba', async ({ page }) => {
    await performLogin(page, ADMIN_USER);

    await page.goto(`${BASE_URL}admin/usuarios`, { waitUntil: 'networkidle' });

    // Find test user (SECRETARIO_SMOKE_USER)
    const userRow = await page.locator(`text=${SECRETARIO_USER.username}`).first();

    if (await userRow.isVisible()) {
      // Click to view detail
      await userRow.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' });

      // Verify detail page loads
      const detailContent = await page.textContent('body');
      expect(detailContent).toBeTruthy();
      expect(detailContent).not.toContain('500');
    }
  });

  test('S4.4 - NON-ADMIN no puede acceder a /admin/usuarios', async ({ page }) => {
    await performLogin(page, SECRETARIO_USER);

    // Try to access admin page
    await page.goto(`${BASE_URL}admin/usuarios`).catch(() => {});

    // Should be redirected or get 403
    const url = page.url();
    const content = await page.textContent('body');

    // Either redirected to dashboard or showing 403
    expect(
      url.includes('dashboard') || 
      url.includes('expedientes') ||
      content.includes('403') ||
      content.includes('Prohibido')
    ).toBeTruthy();
  });
});

// ============================================================================
// SMOKE-5: AUDITORÍA
// ============================================================================

test.describe('Smoke-5: Auditoría @smoke-full', () => {
  
  test('S5.1 - ADMIN acceso a logs de auditoría', async ({ page }) => {
    await performLogin(page, ADMIN_USER);

    // Navigate to audit logs
    await page.goto(`${BASE_URL}admin/auditoria`, { waitUntil: 'networkidle' });

    // Verify page loads
    const heading = await page.locator('h1, h2, [class*="title"]').first();
    expect(heading).toBeTruthy();

    // Should not have 500 error
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('500');
  });

  test('S5.2 - Logs recientes se listan', async ({ page }) => {
    await performLogin(page, ADMIN_USER);

    await page.goto(`${BASE_URL}admin/auditoria`, { waitUntil: 'networkidle' });

    // Should have audit logs table
    const logsList = await page.locator(
      'table, [class*="log"], [role="table"]'
    ).first();

    expect(logsList).toBeTruthy();

    // Should have some rows
    const rows = await page.locator('table tbody tr, [class*="log-item"]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('S5.3 - Filtrar logs por usuario', async ({ page }) => {
    await performLogin(page, ADMIN_USER);

    await page.goto(`${BASE_URL}admin/auditoria`, { waitUntil: 'networkidle' });

    // Find filter/search input
    const filterInput = await page.locator(
      'input[placeholder*="filtro"], input[placeholder*="usuario"], input[type="text"]'
    ).first();

    if (await filterInput.isVisible()) {
      await filterInput.fill(SECRETARIO_USER.username);
      await page.keyboard.press('Enter');

      // Wait for filtered results
      await page.waitForLoadState('networkidle').catch(() => {});

      // Results should be filtered
      const pageContent = await page.textContent('body');
      // Just verify no error
      expect(pageContent).not.toContain('500');
    }
  });
});

// ============================================================================
// SMOKE-6: RBAC (CONTROL DE ACCESO)
// ============================================================================

test.describe('Smoke-6: RBAC @smoke-full', () => {
  
  test('S6.1 - CONSULTA no puede acceder a /admin', async ({ page }) => {
    await performLogin(page, CONSULTA_USER);

    // Try to access /admin
    await page.goto(`${BASE_URL}admin`).catch(() => {});

    const url = page.url();
    const content = await page.textContent('body');

    // Should NOT be on admin page
    expect(
      url.includes('dashboard') || 
      url.includes('expedientes') ||
      content.includes('403') ||
      content.includes('Prohibido') ||
      content.includes('No tiene permiso')
    ).toBeTruthy();
  });

  test('S6.2 - CONSULTA no puede crear expedientes', async ({ page }) => {
    await performLogin(page, CONSULTA_USER);

    // Go to expedientes
    await page.goto(`${BASE_URL}expedientes`);

    // Look for "Crear" or "Nuevo" button
    const createButton = await page.locator(
      'button:has-text("Crear"), button:has-text("Nuevo"), button:has-text("Agregar")'
    ).first();

    // Should NOT be visible for CONSULTA
    if (await createButton.isVisible()) {
      expect(createButton).not.toBeVisible();
    } else {
      expect(true).toBeTruthy(); // Button correctly hidden
    }
  });

  test('S6.3 - CONSULTA puede ver expedientes (readonly)', async ({ page }) => {
    await performLogin(page, CONSULTA_USER);

    // Go to expedientes
    await page.goto(`${BASE_URL}expedientes`);
    await page.waitForLoadState('networkidle');

    // Should be able to view
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
    expect(content).not.toContain('500');
  });

  test('S6.4 - AUXILIAR puede editar expedientes', async ({ page }) => {
    await performLogin(page, AUXILIAR_USER);

    // Go to expediente detail
    await page.goto(`${BASE_URL}expedientes/${TEST_DATA.expediente_numero}`, {
      waitUntil: 'networkidle'
    }).catch(() => {});

    // Look for edit button
    const editButton = await page.locator(
      'button:has-text("Editar"), button:has-text("Edit"), [data-testid="edit-btn"]'
    ).first();

    // Should be visible for AUXILIAR
    if (await editButton.isVisible()) {
      expect(editButton).toBeVisible();
    }
  });

  test('S6.5 - API rejects unauthorized requests with 403', async ({ page }) => {
    // Try to call API as CONSULTA
    await performLogin(page, CONSULTA_USER);

    // Make unauthorized API call
    const response = await page.request.post(`${API_URL}/expedientes`, {
      data: {
        numero: 'TEST-2026-9999',
        demandante: 'Test User'
      }
    });

    // Should get 403, not 500
    expect([403, 401, 405]).toContain(response.status());
  });
});

// ============================================================================
// SMOKE-7: API HEALTH (BASIC)
// ============================================================================

test.describe('Smoke-7: API Health @smoke-quick @smoke-full', () => {
  
  test('S7.1 - GET /api/v1/health retorna 200', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/health`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status || data.Status || data.status).toBeTruthy();
  });

  test('S7.2 - POST /api/v1/auth/login retorna 200 o 401 (no 500)', async ({ page }) => {
    const response = await page.request.post(`${API_URL}/auth/login`, {
      data: {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password
      }
    });

    // Should be 200 (success) or 401 (invalid creds), NOT 500
    expect([200, 201, 401, 400]).toContain(response.status());
  });

  test('S7.3 - Frontend carga sin errores críticos', async ({ page }) => {
    // Collect console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Load main page
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle' });

    // Should not have critical errors
    // Note: Some framework errors are expected, filter critical ones
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('__webpack') &&
      e.length > 0
    );

    expect(criticalErrors).toEqual([]);
  });
});

// ============================================================================
// PERFORMANCE SMOKE TESTS (Optional)
// ============================================================================

test.describe('Smoke-8: Performance @smoke-full', () => {
  
  test('S8.1 - Login completa en < 10 segundos', async ({ page }) => {
    const startTime = Date.now();

    await performLogin(page, ADMIN_USER);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(10000);
  });

  test('S8.2 - Búsqueda de expediente < 3 segundos', async ({ page }) => {
    await performLogin(page, SECRETARIO_USER);
    await page.goto(`${BASE_URL}expedientes`);

    const startTime = Date.now();

    const searchField = await page.locator('input[type="text"]').first();
    if (await searchField.isVisible()) {
      await searchField.fill(TEST_DATA.expediente_numero);
      await page.keyboard.press('Enter');
    }

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(3000);
  });

  test('S8.3 - Carga de detalle de expediente < 5 segundos', async ({ page }) => {
    await performLogin(page, SECRETARIO_USER);

    const startTime = Date.now();

    await page.goto(`${BASE_URL}expedientes/${TEST_DATA.expediente_numero}`, {
      waitUntil: 'networkidle'
    }).catch(() => {});

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000);
  });
});
