import React, { useState } from 'react';
import { Area, AreaId } from '../types';
import { AreaCard } from '../components/AreaCard';
import { Search, Info, HelpCircle, X } from 'lucide-react';

import defaultCorrespondencias from '../../data/correspondencias.json';

import defaultAlias from '../../data/alias.json';

import { Correspondencia } from '../types';


const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};


interface AreasExplorerPageProps {
  areas: Area[];
  onSelectArea: (areaId: AreaId) => void;
}

interface AreaWithMatch extends Area {
  matchReason?: string;
}

export const AreasExplorerPage: React.FC<AreasExplorerPageProps> = ({ areas, onSelectArea }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Helper para normalizar
  const normalizedSearch = normalizeString(searchTerm.trim());
  const correspondencias = defaultCorrespondencias as Correspondencia[];
  const aliasData = defaultAlias as { area_id: string; alias: string[] }[];

  const filteredAreas = areas.reduce<AreaWithMatch[]>((acc, area) => {
    if (!normalizedSearch) {
      acc.push(area);
      return acc;
    }

    // 1. Check basic area fields
    const matchArea =
      normalizeString(area.nombre).includes(normalizedSearch) ||
      normalizeString(area.descripcion).includes(normalizedSearch) ||
      normalizeString(area.area_id).includes(normalizedSearch);

    if (matchArea) {
      acc.push(area);
      return acc;
    }

    // 2. Check correspondencias
    const areaCorrs = correspondencias.filter(c => c.area_id === area.area_id);
    const matchedCorr = areaCorrs.find(c =>
      normalizeString(c.nombre_fuente).includes(normalizedSearch)
    );

    if (matchedCorr) {
      let reasonPrefix = '';
      if (matchedCorr.tipo_correspondencia === 'NO_APLICA') {
        reasonPrefix = 'Fuente no aplicable a esta área';
      } else if (matchedCorr.tipo_correspondencia === 'AGRUPADA') {
        reasonPrefix = 'Coincidencia por agrupación oficial';
      } else if (matchedCorr.tipo_correspondencia === 'PARCIAL' || matchedCorr.estado === 'OBSERVADO') {
        reasonPrefix = 'Coincidencia parcial/observada';
      } else {
        reasonPrefix = 'Coincide con clasificación oficial';
      }
      acc.push({ ...area, matchReason: `${reasonPrefix}: "${matchedCorr.nombre_fuente}"` });
      return acc;
    }

    // 3. Check alias explícitos
    const areaAlias = aliasData.find(a => a.area_id === area.area_id);
    if (areaAlias) {
      const matchedAlias = areaAlias.alias.find(al =>
        normalizeString(al).includes(normalizedSearch)
      );
      if (matchedAlias) {
         acc.push({ ...area, matchReason: `Término orientativo relacionado: "${matchedAlias}"` });
         return acc;
      }
    }

    return acc;
  }, []);

  return (
    <div className="space-y-8 py-6">
      {/* Header de la sección */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
              <Info className="w-3.5 h-3.5" />
              <span>Clasificación Conceptual del Proyecto (12 Áreas)</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Explorador de Áreas de Jujuy
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Seleccioná un área para consultar sus indicadores oficiales en PBG, OEDE, EIL y la Matriz Insumo-Producto.
            </p>
          </div>

          {/* Buscador accesible con botón de limpiar y contador */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative min-w-[260px] sm:min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por área o actividad..."
                className="w-full pl-9 pr-9 py-2 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-2xs"
                aria-label="Buscar área por nombre o descripción"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-xs font-medium text-slate-500 whitespace-nowrap bg-slate-100 px-3 py-2 rounded-xl border border-slate-200/80">
              Mostrando <span className="font-bold text-slate-800">{filteredAreas.length}</span> de <span className="font-bold text-slate-800">{areas.length}</span> áreas
            </div>
          </div>
        </div>

        {/* Nota sobre la naturaleza de area_id */}
        <div className="mt-4 p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Aclaración metodológica:</strong> Los identificadores <code>A01</code> a <code>A12</code> constituyen una clasificación conceptual propia del proyecto para ordenar la exploración y <strong>no son códigos oficiales</strong> de DiPEC, OEDE ni MTEySS. Las áreas se presentan en su orden lógico de A01 a A12, sin ningún ranking de desempeño ni ordenamiento por tamaño.
          </span>
        </div>
      </div>

      {/* Grilla de las 12 Áreas */}
      {filteredAreas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAreas.map((area) => (
            <div key={area.area_id} className="relative">
              <AreaCard area={area} onSelect={onSelectArea} />
              {area.matchReason && (
                 <div className="absolute -top-3 left-4 bg-brand-100 text-brand-800 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-brand-200 z-10">
                    {area.matchReason}
                 </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-600 font-medium mb-2">No se encontraron áreas que coincidan con la búsqueda.</p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-brand-600 font-semibold hover:underline"
          >
            Restablecer búsqueda
          </button>
        </div>
      )}
    </div>
  );
};
