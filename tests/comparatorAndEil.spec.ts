import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Fase 4: Modo Comparador y Dinámica Laboral Transversal (EIL)', () => {
  test('Comparator: loads via hash #comparador, allows swapping areas and switching price modes', async ({ page }) => {
    await page.goto('/#comparador');
    await page.waitForLoadState('networkidle');

    // Verificar que el comparador esté presente
    const comparator = page.locator('[data-testid="area-comparator"]');
    await expect(comparator).toBeVisible();

    // Selectores de área visibles
    const sel1 = page.locator('select[aria-label="Seleccionar Área 1 para comparar"]');
    const sel2 = page.locator('select[aria-label="Seleccionar Área 2 para comparar"]');
    await expect(sel1).toBeVisible();
    await expect(sel2).toBeVisible();

    // Valores iniciales por defecto (A01 y A03)
    await expect(sel1).toHaveValue('A01');
    await expect(sel2).toHaveValue('A03');

    // Botón de intercambio (swap)
    const swapBtn = page.locator('button[aria-label="Intercambiar Área 1 y Área 2"]');
    await swapBtn.click();

    // Verificar que se hayan invertido
    await expect(sel1).toHaveValue('A03');
    await expect(sel2).toHaveValue('A01');

    // Toggle de PBG Constante vs Corriente
    const btnCorriente = page.getByRole('button', { name: /Precios Corrientes/i });
    await btnCorriente.click();
    await expect(page.getByText('Miles $ corrientes').first()).toBeVisible();

    const btnConstante = page.getByRole('button', { name: /Precios Constantes 2004/i });
    await btnConstante.click();
    await expect(page.getByText('Miles $ de 2004').first()).toBeVisible();

    // Verificar año provisorio 2024*
    await expect(page.locator('text=2024*').first()).toBeVisible();
  });

  test('Comparator: respects absence of OEDE in A10 without imputing 0 and detects EIL exclusions', async ({ page }) => {
    await page.goto('/#comparador');
    await page.waitForLoadState('networkidle');

    const sel1 = page.locator('select[aria-label="Seleccionar Área 1 para comparar"]');
    const sel2 = page.locator('select[aria-label="Seleccionar Área 2 para comparar"]');

    // Seleccionar A10 (Adm Pública) y A11 (Salud)
    await sel1.selectOption('A10');
    await sel2.selectOption('A11');

    // Verificar advertencia pedagógica de OEDE para A10
    await expect(page.getByText(/La administración pública \(rama L\) no se releva en la serie OEDE Jujuy/i).first()).toBeVisible();
    await expect(page.getByText(/no se computa como cero/i)).toBeVisible();

    // Verificar exclusión de EIL para A10
    await expect(page.getByText(/Exclusión Metodológica en EIL/i)).toBeVisible();
  });

  test('Comparator: detects indivisible grouping between Comercio (A06) and Turismo (A07) in EIL', async ({ page }) => {
    await page.goto('/#comparador');
    await page.waitForLoadState('networkidle');

    const sel1 = page.locator('select[aria-label="Seleccionar Área 1 para comparar"]');
    const sel2 = page.locator('select[aria-label="Seleccionar Área 2 para comparar"]');

    await sel1.selectOption('A06');
    await sel2.selectOption('A07');

    // Verificar aviso de rama conjunta indivisible en EIL
    await expect(page.getByText(/Rama Conjunta Indivisible en EIL/i)).toBeVisible();
    await expect(page.getByText(/No es metodológicamente correcto desagregarlas/i)).toBeVisible();
  });

  test('Explorer page: supports toggling between 12 Areas catalog and Comparator mode', async ({ page }) => {
    await page.goto('/#areas');
    await page.waitForLoadState('networkidle');

    // Inicialmente en vista Catálogo
    await expect(page.getByPlaceholder('Buscar por área o actividad...')).toBeVisible();

    // Cambiar a Modo Comparador mediante el botón de toggle
    const compBtn = page.getByRole('button', { name: /Modo Comparador \(2 Áreas\)/i });
    await compBtn.click();

    // Verificar que cargó el comparador
    await expect(page.locator('[data-testid="area-comparator"]')).toBeVisible();

    // Regresar al Catálogo
    const catBtn = page.getByRole('button', { name: /Catálogo \(12 Áreas\)/i });
    await catBtn.click();
    await expect(page.getByPlaceholder('Buscar por área o actividad...')).toBeVisible();
  });

  test('EIL Transversal: renders qualification tab with task complexity disclaimer and altas/bajas composition', async ({ page }) => {
    await page.goto('/#transversal');
    await page.waitForLoadState('networkidle');

    // Verificar página EIL transversal
    const eilPage = page.locator('[data-testid="eil-transversal-page"]');
    await expect(eilPage).toBeVisible();

    // Verificar advertencia de calificación != nivel educativo
    await expect(page.getByText(/Calificación de la Tarea ≠ Nivel Educativo/i)).toBeVisible();

    // Verificar categorías de calificación presentes en la composición
    await expect(page.getByText('Profesional').first()).toBeVisible();
    await expect(page.getByText('Técnica').first()).toBeVisible();
    await expect(page.getByText('Operativa').first()).toBeVisible();
    await expect(page.getByText('No Calificada').first()).toBeVisible();

    // Verificar selector de período
    const periodSelect = page.locator('select[aria-label="Seleccionar período de referencia para calificación de la tarea"]');
    await expect(periodSelect).toBeVisible();

    // Verificar KPIs de rotación
    await expect(page.getByText(/Tasa de Rotación Total/i)).toBeVisible();
    await expect(page.getByText(/Tasa de Entrada Total/i)).toBeVisible();
    await expect(page.getByText(/Tasa de Salida Total/i)).toBeVisible();
  });

  test('EIL Transversal: renders labor demand tab with active search disclaimer and coverage breakdown', async ({ page }) => {
    await page.goto('/#transversal');
    await page.waitForLoadState('networkidle');

    // Cambiar a la pestaña de Demanda y Búsquedas
    const demandaTab = page.getByRole('button', { name: /2\. Demanda y Búsquedas Activas/i });
    await demandaTab.click();

    // Advertencia de búsquedas != vacantes
    await expect(page.getByText(/Búsquedas Activas ≠ Vacantes Totales/i)).toBeVisible();

    // Cobertura de puestos
    await expect(page.getByText(/Cubrieron todos los puestos/i)).toBeVisible();
    await expect(page.getByText(/Cubrieron parte de los puestos/i)).toBeVisible();
    await expect(page.getByText(/No cubrieron ninguno de los puestos/i)).toBeVisible();
  });

  test('EIL Transversal: renders time series evolution tab with SVG chart and sector exclusions', async ({ page }) => {
    await page.goto('/#transversal');
    await page.waitForLoadState('networkidle');

    // Cambiar a la pestaña de Evolución del Empleo
    const evolTab = page.getByRole('button', { name: /3\. Evolución del Empleo en Gran Jujuy/i });
    await evolTab.click();

    // Verificar gráfico interactivo SVG
    await expect(page.locator('svg[role="img"]').first()).toBeVisible();

    // Verificar notas de exclusión
    await expect(page.getByText(/Sector Primario Excluido/i)).toBeVisible();
    await expect(page.getByText(/Sector Público Excluido/i)).toBeVisible();
    await expect(page.getByText(/Agrupación Indivisible/i).first()).toBeVisible();
  });

  test('Captures responsive visual snapshots of Fase 4 comparator and EIL transversal', async ({ page }) => {
    const artifactDir = '/home/alanrod10/.gemini/antigravity-cli/brain/cc802746-dfc9-4808-9b48-64cac8121cc9';

    // 1. Desktop: Modo Comparador
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/#comparador');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(artifactDir, 'fase4-comparador-desktop.png'), fullPage: false });

    // 2. Desktop: EIL Transversal
    await page.goto('/#transversal');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(artifactDir, 'fase4-eil-transversal-desktop.png'), fullPage: false });

    // 3. Mobile: Modo Comparador
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/#comparador');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(artifactDir, 'fase4-comparador-mobile.png'), fullPage: false });

    // 4. Mobile: EIL Transversal
    await page.goto('/#transversal');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(artifactDir, 'fase4-eil-transversal-mobile.png'), fullPage: false });
  });
});
