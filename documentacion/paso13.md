# Paso 13 — Sistema completo: 3 formas × 3 colores

## Objetivo
- Ampliar el sistema para soportar 3 formas (caja, triángulo, círculo) y 3 colores (rojo, azul, verde).
- Añadir un segundo desviador en cascada (forma → color).
- 9 contenedores (3 formas × 3 colores) con las formas correctas.
- 9 contadores (C1..C9).
- Escena ampliada (viewBox 1200×1000, scale 1.5×) con fotocélulas por rama.
- GRAFCET de ejemplo con 9 ramas (3 formas × 3 colores).

## Archivos modificados
- `js/core/ioModel.js`: `forma`, `color`, `fase`, `progreso`, `fotocelula1`, `fotocelula2`, `contadores[15]`.
- `js/core/grafcetEngine.js`: motor phase-based con 2 desviadores.
- `js/scenes/empaquetadora.js`: escena con 9 ramas y 9 contenedores, fotocélulas por rama.
- `js/main.js`: GRAFCET de ejemplo con 9 ramas, métricas C1..C9.
- `js/editor/editorGrafcet.js`: variables `forma`, `color`, `fotocelula1`, `fotocelula2`.
- `index.html`: métricas C1..C9.
- `css/dashboard.css`: escena ampliada, pestañas y zoom.

## Instrucciones de prueba
1. Pulsar RUN.
2. Observar las 3 formas (caja/triángulo/círculo) clasificadas por la primera fotocélula.
3. Observar la segunda fotocélula distinguiendo el color (rojo/azul/verde).
4. Verificar que los 9 contadores suben según la ruta.
5. Al llegar a 10 objetos, la máquina se detiene con `✅ Lote completo`.

## Siguiente paso
El sistema está completo y escalable.
