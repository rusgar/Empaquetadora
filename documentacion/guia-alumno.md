# Guía del Alumno — Ayuda para construir el GRAFCET

> **Proyecto:** Estación Empaquetadora (ELEE018PO · Bloque 9)
> **Objetivo:** Entender qué hace cada etapa y transición para construir el ejercicio completo.

---

## 1. Qué es este proyecto

Una **cinta clasificadora** que procesa objetos (cajas, triángulos, círculos) de colores (rojo, azul, verde). El alumno programa un **GRAFCET** que controla:
- El motor de la cinta.
- Un pistón desviador.
- Contadores de objetos clasificados.

---

## 2. Qué es una Etapa (○)

Una **etapa** es un estado de la máquina. Cuando está activa, ejecuta sus **acciones** (salidas).

### Etapas del sistema

| Etapa | Acción | Qué hace cuando está activa |
|---|---|---|
| E1 (inicio) | `motor_cinta=1` | Enciende la cinta para que avance la caja |
| E3 (caja grande) | `motor_cinta=0`, `cilindro=1` | Para la cinta y extiende el pistón para desviar la caja |
| E5 (caja grande fin) | `cilindro=0`, `contador1+1` | Retrae el pistón y suma 1 al contador de grandes |
| E7 (caja pequeña) | `motor_cinta=1` | Sigue avanzando la cinta hasta el final |
| E9 (caja pequeña fin) | `contador2+1` | Suma 1 al contador de pequeñas |

### Acciones disponibles

| Acción | Efecto en la máquina |
|---|---|
| `motor_cinta=1` | La cinta avanza (la caja se mueve) |
| `motor_cinta=0` | La cinta se para |
| `cilindro=1` | El pistón se extiende (desvía la caja) |
| `cilindro=0` | El pistón se retrae |
| `contador1+1` | Suma 1 al contador 1 (cajas grandes) |
| `contador2+1` | Suma 1 al contador 2 (cajas pequeñas) |
| `contador3+1` | Suma 1 al contador 3 (cajas rojas) |
| `contador4+1` | Suma 1 al contador 4 (cajas azules) |
| `contador5+1` | Suma 1 al contador 5 (cajas verdes) |
| `contador6+1`..`contador9+1` | Contadores adicionales |

### Cómo añadir una acción
1. Seleccionar la etapa en el lienzo.
2. En el inspector (paleta izquierda), pulsar **+ acción**.
3. La acción se añade a la etapa.

---

## 3. Qué es una Transición (→)

Una **transición** es la condición que permite pasar de una etapa a otra. Cuando la condición se cumple, la etapa actual se desactiva y la siguiente se activa.

### Transiciones del sistema

| Transición | Condición | Cuándo se dispara |
|---|---|---|
| T2 | `fotocelula==true && caja_grande==true` | Cuando la fotocélula detecta Y la caja es grande |
| T4 | `caja_empujada == true` | Cuando la caja ha llegado al final (pistón) |
| T6 | `fotocelula==true && caja_grande==false` | Cuando la fotocélula detecta Y la caja es pequeña |
| T8 | `timer_fin_caja > 1.0` | Cuando han pasado más de 1 segundo |

### Variables disponibles (entradas)

| Variable | Tipo | Significado |
|---|---|---|
| `fotocelula` | boolean | La fotocélula detecta un objeto |
| `caja_grande` | boolean | La caja actual es grande (true) o pequeña (false) |
| `caja_color` | number | Color de la caja: 0=rojo, 1=azul, 2=verde |
| `forma` | number | Forma del objeto: 0=caja, 1=triángulo, 2=círculo |
| `color` | number | Color del objeto: 0=rojo, 1=azul, 2=verde |
| `caja_empujada` | boolean | La caja ha llegado al final de la cinta |
| `timer_fin_caja` | number | Segundos desde que la caja llegó al final |
| `motor_cinta` | boolean | Estado del motor (1=encendido, 0=apagado) |
| `fotocelula1` | boolean | Fotocélula del desviador 1 (por forma) |
| `fotocelula2` | boolean | Fotocélula del desviador 2 (por color) |

### Operadores disponibles

| Operador | Significado | Ejemplo |
|---|---|---|
| `==` | Igual a | `caja_grande==true` |
| `!=` | Distinto de | `caja_color!=0` |
| `>` | Mayor que | `timer_fin_caja > 1.0` |
| `<` | Menor que | `contador1 < 5` |
| `&&` | Y (ambas condiciones) | `fotocelula==true && caja_grande==true` |
| `\|\|` | O (al menos una) | `caja_grande==true \|\| caja_color==0` |
| `!` | NO (negación) | `!caja_grande` |
| `true` / `false` | Verdadero / Falso | `fotocelula==true` |

### Cómo añadir una condición
1. Seleccionar la transición en el lienzo.
2. En el inspector, escribir la condición en el campo de texto.
3. O pulsar un botón de variable/operador/preset para insertarla.
4. La condición se actualiza automáticamente.

### Presets (condiciones típicas)
- `fotocelula==true && caja_grande==true` — fotocélula Y caja grande
- `fotocelula==true && caja_grande==false` — fotocélula Y caja pequeña
- `caja_empujada == true` — la caja ha llegado al final
- `timer_fin_caja > 1.0` — han pasado más de 1 segundo
- `TRUE` — siempre se dispara (transición incondicional)

---

## 4. Cómo construir el ejercicio completo (paso a paso)

### Paso 1: Primer ciclo (una caja, un contador)

**Objetivo:** Crear un GRAFCET que mueva una caja y la cuente.

```
E1 (inicio) → T2 → E3 → T4 → E1
```

| Elemento | Acción / Condición |
|---|---|
| E1 | `motor_cinta=1` |
| T2 | `fotocelula==true` |
| E3 | `motor_cinta=0` |
| T4 | `caja_empujada == true` |

**Cómo hacerlo:**
1. Pulsar **○ Etapa** → crea E1 (inicial, azul).
2. Seleccionar E1 → inspector → añadir acción `motor_cinta=1`.
3. Pulsar **→ Transición** → crea T2.
4. Seleccionar T2 → inspector → condición `fotocelula==true`.
5. Pulsar **○ Etapa** → crea E3.
6. Seleccionar E3 → añadir acción `motor_cinta=0`.
7. Pulsar **→ Transición** → crea T4.
8. Seleccionar T4 → condición `caja_empujada == true`.
9. Conectar: E1 → T2 → E3 → T4 → E1 (clic en cada elemento en orden).
10. Pulsar RUN y verificar que la caja avanza y se cuenta.

### Paso 2: Clasificación por tamaño (grande/pequeña)

**Objetivo:** Añadir una rama para cajas grandes (con pistón) y otra para pequeñas.

```
E1 → T2 (grande) → E3 → T4 → E5 → T10 → E1
E1 → T6 (pequeña) → E7 → T8 → E9 → T11 → E1
```

| Elemento | Acción / Condición |
|---|---|
| T2 | `fotocelula==true && caja_grande==true` |
| E3 | `motor_cinta=0`, `cilindro=1` |
| T4 | `caja_empujada == true` |
| E5 | `cilindro=0`, `contador1+1` |
| T6 | `fotocelula==true && caja_grande==false` |
| E7 | `motor_cinta=1` |
| T8 | `timer_fin_caja > 1.0` |
| E9 | `contador2+1` |

**Clave:** La condición `fotocelula==true && caja_grande==true` solo se cumple para cajas grandes. La otra (`caja_grande==false`) solo para pequeñas. Así se bifurca el flujo.

### Paso 3: Clasificación por color (rojo/azul/verde)

**Objetivo:** Añadir una rama para cada color.

```
E1 → T2 (rojo)  → E3 → T4 → E5 → T14 → E1
E1 → T6 (azul)  → E7 → T8 → E9 → T15 → E1
E1 → T10 (verde)→ E11 → T12 → E13 → T16 → E1
```

| Transición | Condición |
|---|---|
| T2 | `fotocelula==true && caja_color==0` |
| T6 | `fotocelula==true && caja_color==1` |
| T10 | `fotocelula==true && caja_color==2` |

**Clave:** `caja_color` es 0=rojo, 1=azul, 2=verde. Cada transición solo se dispara para su color.

### Paso 4: Sistema completo (3 formas × 3 colores)

**Objetivo:** Añadir 3 formas (caja, triángulo, círculo) y 3 colores en cada una.

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

**Variables por forma:**
- `forma`: 0=caja, 1=triángulo, 2=círculo.
- `color`: 0=rojo, 1=azul, 2=verde.
- `fotocelula1`: fotocélula del desviador 1 (por forma).
- `fotocelula2`: fotocélula del desviador 2 (por color).

**Contadores:**
- C1: caja-rojo, C2: caja-azul, C3: caja-verde
- C4: triángulo-rojo, C5: triángulo-azul, C6: triángulo-verde
- C7: círculo-rojo, C8: círculo-azul, C9: círculo-verde

---

## 5. Cómo funciona la escena

- La **caja** aparece **gris (indefinida)** en la cinta principal.
- Al llegar a la **primera fotocélula**, se determina la forma (caja/triángulo/círculo) y se desvía a su rama.
- Al llegar a la **segunda fotocélula**, se determina el color y se desvía a su contenedor.
- Los **contenedores** se llenan visualmente con los objetos clasificados.
- Los **contadores** (C1..C9) se incrementan según la ruta del objeto.

---

## 6. Cómo usar el editor

### Añadir elementos
1. Pulsar **○ Etapa** o **→ Transición** en la paleta.
2. El elemento aparece en el centro del lienzo.

### Conectar elementos
1. Clic en una etapa (se selecciona, borde naranja).
2. Clic en una transición (se crea la conexión).
3. Repetir para crear la cadena: etapa → transición → etapa.

### Editar instrucciones
1. Seleccionar una etapa o transición.
2. En el **inspector** (paleta izquierda):
   - **Etapa**: pulsar **+ acción** para añadir, **×** para quitar.
   - **Transición**: escribir la condición o pulsar variables/operadores/presets.

### Zoom
- **🔍 +**: acercar.
- **🔍 −**: alejar.
- **⊙ Ajustar**: restaurar vista automática.

### Pestañas
- **🏭 Escena**: muestra la cinta transportadora.
- **🧩 Editor GRAFCET**: muestra el editor de diagramas.

---

## 7. Consejos y errores frecuentes

### Errores frecuentes
1. **Conectar etapa con etapa directamente**: el motor no evalúa conexiones sin transición.
2. **Condición vacía**: si una transición no tiene condición, se evalúa como `TRUE`.
3. **Condición con error de sintaxis**: la transición no se dispara. Revisa la consola (F12).
4. **Olvidar la vuelta al inicio**: sin la transición de retorno, el GRAFCET se para.
5. **No reiniciar**: después de modificar, pulsar RESET antes de RUN.

### Consejos
- Empieza con un GRAFCET simple (2-3 etapas) y ve añadiendo complejidad.
- Usa los presets de condiciones para ahorrar tiempo.
- Guarda tu GRAFCET en JSON regularmente.
- Si algo no funciona, abre la consola del navegador (F12).

---

*Guía para el alumno — Proyecto Empaquetadora (ELEE018PO · Bloque 9).*
