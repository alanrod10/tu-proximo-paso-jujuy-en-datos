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

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      if (adapter?.setAdapterOverrides) {
        adapter.setAdapterOverrides(null);
      }
    });
  });

  test('PBG Regression: Missing TOTAL record results in null total and pbgDisponible false without artificial fallback (6471196)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      // Inyectar dataset PBG sin registro TOTAL
      adapter.setAdapterOverrides({
        pbg: {
          metadata: { fuente: 'DIPEC', descripcion: 'PBG Test' },
          series: [
            {
              periodo_anio: 2024,
              codigo_rama: 'A',
              nombre_rama: 'Agricultura',
              area_id: 'A01',
              valor_constante: 367447,
              valor_corriente: 245166610,
              es_provisorio: true,
              unidad_medida: 'Miles de pesos'
            }
          ]
        }
      });
      const provincial = adapter.getProvincialOverview();
      const a01 = adapter.getAreaOverview('A01');
      return { provincial, a01 };
    });

    // Sin registro TOTAL, el total provincial debe ser estrictamente null (nunca 6471196 o 5483568000)
    expect(result.provincial.pbgTotalConstanteMiles).toBeNull();
    expect(result.provincial.pbgTotalCorrienteMiles).toBeNull();
    expect(result.provincial.pbgDisponible).toBe(false);
    expect(result.provincial.pbgMotivoNoDisponible).toBeDefined();

    // Sin total provincial, el porcentaje del área debe ser null (no NaN ni 0 artificial)
    expect(result.a01?.pbg.porcentajeProvincial).toBeNull();
    expect(result.a01?.pbg.porcentajeProvincialConstante).toBeNull();
    expect(result.a01?.pbg.porcentajeProvincialCorriente).toBeNull();
  });

  test('PBG Regression: Area missing from PBG dataset results in porcentajeProvincial: null, not 0 without justification', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      // Inyectar dataset PBG con TOTAL pero sin registros para el área A01
      adapter.setAdapterOverrides({
        pbg: {
          metadata: { fuente: 'DIPEC', descripcion: 'PBG Test' },
          series: [
            {
              periodo_anio: 2024,
              codigo_rama: 'TOTAL',
              nombre_rama: 'Producto Bruto Geográfico Total',
              area_id: null,
              valor_constante: 6000000,
              valor_corriente: 5000000000,
              es_provisorio: false,
              unidad_medida: 'Miles de pesos'
            },
            {
              periodo_anio: 2024,
              codigo_rama: 'C',
              nombre_rama: 'Industria Manufacturera',
              area_id: 'A03',
              valor_constante: 1200000,
              valor_corriente: 1000000000,
              es_provisorio: false,
              unidad_medida: 'Miles de pesos'
            }
          ]
        }
      });
      const a01 = adapter.getAreaOverview('A01');
      const a03 = adapter.getAreaOverview('A03');
      return { a01, a03 };
    });

    // A01 no tiene registros en la serie
    expect(result.a01?.pbg.disponible).toBe(false);
    expect(result.a01?.pbg.valorConstanteMiles).toBeNull();
    expect(result.a01?.pbg.valorCorrienteMiles).toBeNull();
    // Rigor: NUNCA reemplazar por 0 sin advertencia
    expect(result.a01?.pbg.porcentajeProvincial).toBeNull();
    expect(result.a01?.pbg.porcentajeProvincialConstante).toBeNull();
    expect(result.a01?.pbg.porcentajeProvincialCorriente).toBeNull();
    expect(result.a01?.pbg.motivoNoDisponible).toContain('No se registran datos oficiales de PBG');

    // A03 sí tiene registros y porcentaje válido
    expect(result.a03?.pbg.disponible).toBe(true);
    expect(result.a03?.pbg.porcentajeProvincialConstante).toBe(20); // 1200000 / 6000000 = 20%
  });

  test('OEDE Regression: Empty or missing totals results in null puestos and oedeDisponible false without artificial fallback (63017)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      // Inyectar dataset OEDE vacío
      adapter.setAdapterOverrides({
        oede: {
          metadata: { fuente: 'OEDE', descripcion: 'OEDE Test' },
          series: []
        }
      });
      const provincial = adapter.getProvincialOverview();
      const a01 = adapter.getAreaOverview('A01');
      return { provincial, a01 };
    });

    // Total provincial debe ser null (nunca fallback artificial 63017)
    expect(result.provincial.oedeTotalPuestosRegistrados).toBeNull();
    expect(result.provincial.oedeDisponible).toBe(false);
    expect(result.provincial.oedeMotivoNoDisponible).toBeDefined();

    // Área sin datos
    expect(result.a01?.oede.disponible).toBe(false);
    expect(result.a01?.oede.puestosTrabajo).toBeNull();
  });

  test('OEDE Regression: Statistical secrecy handling prevents calculating full provincial total without warning', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      // Inyectar dataset OEDE sin nivel TOTAL, con registros de ramas donde una tiene secreto
      adapter.setAdapterOverrides({
        oede: {
          metadata: { fuente: 'OEDE', descripcion: 'OEDE Test' },
          series: [
            {
              periodo: '1° Trim 2026',
              tipo_nivel: 'LETRA',
              codigo_actividad: 'A',
              nombre_actividad: 'Agricultura',
              area_id: 'A01',
              puestos_trabajo: 9000,
              estado_dato: 'PUBLICADO'
            },
            {
              periodo: '1° Trim 2026',
              tipo_nivel: 'LETRA',
              codigo_actividad: 'B',
              nombre_actividad: 'Pesca',
              area_id: 'A01',
              puestos_trabajo: null,
              estado_dato: 'SIN_DATO_SECRETO_ESTADISTICO'
            }
          ]
        }
      });
      const provincial = adapter.getProvincialOverview();
      const a01 = adapter.getAreaOverview('A01');
      return { provincial, a01 };
    });

    // El total no se puede computar sumando letras si hay secreto estadístico
    expect(result.provincial.oedeTotalPuestosRegistrados).toBeNull();
    expect(result.provincial.oedeDisponible).toBe(false);
    expect(result.provincial.oedeMotivoNoDisponible).toContain('secreto estadístico');

    // El área A01 que agrupa ramas con secreto debe marcar tieneSecretoEstadistico: true y esCompleto: false
    expect(result.a01?.oede.tieneSecretoEstadistico).toBe(true);
    expect(result.a01?.oede.esCompleto).toBe(false);
  });
});
