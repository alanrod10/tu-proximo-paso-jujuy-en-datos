import { Area, Correspondencia } from '../types';
import defaultAreas from '../../data/areas.json';
import defaultCorrespondencias from '../../data/correspondencias.json';
import defaultAlias from '../../data/alias.json';

export interface SearchMatch {
  area: Area;
  matchType: 'exact_name' | 'area_field' | 'official' | 'partial_observed' | 'no_applies' | 'alias';
  matchReason?: string;
  matchedTerm?: string;
}

export function normalizeString(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function searchAreas(
  query: string,
  areas: Area[] = defaultAreas as Area[],
  correspondencias: Correspondencia[] = defaultCorrespondencias as Correspondencia[],
  aliasData: { area_id: string; alias: string[] }[] = defaultAlias as { area_id: string; alias: string[] }[]
): SearchMatch[] {
  const normalizedSearch = normalizeString(query);
  if (!normalizedSearch) {
    return areas.map((area) => ({ area, matchType: 'area_field' }));
  }

  const results: SearchMatch[] = [];

  for (const area of areas) {
    const normNombre = normalizeString(area.nombre);
    const normDesc = normalizeString(area.descripcion);
    const normId = normalizeString(area.area_id);

    // 1. Coincidencia directa por nombre, código o descripción del área
    if (normNombre === normalizedSearch) {
      results.push({ area, matchType: 'exact_name' });
      continue;
    }
    if (normNombre.includes(normalizedSearch) || normDesc.includes(normalizedSearch) || normId.includes(normalizedSearch)) {
      results.push({ area, matchType: 'area_field' });
      continue;
    }

    // 2. Coincidencia por nomencladores y correspondencias oficiales (PBG / OEDE / EIL / MIP)
    const areaCorrs = correspondencias.filter((c) => c.area_id === area.area_id);
    const matchedCorr = areaCorrs.find((c) =>
      normalizeString(c.nombre_fuente).includes(normalizedSearch)
    );

    if (matchedCorr) {
      let matchType: SearchMatch['matchType'] = 'official';
      let reasonPrefix = 'Coincide con clasificación oficial';

      if (matchedCorr.tipo_correspondencia === 'NO_APLICA') {
        matchType = 'no_applies';
        reasonPrefix = 'Fuente no aplicable a esta área';
      } else if (matchedCorr.tipo_correspondencia === 'AGRUPADA') {
        matchType = 'official';
        reasonPrefix = 'Coincidencia por agrupación oficial';
      } else if (matchedCorr.tipo_correspondencia === 'PARCIAL' || matchedCorr.estado === 'OBSERVADO') {
        matchType = 'partial_observed';
        reasonPrefix = 'Coincidencia parcial/observada';
      }

      results.push({
        area,
        matchType,
        matchReason: `${reasonPrefix}: "${matchedCorr.nombre_fuente}"`,
        matchedTerm: matchedCorr.nombre_fuente,
      });
      continue;
    }

    // 3. Coincidencia por términos orientativos y alias cotidianos
    const areaAlias = aliasData.find((a) => a.area_id === area.area_id);
    if (areaAlias) {
      const matchedAlias = areaAlias.alias.find((al) =>
        normalizeString(al).includes(normalizedSearch)
      );
      if (matchedAlias) {
        results.push({
          area,
          matchType: 'alias',
          matchReason: `Término orientativo relacionado: "${matchedAlias}"`,
          matchedTerm: matchedAlias,
        });
        continue;
      }
    }
  }

  return results;
}
