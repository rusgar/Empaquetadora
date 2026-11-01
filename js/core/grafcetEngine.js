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
      IO.caja_color = Math.floor(Math.random() * 3);
      IO.caja_grande = (IO.caja_color === 0);
      IO.caja_x = 0;
      IO.caja_empujada = false;
      IO.fotocelula = false;
      IO.timer_fin_caja = 0;
      IO.motor_cinta = false;
    }
  }

  // Prepara una caja nueva al volver a la etapa inicial
  reiniciarCaja() {
    IO.caja_color = Math.floor(Math.random() * 3);
    IO.caja_grande = (IO.caja_color === 0);
    IO.caja_x = 0;
    IO.caja_empujada = false;
    IO.fotocelula = false;
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
    // Si ya hemos procesado 10 cajas, detenemos la máquina
    if (IO.contador1 + IO.contador2 + IO.contador3 >= IO.lote_objetivo) {
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
                  fotocelula: IO.fotocelula,
                  caja_color: IO.caja_color,
                  caja_grande: IO.caja_grande,
                  motor_cinta: IO.motor_cinta,
                  contador1: IO.contador1,
                  contador2: IO.contador2,
                  contador3: IO.contador3,
                  caja_empujada: IO.caja_empujada,
                  timer_fin_caja: IO.timer_fin_caja
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

          if (accion === 'contador1+1' && !this.etapaAnterior.has(idEtapa)) {
            if (IO.contador1 + IO.contador2 + IO.contador3 < IO.lote_objetivo) IO.contador1++;
          }
          if (accion === 'contador2+1' && !this.etapaAnterior.has(idEtapa)) {
            if (IO.contador1 + IO.contador2 + IO.contador3 < IO.lote_objetivo) IO.contador2++;
          }
          if (accion === 'contador3+1' && !this.etapaAnterior.has(idEtapa)) {
            if (IO.contador1 + IO.contador2 + IO.contador3 < IO.lote_objetivo) IO.contador3++;
          }
        });
      }
    });
  }

  actualizarFisica(dt) {
    // Fotocélula: ventana de detección en la unión
    IO.fotocelula = IO.caja_x >= 0.25 && IO.caja_x < 0.35;

    // Movimiento de la caja
    if (IO.motor_cinta && !IO.caja_empujada) {
      IO.caja_x += 0.3 * dt;
    }

    // Llegada al final de la rama
    if (IO.caja_x >= 0.95) {
      IO.caja_empujada = true;
    }

    // Temporizador opcional (caja espera en el contenedor)
    if (!IO.caja_empujada && IO.caja_x >= 0.3) {
      IO.timer_fin_caja += dt;
      if (IO.timer_fin_caja > 1.0) {
        IO.caja_empujada = true;
      }
    }
  }
}
