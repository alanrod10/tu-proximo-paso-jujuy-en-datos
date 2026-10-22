# Informe de Mejora: Buscador de Áreas y Actividades

## 1. ¿Qué se encontró en el buscador actual?
El buscador original (`AreasExplorerPage.tsx`) era puramente local y básico, verificando coincidencias en tres campos del archivo `areas.json`: `nombre`, `descripcion` y `area_id`. Era sensible a los acentos (tildes) y no consultaba las clasificaciones oficiales (`correspondencias.json`) ni profesiones.

## 2. ¿Qué archivos se modificaron y por qué?
- **`src/pages/AreasExplorerPage.tsx`**: Se inyectó la lógica de normalización de cadenas (eliminando marcas diacríticas/tildes) y se importaron las correspondencias para ampliar la matriz de búsqueda.
- **`data/alias.json` (Nuevo)**: Se creó un archivo para alojar alias o términos coloquiales justificados (ej: "abogado" → A09, "médico" → A12, "arquitecto" → A05) sin alterar los datos crudos de las fuentes oficiales, manteniendo la integridad del proyecto.

## 3. ¿Qué tipos de términos permite buscar ahora?
- **Identificadores crudos:** "A01", "a11".
- **Nombres de área y descripciones (insensibles a tildes):** "mineria" encuentra "Minería".
- **Ramas oficiales (de correspondencias):** "agricultura", "silvicultura" (pertenecientes al registro PBG/MIP pero no listados explícitamente en la descripción simple).
- **Términos coloquiales y profesiones (alias):** "abogado", "profesor", "constructor".

## 4. Búsquedas que no pueden resolverse
Búsquedas hiperespecíficas ("técnico reparador de aire acondicionado", "paleontólogo") no tienen correspondencia ni en el alias ni en el dataset local oficial. En este caso el buscador arrojará el estado vacío ("No se encontraron áreas...").

## 5. Pruebas ejecutadas y resultados
- **Búsqueda por nombre sin tilde (`mineria`)**: Resultado 1 (A02). Exitosa.
- **Búsqueda por clasificación en correspondencias (`agricultura`)**: Resultado 1 (A01). Exitosa.
- **Búsqueda por alias coloquial (`abogado`)**: Resultado 1 (A09). Exitosa.
- **Búsqueda por alias coloquial con tilde (`médico`)**: Resultado 1 (A12). Exitosa.
- **Búsqueda inexistente (`astronauta`)**: Despliegue de estado vacío comprobado en Playwright. Exitosa.

## 6. Limitaciones pendientes
- El buscador es de coincidencia estricta de subcadenas (`includes`), no implementa algoritmos de distancia de Levenshtein (búsqueda difusa) nativamente para tolerar errores de tipeo severos (ej: "hvagado" en vez de "abogado").

## 7. Próxima mejora recomendada
- Implementar una librería liviana como **Fuse.js** para añadir tolerancia a errores ortográficos, y agregar una vista de "Resultados Destacados" que sugiera al usuario *por qué* encontró el área (Ej: "A12 - Salud, coincidencia encontrada en: Alias 'médico'").
