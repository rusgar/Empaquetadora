# Guía del Alumno — Ayuda para construir el GRAFCET

> **Proyecto:** Estación Empaquetadora (ELEE018PO · Bloque 9)
> **Objetivo:** Entender qué hace cada etapa y transición para construir el ejercicio por tu cuenta.

---

## 1. Qué es este proyecto

Una **cinta clasificadora** que procesa objetos (cajas, triángulos, círculos) de colores (rojo, azul, verde). El alumno programa un **GRAFCET** que controla:
- El motor de la cinta.
- Un pistón desviador.
- Contadores de objetos clasificados.

La máquina procesa objetos uno a uno: detecta el tipo, desvía a la rama correspondiente, cuenta y vuelve a empezar. Al llegar a 10 objetos, el lote se completa.

---

## 2. Qué es una Etapa (○)

Una **etapa** es un estado de la máquina. Cuando está activa, ejecuta sus **acciones** (salidas).

### Acciones disponibles

| Acción | Efecto en la máquina |
|---|---|
| `motor_cinta=1` | La cinta avanza (el objeto se mueve) |
| `motor_cinta=0` | La cinta se para |
| `cilindro=1` | El pistón se extiende (desvía el objeto) |
| `cilindro=0` | El pistón se retrae |
| `contador1+1` | Suma 1 al contador 1 |
| `contador2+1` | Suma 1 al contador 2 |
| ... | ... |
| `contador9+1` | Suma 1 al contador 9 |

### Cómo añadir una acción
1. Seleccionar la etapa en el lienzo.
2. En el inspector (paleta izquierda), pulsar **+ acción**.
3. La acción se añade a la etapa.

---

## 3. Qué es una Transición (→)

Una **transición** es la condición que permite pasar de una etapa a otra. Cuando la condición se cumple, la etapa actual se desactiva y la siguiente se activa.

### Variables disponibles (entradas)

| Variable | Tipo | Significado |
|---|---|---|
| `fotocelula` / `fotocelula1` | boolean | La fotocélula detecta un objeto |
| `fotocelula2` | boolean | Fotocélula del desviador 2 (color) |
| `forma` | number | 0=caja, 1=triángulo, 2=círculo |
| `color` / `caja_color` | number | 0=rojo, 1=azul, 2=verde |
| `caja_grande` | boolean | La caja es grande (true) o pequeña (false) |
| `caja_empujada` | boolean | El objeto ha llegado al final de la cinta |
| `timer_fin_caja` | number | Segundos desde que el objeto llegó al final |
| `motor_cinta` | boolean | Estado del motor (1=encendido, 0=apagado) |

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

### Presets (condiciones típicas)
- `fotocelula==true && caja_grande==true` — fotocélula Y caja grande
- `fotocelula==true && caja_grande==false` — fotocélula Y caja pequeña
- `caja_empujada == true` — el objeto ha llegado al final
- `timer_fin_caja > 1.0` — han pasado más de 1 segundo
- `forma==0` / `forma==1` / `forma==2` — forma del objeto
- `color==0` / `color==1` / `color==2` — color del objeto
- `fotocelula1==true && forma==0` — fotocélula 1 Y forma caja
- `fotocelula2==true && color==0` — fotocélula 2 Y color rojo
- `TRUE` — siempre se dispara (transición incondicional)

---

## 4. Cómo funciona la escena

- El **objeto** aparece **gris (indefinido)** en la cinta principal.
- Al llegar a la **primera fotocélula**, se determina la forma (caja/triángulo/círculo) y se desvía a su rama.
- Al llegar a la **segunda fotocélula**, se determina el color y se desvía a su contenedor.
- Los **contenedores** se llenan visualmente con los objetos clasificados.
- Los **contadores** (C1..C9) se incrementan según la ruta del objeto.

### Contadores

| Contador | Significado |
|---|---|
| C1 | Caja roja |
| C2 | Caja azul |
| C3 | Caja verde |
| C4 | Triángulo rojo |
| C5 | Triángulo azul |
| C6 | Triángulo verde |
| C7 | Círculo rojo |
| C8 | Círculo azul |
| C9 | Círculo verde |

---

## 5. Cómo usar el editor

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

### Guardar/Cargar
- **💾 Guardar JSON**: descarga el GRAFCET como archivo.
- **📂 Cargar JSON**: carga un GRAFCET desde archivo.
- **📐 Cargar Draw.io**: importa un diagrama desde Draw.io (XML).

---

## 6. Consejos y errores frecuentes

### Errores frecuentes
1. **Conectar etapa con etapa directamente**: el motor no evalúa conexiones sin transición. Siempre: etapa → transición → etapa.
2. **Condición vacía**: si una transición no tiene condición, se evalúa como `TRUE` (siempre se dispara).
3. **Condición con error de sintaxis**: la transición no se dispara. Revisa la consola del navegador (F12).
4. **Olvidar la vuelta al inicio**: sin la transición de retorno, el GRAFCET se para después de una caja.
5. **No reiniciar**: después de modificar, pulsar RESET antes de RUN.

### Consejos
- Empieza con un GRAFCET simple (2-3 etapas) y ve añadiendo complejidad.
- Usa los presets de condiciones para ahorrar tiempo.
- Guarda tu GRAFCET en JSON regularmente.
- Si algo no funciona, abre la consola del navegador (F12) para ver errores.
- Usa el zoom (+/-) para ver mejor el GRAFCET.
- Usa el botón **DOCENTE** para cargar el ejemplo completo y estudiarlo.

---

## 7. Tiempo estimado

| Nivel | Tiempo estimado |
|---|---|
| Principiante (sin experiencia con GRAFCET) | 2-3 horas |
| Intermedio (conoce GRAFCET básico) | 1-1.5 horas |
| Avanzado (conoce GRAFCET y programación) | 30-45 minutos |

El tiempo depende de la complejidad del ejercicio. Un GRAFCET con 2 ramas (grande/pequeña) se puede hacer en 20-30 minutos. El sistema completo (9 ramas) puede llevar 1-2 horas.

---

## 8. Checklist final

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

---

*Guía para el alumno — Proyecto Empaquetadora (ELEE018PO · Bloque 9).*
