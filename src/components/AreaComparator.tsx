import React, { useState } from 'react';
import { Area, AreaId } from '../types';
import { getAreaOverview, getProvincialOverview } from '../data-access/dataAdapter';
import { formatNumber } from '../utils/formatters';
import {
  ArrowLeftRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Users,
  Network,
  Building2,
  ExternalLink,
  Scale,
  Sparkles
} from 'lucide-react';

interface AreaComparatorProps {
  areas: Area[];
  initialArea1Id?: AreaId;
  initialArea2Id?: AreaId;
  onSelectArea?: (areaId: AreaId) => void;
}

export const AreaComparator: React.FC<AreaComparatorProps> = ({
  areas,
  initialArea1Id = 'A01',
  initialArea2Id = 'A03',
  onSelectArea,
}) => {
  const [area1Id, setArea1Id] = useState<AreaId>(initialArea1Id);
  const [area2Id, setArea2Id] = useState<AreaId>(initialArea2Id);
  const [pbgPriceMode, setPbgPriceMode] = useState<'constante' | 'corriente'>('constante');

  const area1 = areas.find((a) => a.area_id === area1Id) || areas[0];
  const area2 = areas.find((a) => a.area_id === area2Id) || areas[1];

  const ov1 = getAreaOverview(area1Id);
  const ov2 = getAreaOverview(area2Id);

  const handleSwap = () => {
    const temp = area1Id;
    setArea1Id(area2Id);
    setArea2Id(temp);
  };

  const setPreset = (a1: AreaId, a2: AreaId) => {
    setArea1Id(a1);
    setArea2Id(a2);
  };

  // Comparaciones estadísticas rigurosas
  const provincial = getProvincialOverview();

  // 1. PBG: cálculo dinámico y estrictamente consistente con el modo de precios seleccionado
  const isConstante = pbgPriceMode === 'constante';
  const totalProvPbg = isConstante
    ? provincial.pbgTotalConstanteMiles
    : provincial.pbgTotalCorrienteMiles;

  const pbg1Val = isConstante ? ov1?.pbg.valorConstanteMiles : ov1?.pbg.valorCorrienteMiles;
  const pbg2Val = isConstante ? ov2?.pbg.valorConstanteMiles : ov2?.pbg.valorCorrienteMiles;

  const pbg1Pct = (pbg1Val !== null && pbg1Val !== undefined && totalProvPbg !== null && totalProvPbg > 0)
    ? Number(((pbg1Val / totalProvPbg) * 100).toFixed(2))
    : null;

  const pbg2Pct = (pbg2Val !== null && pbg2Val !== undefined && totalProvPbg !== null && totalProvPbg > 0)
    ? Number(((pbg2Val / totalProvPbg) * 100).toFixed(2))
    : null;

  const canComparePbg = pbg1Pct !== null && pbg2Pct !== null && totalProvPbg !== null;
  const maxPbgPct = canComparePbg ? Math.max(pbg1Pct, pbg2Pct, 0.1) : 0.1;

  // 2. OEDE
  const oede1Puestos = ov1?.oede.puestosTrabajo;
  const oede2Puestos = ov2?.oede.puestosTrabajo;
  const oede1Avail = ov1?.oede.disponible && oede1Puestos !== null;
  const oede2Avail = ov2?.oede.disponible && oede2Puestos !== null;
  const oede1Period = oede1Avail ? (ov1?.oede.ultimoPeriodo || '') : '';
  const oede2Period = oede2Avail ? (ov2?.oede.ultimoPeriodo || '') : '';
  const areOedePeriodsIdentical = oede1Avail && oede2Avail && oede1Period === oede2Period && oede1Period !== '';
  const hasOedePeriodMismatch = oede1Avail && oede2Avail && oede1Period !== oede2Period;
  const oedeHeaderPeriod = areOedePeriodsIdentical
    ? oede1Period
    : (oede1Avail && oede2Avail)
      ? `${oede1Period} vs ${oede2Period}`
      : (oede1Period || oede2Period || provincial.oedeUltimoPeriodo || 'Período no disponible');
  const maxOede = Math.max(oede1Puestos || 0, oede2Puestos || 0, 1);

  // 3. EIL
  const eil1Avail = ov1?.eil.disponible;
  const eil2Avail = ov2?.eil.disponible;
  const eilBothGrouped = (area1Id === 'A06' && area2Id === 'A07') || (area1Id === 'A07' && area2Id === 'A06');

  // 4. MIP
  const mip1Mult = ov1?.mip.multiplicadorTotalPromedio;
  const mip2Mult = ov2?.mip.multiplicadorTotalPromedio;
  const mip1Direct = ov1?.mip.empleoDirectoPromedio;
  const mip2Direct = ov2?.mip.empleoDirectoPromedio;

  return (
    <div className="space-y-8 py-2 animate-fade-in" data-testid="area-comparator">
      {/* Selector superior y presets */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Comparador Estadístico Riguroso</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Comparación Paralela entre Dos Áreas de Jujuy
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Contrastá la generación de valor (PBG), empleo registrado (OEDE), cobertura laboral (EIL) y multiplicadores estructurales (MIP).
            </p>
          </div>

          {/* Presets rápidos */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Ejemplos:
            </span>
            <button
              onClick={() => setPreset('A01', 'A03')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              🌾 Agro vs 🏭 Industria
            </button>
            <button
              onClick={() => setPreset('A06', 'A07')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              🛒 Comercio vs 🏨 Turismo
            </button>
            <button
              onClick={() => setPreset('A02', 'A04')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              ⛏️ Minería vs ⚡ Energía
            </button>
            <button
              onClick={() => setPreset('A10', 'A11')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              title="Demuestra tratamiento de ausencia de datos en A10"
            >
              🏛️ Adm. Pública vs 🏥 Salud
            </button>
          </div>
        </div>

        {/* Controles de selección de Área 1 y Área 2 con botón Swap */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
          {/* Selector Área 1 */}
          <div className="lg:col-span-5 bg-slate-50 p-4 rounded-2xl border-2 border-brand-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold text-brand-700 tracking-wider">
                Área 1 (Referencia)
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                {area1.area_id}
              </span>
            </div>
            <select
              aria-label="Seleccionar Área 1 para comparar"
              value={area1Id}
              onChange={(e) => setArea1Id(e.target.value as AreaId)}
              className="w-full text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
            >
              {areas.map((a) => (
                <option key={a.area_id} value={a.area_id} disabled={a.area_id === area2Id}>
                  {a.icono} {a.area_id} — {a.nombre}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {area1.descripcion}
            </p>
          </div>

          {/* Botón Intercambiar */}
          <div className="lg:col-span-1 flex justify-center py-2 lg:py-0">
            <button
              onClick={handleSwap}
              type="button"
              className="p-3 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 border border-slate-200 shadow-xs transition-all hover:rotate-180 focus:outline-none focus:ring-2 focus:ring-brand-500"
              title="Intercambiar orden de comparación"
              aria-label="Intercambiar Área 1 y Área 2"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* Selector Área 2 */}
          <div className="lg:col-span-5 bg-slate-50 p-4 rounded-2xl border-2 border-indigo-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold text-indigo-700 tracking-wider">
                Área 2 (Contraste)
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                {area2.area_id}
              </span>
            </div>
            <select
              aria-label="Seleccionar Área 2 para comparar"
              value={area2Id}
              onChange={(e) => setArea2Id(e.target.value as AreaId)}
              className="w-full text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            >
              {areas.map((a) => (
                <option key={a.area_id} value={a.area_id} disabled={a.area_id === area1Id}>
                  {a.icono} {a.area_id} — {a.nombre}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {area2.descripcion}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DIMENSIÓN 1: PBG (PRODUCCIÓN Y VALOR AGREGADO) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-5" aria-labelledby="heading-pbg-comp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 id="heading-pbg-comp" className="text-lg font-bold text-slate-900">
                1. Participación en el Producto Bruto Geográfico (PBG)
              </h3>
              <span className="text-xs text-slate-500">
                Fuente: DiPEC Jujuy · Año de referencia 2024 (Dato provisorio *)
              </span>
            </div>
          </div>

          {/* Toggle Constante vs Corriente */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setPbgPriceMode('constante')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pbgPriceMode === 'constante'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Precios Constantes 2004 (Real)
            </button>
            <button
              onClick={() => setPbgPriceMode('corriente')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pbgPriceMode === 'corriente'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Precios Corrientes (Nominal)
            </button>
          </div>
        </div>

        {/* Barras comparativas de PBG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Área 1 PBG */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
                <span>{area1.icono}</span> {area1.nombre} ({area1.area_id})
              </span>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                2024*
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {pbg1Pct !== null ? `${pbg1Pct}%` : 's/d'}
                </div>
                <div className="text-xs text-slate-500">
                  del PBG provincial ({isConstante ? 'precios constantes 2004' : 'precios corrientes'})
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-700 font-mono">
                  {pbg1Val !== null && pbg1Val !== undefined ? `$${formatNumber(pbg1Val, 0)} mil` : 'Sin dato'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isConstante ? 'Miles $ de 2004' : 'Miles $ corrientes'}
                </div>
              </div>
            </div>
            {/* Visual Gauge Bar */}
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-500"
                style={{ width: `${canComparePbg ? Math.min(100, ((pbg1Pct || 0) / maxPbgPct) * 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Card Área 2 PBG */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                <span>{area2.icono}</span> {area2.nombre} ({area2.area_id})
              </span>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                2024*
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {pbg2Pct !== null ? `${pbg2Pct}%` : 's/d'}
                </div>
                <div className="text-xs text-slate-500">
                  del PBG provincial ({isConstante ? 'precios constantes 2004' : 'precios corrientes'})
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-700 font-mono">
                  {pbg2Val !== null && pbg2Val !== undefined ? `$${formatNumber(pbg2Val, 0)} mil` : 'Sin dato'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isConstante ? 'Miles $ de 2004' : 'Miles $ corrientes'}
                </div>
              </div>
            </div>
            {/* Visual Gauge Bar */}
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${canComparePbg ? Math.min(100, ((pbg2Pct || 0) / maxPbgPct) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Síntesis metodológica PBG */}
        {canComparePbg ? (
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Comparabilidad válida:</strong> Ambos indicadores corresponden al mismo período (2024, provisorio *) y a la misma unidad homogénea ({isConstante ? 'precios constantes con base 2004 para evaluar volumen real' : 'precios nominales corrientes'}).
              {pbg1Pct! > pbg2Pct!
                ? ` ${area1.nombre} aporta ${formatNumber(pbg1Pct! - pbg2Pct!, 2)} puntos porcentuales más de producto provincial que ${area2.nombre}.`
                : pbg2Pct! > pbg1Pct!
                ? ` ${area2.nombre} aporta ${formatNumber(pbg2Pct! - pbg1Pct!, 2)} puntos porcentuales más de producto provincial que ${area1.nombre}.`
                : ' Ambas áreas tienen una participación equivalente en el PBG provincial.'}
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              No hay datos oficiales suficientes para comparar la participación relativa en el PBG provincial para este corte temporal.
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* DIMENSIÓN 2: EMPLEO ASALARIADO REGISTRADO PRIVADO (OEDE / SIPA) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-5" aria-labelledby="heading-oede-comp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 id="heading-oede-comp" className="text-lg font-bold text-slate-900">
                2. Empleo Asalariado Registrado en el Sector Privado (OEDE / SIPA)
              </h3>
              <span className="text-xs text-slate-500">
                Puestos de trabajo formales privados declarados · Período {oedeHeaderPeriod}
              </span>
            </div>
          </div>
        </div>

        {/* Verificación de compatibilidad OEDE */}
        {(!oede1Avail || !oede2Avail) ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Limitación Metodológica de Cobertura en OEDE</span>
            </div>
            <p className="leading-relaxed">
              {!oede1Avail && !oede2Avail ? (
                <>Ni <strong>{area1.nombre}</strong> ni <strong>{area2.nombre}</strong> poseen serie de puestos en OEDE Jujuy para este corte temporal.</>
              ) : !oede1Avail ? (
                <>
                  <strong>{area1.nombre} ({area1.area_id})</strong> no posee datos en OEDE. {ov1?.oede.motivoNoDisponible || 'Dato no disponible en la serie provincial.'} Por rigor estadístico, <strong>no se computa como cero</strong> para no producir comparaciones falsas con {area2.nombre}.
                </>
              ) : (
                <>
                  <strong>{area2.nombre} ({area2.area_id})</strong> no posee datos en OEDE. {ov2?.oede.motivoNoDisponible || 'Dato no disponible en la serie provincial.'} Por rigor estadístico, <strong>no se computa como cero</strong> para no producir comparaciones falsas con {area1.nombre}.
                </>
              )}
            </p>
          </div>
        ) : null}

        {/* Tarjetas de empleo OEDE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Área 1 OEDE */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
                <span>{area1.icono}</span> {area1.nombre} ({area1.area_id})
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                {oede1Avail ? (ov1?.oede.ultimoPeriodo || 's/d') : (area1Id === 'A10' ? 'No aplica' : 'Sin dato')}
              </span>
            </div>
            {oede1Avail ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {formatNumber(oede1Puestos || 0, 0)}
                    </div>
                    <div className="text-xs text-slate-500">puestos asalariados formales privados</div>
                  </div>
                  {ov1?.oede.tieneSecretoEstadistico && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      Dato Parcial · Secreto Estadístico
                    </span>
                  )}
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((oede1Puestos || 0) / maxOede) * 100)}%` }}
                  />
                </div>
                {!ov1?.oede.esCompleto && (
                  <p className="text-[11px] text-amber-900 bg-amber-50/80 rounded-xl p-2.5 border border-amber-200 leading-snug">
                    ⚠️ <strong>Subtotal parcial:</strong> No equivale al total del sector ({area1.nombre}) porque contiene ramas bajo secreto estadístico oficial (Ley 17.622).
                  </p>
                )}
              </>
            ) : (
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 italic">
                {ov1?.oede.motivoNoDisponible || 'No disponible en el registro OEDE Jujuy.'}
              </div>
            )}
          </div>

          {/* Card Área 2 OEDE */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                <span>{area2.icono}</span> {area2.nombre} ({area2.area_id})
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                {oede2Avail ? (ov2?.oede.ultimoPeriodo || 's/d') : (area2Id === 'A10' ? 'No aplica' : 'Sin dato')}
              </span>
            </div>
            {oede2Avail ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {formatNumber(oede2Puestos || 0, 0)}
                    </div>
                    <div className="text-xs text-slate-500">puestos asalariados formales privados</div>
                  </div>
                  {ov2?.oede.tieneSecretoEstadistico && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      Dato Parcial · Secreto Estadístico
                    </span>
                  )}
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((oede2Puestos || 0) / maxOede) * 100)}%` }}
                  />
                </div>
                {!ov2?.oede.esCompleto && (
                  <p className="text-[11px] text-amber-900 bg-amber-50/80 rounded-xl p-2.5 border border-amber-200 leading-snug">
                    ⚠️ <strong>Subtotal parcial:</strong> No equivale al total del sector ({area2.nombre}) porque contiene ramas bajo secreto estadístico oficial (Ley 17.622).
                  </p>
                )}
              </>
            ) : (
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 italic">
                {ov2?.oede.motivoNoDisponible || 'No disponible en el registro OEDE Jujuy.'}
              </div>
            )}
          </div>
        </div>

        {/* Conclusión y Comparabilidad OEDE */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
          {oede1Avail && oede2Avail ? (
            !hasOedePeriodMismatch && areOedePeriodsIdentical ? (
              <>
                <p className="leading-relaxed">
                  <strong>Comparabilidad temporal válida:</strong> Ambos indicadores corresponden al mismo período ({oede1Period}) y a la misma unidad homogénea (puestos asalariados registrados en el sector privado según SIPA).
                </p>
                {(!ov1?.oede.esCompleto || !ov2?.oede.esCompleto) ? (
                  <p className="text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                    ⚠️ <strong>Comparación limitada:</strong> Uno o ambos sectores poseen cobertura parcial por secreto estadístico. Los valores no representan el total completo del sector y no deben compararse como magnitudes exhaustivas.
                  </p>
                ) : (
                  <p className="text-slate-800 font-medium">
                    👥 <strong>Diferencia sectorial:</strong>{' '}
                    {oede1Puestos! > oede2Puestos! ? (
                      <>
                        <strong>{area1.nombre}</strong> registra {formatNumber(oede1Puestos! - oede2Puestos!, 0)} puestos registrados más que <strong>{area2.nombre}</strong>.
                      </>
                    ) : oede1Puestos! < oede2Puestos! ? (
                      <>
                        <strong>{area2.nombre}</strong> registra {formatNumber(oede2Puestos! - oede1Puestos!, 0)} puestos registrados más que <strong>{area1.nombre}</strong>.
                      </>
                    ) : (
                      <>Ambos sectores registran exactamente la misma cantidad de puestos de trabajo ({formatNumber(oede1Puestos!, 0)}).</>
                    )}
                  </p>
                )}
              </>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Discrepancia Temporal en OEDE</span>
                </div>
                <p className="leading-relaxed">
                  Los registros no corresponden al mismo período: <strong>{area1.nombre}</strong> cuenta con datos de <strong>{oede1Period}</strong> mientras que <strong>{area2.nombre}</strong> cuenta con datos de <strong>{oede2Period}</strong>. Por rigor estadístico, <strong>no se comparan magnitudes directamente</strong> al carecer de homogeneidad temporal.
                </p>
              </div>
            )
          ) : (
            <p className="text-slate-600 italic">
              No es posible realizar una comparación directa de empleo formal porque una o ambas actividades no cuentan con serie en OEDE para el período seleccionado.
            </p>
          )}
          <p className="text-slate-500 text-[11px]">
            ℹ️ <em>Fuente oficial:</em> Sistema Integrado Previsional Argentino (SIPA) / Observatorio de Empleo y Dinámica Empresarial (OEDE). No incluye empleo informal, monotributistas, autónomos ni administración pública.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DIMENSIÓN 3: DINÁMICA LABORAL EN GRAN JUJUY (EIL - MTEySS) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-5" aria-labelledby="heading-eil-comp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="heading-eil-comp" className="text-lg font-bold text-slate-900">
                3. Dinámica Laboral Urbana (EIL Gran Jujuy)
              </h3>
              <span className="text-xs text-slate-500">
                MTEySS · Empresas privadas de 5 y más ocupados en aglomerado urbano
              </span>
            </div>
          </div>
        </div>

        {/* Verificación de compatibilidad EIL */}
        {eilBothGrouped ? (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-purple-900 text-sm">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span>Rama Conjunta Indivisible en EIL</span>
            </div>
            <p className="leading-relaxed">
              En el relevamiento de la Encuesta de Indicadores Laborales, <strong>Comercio (A06)</strong> y <strong>Hoteles y Restaurantes (A07)</strong> se publican integradas en la categoría <em>&quot;Comercio, restaurantes y hoteles&quot;</em>.
              <strong>No es metodológicamente correcto desagregarlas</strong> porque comparten la misma muestra y estimador de empleo en el aglomerado Gran Jujuy.
            </p>
          </div>
        ) : (!eil1Avail || !eil2Avail) ? (
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              <span>Exclusión Metodológica en EIL</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              {!eil1Avail && (
                <li>
                  <strong>{area1.nombre} ({area1.area_id}):</strong> {ov1?.eil.motivoExclusion || 'Excluida del relevamiento urbano.'}
                </li>
              )}
              {!eil2Avail && (
                <li>
                  <strong>{area2.nombre} ({area2.area_id}):</strong> {ov2?.eil.motivoExclusion || 'Excluida del relevamiento urbano.'}
                </li>
              )}
            </ul>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Ambas áreas cuentan con seguimiento sectorial en la EIL para Gran Jujuy. Sus índices reflejan la evolución del empleo formal en empresas de 5 y más ocupados con base Febrero 2015 = 100.
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* DIMENSIÓN 4: ENLACES INTERSECTORIALES Y MULTIPLICADORES (MIP 2015) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-5" aria-labelledby="heading-mip-comp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 id="heading-mip-comp" className="text-lg font-bold text-slate-900">
                4. Estructura de Enlaces y Multiplicadores de Empleo (MIP 2015)
              </h3>
              <span className="text-xs text-slate-500">
                Matriz Insumo-Producto de Jujuy · Año Base 2015 (Coeficientes Estructurales)
              </span>
            </div>
          </div>
          <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl font-medium self-start sm:self-auto">
            Base fija 2015 · Coeficientes técnicos
          </span>
        </div>

        {/* Tarjetas comparativas MIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Área 1 MIP */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
                <span>{area1.icono}</span> {area1.nombre} ({area1.area_id})
              </span>
              <span className="text-xs font-mono text-slate-500">
                {ov1?.mip.sectoresAsignados} sector(es) MIP
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Multiplicador Total</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {mip1Mult !== null && mip1Mult !== undefined ? formatNumber(mip1Mult, 2) : 's/d'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Empleo Directo / M$</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {mip1Direct !== null && mip1Direct !== undefined ? formatNumber(mip1Direct, 2) : 's/d'}
                </span>
              </div>
            </div>
          </div>

          {/* Card Área 2 MIP */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                <span>{area2.icono}</span> {area2.nombre} ({area2.area_id})
              </span>
              <span className="text-xs font-mono text-slate-500">
                {ov2?.mip.sectoresAsignados} sector(es) MIP
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Multiplicador Total</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {mip2Mult !== null && mip2Mult !== undefined ? formatNumber(mip2Mult, 2) : 's/d'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Empleo Directo / M$</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {mip2Direct !== null && mip2Direct !== undefined ? formatNumber(mip2Direct, 2) : 's/d'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          * Advertencia obligatoria: Los multiplicadores reflejan el estímulo intersectorial que genera $1 millón de demanda final (en moneda de 2015) sobre el resto de la matriz productiva jujeña. <strong>No representan la cantidad de trabajadores actuales</strong> de ninguna de las actividades.
        </p>
      </section>

      {/* Enlaces directos a fichas completas */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 text-white shadow-xs">
        <div>
          <h4 className="font-bold text-sm sm:text-base">¿Querés profundizar en una de estas áreas?</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Consultá la ficha técnica integral con series históricas, correspondencias oficiales CLAE y desglose metodológico.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          {onSelectArea && (
            <>
              <button
                onClick={() => onSelectArea(area1Id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors"
              >
                <span>Ficha {area1.area_id}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSelectArea(area2Id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
              >
                <span>Ficha {area2.area_id}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
