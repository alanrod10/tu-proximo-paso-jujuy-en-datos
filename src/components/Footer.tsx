import React from 'react';
import { ShieldCheck, BookOpen, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Columna 1: Proyecto */}
          <div>
            <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500"></span>
              Tu Próximo Paso — Jujuy en Datos
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Aplicación web informativa diseñada para explorar la estructura económica, los puestos de trabajo registrados y las relaciones intersectoriales de la estructura productiva de la Provincia de Jujuy a partir de registros y relevamientos oficiales.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>IES N.º 11 — Proyecto Académico</span>
            </div>
          </div>

          {/* Columna 2: Principio No Prescriptivo */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Principio Informativo y No Prescriptivo
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Esta herramienta es un explorador de datos públicos. <strong>NO constituye un test vocacional, ni un sistema de recomendación ni un predictor laboral.</strong> No genera puntuaciones de compatibilidad ni rankings de carreras o sectores. El objetivo es brindar información estadística contextualizada para que cada persona interprete y decida libremente.
            </p>
          </div>

          {/* Columna 3: Fuentes Oficiales Auditadas */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Fuentes Oficiales Utilizadas
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li><strong className="text-slate-200">PBG:</strong> Dirección Provincial de Estadística y Censos (DiPEC) — Serie 2004–2024.</li>
              <li><strong className="text-slate-200">OEDE:</strong> Observatorio de Empleo y Dinámica Empresarial / SIPA — 1996–2026.</li>
              <li><strong className="text-slate-200">EIL:</strong> Encuesta de Indicadores Laborales (Gran Jujuy) — MTEySS.</li>
              <li><strong className="text-slate-200">MIP:</strong> Matriz Insumo-Producto Jujuy (Año base 2015) — DiPEC / CEP XXI.</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Tu Próximo Paso — Jujuy en Datos. Implementación académica IES N.º 11.</p>
          <p className="text-slate-400">Exactitud metodológica sobre apariencia • Trazabilidad sobre inferencia</p>
        </div>
      </div>
    </footer>
  );
};
