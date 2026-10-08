import React, { useState } from 'react';
import { EILDataset } from '../types';
import { formatNumber } from '../utils/formatters';
import { Users, Search, AlertCircle, Calendar } from 'lucide-react';
import defaultEil from '../../data/eil.json';

interface EilTransversalPageProps {
  eilData?: EILDataset;
}

export const EilTransversalPage: React.FC<EilTransversalPageProps> = ({ eilData = defaultEil as EILDataset }) => {
  const [activeSubTab, setActiveSubTab] = useState<'calificacion' | 'demanda'>('calificacion');

  // Obtener meses disponibles de la tabla 3.9.6 y 3.9.8
  const periods396 = Array.from(new Set(eilData.tabla_3_9_6_calificacion_tarea.map((r) => r.periodo))).sort();
  const periods398 = Array.from(new Set(eilData.tabla_3_9_8_demanda_laboral.map((r) => r.periodo))).sort();
  
  const latestMonth396 = periods396.length > 0 ? periods396[periods396.length - 1] : '';
  const latestMonth398 = periods398.length > 0 ? periods398[periods398.length - 1] : '';

  const [selectedMonth396, setSelectedMonth396] = useState(latestMonth396);
  const [selectedMonth398, setSelectedMonth398] = useState(latestMonth398);

  // Filtrar registros para el mes seleccionado
  const recs396 = eilData.tabla_3_9_6_calificacion_tarea.filter((r) => r.periodo === selectedMonth396);
  const recs398 = eilData.tabla_3_9_8_demanda_laboral.filter((r) => r.periodo === selectedMonth398);

  const califCategories = ['Total', 'Profesional', 'Técnica', 'Operativa', 'No Calificada'];

  return (
    <div className="space-y-8 py-6">
      {/* Encabezado */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-extrabold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            🧩 ¿Qué tipo de tareas aparecen en Gran Jujuy?
          </span>
          <span className="text-xs text-slate-500 font-semibold">
            EIL · Encuesta de Indicadores Laborales · MTEySS
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Dinámica Laboral y Demanda en Gran Jujuy (EIL)
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Indicadores globales de calificación de la tarea y demanda laboral relevados por el Ministerio de Trabajo (MTEySS) en empresas privadas formales de 5 y más ocupados. La clasificación describe la tarea requerida para el puesto, no los estudios o títulos de la persona.
        </p>
      </div>

      {/* Selector de Subsección */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('calificacion')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeSubTab === 'calificacion'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Calificación de la Tarea (Tabla 3.9.6)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('demanda')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeSubTab === 'demanda'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Demanda Laboral y Búsquedas (Tabla 3.9.8)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBSECCIÓN 1: CALIFICACIÓN DE LA TAREA */}
      {/* ========================================================================= */}
      {activeSubTab === 'calificacion' && (
        <div className="space-y-6">
          {/* Advertencia Obligatoria */}
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-sm flex gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-0.5">Distinción Conceptual Crítica</strong>
              Las categorías <em>Profesional, Técnica, Operativa y No Calificada</em> describen la <strong>calificación de la tarea requerida por la empresa</strong> para el puesto, y <strong>NO representan automáticamente el nivel educativo formal de las personas</strong>.
            </div>
          </div>

          {/* Selector de Mes */}
          <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="font-semibold">Período de Referencia:</span>
            </div>
            <select
              value={selectedMonth396}
              onChange={(e) => setSelectedMonth396(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {periods396.slice(-24).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Tabla de Tasas y Composición según Calificación */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Tasas Laborales y Composición por Calificación de la Tarea ({selectedMonth396})
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Indicador Laboral</th>
                    {califCategories.map((cat) => (
                      <th key={cat} className="py-2.5 px-3 text-right">
                        {cat}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    'Tasa de entrada',
                    'Tasa de salida',
                    'Tasa de rotación',
                    'Tasa de reemplazo',
                    'Composición de altas',
                    'Composición de bajas'
                  ].map((indName) => {
                    return (
                      <tr key={indName} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{indName} (%)</td>
                        {califCategories.map((cat) => {
                          const r = recs396.find(
                            (x) => x.indicador === indName && x.calificacion_tarea.toLowerCase() === cat.toLowerCase()
                          );
                          return (
                            <td key={cat} className="py-2.5 px-3 text-right font-mono text-slate-700">
                              {r?.valor !== null && r?.valor !== undefined ? `${formatNumber(r.valor, 2)}%` : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400">
              Notas técnicas: Tasa de entrada = altas sobre ocupados fin de mes anterior; Tasa de salida = bajas sobre ocupados fin de mes anterior; Tasa de rotación = promedio simple entrada/salida. Fuente: EIL - MTEySS.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECCIÓN 2: DEMANDA LABORAL Y BÚSQUEDAS */}
      {/* ========================================================================= */}
      {activeSubTab === 'demanda' && (
        <div className="space-y-6">
          {/* Advertencia Obligatoria */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-0.5">Indicador Específico de Demanda Laboral</strong>
              La demanda laboral mide la <strong>búsqueda activa de personal y la efectividad de cobertura</strong> en firmas de 5 y más trabajadores. <strong>NO debe renombrarse automáticamente como &quot;vacantes totales&quot; ni confundirse con el volumen de empleo total</strong>.
            </div>
          </div>

          {/* Selector de Mes */}
          <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Período de Referencia:</span>
            </div>
            <select
              value={selectedMonth398}
              onChange={(e) => setSelectedMonth398(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {periods398.slice(-24).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Grilla de Datos de Demanda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bloque 1: Búsqueda de Personal en Empresas */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Empresas que Realizaron Búsquedas Activas
              </h3>
              <div className="space-y-3">
                {recs398
                  .filter((r) => r.indicador === 'Demanda Laboral (Empresas)')
                  .map((r) => (
                    <div key={r.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">{r.categoria_demanda}:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {r.valor !== null ? `${formatNumber(r.valor, 1)}%` : '-'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bloque 2: Cobertura de Puestos */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Cobertura de los Puestos Buscados
              </h3>
              <div className="space-y-3">
                {recs398
                  .filter((r) => r.indicador === 'Cobertura de puestos buscados')
                  .map((r) => (
                    <div key={r.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">{r.categoria_demanda}:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {r.valor !== null ? `${formatNumber(r.valor, 1)}%` : '-'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Tabla de Tasas de Búsqueda y No Cobertura por Calificación */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Tasas de Búsqueda y No Cobertura por Calificación Requerida ({selectedMonth398})
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Calificación Solicitada</th>
                    <th className="py-2.5 px-3 text-right">Tasa de Búsqueda (%)</th>
                    <th className="py-2.5 px-3 text-right">Composición Puestos No Cubiertos (%)</th>
                    <th className="py-2.5 px-3 text-right">Tasa de No Cobertura (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {['Total', 'Profesionales', 'Técnicos', 'Operativos', 'No calificados'].map((cat) => {
                    const rBusq = recs398.find((x) => x.indicador === 'Tasa de búsqueda según calificación' && x.categoria_demanda.toLowerCase() === cat.toLowerCase());
                    const rComp = recs398.find((x) => x.indicador === 'Composición puestos no cubiertos según calificación' && x.categoria_demanda.toLowerCase() === cat.toLowerCase());
                    const rNoCob = recs398.find((x) => x.indicador === 'Tasa de no cobertura según calificación' && x.categoria_demanda.toLowerCase() === cat.toLowerCase());

                    return (
                      <tr key={cat} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{cat}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {rBusq?.valor !== null && rBusq?.valor !== undefined ? `${formatNumber(rBusq.valor, 2)}%` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {rComp?.valor !== null && rComp?.valor !== undefined ? `${formatNumber(rComp.valor, 1)}%` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {rNoCob?.valor !== null && rNoCob?.valor !== undefined ? `${formatNumber(rNoCob.valor, 1)}%` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400">
              Tasa de no cobertura = relación porcentual entre los puestos no cubiertos y el total de búsquedas realizadas por calificación requerida. Fuente: Tabla 3.9.8 EIL - MTEySS.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
