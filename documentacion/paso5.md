# Paso 5 — Exportación e Importación (JSON)

## Objetivo
Permitir al alumno guardar su progreso en un archivo descargable y cargarlo posteriormente, garantizando la persistencia del trabajo.

## Archivos modificados
- `index.html`: Nuevos botones "Guardar JSON" y "Cargar JSON".
- `js/core/grafcetModel.js`: Métodos `exportarJSON()` e `importarJSON()`.
- `js/main.js`: Lógica de manejo de archivos (Blob API y FileReader).