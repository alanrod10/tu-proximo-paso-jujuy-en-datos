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
    ultimoAnio: number;
    esProvisorio: boolean;
    valorConstanteMiles: number;
    valorCorrienteMiles: number;
    porcentajeProvincial: number;
  };
  oede: {
    disponible: boolean;
    ultimoPeriodo: string;
    puestosTrabajo: number | null;
    tieneSecretoEstadistico: boolean;
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
  pbgTotalConstanteMiles: number;
  pbgTotalCorrienteMiles: number;
  pbgUltimoAnio: number;
  pbgEsProvisorio: boolean;
  oedeTotalPuestosRegistrados: number;
  oedeUltimoPeriodo: string;
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

// Cálculo cacheado en memoria para evitar recomputar en cada render
let cachedOverviews: Map<AreaId, AreaOverview> | null = null;
let cachedProvincial: ProvincialOverview | null = null;
let cachedMipStructure: MIPStructuralOverview | null = null;
let cachedEilRules: EILMethodologyRules | null = null;

function computeData() {
  const areas = defaultAreas as Area[];
  const pbg = defaultPbg as PBGDataset;
  const oede = defaultOede as OEDEDataset;
  const eil = defaultEil as EILDataset;
  const mip = defaultMip as MIPDataset;

  // 1. PBG Provincial Total
  const latestPbgYear = Math.max(...pbg.series.map(r => r.periodo_anio));
  const totalProvincialPbgConstante = pbg.series
    .find(r => r.codigo_rama === 'TOTAL' && r.periodo_anio === latestPbgYear)?.valor_constante || 6471196;
  const totalProvincialPbgCorriente = pbg.series
    .find(r => r.codigo_rama === 'TOTAL' && r.periodo_anio === latestPbgYear)?.valor_corriente || 5483568000;
  const isPbgProvisorio = pbg.metadata.anios_provisorios?.includes(latestPbgYear) ?? true;

  // 2. OEDE Provincial Total
  const oedePeriods = Array.from(new Set(oede.series.map(r => r.periodo)));
  const latestOedePeriod = oedePeriods.length > 0 ? oedePeriods[oedePeriods.length - 1] : '1° Trim 2026';

  // En OEDE, los puestos de nivel LETRA del último periodo suman el total registrado privado
  const latestLetterRecords = oede.series.filter(
    r => r.tipo_nivel === 'LETRA' && r.periodo === latestOedePeriod
  );
  const totalOedePuestos = latestLetterRecords.reduce((acc, r) => acc + (r.puestos_trabajo || 0), 0);

  cachedProvincial = {
    pbgTotalConstanteMiles: totalProvincialPbgConstante,
    pbgTotalCorrienteMiles: totalProvincialPbgCorriente,
    pbgUltimoAnio: latestPbgYear,
    pbgEsProvisorio: isPbgProvisorio,
    oedeTotalPuestosRegistrados: totalOedePuestos > 0 ? totalOedePuestos : 63017,
    oedeUltimoPeriodo: latestOedePeriod,
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
    const areaPbgRecords = pbg.series.filter(r => r.area_id === areaId && r.periodo_anio === latestPbgYear);
    const areaValConstante = areaPbgRecords.reduce((acc, r) => acc + (r.valor_constante || 0), 0);
    const areaValCorriente = areaPbgRecords.reduce((acc, r) => acc + (r.valor_corriente || 0), 0);
    const pbgPct = totalProvincialPbgConstante > 0 ? (areaValConstante / totalProvincialPbgConstante) * 100 : 0;

    // OEDE para el área
    const isOedeAvailable = areaId !== 'A10';
    let areaPuestos: number | null = null;
    let hasSecret = false;
    let oedeReason: string | undefined;

    if (isOedeAvailable) {
      const areaLetters = oede.series.filter(
        r => r.area_id === areaId && r.tipo_nivel === 'LETRA' && r.periodo === latestOedePeriod
      );

      const allNull = areaLetters.length > 0 && areaLetters.every(r => r.puestos_trabajo === null);
      if (allNull) {
        areaPuestos = null;
      } else {
        areaPuestos = areaLetters.reduce((acc, r) => acc + (r.puestos_trabajo || 0), 0);
      }
      hasSecret = areaLetters.some(r => r.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO');
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
        disponible: true,
        ultimoAnio: latestPbgYear,
        esProvisorio: isPbgProvisorio,
        valorConstanteMiles: areaValConstante,
        valorCorrienteMiles: areaValCorriente,
        porcentajeProvincial: Number(pbgPct.toFixed(2)),
      },
      oede: {
        disponible: isOedeAvailable,
        ultimoPeriodo: latestOedePeriod,
        puestosTrabajo: areaPuestos,
        tieneSecretoEstadistico: hasSecret,
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
