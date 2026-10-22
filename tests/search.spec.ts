import { test, expect } from '@playwright/test';

test.describe('Search functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: '12 Áreas de Jujuy' }).click();
  });

  test('search by exact area name ignores diacritics', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar por área o actividad...');
    await searchInput.fill('mineria');

    // Should match Area A02
    await expect(page.locator('text=Minería').first()).toBeVisible();

    // There shouldn't be match reason badge if it matches core Area name
    await expect(page.locator('text=Coincide con')).toHaveCount(0);
  });

  test('search by official correspondence classification', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar por área o actividad...');
    await searchInput.fill('agricultura');

    // Should show Area A01 with match explanation
    await expect(page.locator('text=Agro y producción primaria').first()).toBeVisible();
    await expect(page.locator('text=Coincide con clasificación oficial')).toBeVisible();
  });

  test('search by explicit alias', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar por área o actividad...');
    await searchInput.fill('abogado');

    // Should show Area A09 with match explanation
    await expect(page.locator('text=Finanzas y servicios').first()).toBeVisible();
    await expect(page.locator('text=Coincide con término buscado: "abogado"')).toBeVisible();
  });

  test('search unmatched state', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar por área o actividad...');
    await searchInput.fill('astronauta');

    await expect(page.locator('text=No se encontraron áreas')).toBeVisible();
  });
});
