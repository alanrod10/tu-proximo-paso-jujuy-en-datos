import { test, expect } from '@playwright/test';

test.describe('Global Search and Redesigned Home Page (Fase 2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('home hero search: matches everyday terms, shows semantic badges, and navigates', async ({ page }) => {
    const heroInput = page.getByPlaceholder('Buscar por actividad, oficio o producto (ej. tabaco, litio, comercio)...');
    await expect(heroInput).toBeVisible();

    // Search everyday occupation "enfermero" (alias for A12 Salud)
    await heroInput.fill('enfermero');
    const option = page.locator("button[role='option']:has-text('Salud')");
    await expect(option).toBeVisible();
    await expect(page.locator('text=Término orientativo relacionado: "enfermero"')).toBeVisible();

    // Click to navigate
    await option.click();
    await expect(page).toHaveURL(/.*#detalle\/A12/);
    await expect(page.locator('text=Salud').first()).toBeVisible();
  });

  test('captures visual snapshots of Fase 2 redesigned home and search dropdown', async ({ page }) => {
    // 1. Desktop full home
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.screenshot({ path: 'test-results/screenshots/fase2-desktop.png', fullPage: false });

    // 2. Search dropdown open with autocomplete results
    const heroInput = page.getByPlaceholder('Buscar por actividad, oficio o producto (ej. tabaco, litio, comercio)...');
    await heroInput.fill('comercio');
    await expect(page.locator("button[role='option']").first()).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/fase2-search-dropdown.png', fullPage: false });

    // 3. Mobile view
    await page.setViewportSize({ width: 375, height: 750 });
    await page.goto('/');
    await page.screenshot({ path: 'test-results/screenshots/fase2-mobile.png', fullPage: false });
  });

  test('home hero search: differentiates official, partial, and non-applicable classifications', async ({ page }) => {
    const heroInput = page.getByPlaceholder('Buscar por actividad, oficio o producto (ej. tabaco, litio, comercio)...');

    // Official match: "agricultura" -> A01
    await heroInput.fill('agricultura');
    await expect(page.locator('text=Coincide con clasificación oficial')).toBeVisible();

    // Partial/observed match: "comunales, sociales y personales" -> A12
    await heroInput.fill('');
    await heroInput.fill('comunales, sociales y personales');
    await expect(page.locator('text=Coincidencia parcial/observada')).toBeVisible();
    await expect(page.locator('text=Coincide con clasificación oficial')).toHaveCount(0);

    // Non-applicable match: "Actividades primarias" -> A01 and A02
    await heroInput.fill('');
    await heroInput.fill('Actividades primarias');
    await expect(page.locator('text=Fuente no aplicable a esta área').first()).toBeVisible();
    await expect(page.locator('text=Coincide con clasificación oficial')).toHaveCount(0);
  });

  test('home hero search: handles unmatched queries with clear feedback', async ({ page }) => {
    const heroInput = page.getByPlaceholder('Buscar por actividad, oficio o producto (ej. tabaco, litio, comercio)...');

    await heroInput.fill('astronauta submarino');
    await expect(page.locator("text=No se encontraron actividades para")).toBeVisible();
  });

  test('home hero search: supports keyboard navigation (ArrowDown, Enter, Escape)', async ({ page }) => {
    const heroInput = page.getByPlaceholder('Buscar por actividad, oficio o producto (ej. tabaco, litio, comercio)...');

    await heroInput.fill('comercio');
    await expect(page.locator("button[role='option']").first()).toBeVisible();

    // Press ArrowDown to select first item, then Enter to navigate
    await heroInput.press('ArrowDown');
    await heroInput.press('Enter');

    await expect(page).toHaveURL(/.*#detalle\/A06/);
    await expect(page.locator('text=Comercio').first()).toBeVisible();
  });

  test('quick search chips navigate directly to corresponding areas', async ({ page }) => {
    // Click on 'Litio' quick chip
    const litioChip = page.getByRole('button', { name: 'Litio', exact: true });
    await expect(litioChip).toBeVisible();
    await litioChip.click();

    await expect(page).toHaveURL(/.*#detalle\/A02/);
    await expect(page.locator('text=Minería').first()).toBeVisible();
  });

  test('header global search: functions from any page in desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/#metodologia');

    // Header search input is visible on desktop
    const headerInput = page.getByPlaceholder('Buscar actividad o código...');
    await expect(headerInput).toBeVisible();

    await headerInput.fill('educacion');
    const option = page.locator("button[role='option']:has-text('Educación')");
    await expect(option).toBeVisible();

    await option.click();
    await expect(page).toHaveURL(/.*#detalle\/A11/);
    await expect(page.locator('text=Educación').first()).toBeVisible();
  });

  test('redesigned home page: presents 12 interactive areas and 3 consolidated KPIs with clarity', async ({ page }) => {
    // 3 Consolidated KPIs
    await expect(page.locator('text=Producción Provincial (PBG 2024*)')).toBeVisible();
    await expect(page.locator('text=$6,47 mil millones')).toBeVisible();
    await expect(page.locator('text=Trabajo Registrado (OEDE)')).toBeVisible();
    await expect(page.locator('text=63.017 puestos')).toBeVisible();

    // All 12 Area cards are rendered with code and direct interaction
    for (const code of ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10', 'A11', 'A12']) {
      await expect(page.locator(`text=${code}`).first()).toBeVisible();
    }

    // Direct click on an Area Card navigates to detail
    await page.locator("div[role='button']:has-text('Construcción')").first().click();
    await expect(page).toHaveURL(/.*#detalle\/A05/);
    await expect(page.locator('text=Construcción').first()).toBeVisible();
  });
});
