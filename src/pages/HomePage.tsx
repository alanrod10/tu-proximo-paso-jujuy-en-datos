import React, { useState, useRef } from 'react';
import { Area, AreaId } from '../types';
import { AreaIcon } from '../utils/iconHelper';
import { JujuyLandscapeIllustration } from '../components/JujuyLandscapeIllustration';
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  BookOpen, 
  TrendingUp,
  Users,
  Network,
  Calendar,
  ChevronRight,
  ChevronDown,
  Info,
  Rocket,
  BarChart2,
  HelpCircle
} from 'lucide-react';

interface HomePageProps {
  areas: Area[];
  onStartWizard: () => void;
  onExploreAreas: () => void;
  onSelectArea: (areaId: AreaId) => void;
  onNavigateMethodology: () => void;
}

// Configuración visual minimalista para las 12 áreas en la primera pantalla
const AREA_UI_CONFIG: Record<AreaId, { 
  simpleName: string; 
  badgeColor: string;
  hoverBorder: string;
}> = {
  A01: { simpleName: 'Agro', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', hoverBorder: 'hover:border-emerald-400 hover:shadow-emerald-100' },
  A02: { simpleName: 'Minería', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200', hoverBorder: 'hover:border-amber-400 hover:shadow-amber-100' },
  A03: { simpleName: 'Industria', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200', hoverBorder: 'hover:border-blue-400 hover:shadow-blue-100' },
  A04: { simpleName: 'Energía', badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200', hoverBorder: 'hover:border-yellow-400 hover:shadow-yellow-100' },
  A05: { simpleName: 'Construcción', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200', hoverBorder: 'hover:border-orange-400 hover:shadow-orange-100' },
  A06: { simpleName: 'Comercio', badgeColor: 'bg-teal-50 text-teal-700 border-teal-200', hoverBorder: 'hover:border-teal-400 hover:shadow-teal-100' },
  A07: { simpleName: 'Turismo', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200', hoverBorder: 'hover:border-rose-400 hover:shadow-rose-100' },
  A08: { simpleName: 'Transporte', badgeColor: 'bg-sky-50 text-sky-700 border-sky-200', hoverBorder: 'hover:border-sky-400 hover:shadow-sky-100' },
  A09: { simpleName: 'Servicios', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200', hoverBorder: 'hover:border-purple-400 hover:shadow-purple-100' },
  A10: { simpleName: 'Estado', badgeColor: 'bg-slate-100 text-slate-700 border-slate-300', hoverBorder: 'hover:border-slate-400 hover:shadow-slate-100' },
  A11: { simpleName: 'Educación', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200', hoverBorder: 'hover:border-indigo-400 hover:shadow-indigo-100' },
  A12: { simpleName: 'Salud', badgeColor: 'bg-red-50 text-red-700 border-red-200', hoverBorder: 'hover:border-red-400 hover:shadow-red-100' },
};

export const HomePage: React.FC<HomePageProps> = ({
  areas,
  onStartWizard,
  onExploreAreas,
  onSelectArea,
  onNavigateMethodology,
}) => {
  // Estado para desplegar la capa posterior de profundización (panorama provincial)
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const deepDiveRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const toggleDeepDive = () => {
    setShowDeepDive((prev) => !prev);
    setTimeout(() => {
      deepDiveRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const toggleHowItWorks = () => {
    setShowHowItWorks((prev) => !prev);
    setTimeout(() => {
      howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="space-y-8 sm:space-y-12 py-4 sm:py-8">
      {/* ======================================================================= */}
      {/* 1. PRIMERA PANTALLA INMERSIVA (ESTADO 1: DESCUBRIR & EXPLORAR)          */}
      {/* Cero estadísticas numéricas, imagen protagonista, CTA dominante       */}
      {/* ======================================================================= */}
      <section className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 text-white p-6 sm:p-10 lg:p-14 border border-slate-800 shadow-2xl">
        {/* Halos difusos estáticos de fondo */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Identidad y Marco Académico */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="animate-hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>IES N.º 11 • Exposición Académica</span>
            </div>
            <div className="text-xs uppercase tracking-widest font-black text-brand-400">
              Tu Próximo Paso
            </div>
          </div>

          {/* PREGUNTA CENTRAL Y SUBTÍTULO MOTIVADOR */}
          <div className="space-y-3">
            <div className="text-sm uppercase tracking-wider font-extrabold text-slate-400">
              Jujuy en Datos
            </div>
            <h1 className="animate-hero-title text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              ¿Qué te gustaría descubrir de Jujuy?
            </h1>
            <p className="animate-hero-subtitle text-base sm:text-xl text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed">
              Explorá las actividades, el trabajo y lo que mueve nuestra provincia.
            </p>
          </div>

          {/* Frase Humana Cercana */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs sm:text-sm font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>No hace falta que tengas todo decidido. Explorá y descubrí.</span>
          </div>

          {/* CTA PRINCIPAL DOMINANTE Y TÁCTIL */}
          <div className="animate-hero-cta pt-1 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onStartWizard}
              className="group inline-flex items-center justify-center gap-3 px-9 sm:px-12 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white font-black text-lg sm:text-xl shadow-2xl shadow-brand-950 transition-all duration-200 hover:-translate-y-1 active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 cursor-pointer"
              aria-label="Empezar a explorar actividades de Jujuy"
            >
              <Rocket className="w-6 h-6 text-amber-300 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-12" />
              <span>🚀 Empezar a explorar</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1.5" />
            </button>

            <button
              onClick={onExploreAreas}
              className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Explorar 12 Áreas</span>
            </button>
          </div>

          {/* ILUSTRACIÓN PROTAGONISTA DE JUJUY (CENTRAL, VISIBLE, INMERSIVA) */}
          <div className="pt-4 max-w-3xl mx-auto transform transition-transform duration-300 hover:scale-[1.01]">
            <JujuyLandscapeIllustration className="rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl overflow-hidden" />
          </div>

          {/* Cláusula Informativa No Prescriptiva Breve */}
          <div className="pt-1 text-[11px] sm:text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            <p className="flex items-center justify-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                No es un test vocacional ni prescribe decisiones laborales. Muestra estadísticas públicas oficiales de Jujuy.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 2. LAS 12 ÁREAS VISUALES Y TÁCTILES (INTERACCIÓN INMEDIATA)             */}
      {/* Cada área es un Touch Tile minimalista: Icono + Nombre simple           */}
      {/* ======================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Elegí un área para descubrir
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Tocá cualquiera de las 12 actividades para ver de inmediato su realidad en Jujuy.
            </p>
          </div>
          <button
            onClick={onExploreAreas}
            className="text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Ver buscador y filtros</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grilla visual táctil de 12 Touch Tiles minimalistas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {areas.map((area) => {
            const config = AREA_UI_CONFIG[area.area_id] || {
              simpleName: area.nombre,
              badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
              hoverBorder: 'hover:border-slate-300',
            };

            return (
              <button
                key={area.area_id}
                onClick={() => onSelectArea(area.area_id)}
                className={`p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-lg ${config.hoverBorder} text-center transition-all duration-200 hover:-translate-y-1 active:scale-95 active:translate-y-0 flex flex-col items-center justify-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}
                aria-label={`Ver datos de ${config.simpleName}`}
              >
                {/* Icono Grande y Destacado */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-200 shadow-2xs group-hover:scale-110 mb-2.5 ${config.badgeColor}`}>
                  <AreaIcon name={area.icono} size={28} />
                </div>

                {/* Nombre Simple y Limpio (Agro, Minería, Industria, etc.) */}
                <span className="font-black text-slate-900 text-sm sm:text-base group-hover:text-brand-700 transition-colors block">
                  {config.simpleName}
                </span>

                {/* Microetiqueta técnica sutil para accesibilidad y trazabilidad */}
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-600 mt-0.5 block">
                  {area.area_id}
                </span>

                {/* Label accesible para lectores de pantalla y verificación */}
                <span className="sr-only">Ver datos</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 3. BARRA DE ACCESOS SECUNDARIOS A PROFUNDIZACIÓN Y METODOLOGÍA          */}
      {/* La información profunda no abruma en primer impacto, pero es accesible */}
      {/* ======================================================================= */}
      <section className="pt-2">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-100 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-brand-500 inline-block animate-pulse"></span>
            <span className="font-semibold text-slate-800">¿Querés profundizar?</span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">Elegí qué nivel de información querés explorar.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={toggleDeepDive}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5 text-brand-600" />
              <span>{showDeepDive ? 'Ocultar datos generales' : '📊 Ver datos generales de Jujuy'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showDeepDive ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={toggleHowItWorks}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 transition-all active:scale-95 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>¿Cómo funciona?</span>
            </button>

            <button
              onClick={onNavigateMethodology}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 transition-all active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Fuentes y metodología</span>
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 4. ¿CÓMO FUNCIONA? (PANEL DESPLEGABLE / CAPA SECUNDARIA)                */}
      {/* ======================================================================= */}
      {showHowItWorks && (
        <section ref={howItWorksRef} className="space-y-5 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-black text-brand-600">
                Paso a Paso
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ¿Cómo funciona la experiencia?
              </h3>
            </div>
            <button
              onClick={() => setShowHowItWorks(false)}
              className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-800 font-black text-sm flex items-center justify-center">
                01
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Elegí qué querés explorar</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contanos qué te interesa o recorré las 12 actividades libremente.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-800 font-black text-sm flex items-center justify-center">
                02
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Elegí una o dos áreas</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seleccioná las áreas que más te llamen la atención para mirarlas o compararlas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-800 font-black text-sm flex items-center justify-center">
                03
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Mirá qué muestran los datos</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tarjetas visuales con cifras de producción, empleo formal, tareas y relaciones.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs font-semibold text-brand-800 bg-brand-50 inline-block px-4 py-2 rounded-full border border-brand-200">
              No tenés que tener todo decidido. La aplicación es para explorar y aprender.
            </p>
          </div>
        </section>
      )}

      {/* ======================================================================= */}
      {/* 5. CAPA DE PROFUNDIZACIÓN: PANORAMA PROVINCIAL Y DATOS GLOBALES         */}
      {/* Se despliega a demanda para no saturar la primera pantalla              */}
      {/* ======================================================================= */}
      {showDeepDive && (
        <section ref={deepDiveRef} className="space-y-6 pt-4 border-t border-slate-200 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-1.5 border border-brand-200">
                <BarChart2 className="w-3.5 h-3.5 text-brand-600" />
                <span>Nivel de Profundización</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ¿Querés conocer los números globales de Jujuy?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Cifras consolidadas de producción total (PBG), empleo privado formal (OEDE), series históricas y conexiones intersectoriales (MIP).
              </p>
            </div>
            <button
              onClick={() => setShowDeepDive(false)}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer self-start sm:self-auto"
            >
              Ocultar datos generales
            </button>
          </div>

          {/* Mini Dashboard de 4 bloques estadísticos consolidados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* BLOQUE 1: PRODUCCIÓN (PBG DEFINITIVO) */}
            <div className="animate-stagger-1 p-6 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                    ¿Cuánto produce la economía?
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 block mt-1">
                    PBG 2024*
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                    $6,47 mil millones
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                    a precios constantes de 2004
                  </span>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                    <div className="text-xs text-slate-700 font-medium">
                      A precios corrientes de 2024*: <strong className="font-bold text-slate-900">$5,48 billones</strong>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Precios constantes expresan volumen real sin inflación. Precios corrientes expresan valor nominal del ejercicio.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Fuente: DiPEC</span>
                <span className="font-bold text-emerald-700">PBG Provincial</span>
              </div>
            </div>

            {/* BLOQUE 2: TRABAJO REGISTRADO (OEDE) */}
            <div className="animate-stagger-2 p-6 rounded-3xl bg-white border border-blue-100 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 block">
                    ¿Cuántos puestos privados hay?
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    63.017
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    Puestos asalariados registrados · 1° Trim 2026
                  </span>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Trabajadores formalmente declarados por empresas privadas en SIPA. No incluye empleo público provincial ni trabajo informal.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Fuente: OEDE / SIPA</span>
                <span className="font-bold text-blue-700">Empleo Formal</span>
              </div>
            </div>

            {/* BLOQUE 3: EVOLUCIÓN HISTÓRICA */}
            <div className="animate-stagger-3 p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-800 block">
                    ¿Cómo cambió con el tiempo?
                  </span>
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>2004: $3.70B*</span>
                      <span>2014: $5.83B*</span>
                      <span className="font-bold text-purple-900">2024*: $6.47B*</span>
                    </div>
                    <div className="animate-timeline-grow grid grid-cols-3 gap-1.5 h-2.5 bg-purple-50 rounded-full p-0.5 border border-purple-100">
                      <div className="bg-purple-300 rounded-full w-full h-full"></div>
                      <div className="bg-purple-400 rounded-full w-full h-full"></div>
                      <div className="bg-purple-600 rounded-full w-full h-full"></div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      * Miles de millones constantes de 2004
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Las series públicas registran 21 años continuos de PBG y 30 años de empleo formal, mostrando cambios de volumen sin interpolaciones.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Series: 2004–2024*</span>
                <span className="font-bold text-purple-700">Trayectoria</span>
              </div>
            </div>

            {/* BLOQUE 4: CONEXIONES PRODUCTIVAS (MIP) */}
            <div className="animate-stagger-4 p-6 rounded-3xl bg-white border border-indigo-100 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-800 block">
                    ¿Cómo se conecta con otras?
                  </span>
                  <div className="flex items-center gap-1.5 pt-2 text-[10px] font-bold">
                    <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                      Directo
                    </span>
                    <span className="text-slate-400">➔</span>
                    <span className="px-2 py-1 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-200">
                      Indirecto
                    </span>
                    <span className="text-slate-400">➔</span>
                    <span className="px-2 py-1 rounded-lg bg-indigo-600 text-white shadow-2xs">
                      Total
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    La MIP muestra relaciones entre actividades mediante empleo directo e indirecto.
                  </p>
                  <span className="text-[10px] text-indigo-800 font-semibold block mt-1.5">
                    Base 2015 · coeficientes estructurales · no representa empleo actual.
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">MIP Jujuy 2015</span>
                <span className="font-bold text-indigo-700">Estructura</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            * Nota: La Matriz Insumo-Producto describe la estructura productiva del año base 2015. No representa una medición del empleo actual ni relación de causalidad automática.
          </p>

          {/* HISTORIAS ESTADÍSTICAS: ¿SABÍAS QUE...? */}
          <div className="pt-3 space-y-3">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              ¿Sabías que muestran las estadísticas de Jujuy?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-slate-800 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                  ¿Las actividades funcionan aisladas?
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  La Matriz Insumo-Producto muestra relaciones entre actividades mediante empleo directo e indirecto, reflejando compras de insumos entre ramas de la estructura provincial.
                </p>
                <div className="text-[10px] font-mono text-amber-900 font-semibold pt-1 border-t border-amber-200/60">
                  Fuente: MIP Jujuy · Base 2015
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-slate-800 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block">
                  ¿Cuántos años de historia se pueden seguir?
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Las estadísticas públicas permiten observar la trayectoria de Jujuy desde 2004 en producción (PBG) y a lo largo de 30 años en trabajo asalariado registrado (OEDE).
                </p>
                <div className="text-[10px] font-mono text-emerald-900 font-semibold pt-1 border-t border-emerald-200/60">
                  Fuente: PBG (2004–2024*) · DiPEC / OEDE
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 text-slate-800 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-900 block">
                  ¿Qué tipo de tareas se desempeñan?
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  En empresas de 5 o más personas del Gran Jujuy, la EIL releva puestos con tareas operativas, técnicas, profesionales y generales (sin equivaler a título educativo).
                </p>
                <div className="text-[10px] font-mono text-purple-900 font-semibold pt-1 border-t border-purple-200/60">
                  Fuente: EIL · Gran Jujuy · MTEySS
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================================= */}
      {/* 6. FUENTES OFICIALES Y METODOLOGÍA (CAPA PROFUNDA)                      */}
      {/* ======================================================================= */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-4 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-brand-400 block mb-1">
              Rigor Técnico y Trazabilidad Oficial
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              ¿De dónde salen estos datos?
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Toda la información se construye a partir de cuatro fuentes estadísticas oficiales auditadas: <strong>PBG</strong> (DiPEC), <strong>OEDE</strong> (SIPA), <strong>EIL</strong> (MTEySS) y <strong>MIP</strong> Jujuy (base 2015).
            </p>
          </div>

          <button
            onClick={onNavigateMethodology}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs shadow-md transition-all whitespace-nowrap self-start sm:self-auto hover:scale-102 active:scale-98 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-brand-600" />
            <span>Ver fuentes y metodología</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="font-bold text-white block">PBG</span>
            <span className="text-[10px] text-slate-400">DiPEC · 2004–2024*</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="font-bold text-white block">OEDE</span>
            <span className="text-[10px] text-slate-400">SIPA · Empleo privado</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="font-bold text-white block">EIL</span>
            <span className="text-[10px] text-slate-400">MTEySS · Gran Jujuy</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="font-bold text-white block">MIP</span>
            <span className="text-[10px] text-slate-400">DiPEC / CEP XXI · 2015</span>
          </div>
        </div>
      </section>
    </div>
  );
};
