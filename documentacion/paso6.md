# Paso 6 — Rediseño de Escena: Vista Isométrica Clasificadora

## Objetivo
Sustituir la escena plana y lineal por una vista isométrica (diagonal) con múltiples cintas y contenedores. El reto del alumno cambia de un simple bucle a una clasificación condicional (cajas grandes vs pequeñas).

## Archivos modificados
- `js/scenes/empaquetadora.js`: Reescribir todo el SVG para dibujar la perspectiva diagonal, el pistón desviador y dos contenedores finales.
- `css/dashboard.css`: Ajustar el layout para dar más altura a la escena isométrica.
- `js/main.js`: Modificar el GRAFCET de prueba para incluir una bifurcación (IF/ELSE).

## Prueba
Al cargar la página, la escena debe mostrar las cintas en diagonal y el editor debe tener el GRAFCET de prueba.