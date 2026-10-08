import React from 'react';
import { MissingDataBadge } from './MissingDataBadge';

interface StatCardProps {
  title: string;
  value: string | number | null;
  unit: string;
  period: string;
  source: string;
  isProvisional?: boolean;
  status?: 'PUBLICADO' | 'SIN_DATO_SECRETO_ESTADISTICO' | 'SIN_DATO_NO_DISPONIBLE' | 'NO_APLICA' | 'FUENTE_NO_DISPONIBLE' | 'PROVISORIO';
  subtitle?: string;
  secondaryValue?: {
    label: string;
    value: string | number | null;
    unit: string;
  };
  note?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  period,
  source,
  isProvisional,
  status = 'PUBLICADO',
  subtitle,
  secondaryValue,
  note
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {source}
          </span>
          {isProvisional ? (
            <MissingDataBadge status="PROVISORIO" />
          ) : status !== 'PUBLICADO' ? (
            <MissingDataBadge status={status} />
          ) : null}
        </div>

        <h4 className="text-sm font-semibold text-slate-900 mb-1 leading-snug">
          {title}
        </h4>
        {subtitle && (
          <p className="text-xs text-slate-500 mb-3">{subtitle}</p>
        )}

        {/* Valor principal */}
        <div className="my-3">
          {value !== null && value !== undefined ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {value}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {unit}
              </span>
            </div>
          ) : (
            <div className="py-2 text-slate-500 text-sm font-medium italic">
              {status === 'SIN_DATO_SECRETO_ESTADISTICO'
                ? 's.d. (Secreto estadístico)'
                : 'Indicador no disponible'}
            </div>
          )}
        </div>

        {/* Valor secundario (ej. precios corrientes) */}
        {secondaryValue && secondaryValue.value !== null && (
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between text-xs text-slate-600">
            <span>{secondaryValue.label}:</span>
            <span className="font-semibold text-slate-800">
              {secondaryValue.value} <span className="text-[11px] font-normal text-slate-500">{secondaryValue.unit}</span>
            </span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>Período: <strong className="text-slate-600">{period}</strong></span>
        {note && <span className="truncate max-w-[150px]" title={note}>{note}</span>}
      </div>
    </div>
  );
};
