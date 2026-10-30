# Paso 1 — Esqueleto visual del Proyecto A (Empaquetadora)

## Objetivo
Tener un dashboard funcional a nivel visual con:
- Layout de 3 columnas (paleta | escena + editor | métricas)
- Escena SVG estática de la empaquetadora
- Cronómetro en cabecera
- Barra de controles (RUN/PAUSE/STOP/RESET/PASO/ENTREGAR/DOCENTE) sin lógica aún

## Archivos creados
- index.html
- css/base.css
- css/dashboard.css
- js/main.js
- js/core/ioModel.js
- js/scenes/empaquetadora.js
- js/ui/cronometro.js

## Cómo probar
1. Abrir la carpeta en VS Code.
2. Ejecutar con Live Server (o `python -m http.server 8000`).
3. Abrir http://localhost:8000
4. Verificar: escena visible, cronómetro avanza, botones presentes.

## Siguiente paso
Paso 2: editor de GRAFCET (paleta arrastrable + lienzo SVG con etapas y transiciones).