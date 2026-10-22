# Hoja de Ruta Priorizada de Producto

Este roadmap fue generado en base a la evaluación funcional, las fortalezas actuales de la plataforma y las áreas de fricción de experiencia de usuario (UX) identificadas durante la auditoría.

## 1. Tareas Fundamentales Inmediatas (P3)
Antes de escalar funcionalidades, el producto requiere ajustes menores de deuda técnica y UX.
- **Implementación de Enrutamiento Histórico (React Router):**
  - *Problema:* El manejo actual con estado `currentView` en `App.tsx` impide el uso nativo de botones "Atrás/Adelante" del navegador, especialmente conflictivo en dispositivos móviles.
  - *Esfuerzo:* Medio.
  - *Impacto:* Alto (UX).
- **Control de Calidad Automatizado:**
  - *Problema:* Falta `eslint` configurado.
  - *Esfuerzo:* Bajo.
  - *Impacto:* Alto (Mantenibilidad).

## 2. Mejoras Rápidas (Corto Plazo)
- **Mejora Interfaz Móvil (Gestos y Deslizamientos):**
  - Permitir avanzar en el *Wizard* de Exploración usando un gesto de arrastre (swipe) lateral en dispositivos móviles.
  - *Impacto:* Facilita la navegación rápida sin necesidad de acertar clicks en botones al pie de la pantalla.
- **Navegación Intradocumento en Detalles de Área:**
  - Convertir el diseño de bloques consecutivos (Empleo, PBI, Vínculos) en `AreaDetailPage.tsx` en verdaderas **pestañas adhesivas (sticky tabs)** interactivas, reduciendo la necesidad de hacer mucho scroll para encontrar datos transversales.

## 3. Funcionalidades Recomendadas (Mediano Plazo)
- **Barra de Búsqueda Textual Omnipresente (Search):**
  - *Necesidad:* Un usuario puede buscar "Turismo" o "Abogado" y no sabe qué área de las 12 seleccionar.
  - *Desarrollo:* Implementar un buscador ligero (ej. Fuse.js) que busque por palabras clave en los `correspondencias.json` y ofrezca enlaces directos a las áreas adecuadas.
  - *Impacto:* Muy Alto para la usabilidad principal del producto (Explorar).
- **Filtros Dinámicos Cruzados en 12 Áreas:**
  - *Necesidad:* Usuarios interesados en ver "Solo áreas con datos de EIL" o "Solo áreas con Alto Multiplicador MIP".
  - *Desarrollo:* Agregar selectores en `AreasExplorerPage.tsx` para filtrar los JSON localmente.

## 4. Ideas Futuras para Validar
- **Comparador Lateral (Side-by-Side):**
  - Permitir al usuario poner el "Área A01" al lado del "Área A04" en pantalla dividida para evaluar multiplicadores o volumen de empleo de manera relativa.
- **Exportación de Informes en PDF:**
  - Opción de "Descargar mi exploración" en `ExplorationResultPage.tsx` generando un PDF o imagen resumida con las estadísticas para su guardado/compartición social.

---
**Criterios de Aceptación Medibles para Siguiente Paso:**
El paso más recomendado a ejecutar es el **Buscador Textual**. El criterio de éxito sería que "el 100% de las búsquedas por actividades contenidas en `correspondencias.json` guíen exitosamente a una de las 12 Áreas de manera interactiva (Autocomplete)."
