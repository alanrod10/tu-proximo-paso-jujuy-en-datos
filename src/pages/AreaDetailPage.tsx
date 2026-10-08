import React, { useState } from 'react';
import { Area, AreaId, PBGDataset, OEDEDataset, EILDataset, MIPDataset, Correspondencia } from '../types';
import { AreaIcon } from '../utils/iconHelper';
import { MethodWarning } from '../components/MethodWarning';
import { MissingDataBadge } from '../components/MissingDataBadge';
import { formatNumber, formatCurrencyMiles, formatPercent } from '../utils/formatters';
import { ArrowLeft, FileText, Calendar, Building, Info, HelpCircle, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { HumanDataCards } from '../components/HumanDataCards';

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
  onNavigateArea
}) => {
  const [activeTab, setActiveTab] = useState<'todos' | 'pbg' | 'oede' | 'eil' | 'mip'>('todos');
  const [pbgViewMode, setPbgViewMode] = useState<'constante' | 'corriente'>('constante');
  const [pbgPeriodRange, setPbgPeriodRange] = useState<'reciente' | 'historico' | 'completo'>('reciente');

  const currentIndex = areas.findIndex((a) => a.area_id === areaId);
  const prevArea = currentIndex > 0 ? areas[currentIndex - 1] : areas[areas.length - 1];
  const nextArea = currentIndex < areas.length - 1 ? areas[currentIndex + 1] : areas[0];

  const currentArea = areas.find((a) => a.area_id === areaId);
  if (!currentArea) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600 mb-4">Área no encontrada.</p>
        <button onClick={onBack} className="btn-primary">Volver al explorador</button>
      </div>
    );
  }

  // 1. FILTRAR PBG
  const pbgRecords = pbgData.series
    .filter((r) => r.area_id === areaId)
    .sort((a, b) => b.periodo_anio - a.periodo_anio);
  
  // Agrupar PBG por rama si el área tiene múltiples ramas (ej A09: J + K, A12: N + O)
  const pbgBranches = Array.from(new Set(pbgRecords.map((r) => r.codigo_rama)));
  const latestPbgYear = pbgRecords.length > 0 ? pbgRecords[0].periodo_anio : 2024;
  const latestPbgRecords = pbgRecords.filter((r) => r.periodo_anio === latestPbgYear);

  // 2. FILTRAR OEDE
  const isOEDEAvailable = areaId !== 'A10';
  const oedeRecords = oedeData.series.filter((r) => r.area_id === areaId);
  
  // Ramas letra de OEDE para esta área
  const oedeLetterBranches = oedeRecords.filter((r) => r.tipo_nivel === 'LETRA');
  // Ramas a 2 dígitos de OEDE
  const oedeDigitBranches = oedeRecords.filter((r) => r.tipo_nivel === 'DIGITO_2');
  
  // Último trimestre con datos disponibles (ej. 1° Trim 2026 o 4° Trim 2025)
  const oedePeriods = Array.from(new Set(oedeRecords.map((r) => r.periodo)));
  const latestOedePeriod = oedePeriods.length > 0 ? oedePeriods[oedePeriods.length - 1] : '';
  const latestOedeLetters = oedeLetterBranches.filter((r) => r.periodo === latestOedePeriod);

  // 3. FILTRAR EIL
  const isEILAvailable = !['A01', 'A02', 'A10'].includes(areaId);
  const isEILAgrupada = ['A06', 'A07'].includes(areaId);
  
  const eilKey = isEILAgrupada ? 'A06_A07_AGRUPADA' : areaId;
  const eilBranchRecords = eilData.tabla_3_9_2_evolucion_y_ramas.filter(
    (r) => r.area_id === eilKey
  );

  // Último trimestre EIL disponible
  const eilPeriods = Array.from(new Set(eilBranchRecords.map((r) => r.periodo)));
  const latestEilPeriod = eilPeriods.length > 0 ? eilPeriods[eilPeriods.length - 1] : '';
  const latestEilIndex = eilBranchRecords.find(
    (r) => r.periodo === latestEilPeriod && r.bloque === 'INDICE_POR_RAMA'
  );
  const latestEilVarTrim = eilBranchRecords.find(
    (r) => r.periodo === latestEilPeriod && r.bloque === 'VARIACION_TRIMESTRAL_POR_RAMA'
  );
  const latestEilVarAnual = eilBranchRecords.find(
    (r) => r.periodo === latestEilPeriod && r.bloque === 'VARIACION_ANUAL_POR_RAMA'
  );

  // 4. FILTRAR MIP
  const mipSectors = mipData.sectores.filter((s) => s.area_id === areaId);

  // 5. CORRESPONDENCIAS DEL ÁREA
  const areaCorrespondencias = correspondencias.filter((c) => c.area_id === areaId);

  return (
    <div className="space-y-8 py-6">
      {/* Breadcrumb de navegación */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={onBack}
          className="hover:text-brand-700 transition-colors flex items-center gap-1 font-medium"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Inicio</span>
        </button>
        <span>/</span>
        <button
          onClick={onBack}
          className="hover:text-brand-700 transition-colors font-medium"
        >
          12 Áreas
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-800">
          {currentArea.area_id} — {currentArea.nombre}
        </span>
      </nav>

      {/* Barra de navegación superior con selector de área y flechas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-700 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado de áreas</span>
        </button>

        {/* Navegación secuencial y rápida entre las 12 áreas */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full text-xs">
          <button
            onClick={() => onNavigateArea(prevArea.area_id)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center gap-1"
            title={`Área anterior: ${prevArea.area_id} — ${prevArea.nombre}`}
            aria-label={`Ir al área anterior ${prevArea.area_id}`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-mono font-bold hidden sm:inline">{prevArea.area_id}</span>
          </button>

          <span className="text-slate-300 mx-0.5">|</span>

          {areas.map((a) => (
            <button
              key={a.area_id}
              onClick={() => onNavigateArea(a.area_id)}
              className={`px-2 py-1 rounded font-mono font-bold transition-all ${
                a.area_id === areaId
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={a.nombre}
            >
              {a.area_id}
            </button>
          ))}

          <span className="text-slate-300 mx-0.5">|</span>

          <button
            onClick={() => onNavigateArea(nextArea.area_id)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center gap-1"
            title={`Área siguiente: ${nextArea.area_id} — ${nextArea.nombre}`}
            aria-label={`Ir al área siguiente ${nextArea.area_id}`}
          >
            <span className="font-mono font-bold hidden sm:inline">{nextArea.area_id}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero del Área */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center flex-shrink-0 shadow-xs">
            <AreaIcon name={currentArea.icono} size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                {currentArea.area_id}
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Área Conceptual
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {currentArea.nombre}
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              {currentArea.descripcion}
            </p>
            <div className="pt-3 flex flex-wrap gap-2 items-center">
              <a
                href="#datos-detallados"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-brand-600" />
                <span>Saltar a fichas técnicas y tablas (Nivel 2)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NIVEL 1: RESUMEN VISUAL Y HUMANO (3–5 TARJETAS CLAVE) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-extrabold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
            Nivel 1 · Resumen de la Actividad
          </span>
          <span className="text-xs text-slate-400">
            Estadísticas oficiales explicadas de forma clara
          </span>
        </div>

        <HumanDataCards
          area={currentArea}
          pbgData={pbgData}
          oedeData={oedeData}
          eilData={eilData}
          mipData={mipData}
          onViewTechnicalDetails={(tab) => {
            if (tab) setActiveTab(tab);
            document.getElementById('datos-detallados')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* NIVEL 2: DATOS TÉCNICOS DETALLADOS, TABLAS Y METODOLOGÍA */}
      {/* ========================================================================= */}
      <div id="datos-detallados" className="pt-8 border-t border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400">
              Nivel 2 · Series Estadísticas Completas
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Fichas Técnicas y Tablas por Fuente Oficial
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Seleccioná una fuente para filtrar sus cuadros
          </span>
        </div>
      </div>

      {/* Tabs de Filtro por Fuente */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 text-sm font-medium">
        <button
          onClick={() => setActiveTab('todos')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'todos'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Todas las Fuentes
        </button>
        <button
          onClick={() => setActiveTab('pbg')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'pbg'
              ? 'bg-emerald-700 text-white font-semibold shadow-xs'
              : 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/60'
          }`}
        >
          PBG (DiPEC)
        </button>
        <button
          onClick={() => setActiveTab('oede')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'oede'
              ? 'bg-blue-700 text-white font-semibold shadow-xs'
              : 'text-blue-800 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/60'
          }`}
        >
          OEDE (SIPA)
        </button>
        <button
          onClick={() => setActiveTab('eil')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'eil'
              ? 'bg-purple-700 text-white font-semibold shadow-xs'
              : 'text-purple-800 bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/60'
          }`}
        >
          EIL (Gran Jujuy)
        </button>
        <button
          onClick={() => setActiveTab('mip')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'mip'
              ? 'bg-indigo-700 text-white font-semibold shadow-xs'
              : 'text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200/60'
          }`}
        >
          MIP (Base 2015)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. MÓDULO PBG (DiPEC) */}
      {/* ========================================================================= */}
      {(activeTab === 'todos' || activeTab === 'pbg') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  💰 ¿Cuánto aporta esta actividad a Jujuy?
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  PBG · Producto Bruto Geográfico · DiPEC
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Producto Bruto Geográfico (PBG) a Precios Básicos
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                El PBG permite observar cuánto valor genera una actividad dentro de la economía de la provincia.
              </p>
            </div>

            {/* Selector de modo de precios */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setPbgViewMode('constante')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  pbgViewMode === 'constante' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Precios Constantes (Base 2004)
              </button>
              <button
                onClick={() => setPbgViewMode('corriente')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  pbgViewMode === 'corriente' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Precios Corrientes
              </button>
            </div>
          </div>

          <MethodWarning type="pbg-provisorio" />

          {/* Tarjetas con los valores del último año disponible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestPbgRecords.map((rec) => (
              <div key={rec.id} className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-emerald-900 border border-emerald-200">
                      Rama {rec.codigo_rama}
                    </span>
                    <MissingDataBadge status="PROVISORIO" label={`Año ${rec.periodo_anio}*`} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2 leading-snug">
                    {rec.nombre_rama}
                  </h3>
                  <div className="my-3">
                    <div className="text-2xl font-extrabold text-slate-900">
                      {pbgViewMode === 'constante'
                        ? formatCurrencyMiles(rec.valor_constante)
                        : formatCurrencyMiles(rec.valor_corriente)}
                    </div>
                    <span className="text-xs text-slate-500">
                      {pbgViewMode === 'constante' ? rec.unidad_constante : rec.unidad_corriente}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-100/80 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Hoja: {pbgViewMode === 'constante' ? 'a Precios Constantes' : 'a Precios Corrientes'}</span>
                  <span>DiPEC (Actualiz. Agosto 2025)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla de evolución histórica PBG (Rango configurable 2004-2024*) */}
          <div className="pt-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Serie Histórica PBG ({pbgPeriodRange === 'reciente' ? '2015–2024*' : pbgPeriodRange === 'historico' ? '2004–2014' : 'Serie Completa 2004–2024*'})</span>
              </h3>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setPbgPeriodRange('reciente')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    pbgPeriodRange === 'reciente' ? 'bg-white text-emerald-900 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  2015–2024* (Reciente)
                </button>
                <button
                  onClick={() => setPbgPeriodRange('historico')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    pbgPeriodRange === 'historico' ? 'bg-white text-emerald-900 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  2004–2014
                </button>
                <button
                  onClick={() => setPbgPeriodRange('completo')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    pbgPeriodRange === 'completo' ? 'bg-white text-emerald-900 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Completa (2004–2024*)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Rama</th>
                    <th className="py-2.5 px-3">Nombre Oficial</th>
                    {Array.from(new Set(pbgRecords.map((r) => r.periodo_anio)))
                      .filter((y) => {
                        if (pbgPeriodRange === 'reciente') return y >= 2015;
                        if (pbgPeriodRange === 'historico') return y < 2015;
                        return true;
                      })
                      .sort((a, b) => a - b)
                      .map((year) => (
                        <th key={year} className="py-2.5 px-3 text-right">
                          {year}{[2022, 2023, 2024].includes(year) ? '*' : ''}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pbgBranches.map((branchCode) => {
                    const branchRecs = pbgRecords.filter((r) => r.codigo_rama === branchCode);
                    const name = branchRecs.length > 0 ? branchRecs[0].nombre_rama : branchCode;
                    return (
                      <tr key={branchCode} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{branchCode}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 max-w-[200px] truncate" title={name}>{name}</td>
                        {Array.from(new Set(pbgRecords.map((r) => r.periodo_anio)))
                          .filter((y) => {
                            if (pbgPeriodRange === 'reciente') return y >= 2015;
                            if (pbgPeriodRange === 'historico') return y < 2015;
                            return true;
                          })
                          .sort((a, b) => a - b)
                          .map((year) => {
                            const yRec = branchRecs.find((r) => r.periodo_anio === year);
                            const val = pbgViewMode === 'constante' ? yRec?.valor_constante : yRec?.valor_corriente;
                            return (
                              <td key={year} className="py-2.5 px-3 text-right font-mono text-slate-700">
                                {formatNumber(val, 0)}
                              </td>
                            );
                          })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              * Valores provisorios. Cifras expresadas en {pbgViewMode === 'constante' ? 'Miles de pesos de 2004 (precios constantes base 2004)' : 'Miles de pesos corrientes'}. Fuente: DiPEC.
            </p>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. MÓDULO OEDE (MTEySS / SIPA) */}
      {/* ========================================================================= */}
      {(activeTab === 'todos' || activeTab === 'oede') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                👥 ¿Cuántos puestos de trabajo registrados hay?
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                OEDE · Empleo privado registrado · SIPA
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Puestos de Trabajo Asalariados Registrados del Sector Privado
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Estos datos muestran puestos de trabajo asalariados privados registrados formalmente en la seguridad social (SIPA). Son puestos de trabajo, no necesariamente personas.
            </p>
          </div>

          {!isOEDEAvailable ? (
            /* CASO ESPECIAL A10: NO MOSTRAR 0 */
            <div className="space-y-4">
              <MethodWarning type="oede-a10" />
              <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-200 text-center py-10">
                <div className="inline-flex p-3 rounded-full bg-amber-100 text-amber-800 mb-3">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-amber-900 text-base mb-1">
                  Indicador no publicado en esta fuente para Jujuy
                </h3>
                <p className="text-xs text-amber-800 max-w-xl mx-auto leading-relaxed">
                  El OEDE releva exclusivamente el empleo asalariado registrado del sector privado formal. En la publicación oficial para la provincia de Jujuy no se emite una serie para la Rama L (Administración Pública provincial). Metodológicamente se preserva el estado de no disponibilidad y <strong>no se imputa valor cero</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tarjetas de Nivel Letra del último período */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestOedeLetters.map((rec) => (
                  <div key={rec.id} className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-blue-900 border border-blue-200">
                          Rama {rec.codigo_rama}
                        </span>
                        <MissingDataBadge status={rec.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO' ? 'SIN_DATO_SECRETO_ESTADISTICO' : 'PUBLICADO'} />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-2 leading-snug">
                        {rec.nombre_rama}
                      </h3>
                      <div className="my-3">
                        <div className="text-2xl font-extrabold text-slate-900">
                          {rec.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO'
                            ? 's.d.'
                            : formatNumber(rec.puestos_trabajo, 0)}
                        </div>
                        <span className="text-xs text-slate-500">
                          {rec.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO'
                            ? 'Secreto estadístico (Ley 17.622)'
                            : 'Puestos de trabajo asalariados registrados'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-blue-100/80 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Período: <strong className="text-slate-700">{rec.periodo}</strong></span>
                      <span>OEDE — SIPA</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Apertura a 2 dígitos CIIU Rev. 3 */}
              {oedeDigitBranches.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Desagregación por Rama a 2 Dígitos (Último período: {latestOedePeriod})
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">CIIU 2D</th>
                          <th className="py-2.5 px-3">Rama Específica</th>
                          <th className="py-2.5 px-3">Rama Padre</th>
                          <th className="py-2.5 px-3 text-right">Puestos Registrados</th>
                          <th className="py-2.5 px-3 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {oedeDigitBranches
                          .filter((r) => r.periodo === latestOedePeriod)
                          .map((dRec) => (
                            <tr key={dRec.id} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{dRec.codigo_rama}</td>
                              <td className="py-2.5 px-3 font-medium text-slate-800">{dRec.nombre_rama}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">{dRec.letra_padre}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                                {dRec.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO'
                                  ? 's.d.'
                                  : formatNumber(dRec.puestos_trabajo, 0)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {dRec.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO' ? (
                                  <MissingDataBadge status="SIN_DATO_SECRETO_ESTADISTICO" label="s.d." />
                                ) : (
                                  <span className="text-[11px] text-emerald-700 font-medium">Publicado</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Nota: s.d. indica secreto estadístico para resguardar la identidad de firmas con pocas unidades operativas en la provincia. Fuente: STEySS - OEDE en base a SIPA.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. MÓDULO EIL (MTEySS - Gran Jujuy) */}
      {/* ========================================================================= */}
      {(activeTab === 'todos' || activeTab === 'eil') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                🧩 ¿Qué tipo de tareas aparecen?
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                EIL · Encuesta de Indicadores Laborales · MTEySS
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Indicadores de Dinámica Laboral (Aglomerado Gran Jujuy)
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              La EIL permite observar la composición de los puestos según el tipo de tarea que realizan en empresas de 5 o más ocupados. La clasificación describe la tarea del puesto, no los estudios o títulos de la persona.
            </p>
          </div>

          {!isEILAvailable ? (
            /* CASO ESPECIAL A01, A02, A10: EXCLUSIÓN DE LA MUESTRA */
            <div>
              {['A01', 'A02'].includes(areaId) ? (
                <MethodWarning type="eil-primaria" />
              ) : (
                <div className="p-6 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 text-center py-8">
                  <h3 className="font-bold text-sm mb-1">Sector Público excluido del relevamiento EIL</h3>
                  <p className="text-xs text-slate-600 max-w-lg mx-auto">
                    La Encuesta de Indicadores Laborales releva exclusivamente empresas privadas de 5 y más trabajadores. No incluye la administración pública.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {isEILAgrupada && <MethodWarning type="eil-agrupada" />}

              {/* Indicadores clave de la rama en EIL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Índice de Empleo */}
                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider block mb-1">
                    Índice de Empleo
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 my-2">
                    {latestEilIndex ? formatNumber(latestEilIndex.valor, 2) : 'Sin dato'}
                  </div>
                  <span className="text-xs text-slate-500 block mb-2">
                    Base Febrero 2015 = 100
                  </span>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-purple-100">
                    Período: <strong>{latestEilPeriod}</strong>
                  </div>
                </div>

                {/* Variación Trimestral */}
                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider block mb-1">
                    Variación Trimestral
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 my-2">
                    {latestEilVarTrim ? formatPercent(latestEilVarTrim.valor, 2) : 'Sin dato'}
                  </div>
                  <span className="text-xs text-slate-500 block mb-2">
                    Variación relativa intertrimestral
                  </span>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-purple-100">
                    Período: <strong>{latestEilPeriod}</strong>
                  </div>
                </div>

                {/* Variación Anual */}
                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider block mb-1">
                    Variación Anual
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 my-2">
                    {latestEilVarAnual ? formatPercent(latestEilVarAnual.valor, 2) : 'Sin dato'}
                  </div>
                  <span className="text-xs text-slate-500 block mb-2">
                    Variación interanual relativa
                  </span>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-purple-100">
                    Período: <strong>{latestEilPeriod}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Rama en la fuente original:</strong> <code>{latestEilIndex?.concepto || 'No disponible'}</code>. Para consultar la calificación de la tarea y la demanda laboral desagregada del conjunto del Gran Jujuy, visitá la sección <button onClick={() => onNavigateArea(areaId)} className="text-purple-700 font-bold underline">EIL Gran Jujuy (Transversal)</button>.
                </span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. MÓDULO MIP (DiPEC / CEP XXI) */}
      {/* ========================================================================= */}
      {(activeTab === 'todos' || activeTab === 'mip') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                🔗 ¿Cómo se relaciona esta actividad con otras?
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                MIP · Matriz Insumo-Producto · DiPEC / CEP XXI
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Multiplicadores de Empleo Directo e Indirecto (Año Base 2015)
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              La MIP permite observar cómo una actividad se vincula con otros sectores mediante empleo directo e indirecto. Base 2015 · coeficientes estructurales · no representa empleo actual.
            </p>
          </div>

          <MethodWarning type="mip-base2015" />

          {/* Grilla de Sectores MIP asociados a esta área */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              Sectores MIP correspondientes ({mipSectors.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mipSectors.map((sec) => (
                <div key={sec.sector_mip_id} className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-indigo-900 border border-indigo-200">
                        Sector MIP {sec.sector_mip_id}
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-700">
                        Base 2015
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {sec.nombre_sector}
                    </h4>
                  </div>

                  {/* Multiplicadores Directo / Indirecto / Total */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-100/80 text-center">
                    <div className="p-2 rounded-xl bg-white border border-indigo-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Directo
                      </span>
                      <span className="text-base font-extrabold text-indigo-950 font-mono">
                        {sec.empleo_directo_por_millon !== null ? formatNumber(sec.empleo_directo_por_millon, 3) : '-'}
                      </span>
                      <span className="text-[9px] text-slate-500 block">puestos/M$</span>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-indigo-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Indirecto
                      </span>
                      <span className="text-base font-extrabold text-indigo-700 font-mono">
                        {sec.empleo_indirecto_por_millon !== null ? formatNumber(sec.empleo_indirecto_por_millon, 3) : '-'}
                      </span>
                      <span className="text-[9px] text-slate-500 block">en proveedores</span>
                    </div>

                    <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-indigo-200 block">
                        Total
                      </span>
                      <span className="text-base font-extrabold font-mono">
                        {sec.multiplicador_total_por_millon !== null ? formatNumber(sec.multiplicador_total_por_millon, 3) : '-'}
                      </span>
                      <span className="text-[9px] text-indigo-200 block">impacto</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span>VBP Nacional 2015:</span>
                      <span className="font-medium text-slate-700">{formatNumber(sec.vbp_millones_pesos_2015, 0)} M$</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Densidad laboral directa:</span>
                      <span className="font-mono text-slate-700">{sec.densidad_laboral_directa}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400">
              Unidad: Puestos de trabajo generados o sostenidos por cada $1.000.000 de Valor Bruto de Producción a precios de 2015. Fuente: DiPEC en base a CEP XXI.
            </p>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. MATRIZ DE TRAZABILIDAD DEL ÁREA */}
      {/* ========================================================================= */}
      <section className="bg-slate-100/90 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-slate-600" />
          Trazabilidad y Correspondencias Metodológicas de {currentArea.area_id}
        </h3>
        <p className="text-xs text-slate-600">
          Rastro auditable de las ramas y códigos originales en cada fuente asignados a esta área conceptual:
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Fuente</th>
                <th className="py-2.5 px-3">Código Fuente</th>
                <th className="py-2.5 px-3">Nombre en la Fuente</th>
                <th className="py-2.5 px-3">Tipo Correspondencia</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3">Observación Metodológica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {areaCorrespondencias.map((c) => (
                <tr key={c.correspondencia_id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-800">{c.fuente}</td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-700">{c.codigo_fuente}</td>
                  <td className="py-2 px-3 text-slate-800 max-w-[220px]">{c.nombre_fuente}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700">
                      {c.tipo_correspondencia}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      c.estado === 'CONFIRMADO' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                    }`}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-500 text-[11px] leading-relaxed">{c.observacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Navegación secuencial inferior */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <button
          onClick={() => {
            onNavigateArea(prevArea.area_id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-full sm:w-auto flex items-center gap-3 text-left p-2.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all group"
          aria-label={`Ir al área anterior ${prevArea.area_id}`}
        >
          <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-brand-700 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider block">Área Anterior</span>
            <span className="text-xs font-bold text-slate-800 group-hover:text-brand-700">{prevArea.area_id} — {prevArea.nombre}</span>
          </div>
        </button>

        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-brand-700 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Volver al Explorador de Áreas
        </button>

        <button
          onClick={() => {
            onNavigateArea(nextArea.area_id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 text-right p-2.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all group"
          aria-label={`Ir a la siguiente área ${nextArea.area_id}`}
        >
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider block">Siguiente Área</span>
            <span className="text-xs font-bold text-slate-800 group-hover:text-brand-700">{nextArea.area_id} — {nextArea.nombre}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-700 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
};
