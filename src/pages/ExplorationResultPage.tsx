import React, { useState } from 'react';
import { Area, AreaId, PreferenciasExploracion } from '../types';
import { AreaIcon } from '../utils/iconHelper';
import { HumanDataCards } from '../components/HumanDataCards';
import { 
  RotateCcw, 
  Layers, 
  ArrowRight,
  Compass
} from 'lucide-react';

interface ExplorationResultPageProps {
  preferences: PreferenciasExploracion;
  areas: Area[];
  onSelectArea: (areaId: AreaId) => void;
  onRestartWizard: () => void;
  onViewAllAreas: () => void;
  onViewTechnicalDetails: (areaId: AreaId, tab?: 'pbg' | 'oede' | 'eil' | 'mip') => void;
  onViewMethodology: () => void;
}

export const ExplorationResultPage: React.FC<ExplorationResultPageProps> = ({
  preferences,
  areas,
  onSelectArea,
  onRestartWizard,
  onViewAllAreas,
  onViewTechnicalDetails,
  onViewMethodology,
}) => {
  // Área activa que se está viendo
  const initialAreaId = preferences.areasSeleccionadas[0] || 'A01';
  const [activeAreaId, setActiveAreaId] = useState<AreaId>(initialAreaId);

  const activeArea = areas.find((a) => a.area_id === activeAreaId) || areas[0];

  // Áreas seleccionadas por el usuario
  const userSelectedAreas = areas.filter((a) =>
    preferences.areasSeleccionadas.includes(a.area_id)
  );

  // Frase contextual dinámica y natural
  const getContextPhrase = () => {
    const tareaLabel = preferences.tipoTarea && preferences.tipoTarea !== 'indefinido' && preferences.tipoTarea !== 'varias'
      ? `tareas de tipo ${preferences.tipoTarea}`
      : null;

    if (userSelectedAreas.length === 1) {
      return (
        <span>
          Elegiste explorar <strong>{userSelectedAreas[0].nombre}</strong>
          {tareaLabel ? `, con interés en ${tareaLabel}` : ''}.
        </span>
      );
    }
    if (userSelectedAreas.length === 2) {
      return (
        <span>
          Elegiste comparar <strong>{userSelectedAreas[0].nombre}</strong> y{' '}
          <strong>{userSelectedAreas[1].nombre}</strong>
          {tareaLabel ? `, con interés en ${tareaLabel}` : ''}.
        </span>
      );
    }
    return (
      <span>
        Estás explorando el panorama general de las 12 actividades económicas de Jujuy.
      </span>
    );
  };

  return (
    <div className="space-y-10 py-6 sm:py-8 max-w-4xl mx-auto">
      {/* ======================================================================= */}
      {/* ENCABEZADO CONTEXTUAL VISUAL                                           */}
      {/* ======================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-400/30">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>Tu Exploración Personalizada</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRestartWizard}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cambiar elecciones</span>
            </button>
            <button
              onClick={onViewAllAreas}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ver las 12 áreas</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Tu exploración de Jujuy
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            {getContextPhrase()}
          </p>
        </div>

        {/* Pestañas interactivas si el usuario seleccionó 2 áreas */}
        {userSelectedAreas.length > 1 && (
          <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Área en pantalla:</span>
            {userSelectedAreas.map((a) => {
              const isCurrent = a.area_id === activeAreaId;
              return (
                <button
                  key={a.area_id}
                  onClick={() => {
                    setActiveAreaId(a.area_id);
                    onSelectArea(a.area_id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-brand-500 text-white shadow-md ring-2 ring-brand-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <AreaIcon name={a.icono} size={15} />
                  <span>{a.nombre}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* TARJETA DESTACADA DEL ÁREA SELECCIONADA                                 */}
      {/* ======================================================================= */}
      <div className="flex items-start gap-4 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0 border border-brand-100 shadow-2xs">
          <AreaIcon name={activeArea.icono} size={28} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-800">
              {activeArea.area_id}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Área Seleccionada
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {activeArea.nombre}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            {activeArea.descripcion}
          </p>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* TARJETAS VISUALES DE DATOS (NIVEL 1)                                    */}
      {/* ======================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-black text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Nivel 1 · Resumen Visual
          </span>
          <span className="text-xs text-slate-500 font-medium">
            DiPEC · OEDE · EIL · MIP
          </span>
        </div>

        <HumanDataCards
          area={activeArea}
          tipoTareaInteres={preferences.tipoTarea}
          onViewTechnicalDetails={(tab) => onViewTechnicalDetails(activeArea.area_id, tab)}
        />
      </div>

      {/* ======================================================================= */}
      {/* ACCESO A NIVEL 2: DATOS TÉCNICOS DETALLADOS                             */}
      {/* ======================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-4 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-brand-400 uppercase tracking-wider block mb-1">
              Nivel 2 · Para profundizar en el stand
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              ¿Querés ver las tablas estadísticas completas?
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Consultá las series continuas de 21 años del PBG, los más de 120 trimestres del OEDE y los multiplicadores de la MIP Jujuy con trazabilidad completa.
            </p>
          </div>

          <button
            onClick={() => onViewTechnicalDetails(activeArea.area_id)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm transition-all whitespace-nowrap shadow-md hover:scale-102 active:scale-98"
          >
            <span>Ver ficha técnica completa</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>Toda cifra cuenta con fuente oficial auditada y trazabilidad metodológica.</span>
          <button
            onClick={onViewMethodology}
            className="text-brand-300 hover:underline font-bold"
          >
            Consultar las 4 fuentes oficiales y metodología ➔
          </button>
        </div>
      </div>
    </div>
  );
};
