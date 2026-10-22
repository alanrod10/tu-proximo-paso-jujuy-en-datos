import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Redesigned Area Detail Page (Fase 3)', () => {
  test('renders header KPIs, area pager, and sticky tabs on A01 (Agro)', async ({ page }) => {
    await page.goto('/#detalle/A01');

    // Header title and code
    await expect(page.locator("text=Agro y producción primaria").first()).toBeVisible();
    await expect(page.locator("text=A01 / 12").first()).toBeVisible();

    // 3 Quick KPIs in header
    await expect(page.locator('text=Aporte PBG 2024*').first()).toBeVisible();
    await expect(page.locator('text=Puestos SIPA').first()).toBeVisible();
    await expect(page.locator('text=Multiplicador MIP').first()).toBeVisible();

    // Pager navigation: click next area (A02 Minería)
    await page.getByTitle('Ir a Minería').click();
    await expect(page).toHaveURL(/.*#detalle\/A02/);
    await expect(page.locator('text=Minería').first()).toBeVisible();
  });

  test('PBG tab: interactive chart, price toggles, and metric explainer', async ({ page }) => {
    await page.goto('/#detalle/A01');

    // Click PBG tab
    await page.getByRole('button', { name: '📊 Producción (PBG)' }).click();
    await expect(page.locator("text=Evolución de la Producción de Agro y producción primaria")).toBeVisible();

    // Toggle to Precios Corrientes
    await page.getByRole('button', { name: 'Precios Corrientes' }).click();
    await expect(page.locator('text=Tendencia de PBG a Precios Corrientes')).toBeVisible();

    // Toggle range to Últimos 5 años
    await page.getByRole('button', { name: 'Últimos 5 años' }).click();

    // Metric explainer interaction
    await page.getByRole('button', { name: '¿Qué significa?' }).first().click();
    await expect(page.locator('text=El Producto Bruto Geográfico (PBG) mide el valor monetario')).toBeVisible();

    // Technical source inspection
    await page.getByRole('button', { name: 'Ver fuente oficial' }).first().click();
    await expect(page.locator('text=SERIE DE PBG DE JUJUY 2004 - 2024 provisorio.xlsx')).toBeVisible();
  });

  test('OEDE tab: respects absence of Public Administration (A10) with pedagogical notice', async ({ page }) => {
    await page.goto('/#detalle/A10');

    // Check OEDE tab on A10
    await page.getByRole('button', { name: '👥 Empleo Registrado (OEDE)' }).click();
    await expect(page.locator('text=Serie no aplicable en la fuente oficial de empleo privado')).toBeVisible();
    await expect(page.locator('text=no se imputa valor cero ni se generan estimaciones sintéticas')).toBeVisible();

    // Verify it doesn't display 0 as a valid job count
    await expect(page.locator('text=0 puestos')).toHaveCount(0);
  });

  test('EIL tab: respects primary sector exclusion and official grouping', async ({ page }) => {
    // A01 is primary sector -> excluded from urban EIL
    await page.goto('/#detalle/A01');
    await page.getByRole('button', { name: '🧩 Dinámica Laboral (EIL)' }).click();
    await expect(page.locator('text=Sector excluido del relevamiento urbano de EIL')).toBeVisible();
    await expect(page.locator('text=excluye formalmente las actividades del sector primario')).toBeVisible();

    // A06 is grouped with A07 in EIL
    await page.goto('/#detalle/A06');
    await page.getByRole('button', { name: '🧩 Dinámica Laboral (EIL)' }).click();
    await expect(page.locator('text=Agrupación indivisible oficial (A06 Comercio + A07 Turismo)')).toBeVisible();
  });

  test('MIP tab: preserves 2015 base year and direct vs indirect breakdown', async ({ page }) => {
    await page.goto('/#detalle/A03');

    // Click MIP tab
    await page.getByRole('button', { name: '🔗 Conexiones (MIP 2015)' }).click();
    await expect(page.locator('text=Advertencia metodológica sobre año base 2015')).toBeVisible();
    await expect(page.locator('text=Empleo Directo en la rama')).toBeVisible();
    await expect(page.locator('text=Empleo Indirecto inducido en proveedores')).toBeVisible();
  });

  test('trazabilidad tab: displays official classifications table', async ({ page }) => {
    await page.goto('/#detalle/A02');

    await page.getByRole('button', { name: '📋 Trazabilidad' }).click();
    await expect(page.locator('text=Trazabilidad Oficial de Nomencladores')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Fuente', exact: true })).toBeVisible();
    await expect(page.locator('th:has-text("Código")')).toBeVisible();
    await expect(page.locator('th:has-text("Denominación Oficial en la Fuente")')).toBeVisible();
  });

  test('captures responsive visual snapshots of Fase 3 area detail', async ({ page }, testInfo) => {
    const saveSnapshot = async (filename: string) => {
      const targetPath = process.env.SCREENSHOT_DIR
        ? path.join(process.env.SCREENSHOT_DIR, filename)
        : testInfo.outputPath(filename);
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      await page.screenshot({ path: targetPath, fullPage: false });
      await testInfo.attach(filename, { path: targetPath, contentType: 'image/png' });
    };

    // 1. Desktop detail view on PBG tab
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/#detalle/A02');
    await page.getByRole('button', { name: '📊 Producción (PBG)' }).click();
    await saveSnapshot('fase3-areadetail-pbg.png');

    // 2. Desktop detail view on A10 showing explicit missing data notice
    await page.goto('/#detalle/A10');
    await page.getByRole('button', { name: '👥 Empleo Registrado (OEDE)' }).click();
    await saveSnapshot('fase3-areadetail-a10-missing.png');

    // 3. Mobile view on area detail
    await page.setViewportSize({ width: 375, height: 750 });
    await page.goto('/#detalle/A01');
    await saveSnapshot('fase3-areadetail-mobile.png');
  });
});
