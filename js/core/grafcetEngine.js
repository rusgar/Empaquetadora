import { GrafcetModel } from './grafcetModel.js';
import { IO } from './ioModel.js';

export class GrafcetEngine {
  constructor() {
    this.etapasActivas = new Set();
    this.etapaAnterior = new Set();
    this.intervalo = null;
    this.ultimoTiempo = 0;
    this.enEjecucion = false;
    this.pausado = false;
    this.listeners = [];
  }

  onUpdate(callback) { this.listeners.push(callback); }
  emit() { this.listeners.forEach(cb => cb()); }

  init() {
    const inicial = GrafcetModel.etapas.find(e => e.inicial);
    if (inicial) {
      this.etapasActivas.clear();
      this.etapasActivas.add(inicial.id);
      this.etapaAnterior = new Set(this.etapasActivas);
      IO.forma = Math.floor(Math.random() * 3);
      IO.color = Math.floor(Math.random() * 3);
      IO.fase = 0;
      IO.progreso = 0;
      IO.caja_empujada = false;
      IO.fotocelula1 = false;
      IO.fotocelula2 = false;
      IO.timer_fin_caja = 0;
      IO.motor_cinta = false;
      IO.lote_completo = false;
    }
  }

  reiniciarCaja() {
    IO.forma = Math.floor(Math.random() * 3);
    IO.color = Math.floor(Math.random() * 3);
    IO.fase = 0;
    IO.progreso = 0;
    IO.caja_empujada = false;
    IO.fotocelula1 = false;
    IO.fotocelula2 = false;
    IO.timer_fin_caja = 0;
    IO.motor_cinta = false;
  }

  start() {
    if (this.enEjecucion) return;
    if (this.etapasActivas.size === 0) this.init();
    this.enEjecucion = true;
    this.pausado = false;
    this.ultimoTiempo = performance.now();
    this.actualizarSalidas();
    this.emit();

    this.intervalo = setInterval(() => {
      const ahora = performance.now();
      const deltaTime = (ahora - this.ultimoTiempo) / 1000;
      this.ultimoTiempo = ahora;
      if (this.pausado) return;
      this.ciclo(deltaTime);
    }, 50);
  }

  pause() { this.pausado = !this.pausado; }
  stop() { this.enEjecucion = false; this.pausado = false; clearInterval(this.intervalo); IO.motor_cinta = false; this.emit(); }
  reset() { this.stop(); this.init(); this.actualizarSalidas(); this.emit(); }

  ciclo(deltaTime) {
    const total = IO.contadores.reduce((a, b) => a + b, 0);
    if (total >= IO.lote_objetivo) {
      if (!IO.lote_completo) {
        IO.lote_completo = true;
        IO.motor_cinta = false;
        this.emit();
      }
    }

    let nuevasEtapas = new Set(this.etapasActivas);
    let huboCambio = false;

    if (!IO.lote_completo) {
      GrafcetModel.transiciones.forEach(t => {
        const conexionOrigen = GrafcetModel.conexiones.find(c => c.destinoId === t.id && this.etapasActivas.has(c.origenId));

        if (conexionOrigen) {
          let resultado = false;
          if (t.condicion && t.condicion.trim() !== '') {
            const expresion = t.condicion.trim();
            if (expresion.toUpperCase() === 'TRUE') {
              resultado = true;
            } else {
              try {
                const context = {
                  fotocelula1: IO.fotocelula1,
                  fotocelula2: IO.fotocelula2,
                  forma: IO.forma,
                  color: IO.color,
                  motor_cinta: IO.motor_cinta,
                  caja_empujada: IO.caja_empujada,
                  timer_fin_caja: IO.timer_fin_caja,
                  contador: total
                };
                const evaluador = new Function(...Object.keys(context), `return ${expresion};`);
                resultado = evaluador(...Object.values(context));
              } catch (e) {
                console.warn(`Error en condición de ${t.id}: ${e.message}`);
              }
            }
          }

          if (resultado === true) {
            nuevasEtapas.delete(conexionOrigen.origenId);
            const conexionesDestino = GrafcetModel.conexiones.filter(c => c.origenId === t.id);
            conexionesDestino.forEach(cd => nuevasEtapas.add(cd.destinoId));
            huboCambio = true;
          }
        }
      });
    }

    if (huboCambio) {
      const anteriores = new Set(this.etapasActivas);
      this.etapaAnterior = anteriores;
      this.etapasActivas = nuevasEtapas;

      const inicial = GrafcetModel.etapas.find(e => e.inicial);
      const vuelveAlInicio = inicial
        && this.etapasActivas.has(inicial.id)
        && !anteriores.has(inicial.id);

      if (vuelveAlInicio) {
        this.reiniciarCaja();
      }

      this.actualizarSalidas();
      this.emit();
    }

    if (!IO.lote_completo) {
      this.actualizarFisica(deltaTime);
    }
  }

  actualizarSalidas() {
    IO.motor_cinta = false;

    this.etapasActivas.forEach(idEtapa => {
      const etapa = GrafcetModel.getElemento(idEtapa);
      if (etapa && etapa.acciones) {
        etapa.acciones.forEach(accion => {
          if (accion === 'motor_cinta=1') IO.motor_cinta = true;

          // Contadores: contadorN+1 donde N es el índice de la rama
          const match = accion.match(/^contador(\d+)\+1$/);
          if (match && !this.etapaAnterior.has(idEtapa)) {
            const idx = parseInt(match[1], 10) - 1;
            const total = IO.contadores.reduce((a, b) => a + b, 0);
            if (idx >= 0 && idx < IO.contadores.length && total < IO.lote_objetivo) {
              IO.contadores[idx]++;
            }
          }
        });
      }
    });
  }

  actualizarFisica(dt) {
    // Transiciones de fase por activación del GRAFCET
    if (IO.fase === 1 && IO.motor_cinta) {
      IO.fase = 2;
      IO.progreso = 0;
    }
    if (IO.fase === 3 && IO.motor_cinta) {
      IO.fase = 4;
      IO.progreso = 0;
    }

    // Fotocélulas
    IO.fotocelula1 = (IO.fase === 0 && IO.progreso >= 0.9) || IO.fase === 1;
    IO.fotocelula2 = (IO.fase === 2 && IO.progreso >= 0.9) || IO.fase === 3;

    // Movimiento
    if (IO.motor_cinta && !IO.caja_empujada && IO.fase !== 1 && IO.fase !== 3 && IO.fase !== 5) {
      IO.progreso += 0.4 * dt;
    }

    // Transiciones de fase automáticas
    if (IO.fase === 0 && IO.progreso >= 1) {
      IO.fase = 1;
      IO.progreso = 1;
    }
    if (IO.fase === 2 && IO.progreso >= 1) {
      IO.fase = 3;
      IO.progreso = 1;
    }
    if (IO.fase === 4 && IO.progreso >= 1) {
      IO.fase = 5;
      IO.progreso = 1;
      IO.caja_empujada = true;
    }

    // Temporizador opcional (caja espera en el contenedor)
    if (!IO.caja_empujada && IO.progreso >= 0.9) {
      IO.timer_fin_caja += dt;
      if (IO.timer_fin_caja > 1.0) {
        IO.caja_empujada = true;
      }
    }
  }
}
