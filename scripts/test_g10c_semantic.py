#!/usr/bin/env python3
"""
Test de Validación Semántica G10C
Verifica la traducción de datos oficiales a lenguaje humano:
- Secuencia: Pregunta humana -> Explicación sencilla -> Dato -> Detalle técnico
- Denominaciones técnicas secundarias visibles
- Advertencias conceptuales obligatorias
- Detección de términos conceptualmente prohibidos (no ganancia, no causalidad, no carreras)
- Integridad de hashes de datos
"""

import os
import re
import hashlib
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE_DIR, "src")
DATA_DIR = os.path.join(BASE_DIR, "data")

EXPECTED_HASHES = {
    "areas.json": "8e966e0d337971d504c5559e6673cf2b35270ee2db289716b77b3d24e416e466",
    "correspondencias.json": "8c1d524f00d75d68e1b05c58f45d5c5cb21fe5a53d0f29f6f43165be14e20003",
    "eil.json": "cf298cd192d281ba882982e9e8eead6c7e79cdde9433cd552167770fd09bfd04",
    "empleo_oede.json": "0876189f9672f4c641f680f60140097e7d88936760525b104cae76a4dcf20a16",
    "metadata.json": "2dd6358d11986bc0bda8d358c02d4017973e2ae4dc0b7b40ac99af5e9228a9c9",
    "mip_empleo.json": "f1b82f60c42fe67cc29ff074519171cc421cfd76f61a9dcae7b6b797790106df",
    "pbg.json": "3fdf48ad874c7f6c919168564383c6c86db01d5bbefc81fd622dea2a2b0feeb2"
}

def check(name, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {name}: {detail}")
    assert condition, f"Fallo en {name}: {detail}"

def get_file_content(relative_path):
    with open(os.path.join(SRC_DIR, relative_path), "r", encoding="utf-8") as f:
        return f.read()

def test_semantic_cards():
    cards_code = get_file_content("components/HumanDataCards.tsx")
    area_detail_code = get_file_content("pages/AreaDetailPage.tsx")
    eil_transversal_code = get_file_content("pages/EilTransversalPage.tsx")

    # 1. PBG
    check(
        "PBG - Pregunta Humana",
        "💰 ¿Cuánto aporta esta actividad a Jujuy?" in cards_code and
        "💰 ¿Cuánto aporta esta actividad a Jujuy?" in area_detail_code,
        "Pregunta humana de PBG presente en tarjetas y detalle"
    )
    check(
        "PBG - Explicación Sencilla",
        "El PBG permite observar cuánto valor genera una actividad dentro de la economía de la provincia" in cards_code,
        "Explicación intuitiva de PBG visible"
    )
    check(
        "PBG - Denominación Secundaria",
        "PBG · Producto Bruto Geográfico" in cards_code and
        "PBG · Producto Bruto Geográfico" in area_detail_code,
        "Denominación técnica oficial conservada como nivel secundario"
    )
    check(
        "PBG - Aclaración no ganancia",
        "no ganancias empresariales ni dinero individual a repartir" in cards_code,
        "Advertencia explícita sobre valor de producción vs ganancias"
    )

    # 2. OEDE
    check(
        "OEDE - Pregunta Humana",
        "👥 ¿Cuántos puestos de trabajo registrados hay?" in cards_code and
        "👥 ¿Cuántos puestos de trabajo registrados hay?" in area_detail_code,
        "Pregunta humana de OEDE presente en tarjetas y detalle"
    )
    check(
        "OEDE - Explicación Sencilla",
        "Son puestos de trabajo, no necesariamente personas" in cards_code and
        "Son puestos de trabajo, no necesariamente personas" in area_detail_code,
        "Distinción obligatoria entre puestos y personas presente"
    )
    check(
        "OEDE - Denominación Secundaria",
        "OEDE · Empleo privado registrado" in cards_code and
        "OEDE · Empleo privado registrado" in area_detail_code,
        "Denominación técnica oficial conservada como nivel secundario"
    )

    # 3. MIP
    check(
        "MIP - Pregunta Humana",
        "🔗 ¿Cómo se relaciona esta actividad con otras?" in cards_code and
        "🔗 ¿Cómo se relaciona esta actividad con otras?" in area_detail_code,
        "Pregunta humana de MIP presente en tarjetas y detalle"
    )
    check(
        "MIP - Explicación Sencilla",
        "La MIP permite observar cómo una actividad se vincula con otros sectores mediante empleo directo e indirecto" in cards_code,
        "Explicación intuitiva de interconexión sectorial visible"
    )
    check(
        "MIP - Advertencia Estructural Obligatoria",
        "Base 2015 · coeficientes estructurales · no representa empleo actual" in cards_code and
        "Base 2015 · coeficientes estructurales · no representa empleo actual" in area_detail_code,
        "Advertencia estructural de base 2015 visible en tarjetas y detalle"
    )
    check(
        "MIP - Denominación Secundaria",
        "MIP · Matriz Insumo-Producto" in cards_code and
        "MIP · Matriz Insumo-Producto" in area_detail_code,
        "Denominación técnica oficial conservada como nivel secundario"
    )

    # 4. EIL
    check(
        "EIL - Pregunta Humana",
        "🧩 ¿Qué tipo de tareas aparecen?" in cards_code and
        "🧩 ¿Qué tipo de tareas aparecen?" in area_detail_code,
        "Pregunta humana de EIL presente en tarjetas y detalle"
    )
    check(
        "EIL - Tarea vs Estudios",
        "La clasificación describe la tarea del puesto, no los estudios o títulos de la persona" in cards_code and
        "La clasificación describe la tarea del puesto, no los estudios o títulos de la persona" in area_detail_code,
        "Distinción obligatoria entre tarea operativa y nivel educativo"
    )
    check(
        "EIL - Denominación Secundaria",
        "EIL · Encuesta de Indicadores Laborales" in cards_code and
        "EIL · Encuesta de Indicadores Laborales" in area_detail_code,
        "Denominación técnica oficial conservada como nivel secundario"
    )
    check(
        "EIL Transversal - Pregunta Humana",
        "🧩 ¿Qué tipo de tareas aparecen en Gran Jujuy?" in eil_transversal_code,
        "Pregunta humana integrada en sección transversal EIL"
    )

    # 5. DETECCIÓN DE TÉRMINOS CONCEPTUALMENTE PROHIBIDOS
    prohibited_checks = [
        ("dinero que gana", cards_code, "PBG no debe referirse a dinero que gana"),
        ("ganancia de la actividad", cards_code, "PBG no debe referirse a ganancia"),
        ("toda la gente que trabaja", cards_code, "OEDE no debe referirse a toda la gente que trabaja"),
        ("empleos disponibles", cards_code, "OEDE no debe referirse a empleos disponibles"),
        ("creará empleos", cards_code, "MIP no debe prometer que creará empleos"),
        ("generará empleos", cards_code, "MIP no debe prometer que generará empleos"),
        ("carreras que conviene estudiar", cards_code, "EIL no debe prescribir carreras"),
        ("qué carrera estudiar", cards_code, "EIL no debe prescribir elecciones vocacionales")
    ]
    for phrase, text, desc in prohibited_checks:
        check(f"Prohibición: '{phrase}'", phrase not in text, desc)

    # 6. VERIFICACIÓN DE HASHES DE DATASETS
    for filename, expected_hash in EXPECTED_HASHES.items():
        filepath = os.path.join(DATA_DIR, filename)
        with open(filepath, "rb") as f:
            actual_hash = hashlib.sha256(f.read()).hexdigest()
        check(f"Hash SHA-256 {filename}", actual_hash == expected_hash, f"Hash íntegro {actual_hash[:8]}...")

if __name__ == "__main__":
    print("=== INICIANDO VALIDACIÓN SEMÁNTICA G10C ===")
    test_semantic_cards()
    print("=== TODOS LOS CHEQUEOS DE G10C PASARON CON ÉXITO ===")
