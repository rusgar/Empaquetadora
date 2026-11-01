# Paso 10 — Rediseño de la escena (vista isométrica clasificadora)

## Objetivo
- Sustituir la escena plana por una vista isométrica con múltiples cintas y contenedores.
- El reto del alumno cambia de un simple bucle a una clasificación condicional (cajas grandes vs pequeñas).
- Añadir pistón desviador y dos contenedores finales (azul para grandes, amarillo para pequeñas).

## Archivos modificados
- `js/scenes/empaquetadora.js`: reescritura del SVG con perspectiva diagonal, pistón desviador y dos contenedores.
- `css/dashboard.css`: ajuste del layout para dar más altura a la escena isométrica.
- `js/main.js`: GRAFCET de prueba con bifurcación (IF/ELSE) grande/pequeña.

## Instrucciones de prueba
1. Cargar la página: la escena debe mostrar las cintas en diagonal.
2. El editor debe tener el GRAFCET de prueba con bifurcación.
3. Pulsar RUN y observar la clasificación.

## Siguiente paso
Paso 11: motor de clasificación y lógica condicional.
