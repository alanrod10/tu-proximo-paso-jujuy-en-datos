import React from 'react';
import { Area, AreaId } from '../types';
import { AreaIcon } from '../utils/iconHelper';
import { GlobalSearch } from '../components/GlobalSearch';
import { getAreaOverview, getProvincialOverview } from '../data-access/dataAdapter';
import {
  TrendingUp,
  Users,
  Layers,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Briefcase,
  Compass,
  Sparkles,
  Info
} from 'lucide-react';

interface HomePageProps {
  areas: Area[];
  onStartWizard?: () => void;
  onExploreAreas: () => void;
  onSelectArea: (areaId: AreaId) => void;
  onNavigateMethodology: () => void;
  onNavigateTransversal?: () => void;
}

// Configuración visual semántica para las 12 áreas
const AREA_THEMES: Record<AreaId, {
  simpleName: string;
  iconBg: string;
  iconText: string;
  borderColor: string;
  hoverBorder: string;
}> = {
  A01: { simpleName: 'Agro y Producción', iconBg: 'bg-emerald-50', iconText: 'text-emerald-700', borderColor: 'border-emerald-100', hoverBorder: 'hover:border-emerald-400' },
  A02: { simpleName: 'Minería', iconBg: 'bg-amber-50', iconText: 'text-amber-700', borderColor: 'border-amber-100', hoverBorder: 'hover:border-amber-400' },
  A03: { simpleName: 'Industria', iconBg: 'bg-blue-50', iconText: 'text-blue-700', borderColor: 'border-blue-100', hoverBorder: 'hover:border-blue-400' },
  A04: { simpleName: 'Energía', iconBg: 'bg-yellow-50', iconText: 'text-yellow-800', borderColor: 'border-yellow-100', hoverBorder: 'hover:border-yellow-400' },
  A05: { simpleName: 'Construcción', iconBg: 'bg-orange-50', iconText: 'text-orange-700', borderColor: 'border-orange-100', hoverBorder: 'hover:border-orange-400' },
  A06: { simpleName: 'Comercio', iconBg: 'bg-teal-50', iconText: 'text-teal-700', borderColor: 'border-teal-100', hoverBorder: 'hover:border-teal-400' },
  A07: { simpleName: 'Turismo y Hotelería', iconBg: 'bg-rose-50', iconText: 'text-rose-700', borderColor: 'border-rose-100', hoverBorder: 'hover:border-rose-400' },
  A08: { simpleName: 'Transporte y Logística', iconBg: 'bg-sky-50', iconText: 'text-sky-700', borderColor: 'border-sky-100', hoverBorder: 'hover:border-sky-400' },
  A09: { simpleName: 'Servicios a Empresas', iconBg: 'bg-purple-50', iconText: 'text-purple-700', borderColor: 'border-purple-100', hoverBorder: 'hover:border-purple-400' },
  A10: { simpleName: 'Administración Pública', iconBg: 'bg-slate-100', iconText: 'text-slate-700', borderColor: 'border-slate-200', hoverBorder: 'hover:border-slate-400' },
  A11: { simpleName: 'Educación', iconBg: 'bg-indigo-50', iconText: 'text-indigo-700', borderColor: 'border-indigo-100', hoverBorder: 'hover:border-indigo-400' },
  A12: { simpleName: 'Salud y Comunitarios', iconBg: 'bg-red-50', iconText: 'text-red-700', borderColor: 'border-red-100', hoverBorder: 'hover:border-red-400' },
};

// Términos rápidos para chips de sugerencias
const QUICK_SEARCH_CHIPS: Array<{ label: string; areaId: AreaId }> = [
  { label: 'Litio', areaId: 'A02' },
  { label: 'Tabaco y Azúcar', areaId: 'A01' },
  { label: 'Turismo y Hoteles', areaId: 'A07' },
  { label: 'Comercio', areaId: 'A06' },
  { label: 'Energía Solar', areaId: 'A04' },
  { label: 'Salud Privada', areaId: 'A12' },
];

export const HomePage: React.FC<HomePageProps> = ({
  areas,
  onStartWizard,
  onExploreAreas,
  onSelectArea,
  onNavigateMethodology,
  onNavigateTransversal,
}) => {
  const provincial = getProvincialOverview();

  return (
    <div className="space-y-12 py-6 sm:py-10">
      {/* ======================================================================= */}
      {/* 1. HERO MODERNO Y BUSCADOR GLOBAL INTEGRADO                             */}
      {/* ======================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-950 text-white p-6 sm:p-10 lg:p-12 border border-slate-800 shadow-xl">
        {/* Halos ambientales decorativos */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Identidad de la Plataforma */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Plataforma Interactiva · Jujuy en Datos</span>
          </div>

          {/* Título Principal y Subtítulo */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              ¿Qué te gustaría descubrir de Jujuy?
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Explorá la realidad económica y laboral de nuestra provincia a través de estadísticas públicas oficiales.
            </p>
          </div>

          {/* BUSCADOR GLOBAL CON AUTOCOMPLETADO */}
          <div className="pt-2 max-w-2xl mx-auto space-y-3">
            <GlobalSearch
              areas={areas}
              onSelectArea={onSelectArea}
              variant="hero"
              placeholder="Buscar por actividad, oficio o producto (ej. tabaco, litio, comercio)..."
            />

            {/* Chips de sugerencias directas */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 text-xs font-medium mr-1">Sugerencias rápidas:</span>
              {QUICK_SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => onSelectArea(chip.areaId)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs transition-all cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* TARJETA DESTACADA: MINI ENCUESTA / ASISTENTE */}
          {onStartWizard && (
            <div className="max-w-2xl mx-auto rounded-2xl bg-gradient-to-r from-brand-900/60 via-slate-800/80 to-slate-800/90 border border-brand-400/40 p-5 sm:p-6 text-left shadow-lg backdrop-blur-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Orientación guiada</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    ¿No sabés por dónde empezar?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    Respondé unas preguntas breves sobre tus intereses y te mostraremos áreas económicas de Jujuy para explorar.
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed pt-0.5">
                    Son 3 preguntas principales y una pregunta opcional sobre la edad. No es un test vocacional ni determina qué tenés que estudiar o en qué tenés que trabajar.
                  </p>
                </div>
                <div className="sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={onStartWizard}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                  >
                    <span>Hacer mini encuesta</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3 KPIS CLAVE CONSOLIDADOS DE JUJUY */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
            {/* KPI 1: Producción */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>Producción Provincial (PBG {provincial.pbgUltimoAnio || 2024}{provincial.pbgEsProvisorio ? '*' : ''})</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {provincial.pbgTotalConstanteMiles !== null
                  ? `$${(provincial.pbgTotalConstanteMiles / 1000000).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mil millones`
                  : 'No disponible'}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {provincial.pbgTotalConstanteMiles !== null && provincial.pbgTotalCorrienteMiles !== null
                  ? `Mide el valor de los bienes y servicios producidos en Jujuy (2024 es provisorio*). Expresado a precios constantes de 2004 para medir cantidades reales sin inflación ($${(provincial.pbgTotalCorrienteMiles / 1000000000).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} billones corrientes a valores de cada momento).`
                  : (provincial.pbgMotivoNoDisponible || 'Valores de PBG provincial no disponibles.')}
              </p>
            </div>

            {/* KPI 2: Empleo Privado Formal */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <Users className="w-4 h-4" />
                <span>Trabajo Registrado (OEDE)</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {provincial.oedeTotalPuestosRegistrados !== null
                  ? `${provincial.oedeTotalPuestosRegistrados.toLocaleString('es-AR')} puestos`
                  : 'No disponible'}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {provincial.oedeDisponible
                  ? `Cuenta puestos de trabajo asalariados registrados en el sector privado (${provincial.oedeUltimoPeriodo}). No incluye empleo público ni informalidad.`
                  : (provincial.oedeMotivoNoDisponible || 'Dato oficial de empleo privado no disponible.')}
              </p>
            </div>

            {/* KPI 3: Sectores Auditados */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Layers className="w-4 h-4" />
                <span>12 Actividades Auditadas</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                4 Fuentes Oficiales
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Permite explorar 12 áreas económicas integrando 4 fuentes públicas oficiales: DiPEC, SIPA/OEDE, EIL y MIP 2015.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 2. CÓMO LEER ESTOS DATOS — GUÍA METODOLÓGICA BREVE                      */}
      {/* ======================================================================= */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Cómo leer estos datos
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Esta plataforma reúne información estadística pública de la provincia de Jujuy. Cada fuente mide una dimensión diferente de la economía local:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">PBG (DiPEC)</span>
            <p className="text-xs font-bold text-slate-800">Producción provincial</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Estima el valor monetario de todos los bienes y servicios generados por cada actividad económica en Jujuy.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">OEDE / SIPA</span>
            <p className="text-xs font-bold text-slate-800">Empleo formal privado</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Registra los puestos de trabajo asalariados declarados por empresas privadas. No contabiliza empleo público ni actividad informal.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">EIL (MTEySS)</span>
            <p className="text-xs font-bold text-slate-800">Búsquedas y contrataciones</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Muestra las demandas y calificaciones buscadas por empresas privadas de 5 o más personas trabajadoras en el aglomerado Gran Jujuy.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">MIP Jujuy</span>
            <p className="text-xs font-bold text-slate-800">Relaciones entre sectores</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Describe compras y ventas entre sectores económicos. Advertencia: tiene base 2015 y describe la estructura productiva observada en ese año de referencia.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 3. LAS 12 ÁREAS ECONÓMICAS — PROTAGONISMO CENTRAL                       */}
      {/* ======================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Elegí un área para descubrir
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Tocá cualquiera de las 12 actividades para consultar de inmediato su producción, empleo y relaciones productivas.
            </p>
          </div>
          <button
            onClick={onExploreAreas}
            className="text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Ver con filtros avanzados y ordenamiento</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grilla moderna de 12 tarjetas interactivas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {areas.map((area) => {
            const overview = getAreaOverview(area.area_id);
            const theme = AREA_THEMES[area.area_id] || {
              simpleName: area.nombre,
              iconBg: 'bg-slate-50',
              iconText: 'text-slate-700',
              borderColor: 'border-slate-200',
              hoverBorder: 'hover:border-slate-300',
            };

            const puestosLabel = overview?.oede.disponible && overview.oede.puestosTrabajo !== null
              ? `${overview.oede.puestosTrabajo.toLocaleString('es-AR')} puestos`
              : 'Dato no disponible en esta fuente';

            const pbgShareLabel = (overview?.pbg.porcentajeProvincial !== null && overview?.pbg.porcentajeProvincial !== undefined)
              ? `${overview.pbg.porcentajeProvincial}% del PBG`
              : null;

            return (
              <div
                key={area.area_id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectArea(area.area_id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectArea(area.area_id);
                  }
                }}
                aria-label={`Ver datos de ${theme.simpleName}`}
                className={`group bg-white rounded-2xl p-5 border ${theme.borderColor} ${theme.hoverBorder} shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 group-hover:bg-brand-50 group-hover:text-brand-800 transition-colors">
                      {area.area_id}
                    </span>
                    <div className={`w-10 h-10 rounded-xl ${theme.iconBg} ${theme.iconText} flex items-center justify-center transition-transform group-hover:scale-105 border border-slate-100`}>
                      <AreaIcon name={area.icono} size={22} />
                    </div>
                  </div>

                  <h3 className="font-black text-slate-900 text-base group-hover:text-brand-700 transition-colors leading-snug mb-1.5">
                    {theme.simpleName}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {area.descripcion}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={overview?.oede.disponible && overview.oede.puestosTrabajo !== null ? 'text-slate-600' : 'text-slate-500 italic'}>
                      {puestosLabel}
                    </span>
                    {pbgShareLabel && (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold" title="Participación en la producción provincial (PBG)">
                        {pbgShareLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-brand-600 group-hover:text-brand-800 pt-1">
                    <span>Ver indicadores</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 3. VÍAS COMPLEMENTARIAS DE EXPLORACIÓN Y METODOLOGÍA                    */}
      {/* ======================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Opción 1: Explorador y Comparador */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-base">
              Explorador y Filtros de Áreas
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filtrá por sectores productivos, buscá por códigos oficiales o compará indicadores entre distintas actividades.
            </p>
          </div>
          <button
            type="button"
            onClick={onExploreAreas}
            className="inline-flex items-center justify-between text-xs font-bold text-brand-700 hover:text-brand-900 pt-2 border-t border-slate-100 cursor-pointer"
          >
            <span>Ir al Explorador de Áreas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Opción 2: Dinámica Laboral Gran Jujuy (EIL) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-base">
              Dinámica Laboral Gran Jujuy (EIL)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consultá qué tareas (operativas, técnicas, profesionales) requieren las empresas privadas de 5 y más trabajadores.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateTransversal || onExploreAreas}
            className="inline-flex items-center justify-between text-xs font-bold text-purple-700 hover:text-purple-900 pt-2 border-t border-slate-100 cursor-pointer"
          >
            <span>Ver Dinámica Laboral</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Opción 3: Fuentes y Metodología */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-base">
              Fuentes Oficiales y Metodología
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trazabilidad técnica auditable: organismos emisores (DiPEC, OEDE, MTEySS), archivos Excel originales y alcances.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateMethodology}
            className="inline-flex items-center justify-between text-xs font-bold text-emerald-700 hover:text-emerald-900 pt-2 border-t border-slate-100 cursor-pointer"
          >
            <span>Consultar Metodología</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 4. PIE METODOLÓGICO Y SALVAGUARDA DE INTEGRIDAD ESTADÍSTICA             */}
      {/* ======================================================================= */}
      <section className="p-4 sm:p-5 rounded-2xl bg-slate-100/90 border border-slate-200 text-slate-600 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            <strong>Aclaración estadística:</strong> La plataforma divulga datos públicos oficiales provenientes del Producto Bruto Geográfico (DiPEC), el Observatorio de Empleo y Dinámica Empresarial (OEDE/SIPA), la Encuesta de Indicadores Laborales (EIL) y la Matriz Insumo-Producto Jujuy (base 2015).
          </p>
          <p className="text-[11px] text-slate-500">
            No constituye un test vocacional ni prescribe decisiones ocupacionales individuales.
          </p>
        </div>
      </section>
    </div>
  );
};
