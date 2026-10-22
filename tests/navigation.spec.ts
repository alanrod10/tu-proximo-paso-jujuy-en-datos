import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Navigation and Browser History functionality', () => {
  test('direct hash navigation loads expected views', async ({ page }) => {
    // Navigate directly to methodology via hash
    await page.goto('/#metodologia');
    await expect(page.locator('text=Fuentes Oficiales y Metodología del Proyecto').first()).toBeVisible();

    // Navigate directly to areas via hash
    await page.goto('/#areas');
    await expect(page.locator('text=Explorador de Áreas de Jujuy').first()).toBeVisible();

    // Navigate directly to area detail via hash
    await page.goto('/#detalle/A02');
    await expect(page.locator("text=Minería").first()).toBeVisible();
    await expect(page.locator('text=Volver al Explorador de Áreas').first()).toBeVisible();
  });

  test('browser back and forward buttons work as expected', async ({ page }, testInfo) => {
    await page.goto('/');

    // Screenshot of redesigned header and hero in Fase 1
    const targetHeader = process.env.SCREENSHOT_DIR
      ? path.join(process.env.SCREENSHOT_DIR, 'fase1-home-header.png')
      : testInfo.outputPath('fase1-home-header.png');
    fs.mkdirSync(path.dirname(targetHeader), { recursive: true });
    await page.screenshot({ path: targetHeader, fullPage: false });
    await testInfo.attach('fase1-home-header.png', { path: targetHeader, contentType: 'image/png' });

    // Navigate from home to areas
    await page.getByRole('button', { name: '12 Áreas de Jujuy' }).click();
    await expect(page).toHaveURL(/.*#areas/);
    await expect(page.locator('text=Explorador de Áreas de Jujuy').first()).toBeVisible();

    // Navigate from areas to methodology
    await page.getByRole('button', { name: 'Fuentes y Metodología', exact: true }).click();
    await expect(page).toHaveURL(/.*#metodologia/);
    await expect(page.locator('text=Fuentes Oficiales y Metodología del Proyecto').first()).toBeVisible();

    // Browser back to areas
    await page.goBack();
    await expect(page).toHaveURL(/.*#areas/);
    await expect(page.locator('text=Explorador de Áreas de Jujuy').first()).toBeVisible();

    // Browser back to home
    await page.goBack();
    await expect(page.locator('text=Tu Próximo Paso').first()).toBeVisible();

    // Browser forward to areas
    await page.goForward();
    await expect(page).toHaveURL(/.*#areas/);
    await expect(page.locator('text=Explorador de Áreas de Jujuy').first()).toBeVisible();
  });

  test('gracefully handles invalid hashes and non-existent area IDs', async ({ page }) => {
    // Non-existent area ID falls back to areas explorer
    await page.goto('/#detalle/A99');
    await expect(page.locator('text=Explorador de Áreas de Jujuy').first()).toBeVisible();

    await page.goto('/#area/INEXISTENTE');
    await expect(page.locator('text=Explorador de Áreas de Jujuy').first()).toBeVisible();

    // Unknown route falls back to home page
    await page.goto('/#ruta_desconocida_xyz');
    await expect(page.locator('text=Tu Próximo Paso').first()).toBeVisible();
  });

  test('respects prefers-reduced-motion media query and captures responsive snapshots', async ({ page }, testInfo) => {
    // Emulate prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Check that hero title renders without animation blocking
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();

    // Check that animation-duration is effectively reduced via CSS rule
    const duration = await title.evaluate((el) => {
      return window.getComputedStyle(el).animationDuration;
    });
    // With prefers-reduced-motion: reduce, animation-duration is 0.001ms / 1e-06s / 0s
    expect(duration).toMatch(/^(0s|0\.000001s|1e-06s|0\.001ms|none)$/);

    const saveSnapshot = async (filename: string) => {
      const targetPath = process.env.SCREENSHOT_DIR
        ? path.join(process.env.SCREENSHOT_DIR, filename)
        : testInfo.outputPath(filename);
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      await page.screenshot({ path: targetPath, fullPage: false });
      await testInfo.attach(filename, { path: targetPath, contentType: 'image/png' });
    };

    // Desktop screenshot
    await page.setViewportSize({ width: 1280, height: 800 });
    await saveSnapshot('fase1-desktop.png');

    // Mobile viewport screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await saveSnapshot('fase1-mobile.png');
  });
});
