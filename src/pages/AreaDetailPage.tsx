import React, { useState } from 'react';
import {
  Area,
  AreaId,
  PBGDataset,
  OEDEDataset,
  EILDataset,
  MIPDataset,
  Correspondencia
} from '../types';
import { AreaIcon } from '../utils/iconHelper';
import { InteractiveChart, ChartDataPoint } from '../components/InteractiveChart';
import { MetricExplainer } from '../components/MetricExplainer';
import { formatNumber, formatCurrencyMiles } from '../utils/formatters';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  AlertCircle,
  ShieldCheck,
  Info
} from 'lucide-react';

import defaultAreas from '../../data/areas.json';
import defaultPbg from '../../data/pbg.json';
import defaultOede from '../../data/empleo_oede.json';
import defaultEil from '../../data/eil.json';
import defaultMip from '../../data/mip_empleo.json';
import defaultCorrespondencias from '../../data/correspondencias.json';

interface AreaDetailPageProps {
  areaId: AreaId;
  areas?: Area[];
  pbgData?: PBGDataset;
  oedeData?: OEDEDataset;
  eilData?: EILDataset;
  mipData?: MIPDataset;
  correspondencias?: Correspondencia[];
  onBack: () => void;
  onNavigateArea: (areaId: AreaId) => void;
}

export const AreaDetailPage: React.FC<AreaDetailPageProps> = ({
  areaId,
  areas = defaultAreas as Area[],
  pbgData = defaultPbg as PBGDataset,
  oedeData = defaultOede as OEDEDataset,
  eilData = defaultEil as EILDataset,
  mipData = defaultMip as MIPDataset,
  correspondencias = defaultCorrespondencias as Correspondencia[],
  onBack,
  onNavigateArea,
}) => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'pbg' | 'oede' | 'eil' | 'mip' | 'trazabilidad'>('resumen');
  const [pbgMode, setPbgMode] = useState<'constante' | 'corriente'>('constante');
  const [pbgRange, setPbgRange] = useState<'ultimos5' | 'historica'>('historica');
  const [oedeRange, setOedeRange] = useState<'ultimos3' | 'completa'>('completa');

  const currentArea = areas.find((a) => a.area_id === areaId);
  const currentIndex = areas.findIndex((a) => a.area_id === areaId);
  const prevArea = currentIndex > 0 ? areas[currentIndex - 1] : areas[areas.length - 1];
  const nextArea = currentIndex < areas.length - 1 ? areas[currentIndex + 1] : areas[0];

  if (!currentArea) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-slate-600 font-medium">Área no encontrada.</p>
        <button onClick={onBack} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Volver al Explorador de Áreas
        </button>
      </div>
    );
  }

  // 1. PBG
  const pbgRecords = pbgData.series
    .filter((r) => r.area_id === areaId)
    .sort((a, b) => a.periodo_anio - b.periodo_anio);

  const latestPbgYear = pbgRecords.length > 0 ? Math.max(...pbgRecords.map((r) => r.periodo_anio)) : 2024;
  const latestPbgRecs = pbgRecords.filter((r) => r.periodo_anio === latestPbgYear);
  const latestPbgConstante = latestPbgRecs.reduce((acc, r) => acc + (r.valor_constante || 0), 0);
  const latestPbgCorriente = latestPbgRecs.reduce((acc, r) => acc + (r.valor_corriente || 0), 0);

  const totalProvincialPbgConstante = pbgData.series
    .find((r) => r.codigo_rama === 'TOTAL' && r.periodo_anio === latestPbgYear)?.valor_constante || 6465553;
  const pbgSharePct = totalProvincialPbgConstante > 0 ? ((latestPbgConstante / totalProvincialPbgConstante) * 100).toFixed(1) : '0';

  // Datos para gráfico PBG
  const filteredPbgSeries = pbgRange === 'ultimos5'
    ? pbgRecords.filter((r) => r.periodo_anio >= latestPbgYear - 4)
    : pbgRecords;

  // Agrupar años si hay múltiples ramas
  const pbgYears = Array.from(new Set(filteredPbgSeries.map((r) => r.periodo_anio))).sort((a, b) => a - b);
  const pbgChartPoints: ChartDataPoint[] = pbgYears.map((year) => {
    const recsOfYear = filteredPbgSeries.filter((r) => r.periodo_anio === year);
    const sumVal = recsOfYear.reduce(
      (acc, r) => acc + ((pbgMode === 'constante' ? r.valor_constante : r.valor_corriente) || 0),
      0
    );
    const isProv = recsOfYear.some((r) => r.es_provisorio);
    return {
      label: year.toString(),
      value: sumVal > 0 ? sumVal : null,
      isProvisional: isProv,
      tooltipExtra: pbgMode === 'constante' ? 'Precios constantes de 2004' : 'Precios corrientes',
    };
  });

  // 2. OEDE
  const isOedeAvailable = areaId !== 'A10';
  const oedeRecords = oedeData.series.filter((r) => r.area_id === areaId);
  const oedeLetterRecords = oedeRecords.filter((r) => r.tipo_nivel === 'LETRA');
  const oedePeriods = Array.from(new Set(oedeLetterRecords.map((r) => r.periodo)));
  const latestOedePeriod = oedePeriods.length > 0 ? oedePeriods[oedePeriods.length - 1] : '';
  const latestOedeLetters = oedeLetterRecords.filter((r) => r.periodo === latestOedePeriod);

  const totalPuestosOede = isOedeAvailable
    ? latestOedeLetters.reduce((acc, r) => acc + (r.puestos_trabajo || 0), 0)
    : null;
  const hasOedeSecret = latestOedeLetters.some((r) => r.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO');

  // Datos para gráfico OEDE
  const recentPeriods = oedeRange === 'ultimos3' ? oedePeriods.slice(-12) : oedePeriods;
  const oedeChartPoints: ChartDataPoint[] = recentPeriods.map((period) => {
    const recs = oedeLetterRecords.filter((r) => r.periodo === period);
    const hasSecret = recs.some((r) => r.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO');
    const allNull = recs.length > 0 && recs.every((r) => r.puestos_trabajo === null);
    const sumVal = allNull ? null : recs.reduce((acc, r) => acc + (r.puestos_trabajo || 0), 0);

    return {
      label: period,
      value: sumVal,
      isSecret: hasSecret,
      tooltipExtra: hasSecret ? 'Contiene subramas bajo secreto estadístico oficial' : undefined,
    };
  });

  // 3. EIL
  const isEilPrimary = ['A01', 'A02'].includes(areaId);
  const isEilPublic = areaId === 'A10';
  const isEilAgrupada = ['A06', 'A07'].includes(areaId);
  const isEilAvailable = !isEilPrimary && !isEilPublic;

  const eilKey = isEilAgrupada ? 'A06_A07_AGRUPADA' : areaId;
  const eilBranchRecords = eilData.tabla_3_9_2_evolucion_y_ramas.filter((r) => r.area_id === eilKey);
  const eilPeriods = Array.from(new Set(eilBranchRecords.map((r) => r.periodo)));
  const latestEilPeriod = eilPeriods.length > 0 ? eilPeriods[eilPeriods.length - 1] : '';
  const latestEilIndex = eilBranchRecords.find((r) => r.periodo === latestEilPeriod && r.bloque === 'INDICE_POR_RAMA');
  const latestEilVarAnual = eilBranchRecords.find((r) => r.periodo === latestEilPeriod && r.bloque === 'VARIACION_ANUAL_POR_RAMA');

  // 4. MIP
  const mipSectors = mipData.sectores.filter((s) => s.area_id === areaId);
  const primaryMip = mipSectors.length > 0 ? mipSectors[0] : null;

  // 5. Correspondencias
  const areaCorrs = correspondencias.filter((c) => c.area_id === areaId);

  return (
    <div className="space-y-8 py-6 sm:py-8">
      {/* ========================================================================= */}
      {/* 1. NAVEGACIÓN Y ENCABEZADO DE ÁREA                                        */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Barra superior de navegación entre áreas y botón atrás */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-200 pb-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-900 font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Explorador de Áreas</span>
          </button>

          {/* Paginador rápido entre las 12 áreas */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateArea(prevArea.area_id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              title={`Ir a ${prevArea.nombre}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{prevArea.area_id}</span>
            </button>
            <span className="font-mono font-bold text-slate-400">
              {currentArea.area_id} / 12
            </span>
            <button
              onClick={() => onNavigateArea(nextArea.area_id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              title={`Ir a ${nextArea.nombre}`}
            >
              <span className="hidden sm:inline">{nextArea.area_id}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hero Card del Área con 3 KPIs Clave */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 border border-brand-100 shadow-2xs">
                <AreaIcon name={currentArea.icono} size={32} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {currentArea.area_id}
                  </span>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-brand-600">
                    Actividad Económica Auditada
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {currentArea.nombre}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed pt-1">
                  {currentArea.descripcion}
                </p>
              </div>
            </div>

            {/* 3 KPIs Resumidos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:shrink-0 text-left border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              {/* KPI PBG */}
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 block">
                  Aporte PBG 2024*
                </span>
                <span className="text-lg font-black text-slate-900 block font-mono">
                  {pbgSharePct}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {formatCurrencyMiles(latestPbgConstante)}
                </span>
              </div>

              {/* KPI OEDE */}
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-800 block">
                  Puestos SIPA
                </span>
                <span className="text-lg font-black text-slate-900 block font-mono">
                  {totalPuestosOede !== null ? formatNumber(totalPuestosOede) : 'No disp.'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {isOedeAvailable ? latestOedePeriod : 'Sector público'}
                </span>
              </div>

              {/* KPI MIP */}
              <div className="col-span-2 sm:col-span-1 space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800 block">
                  Multiplicador MIP
                </span>
                <span className="text-lg font-black text-slate-900 block font-mono">
                  {primaryMip?.multiplicador_total_coef !== null ? primaryMip?.multiplicador_total_coef?.toFixed(2) : '—'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Base 2015
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BARRA DE PESTAÑAS ADHESIVAS (STICKY TABS)                              */}
      {/* ========================================================================= */}
      <div className="sticky top-16 z-30 bg-slate-50/95 backdrop-blur-md pt-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold py-1">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'resumen'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            🌟 Resumen Clave
          </button>

          <button
            onClick={() => setActiveTab('pbg')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'pbg'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60'
            }`}
          >
            📊 Producción (PBG)
          </button>

          <button
            onClick={() => setActiveTab('oede')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'oede'
                ? 'bg-blue-700 text-white shadow-xs font-bold'
                : 'text-blue-800 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/60'
            }`}
          >
            👥 Empleo Registrado (OEDE)
          </button>

          <button
            onClick={() => setActiveTab('eil')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'eil'
                ? 'bg-purple-700 text-white shadow-xs font-bold'
                : 'text-purple-800 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/60'
            }`}
          >
            🧩 Dinámica Laboral (EIL)
          </button>

          <button
            onClick={() => setActiveTab('mip')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'mip'
                ? 'bg-amber-700 text-white shadow-xs font-bold'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60'
            }`}
          >
            🔗 Conexiones (MIP 2015)
          </button>

          <button
            onClick={() => setActiveTab('trazabilidad')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'trazabilidad'
                ? 'bg-slate-800 text-white shadow-xs font-bold'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            📋 Trazabilidad
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CONTENIDO DE LAS PESTAÑAS INTERACTIVAS                                */}
      {/* ========================================================================= */}

      {/* PESTAÑA: RESUMEN CLAVE */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarjeta de Producción */}
            <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Producción y Valor Agregado
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {formatCurrencyMiles(latestPbgConstante)}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Año 2024* (precios constantes de 2004)
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Esta actividad representa el <strong>{pbgSharePct}%</strong> de toda la producción generada en la Provincia de Jujuy. A precios corrientes nominales de 2024*, equivale a <strong>{formatCurrencyMiles(latestPbgCorriente)}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('pbg')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer pt-2 border-t border-emerald-50"
              >
                <span>Ver gráfico histórico y selector de precios</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tarjeta de Empleo Formal */}
            <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                    Trabajadores Asalariados Registrados
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {totalPuestosOede !== null ? `${formatNumber(totalPuestosOede)} puestos` : 'No disponible'}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {isOedeAvailable ? latestOedePeriod : 'Sector público provincial'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isOedeAvailable ? (
                  <>
                    Puestos de trabajo formales declarados por empresas privadas ante AFIP/SIPA. No incluye empleo público provincial ni trabajo por cuenta propia.
                    {hasOedeSecret && ' *Algunas subramas están bajo secreto estadístico.'}
                  </>
                ) : (
                  'La administración pública (rama L) no se releva en la serie OEDE Jujuy. Los empleados estatales se rigen por normativas públicas específicas.'
                )}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('oede')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer pt-2 border-t border-blue-50"
              >
                <span>Ver serie trimestral y desglose de ramas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mini Dashboard de Relaciones MIP y EIL */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Estructura y Encadenamiento Productivo
                </span>
                <h4 className="text-lg font-black text-white mt-0.5">
                  ¿Cómo tracciona esta actividad a otros sectores?
                </h4>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Matriz Insumo-Producto · Base 2015
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Multiplicador Total</span>
                <strong className="text-lg font-black text-white block mt-1 font-mono">
                  {primaryMip?.multiplicador_total_coef !== null ? primaryMip?.multiplicador_total_coef?.toFixed(2) : '—'}
                </strong>
                <span className="text-[10px] text-slate-400">Total puestos directos e indirectos por unidad</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Empleo Directo</span>
                <strong className="text-lg font-black text-amber-300 block mt-1 font-mono">
                  {primaryMip?.empleo_directo_por_millon !== null ? primaryMip?.empleo_directo_por_millon?.toFixed(2) : '—'}
                </strong>
                <span className="text-[10px] text-slate-400">Puestos generados en la propia rama</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Empleo Indirecto</span>
                <strong className="text-lg font-black text-amber-400 block mt-1 font-mono">
                  {primaryMip?.empleo_indirecto_por_millon !== null ? primaryMip?.empleo_indirecto_por_millon?.toFixed(2) : '—'}
                </strong>
                <span className="text-[10px] text-slate-400">Puestos inducidos en proveedores</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              * Nota: La MIP describe la matriz técnica del año base 2015. No debe interpretarse como empleo actual ni proyección automática.
            </p>
          </div>
        </div>
      )}

      {/* PESTAÑA: PBG (PRODUCCIÓN) */}
      {activeTab === 'pbg' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                💰 Producto Bruto Geográfico · DiPEC
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Evolución de la Producción de {currentArea.nombre}
              </h2>
              <p className="text-xs text-slate-500 max-w-xl">
                Valor agregado generado en Jujuy entre 2004 y 2024*.
              </p>
            </div>

            {/* Controles de Gráfico PBG */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Selector de Precios */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPbgMode('constante')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    pbgMode === 'constante' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Precios Constantes (2004)
                </button>
                <button
                  type="button"
                  onClick={() => setPbgMode('corriente')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    pbgMode === 'corriente' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Precios Corrientes
                </button>
              </div>

              {/* Selector de Rango */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPbgRange('ultimos5')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    pbgRange === 'ultimos5' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Últimos 5 años
                </button>
                <button
                  type="button"
                  onClick={() => setPbgRange('historica')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    pbgRange === 'historica' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Serie Completa (2004-2024*)
                </button>
              </div>
            </div>
          </div>

          {/* Gráfico Interactivo de PBG */}
          <InteractiveChart
            data={pbgChartPoints}
            title={`Tendencia de PBG a ${pbgMode === 'constante' ? 'Precios Constantes (2004)' : 'Precios Corrientes'}`}
            subtitle={pbgMode === 'constante' ? 'Expresado en miles de pesos constantes de 2004 para medir volumen físico sin inflación.' : 'Expresado en miles de pesos corrientes nominales.'}
            unit={pbgMode === 'constante' ? 'miles de $ 2004' : 'miles de $ corr.'}
            valuePrefix="$"
            color="emerald"
            formatValue={(val) => formatCurrencyMiles(val)}
          />

          {/* Bloque de Interpretación Contextual */}
          <MetricExplainer
            whatItMeans="El Producto Bruto Geográfico (PBG) mide el valor monetario de todos los bienes y servicios finales producidos por esta rama dentro del territorio de Jujuy durante un año."
            howItIsCalculated="A precios constantes de 2004, se valora la producción física a los precios fijos del año 2004 para descontar el efecto de la inflación y observar si la actividad produjo más o menos volumen. A precios corrientes, se multiplica por los precios vigentes en cada año calendario."
            sourceDetails={{
              organismo: 'Dirección Provincial de Estadística y Censos (DiPEC) - Gobierno de Jujuy',
              indicadorOficial: 'Producto Bruto Geográfico a precios básicos',
              archivoOriginal: 'SERIE DE PBG DE JUJUY 2004 - 2024 provisorio.xlsx',
              cobertura: 'Provincia de Jujuy',
              universo: 'Total de unidades productivas provinciales',
              advertencia: 'Las cifras del año 2024 tienen carácter provisorio oficial sujeto a revisión habitual por parte de DiPEC.',
            }}
          />
        </section>
      )}

      {/* PESTAÑA: OEDE (EMPLEO PRIVADO FORMAL) */}
      {activeTab === 'oede' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-extrabold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                👥 Asalariados Registrados Privados · OEDE / SIPA
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Empleo Privado Registrado en {currentArea.nombre}
              </h2>
              <p className="text-xs text-slate-500 max-w-xl">
                Puestos de trabajo formales declarados por empresas privadas en Jujuy.
              </p>
            </div>

            {isOedeAvailable && (
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setOedeRange('ultimos3')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    oedeRange === 'ultimos3' ? 'bg-white text-blue-800 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Últimos 3 años (12 trimestres)
                </button>
                <button
                  type="button"
                  onClick={() => setOedeRange('completa')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    oedeRange === 'completa' ? 'bg-white text-blue-800 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Serie Completa (1996–2026)
                </button>
              </div>
            )}
          </div>

          {!isOedeAvailable ? (
            /* Estado específico y pedagógico para A10 (Administración Pública) */
            <div className="p-8 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                <AlertCircle className="w-5 h-5 text-amber-700" />
                <span>Serie no aplicable en la fuente oficial de empleo privado</span>
              </div>
              <p className="text-xs text-amber-900/90 leading-relaxed max-w-2xl">
                La rama L (Administración Pública) <strong>no forma parte de la serie OEDE de empleo privado asalariado de Jujuy</strong>. Los trabajadores del sector público provincial y municipal se rigen por regímenes estatutarios específicos.
              </p>
              <p className="text-xs text-slate-600">
                De acuerdo con el principio de integridad estadística, <strong>no se imputa valor cero ni se generan estimaciones sintéticas</strong>.
              </p>
            </div>
          ) : (
            <>
              {/* Gráfico Interactivo de Empleo OEDE */}
              <InteractiveChart
                data={oedeChartPoints}
                title="Evolución Trimestral de Puestos de Trabajo Registrados"
                subtitle="Serie continua relevada por el Sistema Integrado Previsional Argentino (SIPA)."
                unit="puestos"
                color="blue"
              />

              {hasOedeSecret && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Secreto estadístico oficial:</strong> Algunas subramas específicas de esta área protegen la confidencialidad de datos cuando existen pocas empresas declarantes (Ley 17.622).
                  </span>
                </div>
              )}
            </>
          )}

          <MetricExplainer
            whatItMeans="Los puestos de trabajo registrados corresponden a personas contratadas formalmente bajo relación de dependencia por empresas del sector privado en Jujuy. No incluye empleo público ni trabajo independiente/informal."
            howItIsCalculated="Se contabilizan a partir de las declaraciones juradas mensuales que presentan los empleadores ante AFIP (formulario 931) procesadas por el Observatorio de Empleo (OEDE)."
            sourceDetails={{
              organismo: 'Observatorio de Empleo y Dinámica Empresarial (OEDE) / Secretaría de Trabajo',
              indicadorOficial: 'Asalariados registrados del sector privado (puestos de trabajo)',
              archivoOriginal: 'Series provinciales OEDE (1996T1 - 2026T1)',
              cobertura: 'Provincia de Jujuy',
              universo: 'Empresas privadas declarantes en SIPA',
              advertencia: 'Un puesto de trabajo no equivale necesariamente a una persona, ya que una persona puede registrar más de un empleo formal simultáneamente.',
            }}
          />
        </section>
      )}

      {/* PESTAÑA: EIL (DINÁMICA LABORAL GRAN JUJUY) */}
      {activeTab === 'eil' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-100">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <span className="text-xs uppercase tracking-wider font-extrabold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              🧩 Dinámica Laboral Gran Jujuy · MTEySS
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Indicadores de Demanda y Empleo en Aglomerado Urbano
            </h2>
            <p className="text-xs text-slate-500 max-w-xl">
              Relevamiento mensual en empresas privadas formales de 5 y más ocupados en Gran Jujuy.
            </p>
          </div>

          {!isEilAvailable ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                <Info className="w-5 h-5 text-slate-600" />
                <span>Sector excluido del relevamiento urbano de EIL</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                {isEilPrimary && (
                  <>
                    La Encuesta de Indicadores Laborales (EIL) se focaliza en aglomerados urbanos y <strong>excluye formalmente las actividades del sector primario (agropecuario y extracción de minerales)</strong>.
                  </>
                )}
                {isEilPublic && (
                  <>
                    La EIL investiga únicamente establecimientos del <strong>sector privado formal</strong> de 5 y más trabajadores, excluyendo a la administración pública provincial y municipal.
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {isEilAgrupada && (
                <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-purple-700" />
                    <span>Agrupación indivisible oficial (A06 Comercio + A07 Turismo)</span>
                  </div>
                  <p className="text-[11px] text-purple-800">
                    En la EIL, la rama <em>«Comercio, restaurantes y hoteles»</em> constituye una categoría única que no se desagrega en las publicaciones oficiales del Ministerio de Trabajo.
                  </p>
                </div>
              )}

              {/* Tarjetas de Indicadores EIL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                    Índice de Empleo por Rama
                  </span>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {latestEilIndex?.valor ? latestEilIndex.valor.toFixed(1) : '100.0'}
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Base Feb. 2015 = 100 · Período {latestEilPeriod}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                    Variación Anual
                  </span>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {latestEilVarAnual?.valor !== null && latestEilVarAnual?.valor !== undefined
                      ? `${latestEilVarAnual.valor > 0 ? '+' : ''}${latestEilVarAnual.valor.toFixed(1)}%`
                      : '—'}
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Comparación interanual en empresas de 5+ ocupados
                  </span>
                </div>
              </div>
            </div>
          )}

          <MetricExplainer
            whatItMeans="La EIL mide la dinámica del empleo (incorporaciones, desvinculaciones y búsquedas) en empresas privadas de 5 o más personas del aglomerado Gran Jujuy."
            howItIsCalculated="Se calcula a través de índices basados en febrero de 2015 = 100 y variaciones porcentuales trimestrales e interanuales."
            sourceDetails={{
              organismo: 'Ministerio de Trabajo, Empleo y Seguridad Social (MTEySS)',
              indicadorOficial: 'Encuesta de Indicadores Laborales (EIL) - Cuadro 3.9.2',
              archivoOriginal: 'EIL_2407_2.xlsx',
              cobertura: 'Gran Jujuy (Aglomerado urbano)',
              universo: 'Empresas privadas de 5 y más ocupados',
              advertencia: 'La calificación de la tarea solicitada en las búsquedas describe los requerimientos del puesto y no el nivel de estudios alcanzado por la persona.',
            }}
          />
        </section>
      )}

      {/* PESTAÑA: MIP (INSUMO-PRODUCTO) */}
      {activeTab === 'mip' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-100">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <span className="text-xs uppercase tracking-wider font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              🔗 Matriz Insumo-Producto · Base 2015
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Eslabones Productivos y Multiplicadores de Empleo
            </h2>
            <p className="text-xs text-slate-500 max-w-xl">
              Relaciones entre sectores económicos y compras a proveedores en Jujuy.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Advertencia metodológica sobre año base 2015</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Los multiplicadores de la MIP describen la estructura técnica y capacidad de tracción del <strong>año base 2015</strong>. No deben interpretarse como cantidad actual de puestos de trabajo ni rankings de carreras profesionales.
            </p>
          </div>

          {/* Gráfico Visual de Empleo Directo vs Indirecto */}
          {primaryMip && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">
                Estructura de Empleo Directo e Indirecto por Millón de Pesos de 2015
              </h4>

              <div className="space-y-3">
                {/* Barra Directo */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Empleo Directo en la rama</span>
                    <span className="font-mono font-bold text-slate-900">
                      {primaryMip.empleo_directo_por_millon?.toFixed(2) || '—'} puestos / millón
                    </span>
                  </div>
                  <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((primaryMip.empleo_directo_por_millon || 0) / (primaryMip.multiplicador_total_coef || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Barra Indirecto */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Empleo Indirecto inducido en proveedores</span>
                    <span className="font-mono font-bold text-slate-900">
                      {primaryMip.empleo_indirecto_por_millon?.toFixed(2) || '—'} puestos / millón
                    </span>
                  </div>
                  <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((primaryMip.empleo_indirecto_por_millon || 0) / (primaryMip.multiplicador_total_coef || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <MetricExplainer
            whatItMeans="El multiplicador de empleo mide cuántos puestos de trabajo adicionales se generan indirectamente en la economía provincial por cada puesto de trabajo creado directamente en esta actividad, debido a las compras de insumos a otras empresas."
            howItIsCalculated="A través de la matriz inversa de Leontief sobre el modelo de insumo-producto provincial calibrado con el Cociente de Localización Simple (SLQ)."
            sourceDetails={{
              organismo: 'DiPEC Jujuy en base a metodología CEP XXI',
              indicadorOficial: 'Multiplicadores de empleo directo e indirecto (Cuadro 3)',
              archivoOriginal: 'Estimaciones de empleo directo e indirecto a través de la MIP Jujuy base 2015.pdf',
              cobertura: 'Provincia de Jujuy',
              universo: '34 sectores productivos de la matriz provincial',
              advertencia: 'Bajo ninguna circunstancia estos coeficientes implican causalidad mecánica inmediata en el presente.',
            }}
          />
        </section>
      )}

      {/* PESTAÑA: TRAZABILIDAD Y NOMENCLADORES */}
      {activeTab === 'trazabilidad' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-100">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <span className="text-xs uppercase tracking-wider font-extrabold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
              📋 Rigor Técnico y Auditoría
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Trazabilidad Oficial de Nomencladores
            </h2>
            <p className="text-xs text-slate-500 max-w-xl">
              Correspondencias auditables entre el código conceptual {currentArea.area_id} y las clasificaciones públicas oficiales.
            </p>
          </div>

          {/* Tabla de Correspondencias */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Fuente</th>
                  <th className="p-3">Código</th>
                  <th className="p-3">Denominación Oficial en la Fuente</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {areaCorrs.map((corr) => (
                  <tr key={corr.correspondencia_id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{corr.fuente}</td>
                    <td className="p-3 font-mono text-[11px]">{corr.codigo_fuente}</td>
                    <td className="p-3 font-medium">{corr.nombre_fuente}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px]">
                        {corr.tipo_correspondencia}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        corr.estado === 'CONFIRMADO'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {corr.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Cadena de auditoría:</span>
            <p className="text-[11px] leading-relaxed">
              Cada dato exhibido en esta ficha cuenta con un registro identificable en los archivos fuente originales publicados por DiPEC, OEDE / SIPA y MTEySS. No existen imputaciones ni estimaciones sintéticas no documentadas.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};
