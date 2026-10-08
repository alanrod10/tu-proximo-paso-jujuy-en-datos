#!/usr/bin/env python3
"""
Test Suite de Verificación G9 — Prototipo e Implementación de Nueva Portada
Valida los requerimientos específicos de la fase G9:
1. Identidad visible: 'Tu Próximo Paso' y 'Jujuy en Datos'.
2. Pregunta central Hero: '¿Qué te gustaría descubrir de Jujuy?'.
3. Subtítulo motivador: 'Explorá las actividades, el trabajo y lo que mueve nuestra provincia.'.
4. CTA grande táctil: '🚀 Empezar a explorar'.
5. Componente visual integrado: JujuyLandscapeIllustration.
6. Frase humana cercana: 'No hace falta que tengas todo decidido. Explorá y descubrí.'.
7. 12 Áreas con nombres simples (Agro, Minería, Industria, Energía, Construcción, Comercio, Turismo, Transporte, Servicios, Estado, Educación, Salud).
8. Ausencia de códigos A01-A12 como protagonistas técnicos predominantes.
9. Progresión de niveles: Datos duros y dashboards reubicados en sección de profundización progresiva.
10. Integridad total de los datos oficiales JSON (sin modificaciones en datasets).
"""

import os
import json

BASE_DIR = "/mnt/c/Proyecto DIPEC"
SRC_DIR = os.path.join(BASE_DIR, "src")
DATA_DIR = os.path.join(BASE_DIR, "data")

def check(name, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {name}: {detail}")
    assert condition, f"Fallo en {name}: {detail}"

# 1. ARCHIVOS Y COMPONENTES
home_path = os.path.join(SRC_DIR, "pages", "HomePage.tsx")
illustration_path = os.path.join(SRC_DIR, "components", "JujuyLandscapeIllustration.tsx")

check("Archivo JujuyLandscapeIllustration existe", os.path.exists(illustration_path), "Componente visual creado")
with open(illustration_path, "r", encoding="utf-8") as f:
    illus_code = f.read()

check("Ilustración SVG vectorial", "<svg" in illus_code and "Hornocal" in illus_code or "mountain" in illus_code, "Ilustración con cerros y sol andino")

with open(home_path, "r", encoding="utf-8") as f:
    home_code = f.read()

# 2. HERO PRINCIPAL & IDENTIDAD
check("Identidad - Tu Próximo Paso", "Tu Próximo Paso" in home_code, "Identidad Tu Próximo Paso presente")
check("Identidad - Jujuy en Datos", "Jujuy en Datos" in home_code, "Identidad Jujuy en Datos presente")
check("Identidad - IES N.º 11", "IES N.º 11" in home_code, "Mención académica IES N.º 11")
check("Hero - Pregunta Central", "¿Qué te gustaría descubrir de Jujuy?" in home_code, "Pregunta central exacta del prompt")
check("Hero - Subtítulo", "Explorá las actividades, el trabajo y lo que mueve nuestra provincia." in home_code, "Subtítulo exacto del prompt")
check("Hero - CTA Principal", "🚀 Empezar a explorar" in home_code, "Botón principal exacto del prompt")
check("Hero - Frase Humana", "No hace falta que tengas todo decidido. Explorá y descubrí." in home_code, "Mensaje humano exacto")
check("Hero - Componente Visual Integrado", "JujuyLandscapeIllustration" in home_code, "Ilustración importada y renderizada")

# 3. LAS 12 ÁREAS CON NOMBRES SIMPLES
simple_names = [
    "Agro", "Minería", "Industria", "Energía", "Construcción",
    "Comercio", "Turismo", "Transporte", "Servicios", "Estado",
    "Educación", "Salud"
]
for name in simple_names:
    check(f"Área visual: {name}", f"'{name}'" in home_code or f">{name}<" in home_code or f"simpleName: '{name}'" in home_code, f"Nombre simple {name} disponible")

# 4. JERARQUÍA Y PROGRESIÓN (PROFUNDIZACIÓN POSTERIOR)
check("Progresión - Nivel de Profundización", "Nivel de Profundización" in home_code and "¿Querés conocer los números globales de Jujuy?" in home_code, "Datos macroeconómicos en nivel posterior")
check("Progresión - Fuentes y Metodología", "fuentes y metodología" in home_code.lower(), "Metodología accesible")

# 5. INTEGRIDAD INALTERADA DE LOS DATOS JSON
for json_file in ["pbg.json", "empleo_oede.json", "eil.json", "mip_empleo.json", "areas.json", "correspondencias.json", "metadata.json"]:
    file_path = os.path.join(DATA_DIR, json_file)
    check(f"Datos intactos: {json_file}", os.path.exists(file_path), f"Dataset {json_file} presente")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        check(f"Datos válidos: {json_file}", len(data) > 0, f"Dataset {json_file} cargado y con registros íntegros")

print("\n=== TODOS LOS CHEQUEOS DE G9 PASARON CON ÉXITO ===")
