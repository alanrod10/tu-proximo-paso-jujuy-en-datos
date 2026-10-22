import { test, expect } from '@playwright/test';

test.describe('Search functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '12 Áreas de Jujuy' }).click();
  });

  test('search by exact area name ignores diacritics', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar por área o actividad...');
    await searchInput.fill('mineria');

    // Should match Area A02
    await expect(page.locator("div[role='button']:has-text('Minería')")).toBeVisible();

    // There shouldn't be match reason badge if it matches core Area name
    await expect(page.locator('text=Coincide con')).toHaveCount(0);
  });

  test('search by official correspondence classification and navigate', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar por área o actividad...');
    await searchInput.fill('agricultura');

    // Should show Area A01 with match explanation
    await expect(page.locator("div[role='button']:has-text('Agro y producción primaria')")).toBeVisible();
    await expect(page.locator('text=Coincide con clasificación oficial')).toBeVisible();

    // Verify Navigation to detail page works
    await page.locator("div[role='button']:has-text('Agro y producción primaria')").click();

    // Check that we entered detail mode
    await expect(page.locator('text=Volver al Explorador de Áreas').first()).toBeVisible();
  });

  test('search by partial/observed correspondence differentiation', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar por área o actividad...');
    await searchInput.fill('comunales, sociales y personales');

    // Area A12 has this as PARCIAL/OBSERVADO
    await expect(page.locator("div[role='button']:has-text('Salud y servicios comunitarios')")).toBeVisible();

    // It MUST NOT show "Coincide con clasificación oficial" because it's not confirmed
    await expect(page.locator('text=Coincide con clasificación oficial')).toHaveCount(0);

    // It MUST show the partial observation text
    await expect(page.locator('text=Coincidencia parcial/observada')).toBeVisible();

    // Verify navigation works even for partial matches
    await page.locator("div[role='button']:has-text('Salud y servicios comunitarios')").click();
    await expect(page.locator('text=Volver al Explorador de Áreas').first()).toBeVisible();
  });

  test('search explicitly handles ambiguous alias accurately', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar por área o actividad...');

    // Ambiguous term part 1: cajero bancario (A09)
    await searchInput.fill('cajero bancario');
    await expect(page.locator("div[role='button']:has-text('Finanzas y servicios empresariales')")).toBeVisible();
    await expect(page.locator('text=Término orientativo relacionado: "cajero bancario"')).toBeVisible();
    // Area A06 should NOT show up
    await expect(page.locator("div[role='button']:has-text('Comercio')")).toHaveCount(0);

    // Ambiguous term part 2: cajero de comercio (A06)
    await searchInput.fill(''); // Clear
    await searchInput.fill('cajero de comercio');
    await expect(page.locator("div[role='button']:has-text('Comercio')")).toBeVisible();
    await expect(page.locator('text=Término orientativo relacionado: "cajero de comercio"')).toBeVisible();
    // Area A09 should NOT show up
    await expect(page.locator("div[role='button']:has-text('Finanzas y servicios empresariales')")).toHaveCount(0);
  });

  test('search unmatched state and clear button', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar por área o actividad...');

    // Test unmatched
    await searchInput.fill('astronauta');
    await expect(page.locator('text=No se encontraron áreas')).toBeVisible();

    // Test clear button
    await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
    await expect(searchInput).toHaveValue('');
    // Multiple areas should be visible again
    expect(await page.locator("div[role='button']").count()).toBeGreaterThan(1);
  });
});
