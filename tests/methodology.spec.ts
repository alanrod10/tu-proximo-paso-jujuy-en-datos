import { test, expect } from '@playwright/test';

test.describe('Methodology Page functionality', () => {
  test('navigation to methodology page renders correctly without crashing', async ({ page }) => {
    await page.goto('/');

    // Click on Methodology button in the header
    await page.getByRole('button', { name: 'Fuentes y Metodología', exact: true }).click();

    // Verify header exists
    await expect(page.locator('text=Fuentes Oficiales y Metodología del Proyecto').first()).toBeVisible();

    // Verify EIL card renders properly
    await expect(page.locator('text=Encuesta de Indicadores Laborales (EIL)').first()).toBeVisible();

    // Verify missing 'unidades' fallback text works
    await expect(page.locator('text=Varía según el indicador y la tabla').first()).toBeVisible();

    // Verify we can navigate back to another section (e.g. Home)
    await page.getByRole('button', { name: 'Inicio', exact: true }).click();
    await expect(page.locator('text=Tu Próximo Paso').first()).toBeVisible();
  });
});
