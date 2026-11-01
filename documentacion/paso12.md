# Paso 12 — Editor de GRAFCET con inspector y zoom

## Objetivo
- Mover las instrucciones (acciones y condiciones) del lienzo a un inspector en la paleta izquierda.
- El lienzo muestra solo badges compactos (número de acciones, condición truncada).
- Añadir chips para añadir/quitar acciones y variables/operadores/presets para condiciones.
- Añadir auto-ajuste de la vista (viewBox) para que el GRAFCET no se corte.
- Añadir zoom (+/-/ajustar) al editor.
- Añadir pestañas (Escena / Editor GRAFCET) para alternar vistas en la misma pantalla.

## Archivos modificados
- `js/editor/editorGrafcet.js`: inspector, auto-fit, zoom, drag con coordenadas SVG.
- `index.html`: inspector en la paleta, pestañas, botones de zoom.
- `css/dashboard.css`: estilos del inspector, pestañas y zoom.
- `js/main.js`: lógica de pestañas y zoom.

## Instrucciones de prueba
1. Seleccionar una etapa o transición en el lienzo.
2. Verificar que el inspector muestra sus instrucciones en la paleta izquierda.
3. Añadir/quitar acciones con los chips.
4. Editar la condición con las variables y operadores.
5. Usar los botones de zoom (+/-/ajustar).
6. Alternar entre las pestañas Escena y Editor.

## Siguiente paso
Paso 13: sistema completo (3 formas × 3 colores).
