export type AreaId = 
  | 'A01' | 'A02' | 'A03' | 'A04' | 'A05' | 'A06' 
  | 'A07' | 'A08' | 'A09' | 'A10' | 'A11' | 'A12';

export interface Area {
  area_id: AreaId;
  nombre: string;
  descripcion: string;
  icono: string;
}

export type MotivoExploracion = 
  | 'estudiar' 
  | 'trabajar' 
  | 'cambiar' 
  | 'emprender' 
  | 'explorar';

export type TipoTareaInteres = 
  | 'profesional' 
  | 'tecnica' 
  | 'operativa' 
  | 'varias' 
  | 'indefinido';

export type RangoEdad = 
  | '13-17' 
  | '18-24' 
  | '25-34' 
  | '35-49' 
  | '50+' 
  | 'omitido';

export interface PreferenciasExploracion {
  motivo: MotivoExploracion | null;
  areasSeleccionadas: AreaId[];
  tipoTarea: TipoTareaInteres | null;
  rangoEdad: RangoEdad | null;
}

export interface Correspondencia {
  correspondencia_id: string;
  area_id: AreaId | null;
  fuente: 'PBG' | 'OEDE' | 'EIL' | 'MIP';
  codigo_fuente: string;
  nombre_fuente: string;
  tipo_correspondencia: 'DIRECTA' | 'AGRUPADA' | 'MULTIPLE' | 'PARCIAL' | 'NO_APLICA';
  estado: 'CONFIRMADO' | 'DECISION_PROYECTO' | 'OBSERVADO';
  observacion: string;
}

export interface PBGRecord {
  id: string;
  area_id: AreaId | null;
  codigo_rama: string;
  nombre_rama: string;
  periodo_anio: number;
  es_provisorio: boolean;
  valor_constante: number | null;
  unidad_constante: string;
  valor_corriente: number | null;
  unidad_corriente: string;
  variacion_anual_pct: number | null;
  unidad_variacion: string | null;
  fuente: string;
  archivo: string;
  hojas_origen: string[];
}

export interface PBGDataset {
  metadata: {
    fuente: string;
    indicador: string;
    cobertura: string;
    periodo_desde: number;
    periodo_hasta: number;
    anios_provisorios: number[];
    base_constante: string;
    total_registros: number;
    nota_metodologica: string;
  };
  series: PBGRecord[];
}

export interface OEDERecord {
  id: string;
  area_id: AreaId | null;
  codigo_rama: string;
  nombre_rama: string;
  tipo_nivel: 'LETRA' | 'DIGITO_2' | 'TOTAL';
  letra_padre: string | null;
  periodo: string;
  anio: number | null;
  trimestre: number | null;
  puestos_trabajo: number | null;
  valor_original: string;
  estado_dato: 'PUBLICADO' | 'SIN_DATO_SECRETO_ESTADISTICO' | 'SIN_DATO' | 'FORMATO_ESPECIAL';
  indicador: string;
  unidad: string;
  universo: string;
  fuente: string;
  archivo: string;
  hoja: string;
}

export interface OEDEDataset {
  metadata: {
    fuente: string;
    indicador: string;
    cobertura: string;
    periodos_totales: number;
    periodo_desde: string;
    periodo_hasta: string;
    total_registros: number;
    regla_a10: string;
    regla_secreto_estadistico: string;
  };
  series: OEDERecord[];
}

export interface EILRecord392 {
  id: string;
  tabla: '3.9.2';
  bloque: string;
  indicador: string;
  concepto: string;
  area_id: string | null;
  tipo_correspondencia: string;
  alcance: 'POR_RAMA' | 'TRANSVERSAL' | 'POR_SECTOR';
  periodo: string;
  valor: number | null;
  valor_original: string;
  estado_dato: 'PUBLICADO' | 'SIN_DATO_SECRETO_ESTADISTICO' | 'SIN_DATO_NO_DISPONIBLE' | 'FORMATO_ESPECIAL';
  unidad: string;
  fuente: string;
  archivo: string;
}

export interface EILRecord396 {
  id: string;
  tabla: '3.9.6';
  indicador: string;
  calificacion_tarea: 'Total' | 'Profesional' | 'Técnica' | 'Operativa' | 'No Calificada';
  area_id: null;
  alcance: 'TRANSVERSAL';
  periodo: string;
  valor: number | null;
  valor_original: string;
  estado_dato: 'PUBLICADO' | 'SIN_DATO_NO_DISPONIBLE' | 'FORMATO_ESPECIAL';
  unidad: string;
  nota: string;
  fuente: string;
  archivo: string;
}

export interface EILRecord398 {
  id: string;
  tabla: '3.9.8';
  indicador: string;
  categoria_demanda: string;
  area_id: null;
  alcance: 'TRANSVERSAL';
  periodo: string;
  valor: number | null;
  valor_original: string;
  estado_dato: 'PUBLICADO' | 'SIN_DATO_NO_DISPONIBLE' | 'FORMATO_ESPECIAL';
  unidad: string;
  nota: string;
  fuente: string;
  archivo: string;
}

export interface EILDataset {
  metadata: {
    fuente: string;
    cobertura: string;
    universo: string;
    exclusiones: string;
    reglas: string[];
  };
  tabla_3_9_2_evolucion_y_ramas: EILRecord392[];
  tabla_3_9_6_calificacion_tarea: EILRecord396[];
  tabla_3_9_8_demanda_laboral: EILRecord398[];
}

export interface MIPSector {
  sector_mip_id: number;
  area_id: AreaId | null;
  nombre_sector: string;
  anio_base: number;
  vbp_millones_pesos_2015: number | null;
  empleo_nacional_2015: number | null;
  densidad_laboral_directa: number | null;
  multiplicador_total_coef: number | null;
  multiplicador_total_por_millon: number | null;
  empleo_directo_por_millon: number | null;
  empleo_indirecto_por_millon: number | null;
  valores_originales_cuadro_3: {
    multiplicador_total: string | null;
    empleo_directo: string | null;
    empleo_indirecto: string | null;
  };
  unidad_multiplicador: string;
  estado_dato: 'PUBLICADO' | 'EXCLUIDO_EN_FUENTE';
  fuente: string;
  archivo: string;
  nota_metodologica: string;
}

export interface MIPDataset {
  metadata: {
    fuente: string;
    documento: string;
    anio_base: number;
    metodologia: string;
    total_sectores: number;
    sectores_asignados_a_areas: number;
    sectores_sin_asignacion_forzada: number[];
    advertencia_fundamental: string;
  };
  sectores: MIPSector[];
}

export interface MetadataFuente {
  fuente_id: string;
  organismo: string;
  archivo_original: string;
  hoja?: string;
  archivos_originales?: string[];
  indicador: string;
  cobertura?: string;
  universo?: string;
  periodicidad: string;
  unidades: string[];
  condicion_especial: string;
}

export interface MetadataDataset {
  proyecto: {
    nombre: string;
    institucion: string;
    tipo: string;
    objetivo: string;
    regla_trazabilidad: string;
  };
  fuentes_oficiales: MetadataFuente[];
}
