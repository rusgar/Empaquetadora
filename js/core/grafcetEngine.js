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
      IO.timer_cilindro = 0;
      IO.timer_fin_caja = 0;
      IO.caja_grande = Math.random() > 0.5; // La primera caja también es aleatoria
    }
  }

  // Prepara una caja nueva al volver a la etapa inicial
  reiniciarCaja() {
    IO.caja_empujada = false;
    IO.caja_x = 120;
    IO.fotocelula = false;
    IO.caja_grande = Math.random() > 0.5;
    IO.timer_fin_caja = 0;
    IO.timer_cilindro = 0;
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
  stop() { this.enEjecucion = false; this.pausado = false; clearInterval(this.intervalo); IO.motor_cinta = false; IO.cilindro_extendido = false; this.emit(); }
  reset() { this.stop(); this.init(); this.actualizarSalidas(); this.emit(); }

  ciclo(deltaTime) {
    // Si ya hemos procesado 10 cajas, detenemos la máquina
    if (IO.contador1 + IO.contador2 >= IO.lote_objetivo) {
        if (!IO.lote_completo) {
          IO.lote_completo = true;
          IO.motor_cinta = false;
          IO.cilindro_extendido = false;
          this.emit(); // Refresca la interfaz (Lote completo)
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
                // Condición permanente (equivale a "siempre")
                resultado = true;
            } else {
            try {
                const context = {
                fotocelula: IO.fotocelula,
                caja_grande: IO.caja_grande,
                motor_cinta: IO.motor_cinta,
                cilindro_extendido: IO.cilindro_extendido,
                contador1: IO.contador1,
                contador2: IO.contador2,
                timer_cilindro: IO.timer_cilindro,
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

      // Al volver a la etapa inicial se genera una caja nueva
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
    IO.cilindro_extendido = false;

    this.etapasActivas.forEach(idEtapa => {
      const etapa = GrafcetModel.getElemento(idEtapa);
      if (etapa && etapa.acciones) {
        etapa.acciones.forEach(accion => {
          if (accion === 'motor_cinta=1') IO.motor_cinta = true;
          if (accion === 'cilindro=1') IO.cilindro_extendido = true;
          
          if (accion === 'contador1+1' && !this.etapaAnterior.has(idEtapa)) {
             if (IO.contador1 + IO.contador2 < IO.lote_objetivo) IO.contador1++;
          }
          if (accion === 'contador2+1' && !this.etapaAnterior.has(idEtapa)) {
             if (IO.contador1 + IO.contador2 < IO.lote_objetivo) IO.contador2++;
          }
        });
      }
    });
  }

  actualizarFisica(dt) {
    // Movimiento de la cinta principal (hasta el pistón)
    if (IO.motor_cinta && !IO.caja_empujada && IO.caja_x < 400) {
      IO.caja_x += 60 * dt;
    }

    // Fotocélula: ventana de detección delante del pistón
    IO.fotocelula = IO.caja_x >= 340 && IO.caja_x < 360;

    // Caja GRANDE: el pistón la empuja hacia el contenedor azul
    if (IO.cilindro_extendido && IO.caja_grande && !IO.caja_empujada) {
      IO.timer_cilindro += dt;
      if (IO.caja_x >= 340) {
        IO.caja_x += 100 * dt;
        if (IO.caja_x >= 520) {
          IO.caja_x = 520;
          IO.caja_empujada = true;
        }
      }
    } else {
      IO.timer_cilindro = 0;
    }

    // Caja PEQUEÑA: llega al final de la cinta y se contabiliza tras 1 s
    if (!IO.caja_grande && !IO.caja_empujada && IO.caja_x >= 400) {
      IO.timer_fin_caja += dt;
      if (IO.timer_fin_caja > 1.0) {
        IO.caja_empujada = true;
      }
    }
  }
}