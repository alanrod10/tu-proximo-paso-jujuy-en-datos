import { test, expect } from '@playwright/test';

test.describe('Statistical Integrity Validation (dataAdapter)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait until window.__DATA_ADAPTER__ is defined
    await page.waitForFunction(() => (window as any).__DATA_ADAPTER__ !== undefined);
  });

  test('PBG: differentiates constant and current prices and preserves provisional status', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      const provincial = adapter.getProvincialOverview();
      const a01 = adapter.getAreaOverview('A01');
      return { provincial, a01 };
    });

    // Constant prices (volume, 2004 base) vs Current prices (nominal)
    expect(result.provincial.pbgTotalConstanteMiles).toBeCloseTo(6465553, 0); // ~$6,47 mil millones de 2004
    expect(result.provincial.pbgTotalCorrienteMiles).toBeCloseTo(5478133735, 0); // ~$5,48 billones corrientes
    expect(result.provincial.pbgTotalCorrienteMiles).toBeGreaterThan(result.provincial.pbgTotalConstanteMiles);

    // Area A01 (Agro)
    expect(result.a01).toBeDefined();
    expect(result.a01?.pbg.disponible).toBe(true);
    expect(result.a01?.pbg.ultimoAnio).toBe(2024);
    expect(result.a01?.pbg.esProvisorio).toBe(true);
    expect(result.a01?.pbg.valorConstanteMiles).toBeGreaterThan(0);
    expect(result.a01?.pbg.valorCorrienteMiles).toBeGreaterThan(result.a01!.pbg.valorConstanteMiles);
    expect(result.a01?.pbg.porcentajeProvincial).toBeGreaterThan(0);
  });

  test('OEDE: respects absence of Public Administration (A10) and never converts missing or secret to 0', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      const a10 = adapter.getAreaOverview('A10');
      const a01 = adapter.getAreaOverview('A01');
      const provincial = adapter.getProvincialOverview();
      return { a10, a01, provincial };
    });

    // Area A10 (Administración Pública) is NOT present in OEDE Jujuy
    expect(result.a10?.oede.disponible).toBe(false);
    expect(result.a10?.oede.puestosTrabajo).toBeNull(); // Rigor: NEVER 0
    expect(result.a10?.oede.motivoNoDisponible).toContain('rama L');

    // Total provincial employment is 63,017 registered private jobs in 1° Trim 2026
    expect(result.provincial.oedeTotalPuestosRegistrados).toBe(63017);
    expect(result.provincial.oedeUltimoPeriodo).toBe('1° Trim 2026');

    // Area A01 has registered jobs in OEDE
    expect(result.a01?.oede.disponible).toBe(true);
    expect(result.a01?.oede.puestosTrabajo).toBe(9431);
  });

  test('EIL: respects primary sector and public administration exclusions, and indivisible grouping', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      const rules = adapter.getEILMethodologyRules();
      const a01 = adapter.getAreaOverview('A01');
      const a02 = adapter.getAreaOverview('A02');
      const a10 = adapter.getAreaOverview('A10');
      const a06 = adapter.getAreaOverview('A06');
      const a07 = adapter.getAreaOverview('A07');
      return { rules, a01, a02, a10, a06, a07 };
    });

    expect(result.rules.cobertura).toContain('Gran Jujuy');
    expect(result.rules.universo).toContain('5 y más trabajadores');

    // Rule: Task qualification does not equal educational attainment
    const hasQualRule = result.rules.reglas.some(r => r.includes('no representa nivel educativo'));
    expect(hasQualRule).toBe(true);

    // Rule: Labor demand does not equal total job vacancies
    const hasDemandRule = result.rules.reglas.some(r => r.includes('no equivale a vacantes'));
    expect(hasDemandRule).toBe(true);

    // Primary sector exclusions (A01 Agro, A02 Minería)
    expect(result.a01?.eil.disponible).toBe(false);
    expect(result.a01?.eil.motivoExclusion).toContain('sector primario');
    expect(result.a02?.eil.disponible).toBe(false);
    expect(result.a02?.eil.motivoExclusion).toContain('sector primario');

    // Public sector exclusion (A10)
    expect(result.a10?.eil.disponible).toBe(false);
    expect(result.a10?.eil.motivoExclusion).toContain('privado formal');

    // Grouping of Comercio (A06) and Hoteles/Restaurantes (A07)
    expect(result.a06?.eil.esAgrupada).toBe(true);
    expect(result.a06?.eil.claveAgrupada).toBe('A06_A07_AGRUPADA');
    expect(result.a07?.eil.esAgrupada).toBe(true);
    expect(result.a07?.eil.claveAgrupada).toBe('A06_A07_AGRUPADA');
  });

  test('MIP: preserves 2015 base year, unassigned sectors and absent values', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      const mipStructure = adapter.getMIPStructuralOverview();
      const allAreas = adapter.getAllAreasOverview();
      return { mipStructure, allAreas };
    });

    // Base year must be strictly 2015
    expect(result.mipStructure.anioBase).toBe(2015);
    expect(result.mipStructure.totalSectores).toBe(34);
    expect(result.mipStructure.sectoresAsignados).toBe(30);

    // 4 sectors must not be forcibly assigned to an area
    expect(result.mipStructure.sectoresSinAsignacionForzada.length).toBe(4);
    const unassignedIds = result.mipStructure.sectoresSinAsignacionForzada.map(s => s.id);
    expect(unassignedIds).toEqual([3, 19, 20, 34]);

    // Sector 34 (Hogares con servicios domésticos) is excluded in official source
    const sector34 = result.mipStructure.sectoresSinAsignacionForzada.find(s => s.id === 34);
    expect(sector34?.motivo).toContain('Excluido');

    // Fundamental warning must be present
    expect(result.mipStructure.advertenciaFundamental).toContain('2015');
    expect(result.mipStructure.advertenciaFundamental).toContain('deben interpretarse como cantidad actual de puestos');

    // All 12 areas overview MIP base year is 2015
    expect(result.allAreas.length).toBe(12);
    for (const a of result.allAreas) {
      expect(a.mip.anioBase).toBe(2015);
    }
  });
});
