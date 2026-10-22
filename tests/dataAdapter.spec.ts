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

  test('OEDE Integrity 1: Missing expected categories (only A, C, D provided) prevents alternative sum and returns null', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      // Inyectar dataset OEDE sin nivel TOTAL y solo con 3 ramas de las 14 esperadas
      adapter.setAdapterOverrides({
        oede: {
          metadata: { fuente: 'OEDE', descripcion: 'OEDE Test' },
          series: [
            {
              id: 'OEDE_A',
              area_id: 'A01',
              codigo_rama: 'A',
              nombre_rama: 'Agricultura',
              tipo_nivel: 'LETRA',
              letra_padre: null,
              periodo: '1° Trim 2026',
              anio: 2026,
              trimestre: 1,
              puestos_trabajo: 9000,
              estado_dato: 'PUBLICADO',
              unidad: 'Puestos'
            },
            {
              id: 'OEDE_C',
              area_id: 'A02',
              codigo_rama: 'C',
              nombre_rama: 'Minería',
              tipo_nivel: 'LETRA',
              letra_padre: null,
              periodo: '1° Trim 2026',
              anio: 2026,
              trimestre: 1,
              puestos_trabajo: 3000,
              estado_dato: 'PUBLICADO',
              unidad: 'Puestos'
            },
            {
              id: 'OEDE_D',
              area_id: 'A03',
              codigo_rama: 'D',
              nombre_rama: 'Industria',
              tipo_nivel: 'LETRA',
              letra_padre: null,
              periodo: '1° Trim 2026',
              anio: 2026,
              trimestre: 1,
              puestos_trabajo: 10000,
              estado_dato: 'PUBLICADO',
              unidad: 'Puestos'
            }
          ]
        }
      });
      return adapter.getProvincialOverview();
    });

    expect(result.oedeTotalPuestosRegistrados).toBeNull();
    expect(result.oedeDisponible).toBe(false);
    expect(result.oedeMotivoNoDisponible).toContain('Cobertura incompleta del universo sectorial OEDE');
    expect(result.oedeMotivoNoDisponible).toContain('faltan ramas oficiales esperadas');
  });

  test('OEDE Integrity 2: Records with null values and states other than PUBLICADO (SIN_DATO, FORMATO_ESPECIAL) prevent sum', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'O'];
      const series = letters.map(code => ({
        id: `OEDE_${code}`,
        area_id: 'A01',
        codigo_rama: code,
        nombre_rama: `Rama ${code}`,
        tipo_nivel: 'LETRA',
        letra_padre: null,
        periodo: '1° Trim 2026',
        anio: 2026,
        trimestre: 1,
        // Letra E tiene estado no publicado y valor nulo
        puestos_trabajo: code === 'E' ? null : 1000,
        estado_dato: code === 'E' ? 'SIN_DATO' : 'PUBLICADO',
        unidad: 'Puestos'
      }));

      adapter.setAdapterOverrides({
        oede: {
          metadata: { fuente: 'OEDE', descripcion: 'OEDE Test' },
          series
        }
      });
      return adapter.getProvincialOverview();
    });

    expect(result.oedeTotalPuestosRegistrados).toBeNull();
    expect(result.oedeDisponible).toBe(false);
    expect(result.oedeMotivoNoDisponible).toContain('valores no publicados, no numéricos o nulos');
  });

  test('OEDE Integrity 3: Duplicate records at letter level prevent alternative sum and return null', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'O'];
      const series = letters.map(code => ({
        id: `OEDE_${code}`,
        area_id: 'A01',
        codigo_rama: code,
        nombre_rama: `Rama ${code}`,
        tipo_nivel: 'LETRA',
        letra_padre: null,
        periodo: '1° Trim 2026',
        anio: 2026,
        trimestre: 1,
        puestos_trabajo: 1000,
        estado_dato: 'PUBLICADO',
        unidad: 'Puestos'
      }));
      // Agregar un duplicado de la letra A
      series.push({
        id: 'OEDE_A_DUPLICADO',
        area_id: 'A01',
        codigo_rama: 'A',
        nombre_rama: 'Rama A Duplicada',
        tipo_nivel: 'LETRA',
        letra_padre: null,
        periodo: '1° Trim 2026',
        anio: 2026,
        trimestre: 1,
        puestos_trabajo: 1000,
        estado_dato: 'PUBLICADO',
        unidad: 'Puestos'
      });

      adapter.setAdapterOverrides({
        oede: {
          metadata: { fuente: 'OEDE', descripcion: 'OEDE Test' },
          series
        }
      });
      return adapter.getProvincialOverview();
    });

    expect(result.oedeTotalPuestosRegistrados).toBeNull();
    expect(result.oedeDisponible).toBe(false);
    expect(result.oedeMotivoNoDisponible).toContain('registros duplicados');
  });

  test('OEDE Integrity 4: Complete and valid set containing all 14 official categories enables summing correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'O'];
      const series = letters.map((code, index) => ({
        id: `OEDE_${code}`,
        area_id: 'A01',
        codigo_rama: code,
        nombre_rama: `Rama ${code}`,
        tipo_nivel: 'LETRA',
        letra_padre: null,
        periodo: '1° Trim 2026',
        anio: 2026,
        trimestre: 1,
        puestos_trabajo: (index + 1) * 1000,
        estado_dato: 'PUBLICADO',
        unidad: 'Puestos'
      }));

      adapter.setAdapterOverrides({
        oede: {
          metadata: { fuente: 'OEDE', descripcion: 'OEDE Test' },
          series
        }
      });
      return adapter.getProvincialOverview();
    });

    // Suma de 1 a 14 * 1000 = (14 * 15 / 2) * 1000 = 105,000
    expect(result.oedeTotalPuestosRegistrados).toBe(105000);
    expect(result.oedeDisponible).toBe(true);
    expect(result.oedeMotivoNoDisponible).toBeUndefined();
  });

  test('OEDE Integrity 5: Statistical secrecy in any letter prevents sum and gives clear reason', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'O'];
      const series = letters.map(code => ({
        id: `OEDE_${code}`,
        area_id: 'A01',
        codigo_rama: code,
        nombre_rama: `Rama ${code}`,
        tipo_nivel: 'LETRA',
        letra_padre: null,
        periodo: '1° Trim 2026',
        anio: 2026,
        trimestre: 1,
        puestos_trabajo: code === 'B' ? null : 1000,
        estado_dato: code === 'B' ? 'SIN_DATO_SECRETO_ESTADISTICO' : 'PUBLICADO',
        unidad: 'Puestos'
      }));

      adapter.setAdapterOverrides({
        oede: {
          metadata: { fuente: 'OEDE', descripcion: 'OEDE Test' },
          series
        }
      });
      return adapter.getProvincialOverview();
    });

    expect(result.oedeTotalPuestosRegistrados).toBeNull();
    expect(result.oedeDisponible).toBe(false);
    expect(result.oedeMotivoNoDisponible).toContain('secreto estadístico');
  });

  test('OEDE Integrity 6: Empty series or non-numeric/non-finite values (NaN, Infinity) return null without crashing', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'O'];
      const series = letters.map(code => ({
        id: `OEDE_${code}`,
        area_id: 'A01',
        codigo_rama: code,
        nombre_rama: `Rama ${code}`,
        tipo_nivel: 'LETRA',
        letra_padre: null,
        periodo: '1° Trim 2026',
        anio: 2026,
        trimestre: 1,
        puestos_trabajo: code === 'C' ? NaN : 1000,
        estado_dato: 'PUBLICADO',
        unidad: 'Puestos'
      }));

      adapter.setAdapterOverrides({
        oede: {
          metadata: { fuente: 'OEDE', descripcion: 'OEDE Test' },
          series
        }
      });
      return adapter.getProvincialOverview();
    });

    expect(result.oedeTotalPuestosRegistrados).toBeNull();
    expect(result.oedeDisponible).toBe(false);
  });

  test('OEDE Integrity 7: Official published total record (63,017 in 1° Trim 2026) is read directly from official source', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      return adapter.getProvincialOverview();
    });

    expect(result.oedeTotalPuestosRegistrados).toBe(63017);
    expect(result.oedeUltimoPeriodo).toBe('1° Trim 2026');
    expect(result.oedeDisponible).toBe(true);
  });

  test('OEDE Area Integrity: Subtotal of published branches when other branches are secret is unequivocally marked as partial', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      // Inyectar un área A09 con 2 ramas: una publicada (500) y otra con secreto estadístico
      adapter.setAdapterOverrides({
        oede: {
          metadata: { fuente: 'OEDE', descripcion: 'OEDE Test' },
          series: [
            {
              id: 'OEDE_TOTAL',
              area_id: null,
              codigo_rama: 'TOTAL',
              nombre_rama: 'TOTAL',
              tipo_nivel: 'TOTAL',
              letra_padre: null,
              periodo: '1° Trim 2026',
              anio: 2026,
              trimestre: 1,
              puestos_trabajo: 500,
              estado_dato: 'PUBLICADO',
              unidad: 'Puestos'
            },
            {
              id: 'OEDE_J',
              area_id: 'A09',
              codigo_rama: 'J',
              nombre_rama: 'Finanzas',
              tipo_nivel: 'LETRA',
              letra_padre: null,
              periodo: '1° Trim 2026',
              anio: 2026,
              trimestre: 1,
              puestos_trabajo: 500,
              estado_dato: 'PUBLICADO',
              unidad: 'Puestos'
            },
            {
              id: 'OEDE_K',
              area_id: 'A09',
              codigo_rama: 'K',
              nombre_rama: 'Servicios inmobiliarios',
              tipo_nivel: 'LETRA',
              letra_padre: null,
              periodo: '1° Trim 2026',
              anio: 2026,
              trimestre: 1,
              puestos_trabajo: null,
              estado_dato: 'SIN_DATO_SECRETO_ESTADISTICO',
              unidad: 'Puestos'
            }
          ]
        }
      });
      return adapter.getAreaOverview('A09');
    });

    expect(result?.oede.puestosTrabajo).toBe(500);
    expect(result?.oede.tieneSecretoEstadistico).toBe(true);
    expect(result?.oede.esCompleto).toBe(false);
    expect(result?.oede.motivoNoDisponible).toContain('Dato parcial');
    expect(result?.oede.motivoNoDisponible).toContain('No equivale al total del área');
  });

  test('OEDE Integrity 8: Unexpected category outside authorized catalog prevents alternative sum and returns null', async ({ page }) => {
    const result = await page.evaluate(() => {
      const adapter = (window as any).__DATA_ADAPTER__;
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'O'];
      const series = letters.map((code, index) => ({
        id: `OEDE_${code}`,
        area_id: 'A01',
        codigo_rama: code,
        nombre_rama: `Rama ${code}`,
        tipo_nivel: 'LETRA',
        letra_padre: null,
        periodo: '1° Trim 2026',
        anio: 2026,
        trimestre: 1,
        puestos_trabajo: (index + 1) * 1000,
        estado_dato: 'PUBLICADO',
        unidad: 'Puestos'
      }));
      // Agregar una categoría extra inesperada / no autorizada (ej. 'Z' o 'Q')
      series.push({
        id: 'OEDE_EXTRA_Z',
        area_id: 'A01',
        codigo_rama: 'Z',
        nombre_rama: 'Rama no autorizada',
        tipo_nivel: 'LETRA',
        letra_padre: null,
        periodo: '1° Trim 2026',
        anio: 2026,
        trimestre: 1,
        puestos_trabajo: 500,
        estado_dato: 'PUBLICADO',
        unidad: 'Puestos'
      });

      adapter.setAdapterOverrides({
        oede: {
          metadata: { fuente: 'OEDE', descripcion: 'OEDE Test' },
          series
        }
      });
      return adapter.getProvincialOverview();
    });

    // Con una categoría extra no autorizada, no se debe sumar ni descartar silenciosamente: debe ser null
    expect(result.oedeTotalPuestosRegistrados).toBeNull();
    expect(result.oedeDisponible).toBe(false);
    expect(result.oedeMotivoNoDisponible).toContain('categorías no autorizadas o inesperadas');
    expect(result.oedeMotivoNoDisponible).toContain('Z');
  });
});
