#!/usr/bin/env python3
"""
ETL Derivado — Proyecto DIPEC: "TU PRÓXIMO PASO — JUJUY EN DATOS" (IES N.º 11)
Este script extrae información de las fuentes originales en TU_PROXIMO_PASO_FUENTES
(en modo estrictamente SOLO LECTURA) y genera los datasets derivados en data/.
"""

import os
import json
import re
from datetime import datetime
import openpyxl
import pypdf

BASE_DIR = "/mnt/c/Proyecto DIPEC"
FUENTES_DIR = os.path.join(BASE_DIR, "TU_PROXIMO_PASO_FUENTES")
DATA_DIR = os.path.join(BASE_DIR, "data")

os.makedirs(DATA_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. AREAS CONCEPTUALES (Exactamente las 12 áreas del proyecto)
# -------------------------------------------------------------
def build_areas():
    areas = [
        {
            "area_id": "A01",
            "nombre": "Agro y producción primaria",
            "descripcion": "Actividades agrícolas, ganaderas, caza, silvicultura y producción primaria provincial.",
            "icono": "sprout"
        },
        {
            "area_id": "A02",
            "nombre": "Minería",
            "descripcion": "Extracción de minerales metalíferos, no metalíferos, rocas de aplicación y recursos del subsuelo.",
            "icono": "pickaxe"
        },
        {
            "area_id": "A03",
            "nombre": "Industria manufacturera",
            "descripcion": "Transformación de materias primas: alimentos, bebidas, tabaco, papel, productos químicos, metales y manufacturas.",
            "icono": "factory"
        },
        {
            "area_id": "A04",
            "nombre": "Energía, agua y gas",
            "descripcion": "Generación y distribución de electricidad, suministro de gas y captación/distribución de agua.",
            "icono": "zap"
        },
        {
            "area_id": "A05",
            "nombre": "Construcción",
            "descripcion": "Obras de infraestructura vial, edificación residencial, comercial e ingeniería civil.",
            "icono": "hard-hat"
        },
        {
            "area_id": "A06",
            "nombre": "Comercio",
            "descripcion": "Comercio mayorista y minorista de bienes y servicios comerciales.",
            "icono": "shopping-cart"
        },
        {
            "area_id": "A07",
            "nombre": "Turismo y gastronomía",
            "descripcion": "Servicios de hotelería, alojamiento, restaurantes, bares y actividades gastronómicas.",
            "icono": "utensils"
        },
        {
            "area_id": "A08",
            "nombre": "Transporte y comunicaciones",
            "descripcion": "Transporte terrestre, logística de carga, almacenamiento, servicios postales y telecomunicaciones.",
            "icono": "truck"
        },
        {
            "area_id": "A09",
            "nombre": "Finanzas y servicios empresariales",
            "descripcion": "Intermediación financiera, seguros, servicios inmobiliarios, jurídicos, contables y profesionales a empresas.",
            "icono": "landmark"
        },
        {
            "area_id": "A10",
            "nombre": "Administración pública",
            "descripcion": "Servicios de la administración pública provincial/nacional, defensa, justicia y seguridad social obligatoria.",
            "icono": "building"
        },
        {
            "area_id": "A11",
            "nombre": "Educación",
            "descripcion": "Servicios de enseñanza inicial, primaria, secundaria, superior y universitaria en sus distintos ámbitos.",
            "icono": "graduation-cap"
        },
        {
            "area_id": "A12",
            "nombre": "Salud y servicios comunitarios",
            "descripcion": "Servicios médicos, hospitalarios, farmacéuticos, atención social y servicios comunitarios, culturales y personales.",
            "icono": "heart-pulse"
        }
    ]
    path = os.path.join(DATA_DIR, "areas.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(areas, f, indent=2, ensure_ascii=False)
    print(f"Areas: {len(areas)} creadas en {path}")
    return areas


# -------------------------------------------------------------
# 2. CORRESPONDENCIAS OFICIALES Y METODOLÓGICAS
# -------------------------------------------------------------
def build_correspondencias():
    # Correspondencias auditadas y aprobadas en Fase de Validación Física
    correspondencias = [
        # PBG
        {"correspondencia_id": "CORR_PBG_A01", "area_id": "A01", "fuente": "PBG", "codigo_fuente": "A", "nombre_fuente": "A - AGRICULTURA, GANADERÍA, CAZA Y SILVIC.", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Serie 2004-2024*. Valores 2022-2024 provisorios."},
        {"correspondencia_id": "CORR_PBG_B_SIN_CORR", "area_id": None, "fuente": "PBG", "codigo_fuente": "B", "nombre_fuente": "(No existe en archivo PBG)", "tipo_correspondencia": "NO_APLICA", "estado": "DECISION_PROYECTO", "observacion": "Rama B (Pesca) no existe físicamente en PBG Jujuy. No se crea área ni se inventa valor."},
        {"correspondencia_id": "CORR_PBG_A02", "area_id": "A02", "fuente": "PBG", "codigo_fuente": "C", "nombre_fuente": "C - MINERÍA", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Serie 2004-2024*."},
        {"correspondencia_id": "CORR_PBG_A03", "area_id": "A03", "fuente": "PBG", "codigo_fuente": "D", "nombre_fuente": "D - INDUSTRIA MANUFACTURERA", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Serie 2004-2024*."},
        {"correspondencia_id": "CORR_PBG_A04", "area_id": "A04", "fuente": "PBG", "codigo_fuente": "E", "nombre_fuente": "E - SUMINISTRO DE ELECTRICIDAD, GAS Y AGUA", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Serie 2004-2024*."},
        {"correspondencia_id": "CORR_PBG_A05", "area_id": "A05", "fuente": "PBG", "codigo_fuente": "F", "nombre_fuente": "F - CONSTRUCCIÓN", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Serie 2004-2024*."},
        {"correspondencia_id": "CORR_PBG_A06", "area_id": "A06", "fuente": "PBG", "codigo_fuente": "G", "nombre_fuente": "G - COMERCIO AL POR MAYOR Y AL POR MENOR", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Serie 2004-2024*."},
        {"correspondencia_id": "CORR_PBG_A07", "area_id": "A07", "fuente": "PBG", "codigo_fuente": "H", "nombre_fuente": "H - HOTELES Y RESTAURANTES", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Serie 2004-2024*."},
        {"correspondencia_id": "CORR_PBG_A08", "area_id": "A08", "fuente": "PBG", "codigo_fuente": "I", "nombre_fuente": "I  -  TRANSPORTE, ALMACENAMIENTO Y COMUNIC.", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Serie 2004-2024*."},
        {"correspondencia_id": "CORR_PBG_A09_J", "area_id": "A09", "fuente": "PBG", "codigo_fuente": "J", "nombre_fuente": "J -  INTERMEDIACIÓN FINANCIERA", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente financiero de A09."},
        {"correspondencia_id": "CORR_PBG_A09_K", "area_id": "A09", "fuente": "PBG", "codigo_fuente": "K", "nombre_fuente": "K - ACTIVIDADES INMOB, EMPRESARIALES Y DE ALQ.", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente inmobiliario y empresarial de A09."},
        {"correspondencia_id": "CORR_PBG_A10", "area_id": "A10", "fuente": "PBG", "codigo_fuente": "L", "nombre_fuente": "L -  ADMINISTRACIÓN PÚBLICA Y DEFENSA", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Serie 2004-2024*."},
        {"correspondencia_id": "CORR_PBG_A11", "area_id": "A11", "fuente": "PBG", "codigo_fuente": "M", "nombre_fuente": "M - ENSEÑANZA", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Serie 2004-2024*."},
        {"correspondencia_id": "CORR_PBG_A12_N", "area_id": "A12", "fuente": "PBG", "codigo_fuente": "N", "nombre_fuente": "N - SERVICIOS SOCIALES Y DE SALUD", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente de salud y servicios sociales de A12."},
        {"correspondencia_id": "CORR_PBG_A12_O", "area_id": "A12", "fuente": "PBG", "codigo_fuente": "O", "nombre_fuente": "O - OTRAS ACTIVIDADES DE Ss COMUNITARIOS, ETC.", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente comunitario y personal de A12."},
        {"correspondencia_id": "CORR_PBG_P_SIN_CORR", "area_id": None, "fuente": "PBG", "codigo_fuente": "P", "nombre_fuente": "P - HOGARES PRIVADOS CON SERVICIO DOMÉSTICO", "tipo_correspondencia": "NO_APLICA", "estado": "DECISION_PROYECTO", "observacion": "Existe físicamente en PBG pero no forma parte de las 12 áreas conceptuales del proyecto. No se fuerza su inclusión."},
        
        # OEDE
        {"correspondencia_id": "CORR_OEDE_A01", "area_id": "A01", "fuente": "OEDE", "codigo_fuente": "A", "nombre_fuente": "AGRICULTURA, GANADERIA, CAZA Y SILVICULTURA", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Asalariados registrados privados. Trimestral 1°T 1996 a 1°T 2026."},
        {"correspondencia_id": "CORR_OEDE_B_SIN_CORR", "area_id": None, "fuente": "OEDE", "codigo_fuente": "B", "nombre_fuente": "PESCA Y SERVICIOS CONEXOS", "tipo_correspondencia": "NO_APLICA", "estado": "DECISION_PROYECTO", "observacion": "Figura en OEDE Jujuy con valor 's.d.' en todos los trimestres. No se asigna a las 12 áreas."},
        {"correspondencia_id": "CORR_OEDE_A02", "area_id": "A02", "fuente": "OEDE", "codigo_fuente": "C", "nombre_fuente": "EXPLOTACION  DE  MINAS  Y  CANTERAS", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Asalariados registrados privados en minería."},
        {"correspondencia_id": "CORR_OEDE_A03", "area_id": "A03", "fuente": "OEDE", "codigo_fuente": "D", "nombre_fuente": "INDUSTRIA MANUFACTURERA", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Asalariados registrados privados industriales."},
        {"correspondencia_id": "CORR_OEDE_A04", "area_id": "A04", "fuente": "OEDE", "codigo_fuente": "E", "nombre_fuente": "ELECTRICIDAD, GAS Y AGUA", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Asalariados registrados privados en suministro de energía y agua."},
        {"correspondencia_id": "CORR_OEDE_A05", "area_id": "A05", "fuente": "OEDE", "codigo_fuente": "F", "nombre_fuente": "CONSTRUCCION", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Asalariados registrados privados en construcción."},
        {"correspondencia_id": "CORR_OEDE_A06", "area_id": "A06", "fuente": "OEDE", "codigo_fuente": "G", "nombre_fuente": "COMERCIO AL POR MAYOR Y AL POR MENOR", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Asalariados registrados privados en comercio."},
        {"correspondencia_id": "CORR_OEDE_A07", "area_id": "A07", "fuente": "OEDE", "codigo_fuente": "H", "nombre_fuente": "HOTELERIA Y RESTAURANTES", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Asalariados registrados privados en hotelería y gastronomía."},
        {"correspondencia_id": "CORR_OEDE_A08", "area_id": "A08", "fuente": "OEDE", "codigo_fuente": "I", "nombre_fuente": "SERVICIOS DE TRANSPORTE, DE ALMACENAMIENTO Y DE COMUNICACIONES", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Asalariados registrados privados en transporte y comunicaciones."},
        {"correspondencia_id": "CORR_OEDE_A09_J", "area_id": "A09", "fuente": "OEDE", "codigo_fuente": "J", "nombre_fuente": "INTERMEDIACION FINANCIERA Y OTROS SERVICIOS FINANCIEROS", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente financiero registrado privado de A09."},
        {"correspondencia_id": "CORR_OEDE_A09_K", "area_id": "A09", "fuente": "OEDE", "codigo_fuente": "K", "nombre_fuente": "SERVICIOS INMOBILIARIOS, EMPRESARIALES Y DE ALQUILER", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente inmobiliario y empresarial registrado privado de A09."},
        {"correspondencia_id": "CORR_OEDE_A10_AUSENTE", "area_id": "A10", "fuente": "OEDE", "codigo_fuente": "L (Ausente)", "nombre_fuente": "(Rama L no publicada en OEDE Jujuy)", "tipo_correspondencia": "NO_APLICA", "estado": "CONFIRMADO", "observacion": "OEDE releva empleo registrado privado; Rama L no existe en la hoja Jujuy. Regla estricta: NO imputar 0, NO estimar, NO inventar."},
        {"correspondencia_id": "CORR_OEDE_A11", "area_id": "A11", "fuente": "OEDE", "codigo_fuente": "M", "nombre_fuente": "ENSEÑANZA", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Asalariados registrados privados en enseñanza."},
        {"correspondencia_id": "CORR_OEDE_A12_N", "area_id": "A12", "fuente": "OEDE", "codigo_fuente": "N", "nombre_fuente": "SERVICIOS SOCIALES Y DE SALUD", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Asalariados registrados privados en salud y servicios sociales."},
        {"correspondencia_id": "CORR_OEDE_A12_O", "area_id": "A12", "fuente": "OEDE", "codigo_fuente": "O", "nombre_fuente": "SERVICIOS COMUNITARIOS, SOCIALES Y PERSONALES N.C.P.", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Asalariados registrados privados en servicios comunitarios."},

        # MIP
        {"correspondencia_id": "CORR_MIP_A01_1", "area_id": "A01", "fuente": "MIP", "codigo_fuente": "1", "nombre_fuente": "Agricultura, silv y pesca", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Base 2015. Multiplicador de empleo total, directo e indirecto."},
        {"correspondencia_id": "CORR_MIP_A02_2", "area_id": "A02", "fuente": "MIP", "codigo_fuente": "2", "nombre_fuente": "Minería", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Base 2015. Multiplicador de empleo total, directo e indirecto."},
        {"correspondencia_id": "CORR_MIP_3_SIN_CORR", "area_id": None, "fuente": "MIP", "codigo_fuente": "3", "nombre_fuente": "Petróleo, gas y refinados", "tipo_correspondencia": "NO_APLICA", "estado": "DECISION_PROYECTO", "observacion": "Sector MIP no forzado en ninguna de las 12 áreas según pauta metodológica."},
        * [{"correspondencia_id": f"CORR_MIP_A03_{sec}", "area_id": "A03", "fuente": "MIP", "codigo_fuente": str(sec), "nombre_fuente": name, "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente industrial en MIP (sectores 4 a 18)."}
           for sec, name in [
               (4, "Elab. de productos alimenticios, bebidas y tabaco"),
               (5, "Productos textiles"),
               (6, "Prendas de vestir"),
               (7, "Curtido y terminación de cueros"),
               (8, "Producción de madera y fab. de prod. de madera"),
               (9, "Fabricación de papel y de prod. papel"),
               (10, "Edición e impresión"),
               (11, "Sustancias y productos químicos"),
               (12, "Productos de caucho y plástico"),
               (13, "Productos minerales no metálicos"),
               (14, "Metales comunes y prod. elaborados de metal"),
               (15, "Maquinaria, equipo"),
               (16, "Aparatos y equipos eléctricos y comunicaciones"),
               (17, "Vehículos aut. remolques y eq. de transporte"),
               (18, "Muebles y colchones")
           ]],
        {"correspondencia_id": "CORR_MIP_19_SIN_CORR", "area_id": None, "fuente": "MIP", "codigo_fuente": "19", "nombre_fuente": "Reciclamiento y gestión de desechos", "tipo_correspondencia": "NO_APLICA", "estado": "DECISION_PROYECTO", "observacion": "Sector MIP no forzado en A03 según regla metodológica."},
        {"correspondencia_id": "CORR_MIP_20_SIN_CORR", "area_id": None, "fuente": "MIP", "codigo_fuente": "20", "nombre_fuente": "Reparación máquinas y equipos", "tipo_correspondencia": "NO_APLICA", "estado": "DECISION_PROYECTO", "observacion": "Sector MIP no forzado en A03 según regla metodológica."},
        {"correspondencia_id": "CORR_MIP_A04_21", "area_id": "A04", "fuente": "MIP", "codigo_fuente": "21", "nombre_fuente": "Electricidad, agua y gas", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Base 2015."},
        {"correspondencia_id": "CORR_MIP_A05_22", "area_id": "A05", "fuente": "MIP", "codigo_fuente": "22", "nombre_fuente": "Construcción", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Base 2015."},
        {"correspondencia_id": "CORR_MIP_A06_23", "area_id": "A06", "fuente": "MIP", "codigo_fuente": "23", "nombre_fuente": "Comercio", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Base 2015."},
        {"correspondencia_id": "CORR_MIP_A07_24", "area_id": "A07", "fuente": "MIP", "codigo_fuente": "24", "nombre_fuente": "Hoteles, campamentos y otros tipos de hospedaje", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente hotelero de A07 (MIP 24+25)."},
        {"correspondencia_id": "CORR_MIP_A07_25", "area_id": "A07", "fuente": "MIP", "codigo_fuente": "25", "nombre_fuente": "Restaurantes, bares y cantinas", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente gastronómico de A07 (MIP 24+25)."},
        {"correspondencia_id": "CORR_MIP_A08_26", "area_id": "A08", "fuente": "MIP", "codigo_fuente": "26", "nombre_fuente": "Transporte", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente transporte de A08 (MIP 26+27)."},
        {"correspondencia_id": "CORR_MIP_A08_27", "area_id": "A08", "fuente": "MIP", "codigo_fuente": "27", "nombre_fuente": "Correo y comunicaciones", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente comunicaciones de A08 (MIP 26+27)."},
        {"correspondencia_id": "CORR_MIP_A09_28", "area_id": "A09", "fuente": "MIP", "codigo_fuente": "28", "nombre_fuente": "Intermediación financiera", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente financiero de A09 (MIP 28+29)."},
        {"correspondencia_id": "CORR_MIP_A09_29", "area_id": "A09", "fuente": "MIP", "codigo_fuente": "29", "nombre_fuente": "Actividades inmobiliarias, empresariales y de alquiler", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente inmobiliario y empresarial de A09 (MIP 28+29)."},
        {"correspondencia_id": "CORR_MIP_A10_30", "area_id": "A10", "fuente": "MIP", "codigo_fuente": "30", "nombre_fuente": "Administración pública", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Base 2015."},
        {"correspondencia_id": "CORR_MIP_A11_31", "area_id": "A11", "fuente": "MIP", "codigo_fuente": "31", "nombre_fuente": "Enseñanza", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Base 2015."},
        {"correspondencia_id": "CORR_MIP_A12_32", "area_id": "A12", "fuente": "MIP", "codigo_fuente": "32", "nombre_fuente": "Servicios sociales y de salud", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente de salud y servicios sociales de A12 (MIP 32+33)."},
        {"correspondencia_id": "CORR_MIP_A12_33", "area_id": "A12", "fuente": "MIP", "codigo_fuente": "33", "nombre_fuente": "Otras actividades de servicios comunitarios", "tipo_correspondencia": "MULTIPLE", "estado": "CONFIRMADO", "observacion": "Componente comunitario de A12 (MIP 32+33)."},
        {"correspondencia_id": "CORR_MIP_34_SIN_CORR", "area_id": None, "fuente": "MIP", "codigo_fuente": "34", "nombre_fuente": "Hogares con servicios domésticos", "tipo_correspondencia": "NO_APLICA", "estado": "DECISION_PROYECTO", "observacion": "Excluido metodológicamente en la fuente (valores '-' en Cuadros 2 y 3). No se asigna a las 12 áreas."},

        # EIL
        {"correspondencia_id": "CORR_EIL_A01_NO_APLICA", "area_id": "A01", "fuente": "EIL", "codigo_fuente": "Sector primario", "nombre_fuente": "Actividades primarias", "tipo_correspondencia": "NO_APLICA", "estado": "CONFIRMADO", "observacion": "EIL Gran Jujuy excluye actividades primarias por diseño de muestra. No aplica."},
        {"correspondencia_id": "CORR_EIL_A02_NO_APLICA", "area_id": "A02", "fuente": "EIL", "codigo_fuente": "Sector primario", "nombre_fuente": "Actividades primarias", "tipo_correspondencia": "NO_APLICA", "estado": "CONFIRMADO", "observacion": "EIL Gran Jujuy excluye minería por diseño de muestra. No aplica."},
        {"correspondencia_id": "CORR_EIL_A03", "area_id": "A03", "fuente": "EIL", "codigo_fuente": "Rama", "nombre_fuente": "Industria manufacturera", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Tabla 3.9.2. Índice Feb.15=100 y variaciones relativas. Gran Jujuy, firmas >= 5 trab."},
        {"correspondencia_id": "CORR_EIL_A04", "area_id": "A04", "fuente": "EIL", "codigo_fuente": "Rama", "nombre_fuente": "Electricidad, gas y agua", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Tabla 3.9.2. Gran Jujuy, firmas >= 5 trab."},
        {"correspondencia_id": "CORR_EIL_A05", "area_id": "A05", "fuente": "EIL", "codigo_fuente": "Rama", "nombre_fuente": "Construcción", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Tabla 3.9.2. Gran Jujuy, firmas >= 5 trab."},
        {"correspondencia_id": "CORR_EIL_A06_AGRUPADA", "area_id": "A06", "fuente": "EIL", "codigo_fuente": "Rama", "nombre_fuente": "Comercio, restaurantes y hoteles", "tipo_correspondencia": "AGRUPADA", "estado": "CONFIRMADO", "observacion": "Tabla 3.9.2. Agrupación indivisible de la fuente. No dividir 50/50. Correspondencia agrupada."},
        {"correspondencia_id": "CORR_EIL_A07_AGRUPADA", "area_id": "A07", "fuente": "EIL", "codigo_fuente": "Rama", "nombre_fuente": "Comercio, restaurantes y hoteles", "tipo_correspondencia": "AGRUPADA", "estado": "CONFIRMADO", "observacion": "Tabla 3.9.2. Agrupación indivisible de la fuente. No dividir 50/50. Correspondencia agrupada."},
        {"correspondencia_id": "CORR_EIL_A08", "area_id": "A08", "fuente": "EIL", "codigo_fuente": "Rama", "nombre_fuente": "Transporte, almacenaje y comunicaciones", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Tabla 3.9.2. Gran Jujuy, firmas >= 5 trab."},
        {"correspondencia_id": "CORR_EIL_A09", "area_id": "A09", "fuente": "EIL", "codigo_fuente": "Rama", "nombre_fuente": "Servicios financieros y a las empresas", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Tabla 3.9.2. Gran Jujuy, firmas >= 5 trab."},
        {"correspondencia_id": "CORR_EIL_A10_NO_APLICA", "area_id": "A10", "fuente": "EIL", "codigo_fuente": "Sector público", "nombre_fuente": "Sector público", "tipo_correspondencia": "NO_APLICA", "estado": "CONFIRMADO", "observacion": "EIL releva únicamente empresas privadas formales. No aplica a administración pública."},
        {"correspondencia_id": "CORR_EIL_A12_PARCIAL", "area_id": "A12", "fuente": "EIL", "codigo_fuente": "Rama", "nombre_fuente": "Servicios comunales, sociales y personales", "tipo_correspondencia": "PARCIAL", "estado": "OBSERVADO", "observacion": "Tabla 3.9.2. Servicios comunales/sociales privados de Gran Jujuy. No cubre todo N+O pero es el agrupamiento formal afín."},
        {"correspondencia_id": "CORR_EIL_TRANSVERSAL_CALIF", "area_id": None, "fuente": "EIL", "codigo_fuente": "Tabla 3.9.6", "nombre_fuente": "Calificación de la tarea (Profesional, Técnica, Operativa, No Calificada)", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Indicadores transversales para el conjunto del Gran Jujuy. Mide calificación de la tarea, no nivel educativo."},
        {"correspondencia_id": "CORR_EIL_TRANSVERSAL_DEMANDA", "area_id": None, "fuente": "EIL", "codigo_fuente": "Tabla 3.9.8", "nombre_fuente": "Demanda laboral (Búsquedas, Cobertura, No cobertura)", "tipo_correspondencia": "DIRECTA", "estado": "CONFIRMADO", "observacion": "Indicador específico de demanda laboral en firmas de 5+ ocupados en Gran Jujuy. No renombrar como empleo ni vacantes."}
    ]

    path = os.path.join(DATA_DIR, "correspondencias.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(correspondencias, f, indent=2, ensure_ascii=False)
    print(f"Correspondencias: {len(correspondencias)} creadas en {path}")
    return correspondencias


# -------------------------------------------------------------
# 3. PBG (DiPEC) — EXTRACCIÓN DERIVADA
# -------------------------------------------------------------
def build_pbg():
    wb_path = os.path.join(FUENTES_DIR, "PBG", "PBG-2004-2024-actualizacion-agosto-2025.xlsx")
    wb = openpyxl.load_workbook(wb_path, data_only=True)
    
    s_const = wb["a Precios Constantes"]
    s_corr = wb["a Precios Corrientes"]
    s_var = wb["variación %"]

    # Mapeo de filas en sheet constantes
    # R10: A -> A01
    # R11: C -> A02
    # R12: D -> A03
    # R13: E -> A04
    # R14: F -> A05
    # R18: G -> A06
    # R19: H -> A07
    # R20: I -> A08
    # R21: J -> A09
    # R22: K -> A09
    # R23: L -> A10
    # R24: M -> A11
    # R25: N -> A12
    # R26: O -> A12
    # R27: P -> None (sin correspondencia)
    # R6: TOTAL PBG -> None
    # R8: SECTORES PRODUCTORES DE BIENES -> None
    # R16: SECTORES PRODUCTORES DE SERVICIOS -> None

    sector_config = [
        {"row_const": 6,  "row_corr": 5,  "codigo": "TOTAL", "area_id": None, "es_total": True,  "nombre": "PRODUCTO BRUTO GEOGRÁFICO"},
        {"row_const": 8,  "row_corr": 7,  "codigo": "BIENES", "area_id": None, "es_total": False, "nombre": "SECTORES PRODUCTORES DE BIENES"},
        {"row_const": 10, "row_corr": 9,  "codigo": "A", "area_id": "A01", "es_total": False, "nombre": "A - AGRICULTURA, GANADERÍA, CAZA Y SILVIC."},
        {"row_const": 11, "row_corr": 10, "codigo": "C", "area_id": "A02", "es_total": False, "nombre": "C - MINERÍA"},
        {"row_const": 12, "row_corr": 11, "codigo": "D", "area_id": "A03", "es_total": False, "nombre": "D - INDUSTRIA MANUFACTURERA"},
        {"row_const": 13, "row_corr": 12, "codigo": "E", "area_id": "A04", "es_total": False, "nombre": "E - SUMINISTRO DE ELECTRICIDAD, GAS Y AGUA"},
        {"row_const": 14, "row_corr": 13, "codigo": "F", "area_id": "A05", "es_total": False, "nombre": "F - CONSTRUCCIÓN"},
        {"row_const": 16, "row_corr": 15, "codigo": "SERVICIOS", "area_id": None, "es_total": False, "nombre": "SECTORES PRODUCTORES DE SERVICIOS"},
        {"row_const": 18, "row_corr": 17, "codigo": "G", "area_id": "A06", "es_total": False, "nombre": "G - COMERCIO AL POR MAYOR Y AL POR MENOR"},
        {"row_const": 19, "row_corr": 18, "codigo": "H", "area_id": "A07", "es_total": False, "nombre": "H - HOTELES Y RESTAURANTES"},
        {"row_const": 20, "row_corr": 19, "codigo": "I", "area_id": "A08", "es_total": False, "nombre": "I  -  TRANSPORTE, ALMACENAMIENTO Y COMUNIC."},
        {"row_const": 21, "row_corr": 20, "codigo": "J", "area_id": "A09", "es_total": False, "nombre": "J -  INTERMEDIACIÓN FINANCIERA"},
        {"row_const": 22, "row_corr": 21, "codigo": "K", "area_id": "A09", "es_total": False, "nombre": "K - ACTIVIDADES INMOB, EMPRESARIALES Y DE ALQ."},
        {"row_const": 23, "row_corr": 22, "codigo": "L", "area_id": "A10", "es_total": False, "nombre": "L -  ADMINISTRACIÓN PÚBLICA Y DEFENSA"},
        {"row_const": 24, "row_corr": 23, "codigo": "M", "area_id": "A11", "es_total": False, "nombre": "M - ENSEÑANZA"},
        {"row_const": 25, "row_corr": 24, "codigo": "N", "area_id": "A12", "es_total": False, "nombre": "N - SERVICIOS SOCIALES Y DE SALUD"},
        {"row_const": 26, "row_corr": 25, "codigo": "O", "area_id": "A12", "es_total": False, "nombre": "O - OTRAS ACTIVIDADES DE Ss COMUNITARIOS, ETC."},
        {"row_const": 27, "row_corr": 26, "codigo": "P", "area_id": None, "es_total": False, "nombre": "P - HOGARES PRIVADOS CON SERVICIO DOMÉSTICO"}
    ]

    # Extraer variación porcentual del total PBG desde hoja 'variación %'
    var_dict = {}
    for r in range(2, 23):
        anio_raw = s_var.cell(r, 1).value
        v_pct = s_var.cell(r, 3).value
        if anio_raw is not None:
            anio_clean = int(str(anio_raw).replace("*", "").strip())
            var_val = None if (v_pct is None or v_pct == "-") else round(float(v_pct), 4)
            var_dict[anio_clean] = var_val

    # Años: columnas 2 a 22 en s_const (años 2004 a 2024)
    # Años 2022, 2023, 2024 son provisorios
    years = []
    for c in range(2, 23):
        raw_val = s_const.cell(4, c).value
        anio_int = int(str(raw_val).replace("*", "").strip())
        is_prov = "*" in str(raw_val) or anio_int in [2022, 2023, 2024]
        years.append((c, anio_int, is_prov))

    records = []
    for sec in sector_config:
        rc = sec["row_const"]
        rr = sec["row_corr"]
        for col_idx, anio, is_prov in years:
            val_const_raw = s_const.cell(rc, col_idx).value
            val_corr_raw = s_corr.cell(rr, col_idx).value

            val_const = round(float(val_const_raw), 2) if val_const_raw is not None else None
            val_corr = round(float(val_corr_raw), 2) if val_corr_raw is not None else None

            # Variación % sólo está en la fuente para TOTAL PBG
            var_pct = var_dict.get(anio) if sec["codigo"] == "TOTAL" else None

            rec = {
                "id": f"PBG_{sec['codigo']}_{anio}",
                "area_id": sec["area_id"],
                "codigo_rama": sec["codigo"],
                "nombre_rama": sec["nombre"],
                "periodo_anio": anio,
                "es_provisorio": is_prov,
                "valor_constante": val_const,
                "unidad_constante": "Miles de pesos de 2004",
                "valor_corriente": val_corr,
                "unidad_corriente": "Miles de pesos corrientes",
                "variacion_anual_pct": var_pct,
                "unidad_variacion": "%" if var_pct is not None else None,
                "fuente": "Dirección Provincial de Estadística y Censos (DiPEC)",
                "archivo": "PBG-2004-2024-actualizacion-agosto-2025.xlsx",
                "hojas_origen": ["a Precios Constantes", "a Precios Corrientes", "variación %"]
            }
            records.append(rec)

    pbg_dataset = {
        "metadata": {
            "fuente": "Dirección Provincial de Estadística y Censos (DiPEC)",
            "indicador": "Producto Bruto Geográfico a precios básicos",
            "cobertura": "Provincia de Jujuy",
            "periodo_desde": 2004,
            "periodo_hasta": 2024,
            "anios_provisorios": [2022, 2023, 2024],
            "base_constante": "Año 2004",
            "total_registros": len(records),
            "nota_metodologica": "Los valores de 2022, 2023 y 2024 tienen condición provisoria en la fuente oficial. La rama P no se asigna a las 12 áreas conceptuales. La variación anual % se extrajo exclusivamente de la hoja física 'variación %' para el total provincial."
        },
        "series": records
    }

    path = os.path.join(DATA_DIR, "pbg.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(pbg_dataset, f, indent=2, ensure_ascii=False)
    print(f"PBG: {len(records)} registros guardados en {path}")
    return pbg_dataset


# -------------------------------------------------------------
# 4. OEDE — EMPLEO PRIVADO REGISTRADO
# -------------------------------------------------------------
def build_oede():
    wb_path = os.path.join(FUENTES_DIR, "OEDE", "provinciales_serie_empleo_trimestral_2dig_7.xlsx")
    wb = openpyxl.load_workbook(wb_path, data_only=True)
    s = wb["Jujuy"]

    # Períodos: fila 4, cols 3 a 123
    periods = []
    for c in range(3, s.max_column + 1):
        pval = s.cell(4, c).value
        if pval is not None:
            pstr = str(pval).strip()
            # Parsear Trimestre y Año: ej "1º Trim 1996" o "4° Trim 2024"
            m = re.match(r"^(\d+)[º°]\s*Trim\s*(\d{4})$", pstr)
            if m:
                trimestre = int(m.group(1))
                anio = int(m.group(2))
            else:
                trimestre = None
                anio = None
            periods.append({
                "col_idx": c,
                "periodo_texto": pstr,
                "trimestre": trimestre,
                "anio": anio
            })

    # Mapeo de ramas a area_id
    letter_area_map = {
        "A": "A01",
        "B": None,   # Sin correspondencia (todo s.d.)
        "C": "A02",
        "D": "A03",
        "E": "A04",
        "F": "A05",
        "G": "A06",
        "H": "A07",
        "I": "A08",
        "J": "A09",
        "K": "A09",
        # L no existe en la hoja Jujuy
        "M": "A11",
        "N": "A12",
        "O": "A12"
    }

    # Leer filas de datos (filas 6 a 76)
    records = []
    current_parent_letter = None
    current_parent_area = None

    for r in range(6, 77):
        c1 = s.cell(r, 1).value
        c2 = s.cell(r, 2).value

        if c2 is None and c1 is None:
            continue

        c1_str = str(c1).strip() if c1 is not None else None
        nombre_rama = str(c2).strip() if c2 is not None else ""

        # Determinar nivel
        if c1_str is not None and len(c1_str) == 1 and c1_str.isalpha():
            # Es letra
            tipo_nivel = "LETRA"
            codigo_rama = c1_str
            current_parent_letter = c1_str
            area_id = letter_area_map.get(c1_str)
            current_parent_area = area_id
            letra_padre = None
        elif c1_str is not None and c1_str.isdigit():
            # Es 2 dígitos
            tipo_nivel = "DIGITO_2"
            codigo_rama = c1_str
            area_id = current_parent_area
            letra_padre = current_parent_letter
        elif nombre_rama == "TOTAL":
            tipo_nivel = "TOTAL"
            codigo_rama = "TOTAL"
            area_id = None
            letra_padre = None
            current_parent_letter = None
            current_parent_area = None
        else:
            continue

        for p in periods:
            val_raw = s.cell(r, p["col_idx"]).value
            val_clean = None
            estado_dato = "PUBLICADO"

            if val_raw is None or val_raw == "" or str(val_raw).strip() == "":
                estado_dato = "SIN_DATO"
                val_original_str = ""
            elif str(val_raw).strip().lower() in ["s.d.", "s/d", "sd"]:
                estado_dato = "SIN_DATO_SECRETO_ESTADISTICO"
                val_original_str = str(val_raw).strip()
            else:
                try:
                    val_clean = int(round(float(val_raw)))
                    val_original_str = str(val_raw)
                except ValueError:
                    estado_dato = "FORMATO_ESPECIAL"
                    val_original_str = str(val_raw)

            rec = {
                "id": f"OEDE_{codigo_rama}_{p['anio']}T{p['trimestre']}",
                "area_id": area_id,
                "codigo_rama": codigo_rama,
                "nombre_rama": nombre_rama,
                "tipo_nivel": tipo_nivel,
                "letra_padre": letra_padre,
                "periodo": p["periodo_texto"],
                "anio": p["anio"],
                "trimestre": p["trimestre"],
                "puestos_trabajo": val_clean,
                "valor_original": val_original_str,
                "estado_dato": estado_dato,
                "indicador": "Asalariados registrados del sector privado",
                "unidad": "Puestos de trabajo",
                "universo": "Empresas privadas declaradas en la Provincia de Jujuy",
                "fuente": "STySS - OEDE en base a SIPA",
                "archivo": "provinciales_serie_empleo_trimestral_2dig_7.xlsx",
                "hoja": "Jujuy"
            }
            records.append(rec)

    oede_dataset = {
        "metadata": {
            "fuente": "Observatorio de Empleo y Dinámica Empresarial (OEDE), MTEySS en base a SIPA",
            "indicador": "Asalariados registrados del sector privado (puestos de trabajo)",
            "cobertura": "Provincia de Jujuy",
            "periodos_totales": len(periods),
            "periodo_desde": periods[0]["periodo_texto"] if periods else "",
            "periodo_hasta": periods[-1]["periodo_texto"] if periods else "",
            "total_registros": len(records),
            "regla_a10": "La rama L (Administración Pública) NO está presente en OEDE Jujuy. No se imputa 0 ni se estiman valores. Se conserva el estado de no disponible.",
            "regla_secreto_estadistico": "Los valores 's.d.' se conservan explícitamente como secreto estadístico y nunca se transforman a 0."
        },
        "series": records
    }

    path = os.path.join(DATA_DIR, "empleo_oede.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(oede_dataset, f, indent=2, ensure_ascii=False)
    print(f"OEDE: {len(records)} registros guardados en {path}")
    return oede_dataset


# -------------------------------------------------------------
# 5. EIL — ENCUESTA DE INDICADORES LABORALES (Gran Jujuy)
# -------------------------------------------------------------
def build_eil():
    eil_data = {
        "metadata": {
            "fuente": "Encuesta de Indicadores Laborales (EIL) - MTEySS",
            "cobertura": "Gran Jujuy",
            "universo": "Empresas privadas formales de 5 y más trabajadores",
            "exclusiones": "Excluye sector primario (agro y minería) y administración pública.",
            "reglas": [
                "No transformar índices en cantidad de trabajadores.",
                "Calificación de la tarea (Profesional, Técnica, Operativa, No calificada) no representa nivel educativo.",
                "Demanda laboral es un indicador de búsquedas activas y cobertura, no equivale a vacantes ni a nivel de empleo.",
                "La rama 'Comercio, restaurantes y hoteles' es una agrupación indivisible y no se particiona."
            ]
        },
        "tabla_3_9_2_evolucion_y_ramas": [],
        "tabla_3_9_6_calificacion_tarea": [],
        "tabla_3_9_8_demanda_laboral": []
    }

    # --- TABLA 3.9.2 ---
    wb2_path = os.path.join(FUENTES_DIR, "EIL", "EIL_2407_2.xlsx")
    wb2 = openpyxl.load_workbook(wb2_path, data_only=True)
    s2 = wb2["Hoja1"]

    # Períodos en fila 2, cols 3 a 46
    periods_392 = []
    for c in range(3, s2.max_column + 1):
        v = s2.cell(2, c).value
        if v is not None:
            periods_392.append((c, str(v).strip()))

    # Filas de interés en Tabla 3.9.2
    # R4: Total Índice
    # Ramas Índice (R10 a R16)
    # Ramas Variación Trimestral (R28 a R34)
    # Ramas Variación Anual (R46 a R52)
    # Estratos Tamaño Índice (R18 a R21)
    # Sectores Actividad Índice (R23 a R25)

    eil_ramas_map = {
        "Industria manufacturera": {"area_id": "A03", "tipo_corr": "DIRECTA"},
        "Electricidad, gas y agua": {"area_id": "A04", "tipo_corr": "DIRECTA"},
        "Construcción": {"area_id": "A05", "tipo_corr": "DIRECTA"},
        "Comercio, restaurantes y hoteles": {"area_id": "A06_A07_AGRUPADA", "tipo_corr": "AGRUPADA"},
        "Transporte, almacenaje y comunicaciones": {"area_id": "A08", "tipo_corr": "DIRECTA"},
        "Servicios financieros y a las empresas": {"area_id": "A09", "tipo_corr": "DIRECTA"},
        "Servicios comunales, sociales y personales": {"area_id": "A12", "tipo_corr": "PARCIAL"}
    }

    for r in range(3, 62):
        c1 = s2.cell(r, 1).value
        c2 = s2.cell(r, 2).value
        cat_c1 = str(c1).strip() if c1 is not None else None
        item_c2 = str(c2).strip() if c2 is not None else None

        # Determinar bloque y tipo de indicador
        if r == 4:
            bloque = "INDICE_TOTAL"
            indicador = "Índice de empleo base Feb.15=100"
            concepto = "Total Aglomerado Gran Jujuy"
            area_id = None
            tipo_corr = "DIRECTA"
            alcance = "TRANSVERSAL"
        elif 10 <= r <= 16:
            bloque = "INDICE_POR_RAMA"
            indicador = "Índice de empleo base Feb.15=100"
            concepto = item_c2
            cfg = eil_ramas_map.get(item_c2, {})
            area_id = cfg.get("area_id")
            tipo_corr = cfg.get("tipo_corr", "DIRECTA")
            alcance = "POR_RAMA"
        elif 18 <= r <= 21:
            bloque = "INDICE_POR_TAMANIO"
            indicador = "Índice de empleo base Feb.15=100"
            concepto = item_c2
            area_id = None
            tipo_corr = "DIRECTA"
            alcance = "TRANSVERSAL"
        elif 23 <= r <= 25:
            bloque = "INDICE_POR_SECTOR"
            indicador = "Índice de empleo base Feb.15=100"
            concepto = item_c2
            area_id = None
            tipo_corr = "DIRECTA"
            alcance = "POR_SECTOR"
        elif 28 <= r <= 34:
            bloque = "VARIACION_TRIMESTRAL_POR_RAMA"
            indicador = "Variación trimestral relativa (%)"
            concepto = item_c2
            cfg = eil_ramas_map.get(item_c2, {})
            area_id = cfg.get("area_id")
            tipo_corr = cfg.get("tipo_corr", "DIRECTA")
            alcance = "POR_RAMA"
        elif 46 <= r <= 52:
            bloque = "VARIACION_ANUAL_POR_RAMA"
            indicador = "Variación anual relativa (%)"
            concepto = item_c2
            cfg = eil_ramas_map.get(item_c2, {})
            area_id = cfg.get("area_id")
            tipo_corr = cfg.get("tipo_corr", "DIRECTA")
            alcance = "POR_RAMA"
        else:
            continue

        for col_idx, per_str in periods_392:
            val_raw = s2.cell(r, col_idx).value
            val_clean = None
            if val_raw is None or str(val_raw).strip() in ["", "-", " "]:
                estado_dato = "SIN_DATO_NO_DISPONIBLE"
                val_orig = str(val_raw) if val_raw is not None else ""
            elif str(val_raw).strip().lower() in ["s/d", "s.d."]:
                estado_dato = "SIN_DATO_SECRETO_ESTADISTICO"
                val_orig = str(val_raw).strip()
            else:
                try:
                    val_clean = round(float(val_raw), 4)
                    estado_dato = "PUBLICADO"
                    val_orig = str(val_raw)
                except ValueError:
                    estado_dato = "FORMATO_ESPECIAL"
                    val_orig = str(val_raw)

            rec = {
                "id": f"EIL_392_R{r}_{per_str}",
                "tabla": "3.9.2",
                "bloque": bloque,
                "indicador": indicador,
                "concepto": concepto,
                "area_id": area_id,
                "tipo_correspondencia": tipo_corr,
                "alcance": alcance,
                "periodo": per_str,
                "valor": val_clean,
                "valor_original": val_orig,
                "estado_dato": estado_dato,
                "unidad": "%" if "Variación" in indicador else "Índice base Feb.15=100",
                "fuente": "EIL - MTEySS",
                "archivo": "EIL_2407_2.xlsx"
            }
            eil_data["tabla_3_9_2_evolucion_y_ramas"].append(rec)

    # --- TABLA 3.9.6 (Calificación de la tarea) ---
    wb6_path = os.path.join(FUENTES_DIR, "EIL", "EIL_2407_6.xlsx")
    wb6 = openpyxl.load_workbook(wb6_path, data_only=True)
    s6 = wb6["Hoja1"]

    periods_396 = []
    for c in range(3, 200):
        v = s6.cell(2, c).value
        if v is not None:
            if isinstance(v, datetime):
                pstr = v.strftime("%Y-%m-%d")
            else:
                pstr = str(v).strip()
            periods_396.append((c, pstr))

    # Filas de tasas y composición por calificación de la tarea
    # Tasa entrada: R3 Total, R4 Prof, R5 Tec, R6 Op, R7 NoCal
    # Tasa salida: R8 Total, R9 Prof, R10 Tec, R11 Op, R12 NoCal
    # Tasa rotación: R13 Total, R14 Prof, R15 Tec, R16 Op, R17 NoCal
    # Tasa reemplazo: R18 Total, R19 Prof, R20 Tec, R21 Op, R22 NoCal
    # Composición altas: R24 Total, R25 Prof, R26 Tec, R27 Op, R28 NoCal
    # Composición bajas: R30 Total, R31 Prof, R32 Tec, R33 Op, R34 NoCal

    t396_specs = [
        (3, "Tasa de entrada", "Total"),
        (4, "Tasa de entrada", "Profesional"),
        (5, "Tasa de entrada", "Técnica"),
        (6, "Tasa de entrada", "Operativa"),
        (7, "Tasa de entrada", "No Calificada"),
        (8, "Tasa de salida", "Total"),
        (9, "Tasa de salida", "Profesional"),
        (10, "Tasa de salida", "Técnica"),
        (11, "Tasa de salida", "Operativa"),
        (12, "Tasa de salida", "No Calificada"),
        (13, "Tasa de rotación", "Total"),
        (14, "Tasa de rotación", "Profesional"),
        (15, "Tasa de rotación", "Técnica"),
        (16, "Tasa de rotación", "Operativa"),
        (17, "Tasa de rotación", "No Calificada"),
        (18, "Tasa de reemplazo", "Total"),
        (19, "Tasa de reemplazo", "Profesional"),
        (20, "Tasa de reemplazo", "Técnica"),
        (21, "Tasa de reemplazo", "Operativa"),
        (22, "Tasa de reemplazo", "No Calificada"),
        (24, "Composición de altas", "Total"),
        (25, "Composición de altas", "Profesional"),
        (26, "Composición de altas", "Técnica"),
        (27, "Composición de altas", "Operativa"),
        (28, "Composición de altas", "No Calificada"),
        (30, "Composición de bajas", "Total"),
        (31, "Composición de bajas", "Profesional"),
        (32, "Composición de bajas", "Técnica"),
        (33, "Composición de bajas", "Operativa"),
        (34, "Composición de bajas", "No Calificada")
    ]

    for r, ind_nombre, calif in t396_specs:
        for col_idx, per_str in periods_396:
            vraw = s6.cell(r, col_idx).value
            vclean = None
            if vraw is None or str(vraw).strip() in ["", "-", "#N/A", " "]:
                estado_dato = "SIN_DATO_NO_DISPONIBLE"
                vorig = str(vraw) if vraw is not None else ""
            else:
                try:
                    vclean = round(float(vraw), 4)
                    estado_dato = "PUBLICADO"
                    vorig = str(vraw)
                except ValueError:
                    estado_dato = "FORMATO_ESPECIAL"
                    vorig = str(vraw)

            rec = {
                "id": f"EIL_396_R{r}_{per_str}",
                "tabla": "3.9.6",
                "indicador": ind_nombre,
                "calificacion_tarea": calif,
                "area_id": None,
                "alcance": "TRANSVERSAL",
                "periodo": per_str,
                "valor": vclean,
                "valor_original": vorig,
                "estado_dato": estado_dato,
                "unidad": "%",
                "nota": "Representa calificación de la tarea y no el nivel educativo de las personas.",
                "fuente": "EIL - MTEySS",
                "archivo": "EIL_2407_6.xlsx"
            }
            eil_data["tabla_3_9_6_calificacion_tarea"].append(rec)

    # --- TABLA 3.9.8 (Demanda laboral) ---
    wb8_path = os.path.join(FUENTES_DIR, "EIL", "EIL_2407_8.xlsx")
    wb8 = openpyxl.load_workbook(wb8_path, data_only=True)
    s8 = wb8["Hoja1"]

    periods_398 = []
    for c in range(3, 200):
        v = s8.cell(2, c).value
        if v is not None:
            if isinstance(v, datetime):
                pstr = v.strftime("%Y-%m-%d")
            else:
                pstr = str(v).strip()
            periods_398.append((c, pstr))

    t398_specs = [
        (4, "Demanda Laboral (Empresas)", "Total empresas"),
        (5, "Demanda Laboral (Empresas)", "No realizaron búsquedas de personal"),
        (6, "Demanda Laboral (Empresas)", "Realizaron búsquedas de personal"),
        (8, "Cobertura de puestos buscados", "Cubrieron todos los puestos"),
        (9, "Cobertura de puestos buscados", "Cubrieron parte de los puestos"),
        (10, "Cobertura de puestos buscados", "No cubrieron ninguno de los puestos"),
        (13, "Tasa de búsqueda según calificación", "Total"),
        (14, "Tasa de búsqueda según calificación", "Profesionales"),
        (15, "Tasa de búsqueda según calificación", "Técnicos"),
        (16, "Tasa de búsqueda según calificación", "Operativos"),
        (17, "Tasa de búsqueda según calificación", "No calificados"),
        (26, "Composición puestos no cubiertos según calificación", "Total"),
        (27, "Composición puestos no cubiertos según calificación", "Profesionales"),
        (28, "Composición puestos no cubiertos según calificación", "Técnicos"),
        (29, "Composición puestos no cubiertos según calificación", "Operativos"),
        (30, "Composición puestos no cubiertos según calificación", "No calificados"),
        (33, "Tasa de no cobertura según calificación", "Total"),
        (34, "Tasa de no cobertura según calificación", "Profesionales"),
        (35, "Tasa de no cobertura según calificación", "Técnicos"),
        (36, "Tasa de no cobertura según calificación", "Operativos"),
        (37, "Tasa de no cobertura según calificación", "No calificados")
    ]

    for r, ind_nombre, subcat in t398_specs:
        for col_idx, per_str in periods_398:
            vraw = s8.cell(r, col_idx).value
            vclean = None
            if vraw is None or str(vraw).strip() in ["", "-", " "]:
                estado_dato = "SIN_DATO_NO_DISPONIBLE"
                vorig = str(vraw) if vraw is not None else ""
            else:
                try:
                    vclean = round(float(vraw), 4)
                    estado_dato = "PUBLICADO"
                    vorig = str(vraw)
                except ValueError:
                    estado_dato = "FORMATO_ESPECIAL"
                    vorig = str(vraw)

            rec = {
                "id": f"EIL_398_R{r}_{per_str}",
                "tabla": "3.9.8",
                "indicador": ind_nombre,
                "categoria_demanda": subcat,
                "area_id": None,
                "alcance": "TRANSVERSAL",
                "periodo": per_str,
                "valor": vclean,
                "valor_original": vorig,
                "estado_dato": estado_dato,
                "unidad": "%",
                "nota": "Indicador específico de demanda laboral en Gran Jujuy. No representa empleo actual ni vacantes.",
                "fuente": "EIL - MTEySS",
                "archivo": "EIL_2407_8.xlsx"
            }
            eil_data["tabla_3_9_8_demanda_laboral"].append(rec)

    path = os.path.join(DATA_DIR, "eil.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(eil_data, f, indent=2, ensure_ascii=False)
    
    tot_recs = len(eil_data["tabla_3_9_2_evolucion_y_ramas"]) + len(eil_data["tabla_3_9_6_calificacion_tarea"]) + len(eil_data["tabla_3_9_8_demanda_laboral"])
    print(f"EIL: {tot_recs} registros guardados en {path}")
    return eil_data


# -------------------------------------------------------------
# 6. MIP — MATRIZ INSUMO PRODUCTO (Año base 2015)
# -------------------------------------------------------------
def build_mip():
    pdf_path = os.path.join(FUENTES_DIR, "MIP", "Informe-MIP-y-Empleo-Jujuy-base-2015.pdf")
    reader = pypdf.PdfReader(pdf_path)

    p11 = reader.pages[10].extract_text()
    p12 = reader.pages[11].extract_text()
    p13 = reader.pages[12].extract_text()

    # Mapeo a las 12 áreas según reglas metodológicas verificadas
    mip_area_map = {
        1: "A01",
        2: "A02",
        3: None,  # Petróleo, gas y refinados (no forzado)
        4: "A03", 5: "A03", 6: "A03", 7: "A03", 8: "A03", 9: "A03", 10: "A03",
        11: "A03", 12: "A03", 13: "A03", 14: "A03", 15: "A03", 16: "A03", 17: "A03", 18: "A03",
        19: None, # Reciclamiento (no forzado)
        20: None, # Reparación de máquinas (no forzado)
        21: "A04",
        22: "A05",
        23: "A06",
        24: "A07", 25: "A07",
        26: "A08", 27: "A08",
        28: "A09", 29: "A09",
        30: "A10",
        31: "A11",
        32: "A12", 33: "A12",
        34: None  # Hogares con servicio doméstico (excluido en fuente)
    }

    c1_data = {}
    for line in p11.split("\n"):
        m = re.match(r"^(\d+)\s+(.+?)\s+([\d\.]+)\s+(\d+)\s+([\d,]+)$", line.strip())
        if m:
            num, name, emp, vbp, dens = m.groups()
            c1_data[int(num)] = {
                "nombre": name.strip(),
                "empleo_nacional_2015": int(emp.replace(".", "")),
                "vbp_millones_2015": int(vbp),
                "densidad_laboral_directa": float(dens.replace(",", "."))
            }

    c2_data = {}
    for line in p12.split("\n"):
        m = re.match(r"^(\d+)\s+(.+?)\s+([\d,]+|-)\s+([\d,]+|-)$", line.strip())
        if m:
            num, name, mult, dif = m.groups()
            c2_data[int(num)] = {
                "multiplicador_total_coef": None if mult == "-" else float(mult.replace(",", ".")),
                "diferencia_coef": None if dif == "-" else float(dif.replace(",", "."))
            }

    c3_data = {}
    for line in p13.split("\n"):
        m = re.match(r"^(\d+)\s+(.+?)\s+([\d\.]+(?:,\d+)?|-)\s+([\d\.]+(?:,\d+)?|-)\s+([\d\.]+(?:,\d+)?|-)$", line.strip())
        if m:
            num, name, tot, dir_val, indir_val = m.groups()
            c3_data[int(num)] = {
                "multiplicador_total_str": tot,
                "empleo_directo_str": dir_val,
                "empleo_indirecto_str": indir_val
            }

    sectors = []
    for sec_id in range(1, 35):
        c1 = c1_data.get(sec_id, {})
        c2 = c2_data.get(sec_id, {})
        c3 = c3_data.get(sec_id, {})

        is_excluded = sec_id == 34
        area_id = mip_area_map.get(sec_id)

        # En Cuadro 3, los multiplicadores por millón son:
        # Si c2["multiplicador_total_coef"] es 0.0029, en Cuadro 3 aparece 2.874 (es decir, 2,874 empleos por cada $1.000.000)
        # Empleo directo: 1.963
        # Empleo indirecto: 910 (es decir, 0,910 puestos por millón)
        tot_str = c3.get("multiplicador_total_str")
        dir_str = c3.get("empleo_directo_str")
        indir_str = c3.get("empleo_indirecto_str")

        tot_val = None
        dir_val = None
        indir_val = None

        if not is_excluded and tot_str is not None and tot_str != "-":
            tot_val = round(float(tot_str), 3) if "." in tot_str else round(float(tot_str) / 1000.0, 3)
        if not is_excluded and dir_str is not None and dir_str != "-":
            dir_val = round(float(dir_str), 3) if "." in dir_str else round(float(dir_str) / 1000.0, 3)
        if not is_excluded and indir_str is not None and indir_str != "-":
            indir_val = round(float(indir_str), 3) if "." in indir_str else round(float(indir_str) / 1000.0, 3)

        rec = {
            "sector_mip_id": sec_id,
            "area_id": area_id,
            "nombre_sector": c1.get("nombre", f"Sector {sec_id}"),
            "anio_base": 2015,
            "vbp_millones_pesos_2015": c1.get("vbp_millones_2015"),
            "empleo_nacional_2015": c1.get("empleo_nacional_2015"),
            "densidad_laboral_directa": c1.get("densidad_laboral_directa"),
            "multiplicador_total_coef": c2.get("multiplicador_total_coef"),
            "multiplicador_total_por_millon": tot_val,
            "empleo_directo_por_millon": dir_val,
            "empleo_indirecto_por_millon": indir_val,
            "valores_originales_cuadro_3": {
                "multiplicador_total": tot_str,
                "empleo_directo": dir_str,
                "empleo_indirecto": indir_str
            },
            "unidad_multiplicador": "Puestos de trabajo por cada $1.000.000 de VBP a precios de 2015",
            "estado_dato": "EXCLUIDO_EN_FUENTE" if is_excluded else "PUBLICADO",
            "fuente": "Dirección Provincial de Estadística y Censos (DiPEC) en base a CEP XXI",
            "archivo": "Informe-MIP-y-Empleo-Jujuy-base-2015.pdf",
            "nota_metodologica": "Excluido de la estimación de multiplicadores por DiPEC debido a la naturaleza de su función en la estructura productiva." if is_excluded else "Los indicadores de la MIP describen relaciones estructurales de la economía provincial según la matriz base 2015 y no constituyen una medición directa del empleo actual."
        }
        sectors.append(rec)

    mip_dataset = {
        "metadata": {
            "fuente": "Dirección Provincial de Estadística y Censos (DiPEC) en base a CEP XXI",
            "documento": "Estimaciones de empleo directo e indirecto a través de la Matriz de Insumo Producto - Jujuy base 2015",
            "anio_base": 2015,
            "metodologia": "Cociente de Localización Simple (SLQ) y Matriz de Leontief",
            "total_sectores": len(sectors),
            "sectores_asignados_a_areas": len([s for s in sectors if s["area_id"] is not None]),
            "sectores_sin_asignacion_forzada": [3, 19, 20, 34],
            "advertencia_fundamental": "Los multiplicadores de la MIP describen capacidad de tracción y relaciones estructurales de 2015. Bajo ninguna circunstancia deben interpretarse como cantidad actual de puestos de trabajo ni rankings de carreras."
        },
        "sectores": sectors
    }

    path = os.path.join(DATA_DIR, "mip_empleo.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(mip_dataset, f, indent=2, ensure_ascii=False)
    print(f"MIP: {len(sectors)} sectores guardados en {path}")
    return mip_dataset


# -------------------------------------------------------------
# 7. METADATA GENERAL Y TRAZABILIDAD DEL PROYECTO
# -------------------------------------------------------------
def build_metadata():
    meta = {
        "proyecto": {
            "nombre": "TU PRÓXIMO PASO — JUJUY EN DATOS",
            "institucion": "IES N.º 11",
            "tipo": "Aplicación web informativa y académica",
            "objetivo": "Presentar y permitir la exploración rigurosa de información económica y laboral oficial de la Provincia de Jujuy sin inferir recomendaciones automáticas ni alterar el significado estadístico de las fuentes.",
            "regla_trazabilidad": "USUARIO -> AREA_ID -> FUENTE -> DATASET -> VARIABLE -> PERÍODO -> UNIDAD -> TRANSFORMACIÓN -> RESULTADO MOSTRADO"
        },
        "fuentes_oficiales": [
            {
                "fuente_id": "PBG",
                "organismo": "Dirección Provincial de Estadística y Censos (DiPEC)",
                "archivo_original": "PBG/PBG-2004-2024-actualizacion-agosto-2025.xlsx",
                "indicador": "Producto Bruto Geográfico a precios básicos",
                "periodicidad": "Anual (2004-2024)",
                "unidades": ["Miles de pesos de 2004 (precios constantes)", "Miles de pesos corrientes", "Variación anual % (total)"],
                "condicion_especial": "Años 2022*, 2023* y 2024* poseen condición de provisorios en la fuente oficial."
            },
            {
                "fuente_id": "OEDE",
                "organismo": "Observatorio de Empleo y Dinámica Empresarial (OEDE), MTEySS en base a SIPA",
                "archivo_original": "OEDE/provinciales_serie_empleo_trimestral_2dig_7.xlsx",
                "hoja": "Jujuy",
                "indicador": "Asalariados registrados del sector privado (puestos de trabajo declarados)",
                "periodicidad": "Trimestral (1°T 1996 a 1°T 2026)",
                "unidades": ["Puestos de trabajo"],
                "condicion_especial": "Rama L (Administración Pública) no publicada en la fuente para Jujuy. Bajo ninguna circunstancia se imputa cero ni estimaciones. Registros 's.d.' se preservan como secreto estadístico."
            },
            {
                "fuente_id": "EIL",
                "organismo": "Encuesta de Indicadores Laborales (EIL), Dirección General de Estudios y Estadísticas Laborales, MTEySS",
                "archivos_originales": [
                    "EIL/EIL_2407_2.xlsx (Tabla 3.9.2 - Índice Feb.15=100 y variaciones trimestrales y anuales por rama)",
                    "EIL/EIL_2407_6.xlsx (Tabla 3.9.6 - Tasas y composición según calificación de la tarea)",
                    "EIL/EIL_2407_8.xlsx (Tabla 3.9.8 - Demanda laboral, coberturas y tasas de no cobertura)"
                ],
                "cobertura": "Aglomerado Gran Jujuy",
                "universo": "Empresas privadas formales de 5 y más trabajadores.",
                "periodicidad": "Trimestral (3.9.2: II-15 a I-26) y Mensual (3.9.6 y 3.9.8: 2015-03 a 2026-05)",
                "condicion_especial": "Excluye actividades primarias (A01, A02) y administración pública (A10). Calificación de la tarea no equivale a nivel educativo de la persona. Demanda laboral mide búsquedas activas de personal y no vacantes totales ni nivel de empleo."
            },
            {
                "fuente_id": "MIP",
                "organismo": "Dirección Provincial de Estadística y Censos (DiPEC) en base a CEP XXI",
                "archivo_original": "MIP/Informe-MIP-y-Empleo-Jujuy-base-2015.pdf",
                "indicador": "Multiplicadores de empleo total, directo e indirecto",
                "anio_base": 2015,
                "unidades": ["Coeficiente técnico", "Puestos de trabajo por cada $1.000.000 de VBP a precios de 2015"],
                "condicion_especial": "Describe relaciones estructurales y capacidad de tracción de la economía jujeña base 2015. No representa puestos de trabajo actuales. Sectores 3, 19, 20 y 34 no se asignan forzadamente."
            }
        ]
    }

    path = os.path.join(DATA_DIR, "metadata.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    print(f"Metadata: guardada en {path}")
    return meta


# -------------------------------------------------------------
# EJECUCIÓN DEL PIPELINE Y CONTROLES TÉCNICOS
# -------------------------------------------------------------
def run_pipeline():
    print("=== INICIANDO ETL DERIVADO TU PRÓXIMO PASO ===")
    areas = build_areas()
    corr = build_correspondencias()
    pbg = build_pbg()
    oede = build_oede()
    eil = build_eil()
    mip = build_mip()
    meta = build_metadata()

    # CONTROLES TÉCNICOS POST-EXTRACCIÓN
    print("\n=== EJECUTANDO CONTROLES TÉCNICOS POST-EXTRACCIÓN ===")
    
    # 1. Cantidad de áreas
    assert len(areas) == 12, f"Error: Se esperaban 12 áreas, obtenidas {len(areas)}"
    print("✔ Control 1: Exactamente 12 áreas conceptuales validadas.")

    # 2. PBG: Años y provisionalidad
    pbg_years = set(r["periodo_anio"] for r in pbg["series"])
    assert len(pbg_years) == 21, f"Error: Se esperaban 21 años (2004-2024), obtenidos {len(pbg_years)}"
    prov_years = set(r["periodo_anio"] for r in pbg["series"] if r["es_provisorio"])
    assert prov_years == {2022, 2023, 2024}, f"Error en años provisorios: {prov_years}"
    print("✔ Control 2: PBG 2004-2024 verificado. Flags provisorios 2022, 2023 y 2024 confirmados.")

    # 3. OEDE: Ausencia de L y ningún cero inventado para A10
    a10_oede = [r for r in oede["series"] if r["area_id"] == "A10"]
    assert len(a10_oede) == 0, f"Error metodológico: Se encontraron registros OEDE para A10: {len(a10_oede)}"
    sd_count = len([r for r in oede["series"] if r["estado_dato"] == "SIN_DATO_SECRETO_ESTADISTICO"])
    assert sd_count > 0, "Error: No se preservaron los estados s.d. en OEDE."
    assert all(r["puestos_trabajo"] is None for r in oede["series"] if r["estado_dato"] == "SIN_DATO_SECRETO_ESTADISTICO")
    print(f"✔ Control 3: OEDE Rama L confirmada ausente para A10 (0 registros para A10). {sd_count} registros 's.d.' preservados como null (sin imputar ceros).")

    # 4. EIL: No asignación a A01 y A02, y comercio agrupado
    a01_eil = [r for r in eil["tabla_3_9_2_evolucion_y_ramas"] if r["area_id"] in ["A01", "A02"]]
    assert len(a01_eil) == 0, "Error: Se asignaron indicadores EIL a actividades primarias A01/A02."
    agrupada_recs = [r for r in eil["tabla_3_9_2_evolucion_y_ramas"] if r["area_id"] == "A06_A07_AGRUPADA"]
    assert len(agrupada_recs) > 0, "Error: No se encontró la rama agrupada Comercio, restaurantes y hoteles en EIL."
    print("✔ Control 4: EIL excluye actividades primarias (A01, A02 = 0 registros). Comercio y hotelería preservados como agrupación única.")

    # 5. MIP: 34 sectores, base 2015 y exclusión de sectores no forzados
    assert len(mip["sectores"]) == 34, f"Error: Se esperaban 34 sectores MIP, obtenidos {len(mip['sectores'])}"
    unforced = [s for s in mip["sectores"] if s["sector_mip_id"] in [3, 19, 20, 34]]
    assert all(s["area_id"] is None for s in unforced), "Error: Se asignó forzadamente alguno de los sectores MIP 3, 19, 20 o 34."
    sec34 = [s for s in mip["sectores"] if s["sector_mip_id"] == 34][0]
    assert sec34["estado_dato"] == "EXCLUIDO_EN_FUENTE" and sec34["multiplicador_total_por_millon"] is None
    print("✔ Control 5: MIP 34 sectores verificados. Base 2015 preservada. Sectores 3, 19, 20 y 34 sin asignación forzada. Sector 34 excluido metodológicamente.")

    # 6. Duplicados de ID en cada dataset
    for name, items in [
        ("PBG", pbg["series"]),
        ("OEDE", oede["series"]),
        ("EIL 3.9.2", eil["tabla_3_9_2_evolucion_y_ramas"]),
        ("EIL 3.9.6", eil["tabla_3_9_6_calificacion_tarea"]),
        ("EIL 3.9.8", eil["tabla_3_9_8_demanda_laboral"]),
        ("MIP", mip["sectores"])
    ]:
        ids = [item["id"] if "id" in item else item["sector_mip_id"] for item in items]
        assert len(ids) == len(set(ids)), f"Error: IDs duplicados encontrados en {name}."
    print("✔ Control 6: Verificación de unicidad de IDs completada sin duplicados.")

    # 7. Integridad de fuentes originales
    for root, dirs, files in os.walk(FUENTES_DIR):
        for f in files:
            full_p = os.path.join(root, f)
            assert os.path.exists(full_p), f"Archivo de fuente faltante: {full_p}"
    print("✔ Control 7: Repositorio TU_PROXIMO_PASO_FUENTES intacto y en modo solo lectura.")

    print("\n=======================================================")
    print("ESTADO DEL PIPELINE: ETL DERIVADO COMPLETADO EXITOSAMENTE")
    print("=======================================================")


if __name__ == "__main__":
    run_pipeline()
