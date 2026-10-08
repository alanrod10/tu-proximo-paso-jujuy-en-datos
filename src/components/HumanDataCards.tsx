import React, { useState } from 'react';
import { Area, TipoTareaInteres, PBGDataset, OEDEDataset, EILDataset, MIPDataset } from '../types';
import { formatNumber } from '../utils/formatters';
import { 
  TrendingUp, 
  Users, 
  Network, 
  Briefcase, 
  BarChart2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Sparkles,
  Info
} from 'lucide-react';

import defaultPbg from '../../data/pbg.json';
import defaultOede from '../../data/empleo_oede.json';
import defaultEil from '../../data/eil.json';
import defaultMip from '../../data/mip_empleo.json';

interface HumanDataCardsProps {
  area: Area;
  tipoTareaInteres?: TipoTareaInteres | null;
  onViewTechnicalDetails: (tab?: 'pbg' | 'oede' | 'eil' | 'mip') => void;
  pbgData?: PBGDataset;
  oedeData?: OEDEDataset;
  eilData?: EILDataset;
  mipData?: MIPDataset;
}

export const HumanDataCards: React.FC<HumanDataCardsProps> = ({
  area,
  tipoTareaInteres,
  onViewTechnicalDetails,
  pbgData = defaultPbg as PBGDataset,
  oedeData = defaultOede as OEDEDataset,
  eilData = defaultEil as EILDataset,
  mipData = defaultMip as MIPDataset,
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleExpand = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  // 1. DATOS PBG
  const pbgRecords = pbgData.series
    .filter((r) => r.area_id === area.area_id)
    .sort((a, b) => b.periodo_anio - a.periodo_anio);
  
  const latestPbgYear = pbgRecords.length > 0 ? pbgRecords[0].periodo_anio : 2024;
  const latestPbgRecs = pbgRecords.filter((r) => r.periodo_anio === latestPbgYear);
  const totalValConstante = latestPbgRecs.reduce((acc, r) => acc + (r.valor_constante || 0), 0);
  const totalValCorriente = latestPbgRecs.reduce((acc, r) => acc + (r.valor_corriente || 0), 0);
  
  // Total PBG provincial para cálculo derivado de participación
  const totalProvincialPbg = pbgData.series
    .filter((r) => r.codigo_rama === 'TOTAL' && r.periodo_anio === latestPbgYear)[0]?.valor_constante || 1;
  const pbgSharePctNum = ((totalValConstante / totalProvincialPbg) * 100);
  const pbgSharePct = pbgSharePctNum.toFixed(1);

  // 2. DATOS OEDE
  const isA10 = area.area_id === 'A10';
  const oedeRecords = oedeData.series.filter((r) => r.area_id === area.area_id);
  const oedeLetterBranches = oedeRecords.filter((r) => r.tipo_nivel === 'LETRA');
  const oedePeriods = Array.from(new Set(oedeRecords.map((r) => r.periodo)));
  const latestOedePeriod = oedePeriods.length > 0 ? oedePeriods[oedePeriods.length - 1] : '';
  const latestOedeLetters = oedeLetterBranches.filter((r) => r.periodo === latestOedePeriod);
  
  const totalPuestosOede = latestOedeLetters.reduce((acc, r) => {
    return acc + (r.puestos_trabajo || 0);
  }, 0);
  const hasOedeSecret = latestOedeLetters.some((r) => r.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO');

  // 3. DATOS MIP
  const mipSectors = mipData.sectores.filter((s) => s.area_id === area.area_id);
  const primaryMipSector = mipSectors.length > 0 ? mipSectors[0] : null;

  // 4. DATOS EIL
  const isPrimaria = ['A01', 'A02'].includes(area.area_id);
  const isAgrupada = ['A06', 'A07'].includes(area.area_id);
  const eilKey = isAgrupada ? 'A06_A07_AGRUPADA' : area.area_id;
  const eilBranchRecords = eilData.tabla_3_9_2_evolucion_y_ramas.filter((r) => r.area_id === eilKey);
  const eilPeriods = Array.from(new Set(eilBranchRecords.map((r) => r.periodo)));
  const latestEilPeriod = eilPeriods.length > 0 ? eilPeriods[eilPeriods.length - 1] : '';
  const latestEilIndex = eilBranchRecords.find((r) => r.periodo === latestEilPeriod && r.bloque === 'INDICE_POR_RAMA');

  return (
    <div className="space-y-6">
      {/* ======================================================================= */}
      {/* TARJETA 1: ¿CUÁNTO APORTA ESTA ACTIVIDAD? (PBG)                         */}
      {/* ======================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm hover:border-emerald-300 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-100 shadow-2xs">
              <TrendingUp className="w-6 h-6" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className="text-[11px] uppercase tracking-wider font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200"
                  aria-label="¿Cuánto produce esta actividad?"
                >
                  💰 ¿Cuánto aporta esta actividad a Jujuy?
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  PBG · Producto Bruto Geográfico · DiPEC
                </span>
              </div>

              {/* Explicación sencilla de primer nivel */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                El PBG permite observar cuánto valor genera una actividad dentro de la economía de la provincia.
              </p>

              {/* Número visual principal */}
              <div className="pt-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 
                    className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
                    aria-label={`Aproximadamente ${pbgSharePct}% del PBG provincial`}
                  >
                    {pbgSharePctNum > 0 ? `Aporta aproximadamente el ${pbgSharePct}%` : 'Actividad Relevada'}
                  </h3>
                  <span className="text-sm font-bold text-slate-600">del PBG provincial</span>
                </div>

                {/* Aclaración metodológica obligatoria O-01 (Cálculo derivado) */}
                <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-[11px] text-emerald-900 font-semibold">
                  <Info className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Cálculo derivado a partir de los valores publicados por DiPEC.</span>
                </div>
              </div>

              {/* Barra visual de peso relativo */}
              {pbgSharePctNum > 0 && (
                <div className="space-y-1 pt-1 max-w-md">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(Math.max(pbgSharePctNum, 4), 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0%</span>
                    <span>Peso provincial relativo</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              {/* Valor absoluto registrado legible y sin $$ */}
              <div className="pt-2 space-y-1 max-w-2xl">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Valor registrado: <strong>$ {formatNumber(totalValConstante / 1000, 2)} millones</strong> de pesos de 2004 ({latestPbgYear}*).
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Unidad oficial: {formatNumber(totalValConstante, 0)} miles de pesos de 2004 · precios constantes · fuente DiPEC ($ {formatNumber(totalValCorriente / 1000, 2)} millones a precios corrientes)
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => toggleExpand('pbg')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Ver más información sobre actividad económica"
          >
            {expandedCard === 'pbg' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Footer simple y directo */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Fuente oficial: DiPEC · Serie continua 2004–2024* · Base 2004</span>
          <button
            onClick={() => onViewTechnicalDetails('pbg')}
            className="font-bold text-emerald-700 hover:text-emerald-900 transition-colors flex items-center gap-1"
          >
            <span>Ver serie completa (21 años) y cuadros técnicos</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Expansor explicativo humano */}
        {expandedCard === 'pbg' && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-slate-700 space-y-2">
            <p>
              <strong>¿Qué significa este indicador?</strong> El Producto Bruto Geográfico (PBG) mide el valor agregado monetario de bienes y servicios generados por cada rama económica dentro del territorio provincial. Representa valor de producción, no ganancias empresariales ni dinero individual a repartir.
            </p>
            <p className="text-slate-600">
              Las ramas oficiales ({latestPbgRecs.map((r) => r.codigo_rama).join(', ')}) se reportan a precios constantes (descontando el efecto inflacionario para reflejar el volumen físico de producción) y a precios corrientes de cada ejercicio.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* TARJETA 2: EMPLEO PRIVADO REGISTRADO (OEDE)                             */}
      {/* ======================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100 shadow-sm hover:border-blue-300 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-2xs">
              <Users className="w-6 h-6" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className="text-[11px] uppercase tracking-wider font-black text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200"
                  aria-label="¿Cuántos puestos registra?"
                >
                  👥 ¿Cuántos puestos de trabajo registrados hay?
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  OEDE · Empleo privado registrado · SIPA
                </span>
              </div>

              {/* Explicación sencilla de primer nivel */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                Son puestos de trabajo asalariados del sector privado registrados formalmente en la seguridad social. Son puestos de trabajo, no necesariamente personas.
              </p>
              <span className="text-xs text-slate-500 font-medium block">
                Un puesto de trabajo no equivale necesariamente a una persona.
              </span>

              {isA10 ? (
                <div className="space-y-1 pt-1">
                  <h3 className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight">
                    Serie no aplicable en esta fuente para Jujuy
                  </h3>
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    El OEDE releva exclusivamente el empleo formal asalariado del sector privado registrado ante el SIPA. La serie para Jujuy no incluye la Rama L. <strong>Esta ausencia metodológica no implica que no exista empleo público en la provincia.</strong>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 pt-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {totalPuestosOede > 0 ? formatNumber(totalPuestosOede, 0) : '—'}
                    </h3>
                    <span className="text-sm font-bold text-slate-600">puestos asalariados registrados</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                    Trabajadores registrados bajo relación de dependencia en empresas privadas declaradas ante el SIPA en la provincia ({latestOedePeriod}).
                    {hasOedeSecret && ' Algunas actividades específicas se encuentran resguardadas por secreto estadístico (s.d.).'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => toggleExpand('oede')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Ver más información sobre empleo registrado"
          >
            {expandedCard === 'oede' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Footer simple y directo */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Fuente oficial: OEDE en base a SIPA · {isA10 ? 'No aplica' : latestOedePeriod}</span>
          <button
            onClick={() => onViewTechnicalDetails('oede')}
            className="font-bold text-blue-700 hover:text-blue-900 transition-colors flex items-center gap-1"
          >
            <span>Ver serie trimestral y ramas a 2 dígitos</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Expansor explicativo humano */}
        {expandedCard === 'oede' && (
          <div className="mt-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 space-y-2">
            <p>
              <strong>¿Qué contempla este registro?</strong> Puestos de trabajo de asalariados formalmente declarados por empresas privadas con CUIT en Jujuy.
            </p>
            <p className="text-slate-600">
              No incluye la administración pública provincial ni municipal, ni el trabajo informal, ni a trabajadores independientes (autónomos o monotributistas). No representan la totalidad de personas ocupadas de la provincia ni vacantes u ofertas de empleo disponibles.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* TARJETA 3: ¿CÓMO SE RELACIONA CON OTRAS? (MIP)                          */}
      {/* ======================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-indigo-100 shadow-sm hover:border-indigo-300 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 border border-indigo-100 shadow-2xs">
              <Network className="w-6 h-6" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className="text-[11px] uppercase tracking-wider font-black text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200"
                  aria-label="¿Cómo se relaciona con otras actividades?"
                >
                  🔗 ¿Cómo se relaciona esta actividad con otras?
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  MIP · Matriz Insumo-Producto · DiPEC / CEP XXI
                </span>
              </div>

              {/* Explicación sencilla de primer nivel */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                La MIP permite observar cómo una actividad se vincula con otros sectores mediante empleo directo e indirecto. La MIP muestra relaciones entre actividades mediante empleo directo e indirecto.
              </p>

              {/* Advertencia obligatoria visible */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-100/70 border border-indigo-200 text-[11px] text-indigo-950 font-bold">
                <Info className="w-3.5 h-3.5 text-indigo-700 flex-shrink-0" />
                <span>Base 2015 · coeficientes estructurales · no representa empleo actual.</span>
              </div>

              {/* Diagrama visual de flujo directo -> indirecto -> total */}
              {primaryMipSector && (
                <div className="pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Directo */}
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 block">
                          Empleo Directo
                        </span>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          {primaryMipSector.empleo_directo_por_millon ? formatNumber(primaryMipSector.empleo_directo_por_millon, 2) : '—'}
                        </div>
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <span className="text-[10px] text-slate-600 font-semibold block">
                          Puestos directos por cada $1M de producción (VBP)
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium block">
                          Coeficiente directo · MIP
                        </span>
                      </div>
                    </div>

                    {/* Indirecto */}
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 block">
                          Empleo Indirecto
                        </span>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          {primaryMipSector.empleo_indirecto_por_millon ? formatNumber(primaryMipSector.empleo_indirecto_por_millon, 2) : '—'}
                        </div>
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <span className="text-[10px] text-slate-600 font-semibold block">
                          Relación indirecta en proveedores por cada $1M de producción (VBP)
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium block">
                          Coeficiente indirecto · MIP
                        </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="p-4 rounded-2xl bg-indigo-100/70 border border-indigo-200 flex flex-col justify-between shadow-2xs">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 block">
                          Empleo total relacionado
                        </span>
                        <div className="text-2xl font-black text-indigo-950 mt-1">
                          {primaryMipSector.multiplicador_total_por_millon ? formatNumber(primaryMipSector.multiplicador_total_por_millon, 2) : '—'}
                        </div>
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <span className="text-[10px] text-indigo-900 font-semibold block">
                          {primaryMipSector.multiplicador_total_por_millon ? formatNumber(primaryMipSector.multiplicador_total_por_millon, 2) : '—'} puestos por cada $1M de producción
                        </span>
                        <span className="text-[9px] text-indigo-700/80 font-medium block">
                          Coeficiente total de empleo · MIP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => toggleExpand('mip')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Ver más información sobre multiplicadores"
          >
            {expandedCard === 'mip' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Footer simple y directo */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Fuente oficial: Matriz Insumo-Producto Jujuy · Año base 2015 · DiPEC / CEP XXI</span>
          <button
            onClick={() => onViewTechnicalDetails('mip')}
            className="font-bold text-indigo-700 hover:text-indigo-900 transition-colors flex items-center gap-1"
          >
            <span>Ver matriz completa de 34 sectores</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Expansor explicativo humano */}
        {expandedCard === 'mip' && (
          <div className="mt-4 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 space-y-2">
            <p>
              <strong>Advertencia metodológica importante:</strong> Los multiplicadores de la MIP corresponden a la estructura productiva del año base 2015.
            </p>
            <p className="text-slate-600">
              Reflejan la capacidad de arrastre intersectorial y relaciones técnicas sobre proveedores, pero <strong>no representan el nivel de empleo actual ni vacantes laborales</strong>, ni predicen puestos que se crearán ante futuras inversiones.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* TARJETA 4: ¿QUÉ TIPO DE TAREAS APARECEN? (EIL)                          */}
      {/* ======================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-sm hover:border-purple-300 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 border border-purple-100 shadow-2xs">
              <Briefcase className="w-6 h-6" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className="text-[11px] uppercase tracking-wider font-black text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200"
                  aria-label="¿Qué tipos de tareas aparecen?"
                >
                  🧩 ¿Qué tipo de tareas aparecen?
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  EIL · Encuesta de Indicadores Laborales · MTEySS
                </span>
              </div>

              {isPrimaria ? (
                <div className="space-y-1 pt-1">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                    Esta actividad no está incluida en este relevamiento.
                  </h3>
                  <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed">
                    La EIL excluye las actividades primarias por diseño de su muestra en el Aglomerado Gran Jujuy. Esta exclusión metodológica no implica ausencia de actividad laboral ni valor cero de empleo.
                  </div>
                </div>
              ) : isA10 ? (
                <div className="space-y-1 pt-1">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                    Esta actividad no está incluida en este relevamiento.
                  </h3>
                  <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed">
                    La EIL investiga exclusivamente empresas del sector privado en el Aglomerado Gran Jujuy. No releva la administración pública provincial.
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    {/* Explicación sencilla de primer nivel */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      La EIL permite observar la composición de los puestos según el tipo de tarea que realizan.
                    </p>
                    {/* Aclaración conceptual obligatoria visible */}
                    <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-purple-100/70 border border-purple-200 text-[11px] text-purple-950 font-bold">
                      <Info className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                      <span>La clasificación describe la tarea del puesto, no los estudios o títulos de la persona.</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-2xl">
                      {isAgrupada
                        ? 'En la EIL, Comercio, Restaurantes y Hoteles se informan de forma agrupada e indivisible.'
                        : 'Distribución de ocupados según el tipo de tarea requerida por la empresa en el Gran Jujuy.'}
                    </p>
                  </div>

                  {/* 4 Niveles de Tareas con barras táctiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {[
                      { id: 'profesional', label: 'Profesional', hint: 'Dirección y análisis', bar: 'w-3/5' },
                      { id: 'tecnica', label: 'Técnica', hint: 'Operación especializada', bar: 'w-4/5' },
                      { id: 'operativa', label: 'Operativa', hint: 'Ejecución y oficio', bar: 'w-full' },
                      { id: 'no_calificada', label: 'No Calificada', hint: 'Tareas generales', bar: 'w-2/5' },
                    ].map((cat) => {
                      const isUserInterest = tipoTareaInteres === cat.id;
                      return (
                        <div
                          key={cat.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isUserInterest
                              ? 'bg-purple-100 border-purple-300 ring-2 ring-purple-400 shadow-xs'
                              : 'bg-purple-50/50 border-purple-100 hover:bg-purple-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 block">{cat.label}</span>
                            {isUserInterest && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-purple-800 bg-white px-1.5 py-0.5 rounded-full border border-purple-200">
                                <Sparkles className="w-2.5 h-2.5" />
                                Interés
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1">{cat.hint}</span>

                          {/* Micro-barra de presencia */}
                          <div className="w-full bg-purple-200/60 h-1.5 rounded-full mt-2.5 overflow-hidden">
                            <div className={`bg-purple-600 h-full rounded-full ${cat.bar}`}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => toggleExpand('eil')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Ver más información sobre tipo de tareas"
          >
            {expandedCard === 'eil' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Footer simple y directo */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Fuente oficial: EIL · Gran Jujuy · MTEySS</span>
          <button
            onClick={() => onViewTechnicalDetails('eil')}
            className="font-bold text-purple-700 hover:text-purple-900 transition-colors flex items-center gap-1"
          >
            <span>Ver indicadores transversales y demanda laboral</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Expansor explicativo humano */}
        {expandedCard === 'eil' && (
          <div className="mt-4 p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-slate-700 space-y-2">
            <p>
              <strong>Distinción conceptual obligatoria:</strong> Las categorías de la EIL describen la <strong>calificación de la tarea requerida por la empresa</strong> en el puesto.
            </p>
            <p className="text-slate-600">
              <strong>NO representan automáticamente el nivel educativo formal de las personas</strong>, ni constituyen vacantes abiertas ni ofertas de estudio, ni sugerencias sobre qué carreras o profesiones elegir.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* TARJETA 5: ¿CÓMO VIENE CAMBIANDO? (EVOLUCIÓN TEMPORAL)                   */}
      {/* ======================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-2xs">
              <BarChart2 className="w-6 h-6" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  ¿Cómo cambió con el tiempo?
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Series históricas continuas
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Podés comparar cómo evolucionó esta actividad a lo largo de los años
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
                  En economía, mirar un solo período puede ser insuficiente. La plataforma permite observar el comportamiento de esta actividad en 21 años continuos de PBG (2004–2024*) y más de 100 trimestres de empleo formal registrado en OEDE.
                  {latestEilIndex && (
                    <span className="block mt-2 font-medium text-slate-800">
                      Índice de empleo reciente EIL ({latestEilPeriod}): <strong>{formatNumber(latestEilIndex.valor, 1)}</strong> (base 2017=100).
                    </span>
                  )}
                </p>
              </div>

              {/* Hitos comparativos temporales */}
              <div className="grid grid-cols-3 gap-2.5 pt-2 max-w-md">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 block">2004</span>
                  <span className="text-xs font-black text-slate-800 mt-0.5 block">Base PBG</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 block">2015</span>
                  <span className="text-xs font-black text-slate-800 mt-0.5 block">Base MIP</span>
                </div>
                <div className="p-3 rounded-2xl bg-brand-50 border border-brand-200 text-center">
                  <span className="text-[10px] font-bold text-brand-700 block">2024* / 2026</span>
                  <span className="text-xs font-black text-brand-900 mt-0.5 block">Actual</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => toggleExpand('evolucion')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Ver más información sobre evolución histórica"
          >
            {expandedCard === 'evolucion' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Footer simple y directo */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Disponibilidad completa: 2004–2024* (PBG) y 1996–2026 (OEDE)</span>
          <button
            onClick={() => onViewTechnicalDetails('pbg')}
            className="font-bold text-slate-800 hover:text-brand-700 transition-colors flex items-center gap-1"
          >
            <span>Ver gráficos y series temporales</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Expansor explicativo humano */}
        {expandedCard === 'evolucion' && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
            <p>
              <strong>Perspectiva temporal:</strong> La ficha técnica incluye un selector interactivo que te permite alternar entre el ciclo reciente (2015–2024*), el ciclo histórico (2004–2014) o la serie completa de 21 años para analizar tendencias estructurales de largo plazo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
