import React from 'react';
import { AlertTriangle, Info, Clock, ShieldAlert } from 'lucide-react';

interface MethodWarningProps {
  type: 'oede-a10' | 'eil-primaria' | 'eil-agrupada' | 'mip-base2015' | 'pbg-provisorio' | 'generic';
  title?: string;
  message?: string;
  className?: string;
}

export const MethodWarning: React.FC<MethodWarningProps> = ({
  type,
  title,
  message,
  className = "my-4"
}) => {
  let defaultTitle = "Nota metodológica oficial";
  let defaultMessage = "";
  let icon = <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />;
  let boxStyle = "bg-blue-50 border-blue-200 text-blue-900";

  switch (type) {
    case 'oede-a10':
      defaultTitle = "Ausencia de serie en OEDE (Administración Pública)";
      defaultMessage =
        "Esta fuente no presenta una serie correspondiente a Administración Pública para Jujuy. La base OEDE releva empleo registrado privado y no incluye la administración estatal provincial. Esto no significa ausencia de puestos públicos ni valor cero.";
      icon = <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />;
      boxStyle = "bg-amber-50 border-amber-200 text-amber-900";
      break;

    case 'eil-primaria':
      defaultTitle = "Actividad excluida del relevamiento EIL";
      defaultMessage =
        "La Encuesta de Indicadores Laborales (EIL) excluye deliberadamente las actividades primarias (agricultura, ganadería y minería) dentro de su marco muestral en el Gran Jujuy. La falta de datos responde al diseño técnico de la fuente y no a inactividad laboral.";
      icon = <Info className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />;
      boxStyle = "bg-slate-100 border-slate-200 text-slate-800";
      break;

    case 'eil-agrupada':
      defaultTitle = "Agrupación indivisible de fuente (Comercio + Hotelería y Restaurantes)";
      defaultMessage =
        "En la Tabla 3.9.2 de EIL, la actividad figura consolidada como 'Comercio, restaurantes y hoteles'. Metodológicamente no se divide artificialmente entre Comercio (A06) y Turismo (A07) porque la fuente original no proporciona ese desglose.";
      icon = <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />;
      boxStyle = "bg-purple-50 border-purple-200 text-purple-900";
      break;

    case 'mip-base2015':
      defaultTitle = "Matriz Insumo-Producto: Año Base 2015";
      defaultMessage =
        "Los indicadores de la MIP corresponden a la estructura productiva de 2015 y permiten observar relaciones estructurales de empleo directo e indirecto. No representan una medición del empleo actual.";
      icon = <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />;
      boxStyle = "bg-indigo-50 border-indigo-200 text-indigo-900";
      break;

    case 'pbg-provisorio':
      defaultTitle = "Valores Provisorios en PBG (*)";
      defaultMessage =
        "Los datos de los años 2022, 2023 y 2024 figuran con asterisco (*) en la fuente oficial de DiPEC y conservan condición provisoria sujeta a rectificaciones estadísticas oficiales.";
      icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />;
      boxStyle = "bg-amber-50 border-amber-200 text-amber-900";
      break;

    case 'generic':
    default:
      icon = <Info className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />;
      boxStyle = "bg-brand-50 border-brand-200 text-brand-900";
      break;
  }

  return (
    <div className={`p-4 rounded-xl border text-sm flex gap-3 shadow-xs ${boxStyle} ${className}`}>
      {icon}
      <div>
        <h5 className="font-semibold mb-0.5">{title || defaultTitle}</h5>
        <p className="text-xs leading-relaxed opacity-90">{message || defaultMessage}</p>
      </div>
    </div>
  );
};
