import React, { useState } from 'react';
import { HelpCircle, Calculator, FileText, ChevronDown } from 'lucide-react';

interface MetricExplainerProps {
  whatItMeans: string;
  howItIsCalculated?: string;
  sourceDetails?: {
    organismo: string;
    indicadorOficial: string;
    archivoOriginal?: string;
    cobertura?: string;
    universo?: string;
    advertencia?: string;
  };
}

export const MetricExplainer: React.FC<MetricExplainerProps> = ({
  whatItMeans,
  howItIsCalculated,
  sourceDetails,
}) => {
  const [openSection, setOpenSection] = useState<'significado' | 'calculo' | 'fuente' | null>(null);

  const toggle = (section: 'significado' | 'calculo' | 'fuente') => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden text-xs">
      {/* Botones de selección rápida */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100/80 border-b border-slate-200">
        <button
          type="button"
          onClick={() => toggle('significado')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            openSection === 'significado'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
              : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
          <span>¿Qué significa?</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSection === 'significado' ? 'rotate-180' : ''}`} />
        </button>

        {howItIsCalculated && (
          <button
            type="button"
            onClick={() => toggle('calculo')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              openSection === 'calculo'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>¿Cómo se calcula?</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSection === 'calculo' ? 'rotate-180' : ''}`} />
          </button>
        )}

        {sourceDetails && (
          <button
            type="button"
            onClick={() => toggle('fuente')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              openSection === 'fuente'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ver fuente oficial</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSection === 'fuente' ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Contenido desplegado */}
      {openSection === 'significado' && (
        <div className="p-4 bg-white text-slate-700 leading-relaxed border-t border-slate-200 animate-in fade-in duration-100">
          <p className="font-medium">{whatItMeans}</p>
        </div>
      )}

      {openSection === 'calculo' && howItIsCalculated && (
        <div className="p-4 bg-white text-slate-700 leading-relaxed border-t border-slate-200 animate-in fade-in duration-100 space-y-1.5">
          <span className="font-bold text-slate-900 block">Metodología de cálculo:</span>
          <p>{howItIsCalculated}</p>
        </div>
      )}

      {openSection === 'fuente' && sourceDetails && (
        <div className="p-4 bg-white text-slate-700 leading-relaxed border-t border-slate-200 animate-in fade-in duration-100 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-900 block">Organismo emisor:</span>
              <span className="text-slate-600">{sourceDetails.organismo}</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Indicador oficial:</span>
              <span className="text-slate-600">{sourceDetails.indicadorOficial}</span>
            </div>
            {sourceDetails.cobertura && (
              <div>
                <span className="font-bold text-slate-900 block">Cobertura territorial:</span>
                <span className="text-slate-600">{sourceDetails.cobertura}</span>
              </div>
            )}
            {sourceDetails.universo && (
              <div>
                <span className="font-bold text-slate-900 block">Universo relevado:</span>
                <span className="text-slate-600">{sourceDetails.universo}</span>
              </div>
            )}
            {sourceDetails.archivoOriginal && (
              <div className="sm:col-span-2">
                <span className="font-bold text-slate-900 block">Archivo fuente original:</span>
                <code className="text-[11px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                  {sourceDetails.archivoOriginal}
                </code>
              </div>
            )}
          </div>
          {sourceDetails.advertencia && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] mt-2">
              <strong>Nota metodológica:</strong> {sourceDetails.advertencia}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
