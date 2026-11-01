# Paso 7 — Motor de Clasificación y Lógica Condicional

## Objetivo
Adaptar el motor (`grafcetEngine.js`) y el modelo de E/S (`ioModel.js`) para que soporten la nueva mecánica:
- Generación aleatoria de cajas (grandes/pequeñas).
- Detección en la fotocélula principal.
- Movimiento del pistón desviador.
- Contadores independientes para cada tipo de caja.

## Archivos modificados
- `js/core/ioModel.js`: Añadir variables `caja_grande`, `contador1`, `contador2`.
- `js/core/grafcetEngine.js`: Añadir lógica de aleatoriedad en la fotocélula y actualización de los dos contadores.
- `js/main.js`: Actualizar el panel de métricas para mostrar los dos contadores.

## Instrucciones de prueba
1. Pulsa RUN.
2. Observa cómo la caja avanza y, dependiendo de su tipo (aleatorio), el pistón la desvía o no.
3. Verifica que el contador correspondiente sube en el panel derecho.