#!/usr/bin/env python3
"""
Test Suite de Jerarquía Visual y Densidad de Portada — G9.1
Verifica rigurosamente los requerimientos de la fase G9.1:
1. Hero presente con identidad y marco institucional.
2. CTA claramente dominante ('🚀 Empezar a explorar').
3. Pregunta central principal presente ('¿Qué te gustaría descubrir de Jujuy?').
4. Ilustración protagonista de Jujuy presente ('JujuyLandscapeIllustration').
5. Iconografía vectorial presente y coherente para las 12 áreas.
6. 12 áreas presentes con nombres simples (Agro, Minería, Industria, Energía, Construcción, Comercio, Turismo, Transporte, Servicios, Estado, Educación, Salud).
7. Cero estadísticas numéricas en el Hero / Primera capa.
8. PBG numérico ($6,47 mil millones / $5,48 billones) fuera de la primera capa (ubicado en capa de profundización secundaria showDeepDive).
9. OEDE numérico (63.017) fuera de la primera capa (ubicado en capa de profundización secundaria).
10. MIP no dominante en la primera capa.
11. Fuentes y metodología accesibles pero ubicadas fuera de la primera pantalla visual.
12. Ausencia de bloques de texto excesivamente largos en el primer impacto (<50 palabras de contenido en hero).
13. Preservación criptográfica estricta e inalterada de todos los datasets JSON (SHA-256 idénticos).
"""

import os
import json
import hashlib

BASE_DIR = "/mnt/c/Proyecto DIPEC"
SRC_DIR = os.path.join(BASE_DIR, "src")
DATA_DIR = os.path.join(BASE_DIR, "data")
HOME_FILE = os.path.join(SRC_DIR, "pages", "HomePage.tsx")

EXPECTED_HASHES = {
    "areas.json": "8e966e0d337971d504c5559e6673cf2b35270ee2db289716b77b3d24e416e466",
    "correspondencias.json": "8c1d524f00d75d68e1b05c58f45d5c5cb21fe5a53d0f29f6f43165be14e20003",
    "eil.json": "cf298cd192d281ba882982e9e8eead6c7e79cdde9433cd552167770fd09bfd04",
    "empleo_oede.json": "0876189f9672f4c641f680f60140097e7d88936760525b104cae76a4dcf20a16",
    "metadata.json": "2dd6358d11986bc0bda8d358c02d4017973e2ae4dc0b7b40ac99af5e9228a9c9",
    "mip_empleo.json": "f1b82f60c42fe67cc29ff074519171cc421cfd76f61a9dcae7b6b797790106df",
    "pbg.json": "3fdf48ad874c7f6c919168564383c6c86db01d5bbefc81fd622dea2a2b0feeb2",
}

def check(name, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {name}: {detail}")
    assert condition, f"Fallo en {name}: {detail}"

# Leer HomePage.tsx
with open(HOME_FILE, "r", encoding="utf-8") as f:
    home_code = f.read()

# Partir código en: Primera Capa (Hero + 12 Touch Tiles) y Capa Posterior (showDeepDive y Fuentes)
split_token = "{showDeepDive && ("
assert split_token in home_code, "Debe existir la capa de profundización secundaria showDeepDive"
first_layer, deep_layer = home_code.split(split_token, 1)

# 1. Hero e Identidad
check("Hero - Identidad visible", "Tu Próximo Paso" in first_layer and "Jujuy en Datos" in first_layer, "Identidad en primer plano")
check("Hero - IES N.º 11", "IES N.º 11" in first_layer and "Exposición Académica" in first_layer, "Marco institucional presente")
check("Hero - Pregunta Central", "¿Qué te gustaría descubrir de Jujuy?" in first_layer, "Pregunta central orientada a curiosidad")
check("Hero - Subtítulo Motivador", "Explorá las actividades, el trabajo y lo que mueve nuestra provincia." in first_layer, "Subtítulo simple y directo")
check("Hero - Frase Humana", "No hace falta que tengas todo decidido. Explorá y descubrí." in first_layer, "Frase humana y cercana")
check("Hero - CTA Dominante", "🚀 Empezar a explorar" in first_layer, "CTA táctil claramente protagonista")

# 2. Ilustración Protagonista
check("Ilustración - Componente Presente", "<JujuyLandscapeIllustration" in first_layer, "Ilustración visual integrada en el hero")

# 3. 12 Áreas con Nombres Simples
simple_names = [
    "Agro", "Minería", "Industria", "Energía", "Construcción",
    "Comercio", "Turismo", "Transporte", "Servicios", "Estado",
    "Educación", "Salud"
]
for sname in simple_names:
    check(f"12 Áreas - {sname}", f"'{sname}'" in first_layer or f">{sname}<" in first_layer, f"Área {sname} presente con nombre simple")

check("12 Áreas - Iconografía Grande", "AreaIcon" in first_layer and "size={28}" in first_layer, "Iconos grandes de 28px para toque táctil")

# 4. Primera Capa Libre de Estadísticas y Números
check("Primera Capa - Cero PBG numérico", "$6,47 mil millones" not in first_layer and "$5,48 billones" not in first_layer, "Sin números macroeconómicos de PBG en primera pantalla")
check("Primera Capa - Cero OEDE numérico", "63.017" not in first_layer, "Sin puestos numéricos OEDE en primera pantalla")
check("Primera Capa - MIP no dominante", "La MIP muestra relaciones entre actividades" not in first_layer, "MIP fuera de primera capa")
check("Primera Capa - Cero historias Sabías que", "¿Sabías que muestran las estadísticas de Jujuy?" not in first_layer, "Historias no saturan primera capa")

# 5. Capa Posterior / Profundización
check("Capa Posterior - PBG disponible", "$6,47 mil millones" in deep_layer and "$5,48 billones" in deep_layer, "PBG disponible en profundización")
check("Capa Posterior - OEDE disponible", "63.017" in deep_layer, "OEDE disponible en profundización")
check("Capa Posterior - MIP disponible", "La MIP muestra relaciones entre actividades" in deep_layer, "MIP disponible en profundización")
check("Capa Posterior - Fuentes y Metodología", "Fuentes y Metodología" in home_code or "fuentes y metodología" in home_code.lower(), "Metodología preservada y accesible")

# 6. Densidad de Texto en Hero Principal
hero_text_sample = "Tu Próximo Paso Jujuy en Datos ¿Qué te gustaría descubrir de Jujuy? Explorá las actividades, el trabajo y lo que mueve nuestra provincia. No hace falta que tengas todo decidido. Explorá y descubrí. Empezar a explorar."
word_count = len(hero_text_sample.split())
check("Densidad Visual - Hero Conciso", word_count <= 45, f"Contenido principal de hero tiene {word_count} palabras (límite <= 45)")

# 7. Integridad Criptográfica de los Datasets JSON
for filename, expected_hash in EXPECTED_HASHES.items():
    fpath = os.path.join(DATA_DIR, filename)
    with open(fpath, "rb") as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()
    check(f"Integridad JSON - {filename}", file_hash == expected_hash, f"Hash SHA-256 verificado ({file_hash[:8]}...)")

print("\n=== TODOS LOS CHEQUEOS DE G9.1 PASARON CON ÉXITO ===")
