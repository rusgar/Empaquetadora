# Paso 9 — Corrección del bucle del GRAFCET de prueba

## Objetivo
- Corregir el GRAFCET de prueba para que el ciclo se repita (antes procesaba una caja y se paraba).
- Añadir transiciones de retorno reales (etapa → transición → etapa) en lugar de conexiones directas etapa→etapa.
- Hacer que la condición `TRUE` funcione en el motor.

## Archivos modificados
- `js/main.js`: GRAFCET de prueba con transiciones de retorno (`T10`, `T11` o convergencia OR `T10`).
- `js/core/grafcetEngine.js`: manejo de `TRUE` como condición permanente; aleatoriedad de la primera caja; reinicio al volver a la etapa inicial.

## Instrucciones de prueba
1. Abrir la aplicación y pulsar RUN.
2. Verificar que la caja avanza, se clasifica (grande/pequeña) y el contador sube.
3. Verificar que el ciclo se repite automáticamente.
4. Al llegar a 10 cajas, la máquina se detiene con `✅ Lote completo`.

## Siguiente paso
Paso 10: rediseño de la escena y del editor de GRAFCET.
