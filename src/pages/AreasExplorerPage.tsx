import React, { useState } from 'react';
import { Area, AreaId } from '../types';
import { AreaCard } from '../components/AreaCard';
import { AreaComparator } from '../components/AreaComparator';
import { Search, Info, HelpCircle, X, Layers, Scale } from 'lucide-react';
import { searchAreas } from '../utils/searchEngine';

interface AreasExplorerPageProps {
  areas: Area[];
  onSelectArea: (areaId: AreaId) => void;
  initialMode?: 'catalogo' | 'comparador';
  initialCompareAreas?: [AreaId, AreaId];
}

interface AreaWithMatch extends Area {
  matchReason?: string;
}

export const AreasExplorerPage: React.FC<AreasExplorerPageProps> = ({
  areas,
  onSelectArea,
  initialMode = 'catalogo',
  initialCompareAreas = ['A01', 'A03'],
}) => {
  const [viewMode, setViewMode] = useState<'catalogo' | 'comparador'>(initialMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [compareAreas, setCompareAreas] = useState<[AreaId, AreaId]>(initialCompareAreas);

  const searchResults = searchAreas(searchTerm, areas);
  const filteredAreas: AreaWithMatch[] = searchResults.map(r => ({
    ...r.area,
    matchReason: r.matchReason,
  }));

  const handleStartComparisonWith = (areaId: AreaId) => {
    // Si ya está seleccionada como primera, comparar con otra, sino ponerla como primera
    const secondArea = areaId === 'A01' ? 'A03' : 'A01';
    setCompareAreas([areaId, secondArea]);
    setViewMode('comparador');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header de la sección */}
      <div className="border-b border-slate-200 pb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
              <Info className="w-3.5 h-3.5" />
              <span>Clasificación Conceptual del Proyecto (12 Áreas)</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {viewMode === 'catalogo' ? 'Explorador de Áreas de Jujuy' : 'Comparador de Áreas de Jujuy'}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              {viewMode === 'catalogo'
                ? 'Seleccioná un área para consultar sus indicadores oficiales en PBG, OEDE, EIL y la Matriz Insumo-Producto.'
                : 'Compará dos actividades en paralelo respetando estrictamente la comparabilidad estadística de cada fuente.'}
            </p>
          </div>

          {/* Selector de Modo: Catálogo vs Comparador */}
          <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl border border-slate-300/70 self-start md:self-center shadow-2xs">
            <button
              onClick={() => setViewMode('catalogo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                viewMode === 'catalogo'
                  ? 'bg-white text-brand-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-pressed={viewMode === 'catalogo'}
            >
              <Layers className="w-4 h-4" />
              <span>Catálogo (12 Áreas)</span>
            </button>
            <button
              onClick={() => setViewMode('comparador')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                viewMode === 'comparador'
                  ? 'bg-white text-brand-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-pressed={viewMode === 'comparador'}
            >
              <Scale className="w-4 h-4" />
              <span>Modo Comparador (2 Áreas)</span>
            </button>
          </div>
        </div>

        {/* Barra de Búsqueda (solo en vista Catálogo) */}
        {viewMode === 'catalogo' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative min-w-[260px] sm:min-w-[320px]">
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
        )}

        {/* Nota sobre la naturaleza de area_id */}
        <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Aclaración metodológica:</strong> Los identificadores <code>A01</code> a <code>A12</code> constituyen una clasificación conceptual propia del proyecto para ordenar la exploración y <strong>no son códigos oficiales</strong> de DiPEC, OEDE ni MTEySS. Las áreas se presentan en su orden lógico de A01 a A12, sin ningún ranking de desempeño ni ordenamiento por tamaño.
          </span>
        </div>
      </div>

      {/* Renderizado condicional según Modo */}
      {viewMode === 'comparador' ? (
        <AreaComparator
          areas={areas}
          initialArea1Id={compareAreas[0]}
          initialArea2Id={compareAreas[1]}
          onSelectArea={onSelectArea}
        />
      ) : (
        /* Grilla de las 12 Áreas */
        filteredAreas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAreas.map((area) => (
              <div key={area.area_id} className="relative flex flex-col justify-between">
                <AreaCard area={area} onSelect={onSelectArea} />
                {area.matchReason && (
                  <div className="absolute -top-3 left-4 bg-brand-100 text-brand-800 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-brand-200 z-10">
                    {area.matchReason}
                  </div>
                )}
                {/* Botón rápido para comparar esta área */}
                <div className="mt-2 text-right">
                  <button
                    onClick={() => handleStartComparisonWith(area.area_id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-700 bg-white hover:bg-brand-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-brand-200 transition-colors shadow-2xs"
                    title={`Comparar ${area.nombre} con otra área`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Comparar en paralelo</span>
                  </button>
                </div>
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
        )
      )}
    </div>
  );
};
