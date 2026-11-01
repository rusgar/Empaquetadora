# Paso 11 — Motor de clasificación y lógica condicional

## Objetivo
- Adaptar el motor (`grafcetEngine.js`) y el modelo de E/S (`ioModel.js`) para soportar:
  - Generación aleatoria de cajas (grandes/pequeñas).
  - Detección en la fotocélula principal.
  - Movimiento del pistón desviador.
  - Contadores independientes para cada tipo de caja.
- Añadir variables `caja_grande`, `contador1`, `contador2` en `ioModel.js`.
- Añadir lógica de aleatoriedad en la fotocélula y actualización de los dos contadores en `grafcetEngine.js`.
- Actualizar el panel de métricas para mostrar los dos contadores.

## Archivos modificados
- `js/core/ioModel.js`: variables `caja_grande`, `contador1`, `contador2`.
- `js/core/grafcetEngine.js`: aleatoriedad en fotocélula, actualización de contadores.
- `js/main.js`: panel de métricas con dos contadores.

## Instrucciones de prueba
1. Pulsar RUN.
2. Observar cómo la caja avanza y, dependiendo de su tipo (aleatorio), el pistón la desvía o no.
3. Verificar que el contador correspondiente sube en el panel derecho.

## Siguiente paso
Paso 12: editor de GRAFCET con inspector y zoom.
