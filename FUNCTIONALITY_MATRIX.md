# Matriz de Verificación de Funcionalidad

Esta tabla consolida las pruebas funcionales sobre los componentes interactivos de Tu Próximo Paso — Jujuy en Datos.

| ID | Página | Elemento/Acción | Comportamiento Esperado | Resultado Observado | Estado | Evidencia | Archivo/Ubicación | Severidad | Recomendación |
|---|---|---|---|---|---|---|---|---|---|
| 01 | Header | Botón "Inicio" | Redirige al inicio (`currentView = inicio`) | Funciona correctamente y limpia el estado | Funciona | Playwright (`verify8.py`) | `src/components/Header.tsx` | - | - |
| 02 | Header | Botón "12 Áreas de Jujuy" | Cambia la vista a Explorador de Áreas | Renderiza la cuadrícula de 12 áreas | Funciona | Playwright (`verify8.py`) | `src/components/Header.tsx` | - | - |
| 03 | Header | Menú Móvil (Hamburguesa) | Abre/Cierra el Drawer Móvil | Alterna estado interactivo | Funciona | Revisión estática de estado `mobileMenuOpen` | `src/components/Header.tsx` | - | - |
| 04 | Inicio | Botón "Empezar a explorar" | Inicializa el Wizard (Asistente) | Cambia a vista `asistente` | Funciona | Playwright E2E (`verify7.py`) | `src/pages/HomePage.tsx` | - | - |
| 05 | Wizard | Selección de Motivos | Actualiza el estado del motivo y avanza | Estado persiste y permite saltar al paso 2 | Funciona | Playwright E2E (`verify7.py`) | `src/components/ExplorationWizard.tsx` | - | - |
| 06 | Wizard | Selección de Áreas (max 2) | Activa/Desactiva áreas seleccionadas | Límite funcional, deselecciona si se pasa límite | Funciona | Playwright E2E (`verify7.py`) | `src/components/ExplorationWizard.tsx` | - | - |
| 07 | Wizard | Finalizar ("Ver mi exploración") | Envía preferencias a `ExplorationResultPage` | Estado `preferences` se transfiere exitosamente | Funciona | Playwright E2E (`verify7.py`) | `src/components/ExplorationWizard.tsx` | - | - |
| 08 | 12 Áreas | Clic en una Tarjeta de Área | Abre la vista `AreaDetailPage` del área | Carga correcto componente `AreaDetailPage` | Funciona | Playwright (`verify10.py`) | `src/pages/AreasExplorerPage.tsx` | - | - |
| 09 | AreaDetail | Botón "Volver al Explorador..." | Regresa a la vista anterior (`areas`) | Ejecuta `onBack` exitosamente | Funciona | Playwright (`verify12.py`) | `src/pages/AreaDetailPage.tsx` | - | - |
| 10 | AreaDetail | Paginación "Siguiente / Anterior" | Recorre `A01` a `A12` secuencialmente | Actualiza estado `currentArea` y reinicia scroll | Funciona | Lectura Estática (onNavigateArea) | `src/pages/AreaDetailPage.tsx` | - | Añadir control de límites (si A12 -> A01). |
| 11 | Transversal | Filtros/Tarjetas EIL | Despliega datos consolidados | Renderiza condicionalmente | Funciona | Revisión Estática | `src/pages/EilTransversalPage.tsx` | - | - |
| 12 | Metodología| Enlaces a Secciones | Navegación informativa de trazabilidad | El componente es responsivo y legible | Funciona | Playwright (`verify15.py`) | `src/pages/MethodologyPage.tsx` | - | - |
| 13 | Global | Accesibilidad de Enfoque | Soporte para focus/tabulación en teclado | Los botones poseen ring focus de Tailwind | Funciona | Revisión CSS y roles ARIA | Varios archivos | - | - |
