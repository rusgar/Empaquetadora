# Paso 2 — Editor de GRAFCET interactivo

## Objetivo
Implementar el lienzo de dibujo (SVG) donde el alumno construirá su secuencia.
- Paleta interactiva (clic para añadir elementos).
- Nodos arrastrables (Etapas y Transiciones).
- Conexión visual entre nodos (líneas dirigidas).
- Selección de nodos para editar sus propiedades (nombre, condición, acciones).

## Archivos creados/modificados
- js/core/grafcetModel.js (NUEVO)
- js/editor/editorGrafcet.js (NUEVO)
- js/main.js (MODIFICADO)
- css/grafcet.css (NUEVO)

## Cómo probar
1. Recarga la página en el navegador.
2. Haz clic en "○ Etapa" o "→ Transición" en la paleta izquierda. 
3. Verás que aparecen en el lienzo central.
4. Haz clic y arrastra los círculos (etapas) o cruces (transiciones) para moverlos.
5. Haz clic en una Etapa y luego en una Transición para crear una línea de conexión.
6. En el panel derecho (Métricas) verás un resumen de cuántos elementos has creado.

## Siguiente paso
Paso 3: El motor de simulación (Scan Cycle) que leerá este GRAFCET y moverá la escena.

## Corrección de errores (Feedback del usuario)
- Se ha corregido la lógica de arrastre. Ahora los eventos `mousemove` y `mouseup` se capturan a nivel de `document` para que el arrastre no se corte si el ratón sale del nodo.
- Se ha separado el "clic simple" (para conectar nodos) del "arrastre" (para mover nodos) mediante un sistema de umbral de píxeles.
- Se ha asegurado que el lienzo tenga un `tabindex` o tamaño mínimo para capturar clics.