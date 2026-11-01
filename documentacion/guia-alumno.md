# Guía del Alumno — Construcción del Proyecto Empaquetadora (GRAFCET)

> **Módulo:** ELEE018PO · Bloque 9 — Programación de autómatas
> **Nivel:** Desde cero hasta el sistema completo (3 formas × 3 colores)
> **Formato:** Markdown — puedes leerlo en VS Code, GitHub o cualquier visor de Markdown.

---

## Índice

1. [Qué es este proyecto](#1-qu%C3%A9-es-este-proyecto)
2. [Requisitos previos](#2-requisitos-previos)
3. [Estructura de carpetas](#3-estructura-de-carpetas)
4. [Cómo ejecutar el proyecto](#4-c%C3%B3mo-ejecutar-el-proyecto)
5. [Conceptos clave de GRAFCET](#5-conceptos-clave-de-grafcet)
6. [Paso 1 — Primer ciclo (una caja, un contador)](#6-paso-1--primer-ciclo-una-caja-un-contador)
7. [Paso 2 — Clasificación por tamaño (grande/pequeña)](#7-paso-2--clasificaci%C3%B3n-por-tama%C3%B1o-grandepeque%C3%B1a)
8. [Paso 3 — Clasificación por color (rojo/azul/verde)](#8-paso-3--clasificaci%C3%B3n-por-color-rojoazulverde)
9. [Paso 4 — Sistema completo (3 formas × 3 colores)](#9-paso-4--sistema-completo-3-formas--3-colores)
10. [Uso del editor GRAFCET](#10-uso-del-editor-grafcet)
11. [Variables disponibles](#11-variables-disponibles)
12. [Acciones disponibles](#12-acciones-disponibles)
13. [Condiciones típicas](#13-condiciones-t%C3%ADpicas)
14. [Consejos y errores frecuentes](#14-consejos-y-errores-frecuentes)
15. [Checklist final](#15-checklist-final)

---

## 1. Qué es este proyecto

Una **estación de empaquetadora/clasificadora** simulada en el navegador. El alumno programa un **GRAFCET** (diagrama funcional) que controla una cinta transportadora que clasifica objetos por **forma** (caja, triángulo, círculo) y **color** (rojo, azul, verde).

La máquina procesa objetos uno a uno: detecta el tipo, desvía a la rama correspondiente, cuenta y vuelve a empezar. Al llegar a 10 objetos, el lote se completa.

---

## 2. Requisitos previos

- Navegador moderno (Chrome, Edge, Firefox).
- Un servidor local (los módulos ES no funcionan con `file://`):
  ```powershell
  python -m http.server 8000
  ```
  y abrir `http://localhost:8000`.
- Conocimientos básicos de GRAFCET: etapas, transiciones, acciones.

---

## 3. Estructura de carpetas

```
Empaquetadora/
├── index.html              ← Página principal
├── css/
│   ├── base.css            ← Variables y estilos base
│   ├── dashboard.css       ← Layout del dashboard
│   └── grafcet.css         ← Estilos del editor GRAFCET
├── js/
│   ├── main.js             ← Lógica principal y GRAFCET de prueba
│   ├── core/
│   │   ├── grafcetModel.js ← Modelo de datos (etapas, transiciones, conexiones)
│   │   ├── grafcetEngine.js← Motor de ejecución del GRAFCET
│   │   └── ioModel.js      ← Variables de E/S (entradas/salidas/física)
│   ├── editor/
│   │   └── editorGrafcet.js← Editor visual (lienzo SVG)
│   ├── scenes/
│   │   └── empaquetadora.js← Escena SVG (cintas, contenedores, caja)
│   └── ui/
│       └── cronometro.js   ← Cronómetro
└── documentacion/
    └── paso1.md ... paso13.md
```

---

## 4. Cómo ejecutar el proyecto

1. Abrir la carpeta en VS Code.
2. Ejecutar en la terminal:
   ```powershell
   python -m http.server 8000
   ```
3. Abrir `http://localhost:8000` en el navegador.
4. Verificar: escena visible, cronómetro avanza, botones presentes.

---

## 5. Conceptos clave de GRAFCET

| Concepto | Descripción |
|---|---|
| **Etapa** | Estado de la máquina. Puede tener acciones (salidas). |
| **Transición** | Condición que permite pasar de una etapa a otra. |
| **Acción** | Salida que se activa cuando la etapa está activa. |
| **Conexión** | Línea que une etapa → transición → etapa. |
| **Etapa inicial** | La primera etapa (marcada en azul). |

**Regla fundamental:** siempre alternar etapa → transición → etapa. Nunca conectar etapa con etapa directamente.

---

## 6. Paso 1 — Primer ciclo (una caja, un contador)

### Objetivo
Crear un GRAFCET mínimo que mueva una caja por la cinta y cuente.

### Etapas y transiciones

```
E1 (inicial) → T2 → E3 → T4 → E1
```

| Elemento | Acción / Condición |
|---|---|
| E1 | `motor_cinta=1` |
| T2 | `fotocelula==true` |
| E3 | `motor_cinta=0` |
| T4 | `caja_empujada == true` |

### Cómo crearlo en el editor
1. Pulsar **○ Etapa** en la paleta → crea E1 (inicial).
2. Seleccionar E1 → en el inspector, añadir acción `motor_cinta=1`.
3. Pulsar **→ Transición** → crea T2.
4. Seleccionar T2 → en el inspector, poner condición `fotocelula==true`.
5. Pulsar **○ Etapa** → crea E3.
6. Seleccionar E3 → añadir acción `motor_cinta=0`.
7. Pulsar **→ Transición** → crea T4.
8. Seleccionar T4 → condición `caja_empujada == true`.
9. Conectar: clic en E1, luego clic en T2 (se crea la conexión).
10. Conectar: T2 → E3, E3 → T4, T4 → E1.

### Cómo probar
1. Pulsar RUN.
2. La caja avanza por la cinta.
3. Al llegar a la fotocélula, la cinta se para.
4. La caja llega al final y se cuenta.
5. El ciclo se repite.

---

## 7. Paso 2 — Clasificación por tamaño (grande/pequeña)

### Objetivo
Clasificar cajas grandes (azul) y pequeñas (amarillo) con un pistón desviador.

### GRAFCET

```
E1 → T2 (grande) → E3 → T4 → E5 → T10 → E1
E1 → T6 (pequeña) → E7 → T8 → E9 → T11 → E1
```

| Rama | Etapa | Acciones |
|---|---|---|
| Grande | E3 | `motor_cinta=0`, `cilindro=1` |
| Grande | E5 | `cilindro=0`, `contador1+1` |
| Pequeña | E7 | `motor_cinta=1` |
| Pequeña | E9 | `contador2+1` |

| Transición | Condición |
|---|---|
| T2 | `fotocelula==true && caja_grande==true` |
| T4 | `caja_empujada == true` |
| T6 | `fotocelula==true && caja_grande==false` |
| T8 | `timer_fin_caja > 1.0` |

### Variables nuevas
- `caja_grande`: indica si la caja actual es grande.
- `contador1`: cajas grandes (azul).
- `contador2`: cajas pequeñas (amarillo).
- `cilindro`: salida del pistón desviador.
- `timer_fin_caja`: temporizador para cajas pequeñas.

### Cómo probar
1. Pulsar RUN.
2. Observar cómo la caja avanza y, dependiendo de su tipo, el pistón la desvía o no.
3. Verificar que el contador correspondiente (C1 o C2) sube.

---

## 8. Paso 3 — Clasificación por color (rojo/azul/verde)

### Objetivo
Clasificar cajas por color (rojo, azul, verde) en 3 ramas.

### Variables nuevas
- `caja_color`: 0=rojo, 1=azul, 2=verde.
- `contador1`, `contador2`, `contador3`: un contador por color.
- `motor_cinta`: salida del motor de la cinta.

### GRAFCET

```
E1 → T2 (rojo)   → E3 → T4 → E5 → T14 → E1
E1 → T6 (azul)   → E7 → T8 → E9 → T15 → E1
E1 → T10 (verde) → E11 → T12 → E13 → T16 → E1
```

| Transición | Condición |
|---|---|
| T2 | `fotocelula==true && caja_color==0` |
| T6 | `fotocelula==true && caja_color==1` |
| T10 | `fotocelula==true && caja_color==2` |
| T4/T8/T12 | `caja_empujada == true` |

### Cómo probar
1. Pulsar RUN.
2. Observar las 3 ramas (rojo/azul/verde).
3. Verificar que cada contador sube según el color de la caja.

---

## 9. Paso 4 — Sistema completo (3 formas × 3 colores)

### Objetivo
Sistema completo con 3 formas (caja, triángulo, círculo) y 3 colores (rojo, azul, verde), con dos desviadores en cascada.

### Variables nuevas
- `forma`: 0=caja, 1=triángulo, 2=círculo.
- `color`: 0=rojo, 1=azul, 2=verde.
- `fotocelula1`: fotocélula del desviador 1 (por forma).
- `fotocelula2`: fotocélula del desviador 2 (por color).
- `fase`: 0-5 (fase actual del recorrido).
- `progreso`: 0-1 (progreso dentro de la fase actual).
- `contador1`..`contador9`: un contador por rama (3 formas × 3 colores).

### GRAFCET

```
E1 → T2 (caja)      → E3 → T4 (rojo)   → E5 → T26 → E1
                                 T6 (azul)  → E7 → T27 → E1
                                 T8 (verde) → E9 → T28 → E1
E1 → T10 (triángulo) → E11 → T12 (rojo)  → E13 → T29 → E1
                                  T14 (azul) → E15 → T30 → E1
                                  T16 (verde)→ E17 → T31 → E1
E1 → T18 (círculo)   → E19 → T20 (rojo)  → E21 → T32 → E1
                                  T22 (azul) → E23 → T33 → E1
                                  T24 (verde)→ E25 → T34 → E1
```

### Cómo probar
1. Pulsar RUN.
2. Observar las 3 formas clasificadas por la primera fotocélula.
3. Observar la segunda fotocélula distinguiendo el color dentro de cada forma.
4. Verificar que los 9 contadores suben según la ruta.
5. Al llegar a 10 objetos, la máquina se detiene con `✅ Lote completo`.

---

## 10. Uso del editor GRAFCET

### Añadir elementos
- Pulsar **○ Etapa** o **→ Transición** en la paleta para añadir al lienzo.
- Arrastrar para mover.

### Conectar elementos
1. Clic en una etapa (se selecciona).
2. Clic en una transición (se crea la conexión).
3. Siempre alternar: etapa → transición → etapa.

### Editar instrucciones
1. Seleccionar una etapa o transición en el lienzo.
2. En el **inspector** (paleta izquierda):
   - **Etapa**: añadir/quitar acciones con chips.
   - **Transición**: editar condición con variables, operadores y presets.

### Zoom
- Usar los botones **🔍 +**, **🔍 −**, **⊙ Ajustar** para hacer zoom.
- En la escena: **🔍 +**, **🔍 −**, **⊙ Ajustar** para centrar/ampliar las cintas.

### Pestañas
- **🏭 Escena**: muestra la cinta transportadora.
- **🧩 Editor GRAFCET**: muestra el editor de diagramas.

### Guardar/Cargar
- **💾 Guardar JSON**: descarga el GRAFCET como archivo.
- **📂 Cargar JSON**: carga un GRAFCET desde archivo.

---

## 11. Variables disponibles

| Variable | Tipo | Descripción |
|---|---|---|
| `fotocelula` / `fotocelula1` | boolean | Fotocélula principal (detección) |
| `fotocelula2` | boolean | Fotocélula del desviador 2 (color) |
| `forma` | number | 0=caja, 1=triángulo, 2=círculo |
| `color` / `caja_color` | number | 0=rojo, 1=azul, 2=verde |
| `caja_grande` | boolean | Si la caja es grande |
| `motor_cinta` | boolean | Estado del motor de la cinta |
| `caja_empujada` | boolean | Si la caja ha llegado al final |
| `timer_fin_caja` | number | Temporizador de llegada al final |
| `contador1`..`contador9` | number | Contadores por rama |

---

## 12. Acciones disponibles

| Acción | Efecto |
|---|---|
| `motor_cinta=1` | Enciende el motor de la cinta |
| `motor_cinta=0` | Apaga el motor |
| `cilindro=1` | Extiende el pistón desviador |
| `cilindro=0` | Retrae el pistón |
| `contador1+1` | Incrementa el contador 1 |
| `contador2+1` | Incrementa el contador 2 |
| ... | ... |
| `contador9+1` | Incrementa el contador 9 |

---

## 13. Condiciones típicas

| Condición | Significado |
|---|---|
| `fotocelula==true` | La fotocélula detecta una caja |
| `caja_grande==true` | La caja es grande |
| `caja_grande==false` | La caja es pequeña |
| `fotocelula==true && caja_grande==true` | Fotocélula Y caja grande |
| `fotocelula==true && caja_grande==false` | Fotocélula Y caja pequeña |
| `caja_empujada == true` | La caja ha llegado al final |
| `timer_fin_caja > 1.0` | Han pasado más de 1 segundo |
| `forma==0` | El objeto es una caja |
| `forma==1` | El objeto es un triángulo |
| `forma==2` | El objeto es un círculo |
| `color==0` | El color es rojo |
| `color==1` | El color es azul |
| `color==2` | El color es verde |
| `fotocelula1==true && forma==0` | Fotocélula 1 Y forma caja |
| `fotocelula2==true && color==0` | Fotocélula 2 Y color rojo |
| `TRUE` | Condición siempre verdadera |

---

## 14. Consejos y errores frecuentes

### Errores frecuentes
1. **Conectar etapa con etapa directamente**: el motor no evalúa conexiones sin transición. Siempre: etapa → transición → etapa.
2. **Condición vacía**: si una transición no tiene condición, se evalúa como `TRUE` (siempre se dispara).
3. **Condición con error de sintaxis**: si la condición tiene un error, la transición no se dispara. Revisa la consola del navegador.
4. **Olvidar la vuelta al inicio**: sin la transición de retorno, el GRAFCET se para después de una caja.
5. **Usar `TRUE` en mayúsculas**: funciona, pero es mejor usar `true` en minúsculas (JavaScript).
6. **No reiniciar**: después de modificar el GRAFCET, pulsar RESET antes de RUN.

### Consejos
- Empieza con un GRAFCET simple (2-3 etapas) y ve añadiendo complejidad.
- Usa el inspector para añadir/quitar instrucciones fácilmente.
- Usa los presets de condiciones para ahorrar tiempo.
- Guarda tu GRAFCET en JSON regularmente.
- Si algo no funciona, abre la consola del navegador (F12) para ver errores.
- Usa el zoom (+/-) para ver mejor el GRAFCET.

---

## 15. Checklist final

- [ ] La escena se ve correctamente (cintas, contenedores, fotocélulas).
- [ ] El GRAFCET tiene etapa inicial marcada.
- [ ] Todas las conexiones alternan etapa → transición → etapa.
- [ ] Cada transición tiene una condición válida.
- [ ] Cada etapa tiene las acciones correctas.
- [ ] Hay una transición de retorno al inicio.
- [ ] Al pulsar RUN, la caja avanza y se clasifica.
- [ ] Los contadores suben correctamente.
- [ ] Al llegar a 10, el lote se completa.
- [ ] El GRAFCET se guarda y carga correctamente en JSON.
- [ ] El editor permite zoom y el inspector funciona.

---

*Guía creada para el proyecto Empaquetadora (ELEE018PO · Bloque 9).*
*Última actualización: Noviembre 2026.*
