import React, { useState } from 'react';
import { EILDataset } from '../types';
import { formatNumber } from '../utils/formatters';
import { InteractiveChart, ChartDataPoint } from '../components/InteractiveChart';
import {
  Users,
  Search,
  AlertCircle,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Layers,
  Building2,
  PieChart,
  ArrowUpRight,
  Info
} from 'lucide-react';
import defaultEil from '../../data/eil.json';

interface EilTransversalPageProps {
  eilData?: EILDataset;
}

function formatPeriodMonth(isoDate: string): string {
  if (!isoDate || isoDate.length < 7) return isoDate;
  const [year, month] = isoDate.split('-');
  const months: Record<string, string> = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };
  return `${months[month] || month} ${year}`;
}

export const EilTransversalPage: React.FC<EilTransversalPageProps> = ({ eilData = defaultEil as EILDataset }) => {
  const [activeTab, setActiveTab] = useState<'calificacion' | 'demanda' | 'evolucion'>('calificacion');

  // 1. Períodos para Calificación (3.9.6)
  const periods396 = Array.from(new Set(eilData.tabla_3_9_6_calificacion_tarea.map((r) => r.periodo))).sort();
  const latestMonth396 = periods396.length > 0 ? periods396[periods396.length - 1] : '';
  const [selectedMonth396, setSelectedMonth396] = useState(latestMonth396);

  // 2. Períodos para Demanda (3.9.8)
  const periods398 = Array.from(new Set(eilData.tabla_3_9_8_demanda_laboral.map((r) => r.periodo))).sort();
  const latestMonth398 = periods398.length > 0 ? periods398[periods398.length - 1] : '';
  const [selectedMonth398, setSelectedMonth398] = useState(latestMonth398);

  // 3. Ramas y conceptos para Evolución (3.9.2)
  const ramasDisponibles = [
    'Total Aglomerado Gran Jujuy',
    'Industria manufacturera',
    'Construcción',
    'Comercio, restaurantes y hoteles',
    'Transporte, almacenaje y comunicaciones',
    'Servicios financieros y a las empresas',
    'Electricidad, gas y agua',
    'Servicios comunales, sociales y personales'
  ];
  const [selectedRama392, setSelectedRama392] = useState('Total Aglomerado Gran Jujuy');

  // Registros filtrados para el mes seleccionado en 3.9.6
  const recs396 = eilData.tabla_3_9_6_calificacion_tarea.filter((r) => r.periodo === selectedMonth396);
  // Registros filtrados para el mes seleccionado en 3.9.8
  const recs398 = eilData.tabla_3_9_8_demanda_laboral.filter((r) => r.periodo === selectedMonth398);

  // Registros de serie temporal para 3.9.2
  const recs392 = eilData.tabla_3_9_2_evolucion_y_ramas
    .filter((r) => r.concepto === selectedRama392 && r.indicador === 'Índice de empleo base Feb.15=100');

  // Preparar puntos de gráfico para 3.9.2
  const chartPoints392: ChartDataPoint[] = recs392.map((r) => ({
    label: r.periodo,
    value: r.valor,
    tooltipExtra: `${r.concepto} · Índice: ${r.valor !== null ? formatNumber(r.valor, 1) : 's/d'}`,
  }));

  const califLevels = [
    { key: 'Profesional', label: 'Profesional', color: 'bg-purple-600', text: 'text-purple-700', border: 'border-purple-200', bgLight: 'bg-purple-50' },
    { key: 'Técnica', label: 'Técnica', color: 'bg-blue-600', text: 'text-blue-700', border: 'border-blue-200', bgLight: 'bg-blue-50' },
    { key: 'Operativa', label: 'Operativa', color: 'bg-emerald-600', text: 'text-emerald-700', border: 'border-emerald-200', bgLight: 'bg-emerald-50' },
    { key: 'No Calificada', label: 'No Calificada', color: 'bg-amber-600', text: 'text-amber-700', border: 'border-amber-200', bgLight: 'bg-amber-50' },
  ];

  // Helper para buscar valor en 3.9.6
  const getVal396 = (indicador: string, calif: string): number | null => {
    const rec = recs396.find(
      (r) => r.indicador === indicador && r.calificacion_tarea.toLowerCase() === calif.toLowerCase()
    );
    return rec?.valor ?? null;
  };

  // Helper para buscar valor en 3.9.8
  const getVal398 = (indicador: string, cat: string): number | null => {
    const rec = recs398.find(
      (r) => r.indicador === indicador && r.categoria_demanda.toLowerCase() === cat.toLowerCase()
    );
    return rec?.valor ?? null;
  };

  // Datos para Demanda (3.9.8)
  const pctBusqueda = getVal398('Demanda Laboral (Empresas)', 'Realizaron búsquedas de personal');
  const pctNoBusqueda = getVal398('Demanda Laboral (Empresas)', 'No realizaron búsquedas de personal');

  const cobTodos = getVal398('Cobertura de puestos buscados', 'Cubrieron todos los puestos');
  const cobParte = getVal398('Cobertura de puestos buscados', 'Cubrieron parte de los puestos');
  const cobNinguno = getVal398('Cobertura de puestos buscados', 'No cubrieron ninguno de los puestos');

  return (
    <div className="space-y-8 py-6 animate-fade-in" data-testid="eil-transversal-page">
      {/* Encabezado Principal */}
      <div className="border-b border-slate-200 pb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-extrabold text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 inline-flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Encuesta de Indicadores Laborales (EIL) · MTEySS</span>
          </span>
          <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full border border-slate-200">
            Aglomerado Gran Jujuy
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Dinámica Laboral, Calificación y Demanda en Gran Jujuy
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Indicadores oficiales sobre la rotación del personal, la calificación técnica requerida por los puestos, las búsquedas activas de empresas privadas y la evolución trimestral del empleo asalariado formal en firmas de 5 y más ocupados.
          </p>
        </div>

        {/* 4 Puntos Metodológicos Críticos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Universo Relevado</span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block">Empresas privadas formales de 5+ ocupados</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cobertura Territorial</span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block">Aglomerado urbano Gran Jujuy</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Exclusiones Oficiales</span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block">Excluye Agro (A01), Minería (A02) y Adm. Pública (A10)</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Agrupación Indivisible</span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block">Comercio + Restaurantes y Hoteles juntos (A06_A07)</span>
          </div>
        </div>
      </div>

      {/* Navegación entre las 3 Subsecciones Principales */}
      <nav className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto" aria-label="Secciones de EIL">
        <button
          onClick={() => setActiveTab('calificacion')}
          aria-pressed={activeTab === 'calificacion'}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'calificacion'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Calificación de la Tarea (Tabla 3.9.6)</span>
        </button>

        <button
          onClick={() => setActiveTab('demanda')}
          aria-pressed={activeTab === 'demanda'}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'demanda'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>2. Demanda y Búsquedas Activas (Tabla 3.9.8)</span>
        </button>

        <button
          onClick={() => setActiveTab('evolucion')}
          aria-pressed={activeTab === 'evolucion'}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'evolucion'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>3. Evolución del Empleo en Gran Jujuy (Tabla 3.9.2)</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: CALIFICACIÓN DE LA TAREA (TABLA 3.9.6) */}
      {/* ========================================================================= */}
      {activeTab === 'calificacion' && (
        <section className="space-y-6" aria-labelledby="heading-calificacion">
          {/* Advertencia Metodológica Fundamental */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-bold text-purple-900 mb-0.5">
                Distinción Conceptual Crítica: Calificación de la Tarea ≠ Nivel Educativo
              </strong>
              Las categorías <em>Profesional, Técnica, Operativa y No Calificada</em> describen la <strong>complejidad técnica que requiere la tarea solicitada para el puesto</strong> en la empresa formal. <strong>NO equivalen a los títulos académicos ni a los años de escolaridad de las personas</strong>. Una persona con título universitario puede desempeñar una tarea clasificada como operativa o técnica sin que la tarea cambie su denominación estadística.
            </div>
          </div>

          {/* Selector de Período y Tarjeta Resumen */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Período Mensual Seleccionado:</span>
                <span className="text-xs text-slate-500">{formatPeriodMonth(selectedMonth396)}</span>
              </div>
            </div>
            <select
              aria-label="Seleccionar período de referencia para calificación de la tarea"
              value={selectedMonth396}
              onChange={(e) => setSelectedMonth396(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
            >
              {periods396.slice(-36).reverse().map((p) => (
                <option key={p} value={p}>
                  {formatPeriodMonth(p)} ({p})
                </option>
              ))}
            </select>
          </div>

          {/* KPIs Globales de Rotación en el Mes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tasa de Rotación Total</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {getVal396('Tasa de rotación', 'Total') !== null ? `${formatNumber(getVal396('Tasa de rotación', 'Total')!, 2)}%` : 's/d'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Promedio simple altas / bajas</span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Tasa de Entrada Total</span>
              <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">
                {getVal396('Tasa de entrada', 'Total') !== null ? `${formatNumber(getVal396('Tasa de entrada', 'Total')!, 2)}%` : 's/d'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Altas sobre ocupados</span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">Tasa de Salida Total</span>
              <span className="text-2xl font-black text-red-800 font-mono mt-1 block">
                {getVal396('Tasa de salida', 'Total') !== null ? `${formatNumber(getVal396('Tasa de salida', 'Total')!, 2)}%` : 's/d'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Bajas sobre ocupados</span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Tasa de Reemplazo</span>
              <span className="text-2xl font-black text-blue-800 font-mono mt-1 block">
                {getVal396('Tasa de reemplazo', 'Total') !== null ? `${formatNumber(getVal396('Tasa de reemplazo', 'Total')!, 2)}%` : 's/d'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Relación altas / bajas</span>
            </div>
          </div>

          {/* Visualización Gráfica: Composición de Altas vs Bajas por Calificación */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 id="heading-calificacion" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  <span>Composición de Altas y Bajas por Calificación ({formatPeriodMonth(selectedMonth396)})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribución porcentual de las incorporaciones (altas) y desvinculaciones (bajas) según la complejidad de la tarea requerida.
                </p>
              </div>

              {/* Leyenda de Calificación */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {califLevels.map((lvl) => (
                  <span key={lvl.key} className="inline-flex items-center gap-1 font-semibold text-slate-700">
                    <span className={`w-2.5 h-2.5 rounded-full ${lvl.color}`} />
                    <span>{lvl.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Barras Segmentadas de Composición */}
            <div className="space-y-6">
              {/* Barra Altas */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    <span>Composición de Altas (Incorporaciones):</span>
                  </span>
                  <span className="text-slate-500 font-mono">Total: 100%</span>
                </div>
                <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden flex shadow-inner">
                  {califLevels.map((lvl) => {
                    const val = getVal396('Composición de altas', lvl.key) || 0;
                    if (val <= 0) return null;
                    return (
                      <div
                        key={lvl.key}
                        className={`${lvl.color} hover:opacity-90 transition-opacity flex items-center justify-center text-[10px] text-white font-bold font-mono`}
                        style={{ width: `${val}%` }}
                        title={`${lvl.label}: ${formatNumber(val, 1)}%`}
                      >
                        {val > 8 ? `${formatNumber(val, 0)}%` : ''}
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                  {califLevels.map((lvl) => {
                    const val = getVal396('Composición de altas', lvl.key);
                    return (
                      <div key={lvl.key} className={`p-2 rounded-xl ${lvl.bgLight} border ${lvl.border} flex items-center justify-between`}>
                        <span className={`font-semibold ${lvl.text}`}>{lvl.label}:</span>
                        <span className="font-bold font-mono text-slate-900">{val !== null ? `${formatNumber(val, 1)}%` : '0%'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Barra Bajas */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                  <span className="flex items-center gap-1.5 text-red-800">
                    <ArrowUpRight className="w-4 h-4 text-red-600 rotate-90" />
                    <span>Composición de Bajas (Desvinculaciones):</span>
                  </span>
                  <span className="text-slate-500 font-mono">Total: 100%</span>
                </div>
                <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden flex shadow-inner">
                  {califLevels.map((lvl) => {
                    const val = getVal396('Composición de bajas', lvl.key) || 0;
                    if (val <= 0) return null;
                    return (
                      <div
                        key={lvl.key}
                        className={`${lvl.color} hover:opacity-90 transition-opacity flex items-center justify-center text-[10px] text-white font-bold font-mono`}
                        style={{ width: `${val}%` }}
                        title={`${lvl.label}: ${formatNumber(val, 1)}%`}
                      >
                        {val > 8 ? `${formatNumber(val, 0)}%` : ''}
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                  {califLevels.map((lvl) => {
                    const val = getVal396('Composición de bajas', lvl.key);
                    return (
                      <div key={lvl.key} className={`p-2 rounded-xl ${lvl.bgLight} border ${lvl.border} flex items-center justify-between`}>
                        <span className={`font-semibold ${lvl.text}`}>{lvl.label}:</span>
                        <span className="font-bold font-mono text-slate-900">{val !== null ? `${formatNumber(val, 1)}%` : '0%'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Tabla Completa de Tasas por Calificación */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Matriz Completa de Indicadores Laborales por Calificación ({formatPeriodMonth(selectedMonth396)})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Indicador Laboral Oficial</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right text-purple-700">Profesional</th>
                    <th className="py-3 px-4 text-right text-blue-700">Técnica</th>
                    <th className="py-3 px-4 text-right text-emerald-700">Operativa</th>
                    <th className="py-3 px-4 text-right text-amber-700">No Calificada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: 'Tasa de entrada', label: 'Tasa de entrada (%)' },
                    { id: 'Tasa de salida', label: 'Tasa de salida (%)' },
                    { id: 'Tasa de rotación', label: 'Tasa de rotación (%)' },
                    { id: 'Tasa de reemplazo', label: 'Tasa de reemplazo' },
                    { id: 'Composición de altas', label: 'Composición de altas (%)' },
                    { id: 'Composición de bajas', label: 'Composición de bajas (%)' },
                  ].map((ind) => (
                    <tr key={ind.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{ind.label}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {getVal396(ind.id, 'Total') !== null ? `${formatNumber(getVal396(ind.id, 'Total')!, 2)}${ind.id.includes('%') ? '%' : ''}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {getVal396(ind.id, 'Profesional') !== null ? `${formatNumber(getVal396(ind.id, 'Profesional')!, 2)}${ind.id.includes('%') ? '%' : ''}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {getVal396(ind.id, 'Técnica') !== null ? `${formatNumber(getVal396(ind.id, 'Técnica')!, 2)}${ind.id.includes('%') ? '%' : ''}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {getVal396(ind.id, 'Operativa') !== null ? `${formatNumber(getVal396(ind.id, 'Operativa')!, 2)}${ind.id.includes('%') ? '%' : ''}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {getVal396(ind.id, 'No Calificada') !== null ? `${formatNumber(getVal396(ind.id, 'No Calificada')!, 2)}${ind.id.includes('%') ? '%' : ''}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Notas metodológicas oficiales: Tasa de entrada = altas sobre ocupados fin de mes anterior; Tasa de salida = bajas sobre ocupados fin de mes anterior; Tasa de rotación = promedio simple de entrada y salida; Tasa de reemplazo = altas divididas por bajas. Fuente: Tabla 3.9.6 EIL · MTEySS.
            </p>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 2: DEMANDA LABORAL Y BÚSQUEDAS (TABLA 3.9.8) */}
      {/* ========================================================================= */}
      {activeTab === 'demanda' && (
        <section className="space-y-6" aria-labelledby="heading-demanda">
          {/* Advertencia Metodológica Fundamental */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-bold text-blue-900 mb-0.5">
                Definición Específica de Demanda Laboral: Búsquedas Activas ≠ Vacantes Totales
              </strong>
              La demanda laboral en EIL mide exclusivamente la <strong>proporción de firmas de 5+ trabajadores que iniciaron búsquedas activas de personal y su efectividad de cobertura</strong> en Gran Jujuy. <strong>NO debe renombrarse automáticamente como &quot;vacantes totales&quot; ni confundirse con el volumen total de empleo provincial</strong>.
            </div>
          </div>

          {/* Selector de Período */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Período Mensual Seleccionado:</span>
                <span className="text-xs text-slate-500">{formatPeriodMonth(selectedMonth398)}</span>
              </div>
            </div>
            <select
              aria-label="Seleccionar período de referencia para demanda laboral"
              value={selectedMonth398}
              onChange={(e) => setSelectedMonth398(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            >
              {periods398.slice(-36).reverse().map((p) => (
                <option key={p} value={p}>
                  {formatPeriodMonth(p)} ({p})
                </option>
              ))}
            </select>
          </div>

          {/* Bloques de Visualización: Búsqueda y Cobertura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bloque 1: Propensión a la búsqueda */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Search className="w-5 h-5 text-blue-600" />
                <h3 id="heading-demanda">Empresas con Búsquedas Activas de Personal</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Porcentaje de empresas de 5 y más ocupados que salieron al mercado a incorporar personal en el mes de referencia.
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-700">Realizaron búsquedas:</span>
                  <span className="text-2xl font-black text-blue-800 font-mono">
                    {pctBusqueda !== null ? `${formatNumber(pctBusqueda, 1)}%` : 's/d'}
                  </span>
                </div>
                <div className="h-4 bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${pctBusqueda || 0}%` }}
                    title={`Realizaron búsquedas: ${pctBusqueda}%`}
                  />
                  <div
                    className="h-full bg-slate-300 transition-all duration-500"
                    style={{ width: `${pctNoBusqueda || 0}%` }}
                    title={`No realizaron búsquedas: ${pctNoBusqueda}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>Con búsquedas ({formatNumber(pctBusqueda || 0, 1)}%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span>Sin búsquedas ({formatNumber(pctNoBusqueda || 0, 1)}%)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bloque 2: Cobertura de los puestos buscados */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3>Efectividad de Cobertura de Vacantes</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Resultado de las búsquedas entre las empresas que buscaron incorporar personal.
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900">Cubrieron todos los puestos:</span>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    {cobTodos !== null ? `${formatNumber(cobTodos, 1)}%` : 's/d'}
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900">Cubrieron parte de los puestos:</span>
                  <span className="font-mono font-bold text-amber-800 text-sm">
                    {cobParte !== null ? `${formatNumber(cobParte, 1)}%` : 's/d'}
                  </span>
                </div>

                <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-red-900">No cubrieron ninguno de los puestos:</span>
                  <span className="font-mono font-bold text-red-800 text-sm">
                    {cobNinguno !== null ? `${formatNumber(cobNinguno, 1)}%` : 's/d'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dificultad de Cobertura y Búsquedas por Calificación Requerida */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Búsquedas y Dificultad de Cobertura por Calificación Solicitada ({formatPeriodMonth(selectedMonth398)})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Calificación Solicitada en el Puesto</th>
                    <th className="py-3 px-4 text-right">Tasa de Búsqueda (%)</th>
                    <th className="py-3 px-4 text-right">Composición No Cubiertos (%)</th>
                    <th className="py-3 px-4 text-right">Tasa de No Cobertura (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { key: 'Total', label: 'Total general' },
                    { key: 'Profesionales', label: 'Profesionales' },
                    { key: 'Técnicos', label: 'Técnicos' },
                    { key: 'Operativos', label: 'Operativos' },
                    { key: 'No calificados', label: 'No calificados' },
                  ].map((cat) => {
                    const rBusq = getVal398('Tasa de búsqueda según calificación', cat.key);
                    const rComp = getVal398('Composición puestos no cubiertos según calificación', cat.key);
                    const rNoCob = getVal398('Tasa de no cobertura según calificación', cat.key);

                    return (
                      <tr key={cat.key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{cat.label}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-800">
                          {rBusq !== null ? `${formatNumber(rBusq, 2)}%` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-800">
                          {rComp !== null ? `${formatNumber(rComp, 1)}%` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-red-700">
                          {rNoCob !== null ? `${formatNumber(rNoCob, 1)}%` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tasa de no cobertura = relación porcentual entre los puestos que quedaron desiertos y el total de búsquedas realizadas para ese perfil específico. Fuente: Tabla 3.9.8 EIL · MTEySS.
            </p>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 3: EVOLUCIÓN DEL EMPLEO EN GRAN JUJUY (TABLA 3.9.2) */}
      {/* ========================================================================= */}
      {activeTab === 'evolucion' && (
        <section className="space-y-6" aria-labelledby="heading-evolucion">
          {/* Advertencia Metodológica Fundamental */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-bold text-purple-900 mb-0.5">
                Seguimiento Temporal: Índice de Empleo (Base Feb. 2015 = 100)
              </strong>
              Esta serie mide la trayectoria relativa del empleo asalariado registrado en firmas privadas formales de 5 y más trabajadores en el aglomerado urbano Gran Jujuy. <strong>No debe transformarse en cantidad de trabajadores ni extrapolarse al empleo informal</strong>.
            </div>
          </div>

          {/* Selector de Rama EIL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Actividad o Agrupación EIL:</span>
                <span className="text-xs text-slate-500">Seleccioná la rama a graficar</span>
              </div>
            </div>
            <select
              aria-label="Seleccionar rama para graficar evolución de empleo en Gran Jujuy"
              value={selectedRama392}
              onChange={(e) => setSelectedRama392(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
            >
              {ramasDisponibles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Gráfico Interactivo de Evolución EIL */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 id="heading-evolucion" className="text-lg font-bold text-slate-900">
                  {selectedRama392}
                </h3>
                <span className="text-xs text-slate-500">
                  Serie histórica trimestral · Base Febrero 2015 = 100 · Fuente: EIL - MTEySS
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Último período relevado</span>
                <span className="text-sm font-mono font-bold text-purple-700">
                  {chartPoints392.length > 0 ? chartPoints392[chartPoints392.length - 1].label : '-'}
                </span>
              </div>
            </div>

            <InteractiveChart
              data={chartPoints392}
              title={`Índice de Empleo Trimestral (${selectedRama392})`}
              subtitle="Punto de partida = 100 (Febrero 2015). Valores superiores a 100 indican expansión del empleo privado respecto a esa fecha."
              unit="Base 100"
              color="purple"
              height={260}
              formatValue={(val) => `${formatNumber(val, 1)} pts`}
            />
          </div>

          {/* Aclaraciones Metodológicas de Cobertura */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>Sector Primario Excluido</span>
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                El Agro (A01) y la Minería (A02) no participan de la EIL Gran Jujuy por tratarse de un relevamiento urbano que no cubre explotaciones primarias rurales.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Sector Público Excluido</span>
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                La Administración Pública (A10) no forma parte del universo de EIL, cuyo objetivo exclusivo es monitorear a las empresas privadas formales.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Agrupación Indivisible</span>
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comercio (A06) y Hoteles/Restaurantes (A07) se publican agrupados en una sola serie oficial conjunta. No es metodológicamente correcto particionarla.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
