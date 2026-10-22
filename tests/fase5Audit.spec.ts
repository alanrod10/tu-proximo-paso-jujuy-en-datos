import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Fase 5: Auditoría Final de Integridad Estadística, Accesibilidad y Rendimiento', () => {
  test('Audit 1: Zero runtime console errors or page errors across all application routes', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    const routes = [
      '/#inicio',
      '/#areas',
      '/#comparador',
      '/#transversal',
      '/#metodologia',
      '/#detalle/A01',
      '/#detalle/A02',
      '/#detalle/A06',
      '/#detalle/A10',
      '/#asistente',
    ];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
    }

    expect(consoleErrors, `Console errors detected: ${consoleErrors.join(', ')}`).toHaveLength(0);
    expect(pageErrors, `Page errors detected: ${pageErrors.join(', ')}`).toHaveLength(0);
  });

  test('Audit 2: Complete keyboard navigation, visible focus indicators, and skip-link functionality', async ({ page }) => {
    await page.goto('/#inicio');
    await page.waitForLoadState('networkidle');

    // 1. Probar el enlace de salto accesible (Skip to Content)
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();

    // Activar skip link con Enter
    await page.keyboard.press('Enter');
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();

    // 2. Navegar al buscador por teclado usando el atajo '/'
    await page.keyboard.press('/');
    const searchInput = page.locator('input[aria-label="Buscar actividades, oficios o productos en Jujuy"]').first();
    await expect(searchInput).toBeFocused();

    // 3. Escribir término con teclado y navegar resultados con flechas
    await page.keyboard.type('turismo');
    await page.waitForTimeout(300);

    const firstResult = page.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible();

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Debe haber navegado al detalle de A07 (Turismo)
    await expect(page).toHaveURL(/.*#detalle\/A07/i);
    await expect(page.getByText('Turismo y gastronomía').first()).toBeVisible();
  });

  test('Audit 3: Statistical integrity cross-check across all modules', async ({ page }) => {
    // 1. Verificar PBG en Inicio: constatar presencia de precios constantes 2004 y advertencia provisoria
    await page.goto('/#inicio');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/PBG 2024\*/i).first()).toBeVisible();
    await expect(page.getByText(/precios constantes de 2004/i).first()).toBeVisible();

    // 2. Verificar Tratamiento de A10 en Detalle: OEDE no disponible, sin ceros imputados
    await page.goto('/#detalle/A10');
    await page.waitForLoadState('networkidle');

    const oedeTab = page.getByRole('button', { name: /👥 Empleo Registrado \(OEDE\)/i });
    await oedeTab.click();
    await expect(page.getByText(/no forma parte de la serie OEDE de empleo privado/i)).toBeVisible();
    await expect(page.getByText(/no se imputa valor cero/i)).toBeVisible();

    // 3. Verificar Exclusión de Primarias en EIL (A01 Agro)
    await page.goto('/#detalle/A01');
    await page.waitForLoadState('networkidle');

    const eilTab = page.getByRole('button', { name: /🧩 Dinámica Laboral \(EIL\)/i });
    await eilTab.click();
    await expect(page.getByText(/excluye.*actividades del sector primario/i)).toBeVisible();

    // 4. Verificar Agrupación Indivisible en EIL (A06 Comercio)
    await page.goto('/#detalle/A06');
    await page.waitForLoadState('networkidle');
    const eilTabA06 = page.getByRole('button', { name: /🧩 Dinámica Laboral \(EIL\)/i });
    await eilTabA06.click();
    await expect(page.getByText(/Agrupación indivisible oficial/i)).toBeVisible();

    // 5. Verificar Base 2015 en MIP
    const mipTab = page.getByRole('button', { name: /🔗 Conexiones \(MIP 2015\)/i });
    await mipTab.click();
    await expect(page.getByText(/Matriz Insumo-Producto.*Base 2015/i).first()).toBeVisible();
    await expect(page.getByText(/No deben interpretarse como cantidad actual de puestos de trabajo/i)).toBeVisible();
  });

  test('Audit 4: Generate complete visual snapshot gallery for final project closure report', async ({ page }) => {
    const artifactDir = '/home/alanrod10/.gemini/antigravity-cli/brain/cc802746-dfc9-4808-9b48-64cac8121cc9';

    // 1. Desktop: Portada / Home
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/#inicio');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(artifactDir, 'fase5-home-desktop.png'), fullPage: false });

    // 2. Desktop: Explorador de Áreas
    await page.goto('/#areas');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(artifactDir, 'fase5-areas-desktop.png'), fullPage: false });

    // 3. Desktop: Modo Comparador (A01 Agro vs A03 Industria)
    await page.goto('/#comparador');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(artifactDir, 'fase5-comparador-desktop.png'), fullPage: false });

    // 4. Desktop: Dinámica Laboral EIL Transversal
    await page.goto('/#transversal');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(artifactDir, 'fase5-eil-desktop.png'), fullPage: false });

    // 5. Desktop: Ficha de Área A01 Agro (con gráficos y KPIs)
    await page.goto('/#detalle/A01');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(artifactDir, 'fase5-detail-a01-desktop.png'), fullPage: false });

    // 6. Desktop: Ficha de Área A10 Administración Pública (tratamiento de no disponibilidad OEDE)
    await page.goto('/#detalle/A10');
    await page.waitForLoadState('networkidle');
    const oedeTab = page.getByRole('button', { name: /👥 Empleo Registrado \(OEDE\)/i });
    await oedeTab.click();
    await page.screenshot({ path: path.join(artifactDir, 'fase5-detail-a10-desktop.png'), fullPage: false });

    // 7. Mobile: Portada
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/#inicio');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(artifactDir, 'fase5-home-mobile.png'), fullPage: false });

    // 8. Mobile: Modo Comparador
    await page.goto('/#comparador');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(artifactDir, 'fase5-comparador-mobile.png'), fullPage: false });
  });
});
