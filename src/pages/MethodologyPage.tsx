import React from 'react';
import { MetadataDataset, Correspondencia, Area } from '../types';
import { ShieldCheck, BookOpen } from 'lucide-react';
import defaultMetadata from '../../data/metadata.json';
import defaultCorrespondencias from '../../data/correspondencias.json';
import defaultAreas from '../../data/areas.json';

interface MethodologyPageProps {
  metadata?: MetadataDataset;
  correspondencias?: Correspondencia[];
  areas?: Area[];
}

export const MethodologyPage: React.FC<MethodologyPageProps> = ({
  metadata = defaultMetadata as MetadataDataset,
  correspondencias = defaultCorrespondencias as Correspondencia[],
  areas = defaultAreas as Area[]
}) => {
  return (
    <div className="space-y-12 py-8">
      {/* Encabezado */}
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Rigor Metodológico y Trazabilidad</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Fuentes Oficiales y Metodología del Proyecto
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Documentación técnica auditable de los organismos emisores, archivos físicos de origen, coberturas, limitaciones y criterios de correspondencia adoptados en la aplicación.
        </p>
      </div>

      {/* Regla Fundamental de Trazabilidad */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
        <h2 className="text-base font-bold text-brand-400 uppercase tracking-wider">
          Cadena de Trazabilidad de los Datos
        </h2>
        <div className="p-4 rounded-xl bg-slate-800 font-mono text-xs text-brand-200 overflow-x-auto">
          USUARIO ➔ AREA_ID (A01..A12) ➔ FUENTE ➔ ARCHIVO FÍSICO ➔ HOJA/TABLA ➔ VARIABLE ORIGINAL ➔ PERÍODO ➔ UNIDAD ➔ RESULTADO EN PANTALLA
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Todo número exhibido en la interfaz proviene de un registro físico identificable en las fuentes públicas de la provincia y la nación. No existen datos extrapolados ni estimaciones sintéticas.
        </p>
      </div>

      {/* Fichas Técnicas por Fuente Oficial */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          Fichas Técnicas de las Fuentes Oficiales
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metadata.fuentes_oficiales.map((f) => (
            <div key={f.fuente_id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800">
                    {f.fuente_id}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {f.periodicidad}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">
                  {f.organismo}
                </h3>
                <p className="text-xs text-brand-700 font-semibold mb-3">
                  {f.indicador}
                </p>

                <div className="space-y-2 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-700">Archivo Original: </span>
                    <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded text-slate-800 break-all">
                      {f.archivo_original || f.archivos_originales?.join(', ')}
                    </code>
                  </div>
                  {f.hoja && (
                    <div>
                      <span className="font-semibold text-slate-700">Hoja utilizada: </span>
                      <span>{f.hoja}</span>
                    </div>
                  )}
                  {f.universo && (
                    <div>
                      <span className="font-semibold text-slate-700">Universo / Cobertura: </span>
                      <span>{f.universo} ({f.cobertura || 'Provincial'})</span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-slate-700">Unidad de medida: </span>
                    <span>{f.unidades.join(' • ')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-amber-800 block mb-1">
                  Condición Metodológica Especial:
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                  {f.condicion_especial}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Criterios Metodológicos Especiales Aprobados */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900">
          Decisiones Metodológicas Explícitas del Proyecto
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Caso Rama L en OEDE (A10)
            </div>
            <p className="leading-relaxed">
              La rama L no existe en la hoja Jujuy de OEDE porque la fuente releva empresas privadas. La aplicación <strong>no imputa cero</strong> ni estima datos, sino que reporta expresamente la no disponibilidad.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Caso EIL Sector Primario (A01 / A02)
            </div>
            <p className="leading-relaxed">
              La EIL excluye por diseño las actividades agropecuarias y mineras. A01 y A02 se señalan como &quot;No aplica por exclusión de muestra&quot;, evitando confusiones sobre inactividad.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Sectores MIP No Forzados
            </div>
            <p className="leading-relaxed">
              Los sectores MIP 3, 19, 20 y 34 (hogares) no se asignaron forzadamente a ninguna de las 12 áreas al no existir justificación metodológica sólida.
            </p>
          </div>
        </div>
      </div>

      {/* Matriz Completa de Correspondencias */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Matriz Completa de Correspondencias (78 Registros)
            </h2>
            <p className="text-xs text-slate-500">
              Mapeo unívoco entre las ramas de cada fuente oficial y las {areas.length} áreas conceptuales del proyecto:
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">Área ID</th>
                <th className="py-2.5 px-3">Fuente</th>
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Denominación en la Fuente</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {correspondencias.map((c) => (
                <tr key={c.correspondencia_id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-bold text-brand-700">{c.area_id || 'SIN_CORR'}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{c.fuente}</td>
                  <td className="py-2 px-3 font-mono text-slate-600">{c.codigo_fuente}</td>
                  <td className="py-2 px-3 text-slate-900">{c.nombre_fuente}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{c.tipo_correspondencia}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      c.estado === 'CONFIRMADO' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100'
                    }`}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-500 text-[11px]">{c.observacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
