import { GrafcetModel } from './grafcetModel.js';
import { IO } from './ioModel.js';

export class GrafcetEngine {
  constructor() {
    this.etapasActivas = new Set();
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
    }
  }

  start() {
    if (this.enEjecucion) return;
    if (this.etapasActivas.size === 0) this.init();
    
    this.enEjecucion = true;
    this.pausado = false;
    this.ultimoTiempo = performance.now();
    
    // Forzamos actualización instantánea
    this.actualizarSalidas();
    this.emit();

    this.intervalo = setInterval(() => {
      if (this.pausado) return;
      const ahora = performance.now();
      const deltaTime = (ahora - this.ultimoTiempo) / 1000;
      this.ultimoTiempo = ahora;
      this.ciclo(deltaTime);
    }, 50);
  }

  pause() { this.pausado = !this.pausado; }

  stop() {
    this.enEjecucion = false;
    this.pausado = false;
    clearInterval(this.intervalo);
    IO.motor_cinta = false;
    IO.cilindro_extendido = false;
    this.emit();
  }

  reset() {
    this.stop();
    this.init();
    this.actualizarSalidas();
    this.emit();
  }

  ciclo(deltaTime) {
    let nuevasEtapas = new Set(this.etapasActivas);
    let huboCambio = false;

    GrafcetModel.transiciones.forEach(t => {
      const conexionOrigen = GrafcetModel.conexiones.find(c => c.destinoId === t.id && this.etapasActivas.has(c.origenId));
      
      if (conexionOrigen) {
        let resultado = false;
        if (t.condicion && t.condicion.trim() !== '') {
          try {
            const context = {
              fotocelula: IO.fotocelula,
              motor_cinta: IO.motor_cinta,
              cilindro_extendido: IO.cilindro_extendido,
              contador: IO.contador
            };
            const evaluador = new Function(...Object.keys(context), `return ${t.condicion};`);
            resultado = evaluador(...Object.values(context));
          } catch (e) {
            console.warn(`Error en condición de ${t.id}: ${e.message}`);
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

    if (huboCambio) {
      this.etapasActivas = nuevasEtapas;
      this.actualizarSalidas();
      this.emit();
    }

    this.actualizarFisica(deltaTime);
  }

  actualizarSalidas() {
    IO.motor_cinta = false;
    IO.cilindro_extendido = false;

    this.etapasActivas.forEach(idEtapa => {
      const etapa = GrafcetModel.getElemento(idEtapa);
      // AQUÍ LEEMOS LO QUE EL ALUMNO ESCRIBE EN EL PANEL
      if (etapa && etapa.acciones) {
        etapa.acciones.forEach(accion => {
          if (accion === 'motor_cinta=1') IO.motor_cinta = true;
          if (accion === 'cilindro=1') IO.cilindro_extendido = true;
          if (accion === 'contador+1') IO.contador++; 
        });
      }
    });
  }

  actualizarFisica(dt) {
    if (IO.motor_cinta && !IO.caja_empujada && IO.caja_x < 340) {
      IO.caja_x += 120 * dt; 
      if (IO.caja_x >= 340) {
        IO.caja_x = 340;
        IO.fotocelula = true; 
      }
    } else if (!IO.motor_cinta && IO.caja_x < 340) {
        IO.fotocelula = false;
    }

    if (IO.cilindro_extendido && IO.caja_x >= 300 && !IO.caja_empujada) {
       IO.caja_x += 200 * dt; 
       if (IO.caja_x > 520) {
         IO.caja_empujada = true; 
       }
    }
  }
}