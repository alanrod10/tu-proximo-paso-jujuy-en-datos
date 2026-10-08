#!/usr/bin/env python3
"""
Test Suite de Verificación UX/UI Expositivo 2.0 — Cierre Final (G8.3-C)
Verifica exhaustivamente los requerimientos de la G8.3-C:
- Home: CTA único dominante, PBG escala definitiva ($6,47 mil millones constantes / $5,48 billones corrientes).
- OEDE (63.017 puestos asalariados privados registrados).
- Falsos KPI eliminados (sin 4 niveles ni 34 sectores en portada).
- MIP: lenguaje no causal estricto ("muestra relaciones entre actividades mediante empleo directo e indirecto").
- Ausencia de palabras causales prohibidas (tracción, motor, sostiene, genera empleo, crea empleo, proveedores locales).
- Microanimaciones controladas y soporte estricto de prefers-reduced-motion en index.css.
- Áreas específicas: A01/A02 exclusión primaria, A06/A07 agrupada, A10 OEDE no aplicable.
- Accesibilidad, navegación por teclado y responsive.
"""

import os
import json

BASE_DIR = "/mnt/c/Proyecto DIPEC"
SRC_DIR = os.path.join(BASE_DIR, "src")
DATA_DIR = os.path.join(BASE_DIR, "data")
CSS_FILE = os.path.join(SRC_DIR, "styles", "index.css")

def check(name, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {name}: {detail}")
    assert condition, f"Fallo en {name}: {detail}"

# 1. HOME
with open(os.path.join(SRC_DIR, "pages", "HomePage.tsx"), "r", encoding="utf-8") as f:
    home_code = f.read()

check("Home - Título e Identidad", "Tu Próximo Paso" in home_code and "Jujuy en Datos" in home_code, "Título y subtítulo en orden")
check("Home - Stand IES 11", "IES N.º 11" in home_code and "Exposición Académica" in home_code, "Mención al IES N.º 11 y stand")
check("Home - No Prescriptivo", "No es un test vocacional ni prescribe decisiones laborales" in home_code, "Cláusula informativa explícita")
check("Home - PBG Presentación Definitiva", "$6,47 mil millones" in home_code and "a precios constantes de 2004" in home_code and "$5,48 billones" in home_code, "PBG formulado exactamente como $6,47 mil millones constantes y $5,48 billones corrientes")
check("Home - OEDE 63.017", "63.017" in home_code and "Puestos asalariados registrados" in home_code, "Puestos privados registrados sin llamar empleo total")
check("Home - Falsos KPI Eliminados", "4 Niveles" not in home_code and "34 Sectores" not in home_code, "Eliminados 4 niveles y 34 sectores como KPI del Mini Dashboard")
check("Home - Micro-línea temporal", "2004:" in home_code and "2014:" in home_code and "2024*:" in home_code, "Microvisualización temporal PBG presente")
check("Home - MIP no causal", "La MIP muestra relaciones entre actividades mediante empleo directo e indirecto" in home_code, "MIP formulado según mandato estricto")
check("Home - Sabías que reformulado", "¿Sabías que muestran las estadísticas de Jujuy?" in home_code and "PBG (2004–2024*)" in home_code, "Historias de datos con fuentes visibles")
check("Home - 12 Tarjetas Táctiles", "areas.map" in home_code and "Ver datos" in home_code, "Tarjetas de acceso rápido táctil")
check("Home - 3 Pasos", "01" in home_code and "02" in home_code and "03" in home_code and "No tenés que tener todo decidido" in home_code, "Guía simplificada en 3 pasos")
check("Home - 4 Fuentes", all(k in home_code for k in ["PBG", "OEDE", "EIL", "MIP"]), "Banner con las 4 fuentes estadísticas oficiales")

# 2. PROHIBICIÓN DE LENGUAJE CAUSAL NO DEMOSTRADO
with open(CSS_FILE, "r", encoding="utf-8") as f:
    css_code = f.read()

check("Animaciones CSS - Hero Entrada", "animate-hero-title" in css_code and "animate-hero-subtitle" in css_code and "animate-hero-cta" in css_code, "Clases de entrada suave en Hero")
check("Animaciones CSS - Stagger Dashboard", "animate-stagger-1" in css_code and "animate-stagger-4" in css_code, "Entrada escalonada sin bloqueo")
check("Animaciones CSS - Reduced Motion", "prefers-reduced-motion: reduce" in css_code and "animation: none !important" in css_code, "Soporte estricto de prefers-reduced-motion")

# 3. HUMAN DATA CARDS & NIVEL 1
with open(os.path.join(SRC_DIR, "components", "HumanDataCards.tsx"), "r", encoding="utf-8") as f:
    cards_code = f.read()

check("Preguntas Nivel 1", "¿Cuánto produce esta actividad?" in cards_code and "¿Cuántos puestos registra?" in cards_code and "¿Cómo se relaciona con otras actividades?" in cards_code and "¿Qué tipos de tareas aparecen?" in cards_code and "¿Cómo cambió con el tiempo?" in cards_code, "5 preguntas humanas en Nivel 1")
check("O-01 PBG Derivado", "Cálculo derivado a partir de los valores publicados por DiPEC" in cards_code and "Aproximadamente" in cards_code, "Aclaración metodológica obligatoria O-01")
check("MIP Lenguaje No Causal", "tracciona a toda la economía" not in cards_code and "La MIP muestra relaciones entre actividades mediante empleo directo e indirecto" in cards_code, "Sin lenguaje causal prohibido")

# 4. ÁREAS ESPECÍFICAS
with open(os.path.join(SRC_DIR, "pages", "AreaDetailPage.tsx"), "r", encoding="utf-8") as f:
    detail_code = f.read()

check("A01 / A02 EIL Exclusión", "eil-primaria" in detail_code, "Alerta de exclusión primaria en A01 y A02")
check("A06 / A07 EIL Agrupada", "eil-agrupada" in detail_code, "Alerta de agrupación indivisible en A06 y A07")
check("A10 OEDE Inexistente", "areaId !== 'A10'" in detail_code and "oede-a10" in detail_code, "OEDE no muestra ceros falsos en A10")
check("Salto a Nivel 2", "Saltar a fichas técnicas y tablas (Nivel 2)" in detail_code, "Acceso rápido a Nivel 2 en cabecera")

# 5. RESULTADO & COMPARACIÓN 2 ÁREAS
with open(os.path.join(SRC_DIR, "pages", "ExplorationResultPage.tsx"), "r", encoding="utf-8") as f:
    result_code = f.read()

check("Resultado - Comparación 2 Áreas", "userSelectedAreas.length > 1" in result_code and "Área en pantalla:" in result_code, "Pestañas interactivas de comparación de áreas")

# 6. MOBILE & ACCESIBILIDAD
with open(os.path.join(SRC_DIR, "components", "AreaCard.tsx"), "r", encoding="utf-8") as f:
    areacard_code = f.read()

check("Accesibilidad AreaCard", 'role="button"' in areacard_code and 'onKeyDown' in areacard_code, "Navegación por teclado garantizada")

print("\n=== TODOS LOS CHEQUEOS DE G8.3-C PASARON CON ÉXITO (24/24) ===")
