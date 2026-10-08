import React, { useState } from 'react';
import { Area, AreaId, MotivoExploracion, TipoTareaInteres, RangoEdad, PreferenciasExploracion } from '../types';
import { AreaIcon } from '../utils/iconHelper';
import { 
  GraduationCap, 
  Briefcase, 
  RefreshCw, 
  Rocket, 
  Compass, 
  Brain, 
  Settings, 
  Wrench, 
  Shuffle, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles
} from 'lucide-react';

interface ExplorationWizardProps {
  areas: Area[];
  onComplete: (prefs: PreferenciasExploracion) => void;
  onSkipToAreas: () => void;
  onCancel: () => void;
}

export const ExplorationWizard: React.FC<ExplorationWizardProps> = ({
  areas,
  onComplete,
  onSkipToAreas,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [motivo, setMotivo] = useState<MotivoExploracion | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<AreaId[]>([]);
  const [tipoTarea, setTipoTarea] = useState<TipoTareaInteres | null>(null);
  const [rangoEdad, setRangoEdad] = useState<RangoEdad | null>(null);

  // Manejo de selección múltiple (hasta 2 áreas o todas)
  const toggleArea = (areaId: AreaId) => {
    if (selectedAreas.includes(areaId)) {
      setSelectedAreas(selectedAreas.filter((id) => id !== areaId));
    } else {
      if (selectedAreas.length < 2) {
        setSelectedAreas([...selectedAreas, areaId]);
      } else {
        // Reemplazar la segunda si ya hay 2
        setSelectedAreas([selectedAreas[0], areaId]);
      }
    }
  };

  const selectAllAreas = () => {
    setSelectedAreas(areas.map((a) => a.area_id));
  };

  const handleFinish = () => {
    onComplete({
      motivo,
      areasSeleccionadas: selectedAreas.length > 0 ? selectedAreas : ['A01'],
      tipoTarea,
      rangoEdad: rangoEdad || 'omitido',
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4">
      {/* Barra de progreso amigable */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>Paso {step} de 4</span>
          <button
            onClick={onSkipToAreas}
            className="text-brand-600 hover:text-brand-800 transition-colors font-medium flex items-center gap-1"
          >
            <span>Omitir preguntas y explorar directamente</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PASO 1: ¿QUÉ ESTÁS BUSCANDO? */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <span className="text-xs uppercase tracking-wider font-extrabold text-brand-600">
              Paso 1
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              ¿Qué estás buscando?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              No hace falta que lo tengas decidido. Elegí la opción que más se acerque a lo que querés explorar hoy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              {
                id: 'estudiar' as MotivoExploracion,
                icon: GraduationCap,
                title: 'Estudiar o capacitarme',
                desc: 'Quiero conocer áreas y actividades que puedan interesarme para formarme.',
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
              },
              {
                id: 'trabajar' as MotivoExploracion,
                icon: Briefcase,
                title: 'Buscar trabajo',
                desc: 'Quiero conocer mejor dónde se mueve el empleo registrado en Jujuy.',
                color: 'text-blue-600 bg-blue-50 border-blue-200',
              },
              {
                id: 'cambiar' as MotivoExploracion,
                icon: RefreshCw,
                title: 'Cambiar de actividad',
                desc: 'Quiero explorar otras áreas y conocer cómo se comportan en la provincia.',
                color: 'text-purple-600 bg-purple-50 border-purple-200',
              },
              {
                id: 'emprender' as MotivoExploracion,
                icon: Rocket,
                title: 'Emprender',
                desc: 'Quiero conocer actividades productivas y sectores presentes en Jujuy.',
                color: 'text-amber-600 bg-amber-50 border-amber-200',
              },
              {
                id: 'explorar' as MotivoExploracion,
                icon: Compass,
                title: 'Explorar',
                desc: 'Todavía no tengo algo definido. Quiero mirar opciones con curiosidad.',
                color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
                colSpan: 'sm:col-span-2',
              },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = motivo === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setMotivo(opt.id)}
                  className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 ${
                    opt.colSpan || ''
                  } ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${opt.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-base">{opt.title}</h3>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={onCancel}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Volver al inicio
            </button>
            <button
              disabled={!motivo}
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASO 2: ¿QUÉ ÁREAS TE INTERESAN? */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-brand-600">
                Paso 2
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                ¿Qué áreas te llaman la atención?
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Podés elegir <strong>hasta dos</strong>. Si querés mirar todo sin elegir ahora, seleccioná "Explorar todas".
              </p>
            </div>
            <button
              onClick={selectAllAreas}
              className="text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Explorar todas las áreas
            </button>
          </div>

          {/* Grilla visual de las 12 áreas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {areas.map((area) => {
              const isSelected = selectedAreas.includes(area.area_id);
              return (
                <button
                  key={area.area_id}
                  onClick={() => toggleArea(area.area_id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[110px] relative ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <AreaIcon name={area.icono} size={18} />
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                    {area.nombre}
                  </h3>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                {selectedAreas.length === 12
                  ? 'Todas las áreas seleccionadas'
                  : `${selectedAreas.length} de 2 seleccionadas`}
              </span>
              <button
                disabled={selectedAreas.length === 0}
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASO 3: ¿QUÉ TIPO DE TAREA TE INTERESA? */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <span className="text-xs uppercase tracking-wider font-extrabold text-brand-600">
              Paso 3
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              ¿Qué tipo de tarea te interesa?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              No hace falta que lo tengas claro. Esto solo nos ayuda a mostrar información de la Encuesta de Indicadores Laborales que pueda resultarte más útil.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                id: 'profesional' as TipoTareaInteres,
                icon: Brain,
                title: 'Profesional',
                desc: 'Planificación, análisis, gestión, tareas de grado o especialización técnica superior.',
              },
              {
                id: 'tecnica' as TipoTareaInteres,
                icon: Settings,
                title: 'Técnica',
                desc: 'Operación especializada, supervisión, soporte técnico y procesos aplicados.',
              },
              {
                id: 'operativa' as TipoTareaInteres,
                icon: Wrench,
                title: 'Operativa',
                desc: 'Ejecución directa, logística, montaje, manipulación y servicios generales.',
              },
              {
                id: 'varias' as TipoTareaInteres,
                icon: Shuffle,
                title: 'Varias',
                desc: 'Me interesan distintos perfiles o tareas combinadas.',
              },
              {
                id: 'indefinido' as TipoTareaInteres,
                icon: HelpCircle,
                title: 'Todavía no lo sé',
                desc: 'Quiero ver el panorama general de tareas sin filtrar.',
              },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = tipoTarea === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setTipoTarea(opt.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 border border-purple-100">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{opt.title}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Nota metodológica:</strong> Esta selección no evalúa compatibilidad ni determina qué deberías hacer. Solo personaliza qué datos de tareas requeridas ver primero cuando la fuente EIL esté disponible.
            </span>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
            <button
              disabled={!tipoTarea}
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASO 4: EDAD (OPCIONAL) */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <span className="text-xs uppercase tracking-wider font-extrabold text-brand-600">
              Paso 4 (Opcional)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              ¿En qué rango de edad estás?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Es opcional y nos ayuda a conocer quiénes usan la aplicación durante la exposición académica. No se utiliza para recomendar ni asociar actividades.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {[
              { id: '13-17' as RangoEdad, label: '13 a 17 años' },
              { id: '18-24' as RangoEdad, label: '18 a 24 años' },
              { id: '25-34' as RangoEdad, label: '25 a 34 años' },
              { id: '35-49' as RangoEdad, label: '35 a 49 años' },
              { id: '50+' as RangoEdad, label: '50 años o más' },
              { id: 'omitido' as RangoEdad, label: 'Prefiero no indicar' },
            ].map((opt) => {
              const isSelected = rangoEdad === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setRangoEdad(opt.id)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold ring-2 ring-brand-500 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 text-sm'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 text-white font-bold text-base hover:bg-brand-500 transition-all shadow-md shadow-brand-900/20 active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Ver mi exploración</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
