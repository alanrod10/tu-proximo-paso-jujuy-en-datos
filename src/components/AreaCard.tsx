import React from 'react';
import { Area, AreaId } from '../types';
import { AreaIcon } from '../utils/iconHelper';
import { ArrowRight, CheckCircle2, MinusCircle } from 'lucide-react';

interface AreaCardProps {
  area: Area;
  onSelect: (areaId: AreaId) => void;
}

export const AreaCard: React.FC<AreaCardProps> = ({ area, onSelect }) => {
  // Disponibilidad de fuentes según validación física y reglas metodológicas
  const hasPBG = true; // Todas las 12 tienen PBG
  const hasOEDE = area.area_id !== 'A10'; // A10 no tiene serie en OEDE Jujuy
  const hasEIL = !['A01', 'A02', 'A10'].includes(area.area_id); // A01, A02 primarias excluidas; A10 sector público excluido
  const hasMIP = true; // Todas las 12 tienen sectores en MIP

  return (
    <div
      onClick={() => onSelect(area.area_id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(area.area_id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Explorar área ${area.area_id}: ${area.nombre}`}
      className="group bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-brand-400 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
    >
      <div>
        {/* Header con Código e Icono */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-brand-50 group-hover:text-brand-800 transition-colors">
            {area.area_id}
          </span>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all shadow-2xs group-hover:scale-105">
            <AreaIcon name={area.icono} size={22} />
          </div>
        </div>

        {/* Nombre y Descripción */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-700 transition-colors mb-2 leading-snug">
          {area.nombre}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-5">
          {area.descripcion}
        </p>
      </div>

      <div>
        {/* Badges de Fuentes Oficiales Disponibles */}
        <div className="pt-4 border-t border-slate-100 mb-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Disponibilidad en Fuentes:
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold ${
              hasPBG ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-slate-100 text-slate-400'
            }`}>
              {hasPBG ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <MinusCircle className="w-3 h-3" />}
              PBG (DiPEC)
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold ${
              hasOEDE ? 'bg-blue-50 text-blue-800 border border-blue-100' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {hasOEDE ? <CheckCircle2 className="w-3 h-3 text-blue-600" /> : <MinusCircle className="w-3 h-3 text-amber-500" />}
              {hasOEDE ? 'OEDE (SIPA)' : 'OEDE (No disp.)'}
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold ${
              hasEIL ? 'bg-purple-50 text-purple-800 border border-purple-100' : 'bg-slate-100 text-slate-500'
            }`}>
              {hasEIL ? <CheckCircle2 className="w-3 h-3 text-purple-600" /> : <MinusCircle className="w-3 h-3" />}
              {hasEIL ? 'EIL (Gran Juy)' : 'EIL (Excluido)'}
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold ${
              hasMIP ? 'bg-indigo-50 text-indigo-800 border border-indigo-100' : 'bg-slate-100 text-slate-400'
            }`}>
              {hasMIP ? <CheckCircle2 className="w-3 h-3 text-indigo-600" /> : <MinusCircle className="w-3 h-3" />}
              MIP (Base 2015)
            </span>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="flex items-center justify-between pt-2 text-xs font-bold text-brand-600 group-hover:text-brand-800">
          <span>Explorar indicadores</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
