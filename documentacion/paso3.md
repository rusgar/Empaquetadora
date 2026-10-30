# Paso 3 — Motor de Simulación y Animación de la Escena

## Objetivo
Implementar el "Scan Cycle" del PLC en JavaScript.
- El motor lee las etapas activas del GRAFCET.
- Evalúa las condiciones de las transiciones de salida.
- Actualiza las variables de E/S (fotocélula, cinta, cilindro).
- La escena SVG se mueve en tiempo real según estas variables.
- Se conectan los botones RUN, STOP, PAUSE y RESET.

## Variables de E/S
- Entradas: `fotocelula` (true si la caja está en el sensor).
- Salidas: `motor_cinta`, `cilindro_extendido`.
- Internas: `contador` (cajas empujadas).

## Cómo probar
1. Recarga la página.
2. Crea un GRAFCET básico: E1 -> T2 -> E4.
3. Haz clic en T2 y en el panel de propiedades escribe: `motor_cinta == true`
4. Pulsa RUN. La cinta debería empezar a moverse.