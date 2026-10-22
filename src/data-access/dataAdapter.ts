import {
  Area,
  AreaId,
  PBGDataset,
  OEDEDataset,
  EILDataset,
  MIPDataset
} from '../types';

import defaultAreas from '../../data/areas.json';
import defaultPbg from '../../data/pbg.json';
import defaultOede from '../../data/empleo_oede.json';
import defaultEil from '../../data/eil.json';
import defaultMip from '../../data/mip_empleo.json';

export interface AreaOverview {
  areaId: AreaId;
  nombre: string;
  descripcion: string;
  icono: string;
  pbg: {
    disponible: boolean;
    ultimoAnio: number | null;
    esProvisorio: boolean;
    valorConstanteMiles: number | null;
    valorCorrienteMiles: number | null;
    porcentajeProvincial: number | null;
    porcentajeProvincialConstante: number | null;
    porcentajeProvincialCorriente: number | null;
    motivoNoDisponible?: string;
  };
  oede: {
    disponible: boolean;
    ultimoPeriodo: string;
    puestosTrabajo: number | null;
    tieneSecretoEstadistico: boolean;
    esCompleto: boolean;
    motivoNoDisponible?: string;
  };
  eil: {
    disponible: boolean;
    esAgrupada: boolean;
    claveAgrupada?: string;
    ultimoPeriodo: string;
    motivoExclusion?: string;
  };
  mip: {
    disponible: boolean;
    anioBase: number;
    sectoresAsignados: number;
    multiplicadorTotalPromedio: number | null;
    empleoDirectoPromedio: number | null;
    empleoIndirectoPromedio: number | null;
  };
}

export interface ProvincialOverview {
  pbgTotalConstanteMiles: number | null;
  pbgTotalCorrienteMiles: number | null;
  pbgUltimoAnio: number | null;
  pbgEsProvisorio: boolean;
  pbgDisponible: boolean;
  pbgMotivoNoDisponible?: string;
  oedeTotalPuestosRegistrados: number | null;
  oedeUltimoPeriodo: string;
  oedeDisponible: boolean;
  oedeMotivoNoDisponible?: string;
}

export interface MIPStructuralOverview {
  anioBase: number;
  totalSectores: number;
  sectoresAsignados: number;
  sectoresSinAsignacionForzada: Array<{ id: number; nombre: string; motivo: string }>;
  advertenciaFundamental: string;
}

export interface EILMethodologyRules {
  cobertura: string;
  universo: string;
  exclusiones: string;
  reglas: string[];
}

export interface DataAdapterOverrides {
  areas?: Area[];
  pbg?: PBGDataset;
  oede?: OEDEDataset;
  eil?: EILDataset;
  mip?: MIPDataset;
}

// Cálculo cacheado en memoria para evitar recomputar en cada render
let cachedOverviews: Map<AreaId, AreaOverview> | null = null;
let cachedProvincial: ProvincialOverview | null = null;
let cachedMipStructure: MIPStructuralOverview | null = null;
let cachedEilRules: EILMethodologyRules | null = null;
let activeOverrides: DataAdapterOverrides | null = null;

export function resetAdapterCache(): void {
  cachedOverviews = null;
  cachedProvincial = null;
  cachedMipStructure = null;
  cachedEilRules = null;
}

export function setAdapterOverrides(overrides: DataAdapterOverrides | null): void {
  activeOverrides = overrides;
  resetAdapterCache();
}

function computeData() {
  const areas = activeOverrides?.areas ?? (defaultAreas as Area[]);
  const pbg = activeOverrides?.pbg ?? (defaultPbg as PBGDataset);
  const oede = activeOverrides?.oede ?? (defaultOede as OEDEDataset);
  const eil = activeOverrides?.eil ?? (defaultEil as EILDataset);
  const mip = activeOverrides?.mip ?? (defaultMip as MIPDataset);

  // 1. PBG Provincial Total
  const pbgYears = Array.from(new Set(pbg.series.map(r => r.periodo_anio))).filter(
    (y): y is number => typeof y === 'number' && !isNaN(y)
  );
  const latestPbgYear = pbgYears.length > 0 ? Math.max(...pbgYears) : null;

  const latestPbgRecord = latestPbgYear !== null
    ? pbg.series.find(r => r.codigo_rama === 'TOTAL' && r.periodo_anio === latestPbgYear)
    : null;

  // Rigor estadístico: obtener exclusivamente de la fuente sin números de respaldo artificiales
  const totalProvincialPbgConstante = latestPbgRecord?.valor_constante ?? null;
  const totalProvincialPbgCorriente = latestPbgRecord?.valor_corriente ?? null;
  const isPbgProvisorio = latestPbgRecord?.es_provisorio ?? (
    latestPbgYear !== null ? (pbg.metadata?.anios_provisorios?.includes(latestPbgYear) ?? true) : false
  );
  const isPbgAvailable = totalProvincialPbgConstante !== null || totalProvincialPbgCorriente !== null;

  // 2. OEDE Provincial Total
  const oedePeriods = Array.from(new Set(oede.series.map(r => r.periodo))).filter(Boolean);
  const latestOedePeriod = oedePeriods.length > 0 ? oedePeriods[oedePeriods.length - 1] : '';

  // En OEDE, el registro oficial de nivel TOTAL define el total provincial
  const officialOedeTotalRecord = latestOedePeriod
    ? oede.series.find(r => r.tipo_nivel === 'TOTAL' && r.periodo === latestOedePeriod)
    : null;

  let totalOedePuestos: number | null = null;
  let oedeDisponible = false;
  let oedeMotivoNoDisponible: string | undefined;

  if (officialOedeTotalRecord && officialOedeTotalRecord.puestos_trabajo !== null && officialOedeTotalRecord.estado_dato === 'PUBLICADO') {
    totalOedePuestos = officialOedeTotalRecord.puestos_trabajo;
    oedeDisponible = true;
  } else if (officialOedeTotalRecord && officialOedeTotalRecord.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO') {
    totalOedePuestos = null;
    oedeDisponible = false;
    oedeMotivoNoDisponible = 'El total provincial se encuentra bajo secreto estadístico oficial.';
  } else {
    // Si no existe un registro directo de nivel TOTAL, verificar si las letras permiten computar una suma completa
    const latestLetterRecords = latestOedePeriod
      ? oede.series.filter(r => r.tipo_nivel === 'LETRA' && r.periodo === latestOedePeriod)
      : [];

    const hasSecret = latestLetterRecords.some(r => r.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO');
    const hasMissing = latestLetterRecords.some(r => r.puestos_trabajo === null && r.estado_dato !== 'SIN_DATO_SECRETO_ESTADISTICO');

    if (latestLetterRecords.length > 0 && !hasSecret && !hasMissing) {
      totalOedePuestos = latestLetterRecords.reduce((acc, r) => acc + (r.puestos_trabajo ?? 0), 0);
      oedeDisponible = true;
    } else {
      totalOedePuestos = null;
      oedeDisponible = false;
      oedeMotivoNoDisponible = hasSecret
        ? 'No es posible determinar el total provincial porque contiene ramas protegidas por secreto estadístico (Ley 17.622).'
        : 'Datos oficiales insuficientes para computar el total de empleo registrado provincial.';
    }
  }

  cachedProvincial = {
    pbgTotalConstanteMiles: totalProvincialPbgConstante,
    pbgTotalCorrienteMiles: totalProvincialPbgCorriente,
    pbgUltimoAnio: latestPbgYear,
    pbgEsProvisorio: isPbgProvisorio,
    pbgDisponible: isPbgAvailable,
    pbgMotivoNoDisponible: isPbgAvailable ? undefined : 'No se registran datos oficiales de PBG para el período.',
    oedeTotalPuestosRegistrados: totalOedePuestos,
    oedeUltimoPeriodo: latestOedePeriod,
    oedeDisponible,
    oedeMotivoNoDisponible,
  };

  // 3. Estructura MIP global
  const unassignedSectors = mip.sectores
    .filter(s => s.area_id === null)
    .map(s => ({
      id: s.sector_mip_id,
      nombre: s.nombre_sector,
      motivo: s.estado_dato === 'EXCLUIDO_EN_FUENTE'
        ? 'Excluido en la fuente oficial por limitaciones metodológicas'
        : 'Sector residual/transversal sin asignación forzada a un área única'
    }));

  cachedMipStructure = {
    anioBase: mip.metadata.anio_base,
    totalSectores: mip.metadata.total_sectores,
    sectoresAsignados: mip.metadata.sectores_asignados_a_areas,
    sectoresSinAsignacionForzada: unassignedSectors,
    advertenciaFundamental: mip.metadata.advertencia_fundamental,
  };

  // 4. Reglas metodológicas EIL
  cachedEilRules = {
    cobertura: eil.metadata.cobertura,
    universo: eil.metadata.universo,
    exclusiones: eil.metadata.exclusiones,
    reglas: eil.metadata.reglas,
  };

  // 5. Resúmenes por Área
  const map = new Map<AreaId, AreaOverview>();

  for (const area of areas) {
    const areaId = area.area_id;

    // PBG para el área
    const areaPbgRecords = latestPbgYear !== null
      ? pbg.series.filter(r => r.area_id === areaId && r.periodo_anio === latestPbgYear)
      : [];

    const hasConstante = areaPbgRecords.some(r => r.valor_constante !== null && r.valor_constante !== undefined);
    const hasCorriente = areaPbgRecords.some(r => r.valor_corriente !== null && r.valor_corriente !== undefined);

    const areaValConstante = hasConstante
      ? areaPbgRecords.reduce((acc, r) => acc + (r.valor_constante ?? 0), 0)
      : null;
    const areaValCorriente = hasCorriente
      ? areaPbgRecords.reduce((acc, r) => acc + (r.valor_corriente ?? 0), 0)
      : null;

    const pbgPctConstante = (areaValConstante !== null && totalProvincialPbgConstante !== null && totalProvincialPbgConstante > 0)
      ? Number(((areaValConstante / totalProvincialPbgConstante) * 100).toFixed(2))
      : null;

    const pbgPctCorriente = (areaValCorriente !== null && totalProvincialPbgCorriente !== null && totalProvincialPbgCorriente > 0)
      ? Number(((areaValCorriente / totalProvincialPbgCorriente) * 100).toFixed(2))
      : null;

    const isAreaPbgAvailable = hasConstante || hasCorriente;

    // OEDE para el área
    const isOedeAvailable = areaId !== 'A10';
    let areaPuestos: number | null = null;
    let hasSecret = false;
    let isComplete = true;
    let oedeReason: string | undefined;

    if (isOedeAvailable && latestOedePeriod) {
      const areaLetters = oede.series.filter(
        r => r.area_id === areaId && r.tipo_nivel === 'LETRA' && r.periodo === latestOedePeriod
      );

      hasSecret = areaLetters.some(r => r.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO');
      const allNull = areaLetters.length === 0 || areaLetters.every(r => r.puestos_trabajo === null);

      if (areaLetters.length === 0) {
        areaPuestos = null;
        oedeReason = 'No se registran ramas de empleo privado para esta actividad en el período seleccionado.';
      } else if (allNull) {
        areaPuestos = null;
        oedeReason = hasSecret
          ? 'Dato bajo secreto estadístico oficial (Ley 17.622).'
          : 'Dato no disponible en la serie oficial.';
      } else if (hasSecret) {
        // Suma solo las ramas publicadas conocidas, pero marca que no es completo para evitar engaños
        const validRamas = areaLetters.filter(r => r.puestos_trabajo !== null);
        areaPuestos = validRamas.reduce((acc, r) => acc + (r.puestos_trabajo ?? 0), 0);
        isComplete = false;
        oedeReason = 'Dato parcial: incluye ramas protegidas por secreto estadístico (Ley 17.622).';
      } else {
        areaPuestos = areaLetters.reduce((acc, r) => acc + (r.puestos_trabajo ?? 0), 0);
        isComplete = true;
      }
    } else {
      areaPuestos = null; // Rigor: A10 NUNCA es cero
      oedeReason = 'La administración pública (rama L) no se releva en la serie OEDE Jujuy.';
    }

    // EIL para el área
    const isEilPrimary = ['A01', 'A02'].includes(areaId);
    const isEilPublic = areaId === 'A10';
    const isEilAgrupada = ['A06', 'A07'].includes(areaId);
    const isEilAvailable = !isEilPrimary && !isEilPublic;

    let eilReason: string | undefined;
    if (isEilPrimary) {
      eilReason = 'El relevamiento de EIL en aglomerados urbanos excluye actividades del sector primario (agro y minería).';
    } else if (isEilPublic) {
      eilReason = 'EIL releva exclusivamente empresas del sector privado formal (excluye administración pública).';
    }

    const eilKey = isEilAgrupada ? 'A06_A07_AGRUPADA' : areaId;
    const eilRecords = eil.tabla_3_9_2_evolucion_y_ramas.filter(r => r.area_id === eilKey);
    const eilPeriods = Array.from(new Set(eilRecords.map(r => r.periodo)));
    const latestEilPeriod = eilPeriods.length > 0 ? eilPeriods[eilPeriods.length - 1] : '';

    // MIP para el área
    const areaMipSectors = mip.sectores.filter(s => s.area_id === areaId);
    const validMultipliers = areaMipSectors.filter(s => s.multiplicador_total_coef !== null && s.estado_dato !== 'EXCLUIDO_EN_FUENTE');
    const multAvg = validMultipliers.length > 0
      ? validMultipliers.reduce((acc, s) => acc + (s.multiplicador_total_coef || 0), 0) / validMultipliers.length
      : null;
    const directAvg = validMultipliers.length > 0
      ? validMultipliers.reduce((acc, s) => acc + (s.empleo_directo_por_millon || 0), 0) / validMultipliers.length
      : null;
    const indirectAvg = validMultipliers.length > 0
      ? validMultipliers.reduce((acc, s) => acc + (s.empleo_indirecto_por_millon || 0), 0) / validMultipliers.length
      : null;

    map.set(areaId, {
      areaId,
      nombre: area.nombre,
      descripcion: area.descripcion,
      icono: area.icono,
      pbg: {
        disponible: isAreaPbgAvailable,
        ultimoAnio: latestPbgYear,
        esProvisorio: isPbgProvisorio,
        valorConstanteMiles: areaValConstante,
        valorCorrienteMiles: areaValCorriente,
        porcentajeProvincial: pbgPctConstante,
        porcentajeProvincialConstante: pbgPctConstante,
        porcentajeProvincialCorriente: pbgPctCorriente,
        motivoNoDisponible: isAreaPbgAvailable ? undefined : 'No se registran datos oficiales de PBG para esta actividad.',
      },
      oede: {
        disponible: isOedeAvailable && areaPuestos !== null,
        ultimoPeriodo: latestOedePeriod,
        puestosTrabajo: areaPuestos,
        tieneSecretoEstadistico: hasSecret,
        esCompleto: isComplete,
        motivoNoDisponible: oedeReason,
      },
      eil: {
        disponible: isEilAvailable,
        esAgrupada: isEilAgrupada,
        claveAgrupada: isEilAgrupada ? 'A06_A07_AGRUPADA' : undefined,
        ultimoPeriodo: latestEilPeriod,
        motivoExclusion: eilReason,
      },
      mip: {
        disponible: areaMipSectors.length > 0,
        anioBase: mip.metadata.anio_base,
        sectoresAsignados: areaMipSectors.length,
        multiplicadorTotalPromedio: multAvg !== null ? Number(multAvg.toFixed(2)) : null,
        empleoDirectoPromedio: directAvg !== null ? Number(directAvg.toFixed(2)) : null,
        empleoIndirectoPromedio: indirectAvg !== null ? Number(indirectAvg.toFixed(2)) : null,
      },
    });
  }

  cachedOverviews = map;
}

export function getAreaOverview(areaId: AreaId): AreaOverview | undefined {
  if (!cachedOverviews) computeData();
  return cachedOverviews?.get(areaId);
}

export function getAllAreasOverview(): AreaOverview[] {
  if (!cachedOverviews) computeData();
  return Array.from(cachedOverviews?.values() || []);
}

export function getProvincialOverview(): ProvincialOverview {
  if (!cachedProvincial) computeData();
  return cachedProvincial!;
}

export function getMIPStructuralOverview(): MIPStructuralOverview {
  if (!cachedMipStructure) computeData();
  return cachedMipStructure!;
}

export function getEILMethodologyRules(): EILMethodologyRules {
  if (!cachedEilRules) computeData();
  return cachedEilRules!;
}
