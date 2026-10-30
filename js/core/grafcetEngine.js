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
    this.condiciones = {}; // Almacena el texto de las condiciones evaluadas
  }

  onUpdate(callback) {
    this.listeners.push(callback);
  }

  emit() {
    this.listeners.forEach(cb => cb());
  }

  init() {
    // Buscar etapa inicial y activarla
    const inicial = GrafcetModel.etapas.find(e => e.inicial);
    if (inicial) {
      this.etapasActivas.clear();
      this.etapasActivas.add(inicial.id);
    }
  }

  start() {
    if (this.enEjecucion) return;
    this.enEjecucion = true;
    this.pausado = false;
    this.ultimoTiempo = performance.now();
    
    // Bucle de simulación a 20 Hz (50ms por ciclo, similar a un PLC)
    this.intervalo = setInterval(() => {
      if (this.pausado) return;
      const ahora = performance.now();
      const deltaTime = (ahora - this.ultimoTiempo) / 1000; // en segundos
      this.ultimoTiempo = ahora;
      
      this.ciclo(deltaTime);
    }, 50);
  }

  pause() {
    this.pausado = !this.pausado;
  }

  stop() {
    this.enEjecucion = false;
    this.pausado = false;
    clearInterval(this.intervalo);
    // Opcional: Resetear salidas al parar
    IO.motor_cinta = false;
    IO.cilindro_extendido = false;
    this.emit();
  }

  reset() {
    this.stop();
    this.init();
    this.emit();
  }

  // El ciclo de scan del PLC
  ciclo(deltaTime) {
    // 1. Actualizar variables físicas de la escena (movimiento de la caja)
    this.actualizarFisica(deltaTime);

    // 2. Evaluar transiciones desde las etapas activas
    let nuevasEtapas = new Set(this.etapasActivas);
    let huboCambio = false;

    GrafcetModel.transiciones.forEach(t => {
      // Si la transición parte de una etapa activa
      const conexionOrigen = GrafcetModel.conexiones.find(c => c.destinoId === t.id && this.etapasActivas.has(c.origenId));
      
      if (conexionOrigen) {
        // Evaluar condición. Por seguridad, si no hay condición escrita, asumimos FALSE.
        let resultado = false;
        if (t.condicion && t.condicion.trim() !== '') {
          try {
            // Usamos Function para evaluar variables como "fotocelula" y operadores como "&&"
            // mapeamos las variables disponibles a un contexto
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
          // La transición se dispara
          nuevasEtapas.delete(conexionOrigen.origenId);
          
          // Activar las etapas destino de esta transición
          const conexionesDestino = GrafcetModel.conexiones.filter(c => c.origenId === t.id);
          conexionesDestino.forEach(cd => nuevasEtapas.add(cd.destinoId));
          
          huboCambio = true;
          console.log(`[Scan] Transición ${t.id} disparada (${t.condicion} = TRUE)`);
        }
      }
    });

    if (huboCambio) {
      this.etapasActivas = nuevasEtapas;
      this.actualizarSalidas();
      this.emit();
    }
  }

  actualizarSalidas() {
    // Resetear salidas
    IO.motor_cinta = false;
    IO.cilindro_extendido = false;

    // Activar salidas según las etapas activas (Lógica cableada simplificada)
    // En el futuro, el alumno definirá esto en las acciones de la etapa.
    // Por ahora, mapeamos las acciones a las salidas por convención:
    // Si estamos en E1 (o la etapa activa se llama así), encendemos motor_cinta.
    // Esto es una simplificación para que funcione ya.
    
    this.etapasActivas.forEach(idEtapa => {
      // Ejemplo de lógica hardcodeada para el ejercicio:
      // E1 enciende la cinta, E2 extiende el cilindro...
      // En el paso 4 esto se leerá del modelo de datos (acciones).
      if (idEtapa === 'E1') IO.motor_cinta = true;
      if (idEtapa === 'E2') IO.cilindro_extendido = true; // Suponiendo que E2 es la etapa de empuje
      // Si el alumno usa otros IDs, no se moverá, pero es un test.
    });
  }

  actualizarFisica(dt) {
    // Movimiento de la caja
    if (IO.motor_cinta && !IO.caja_empujada) {
      IO.caja_x += 100 * dt; // Velocidad de 100px/seg
      if (IO.caja_x >= 340) { // Límite de la fotocélula
        IO.caja_x = 340;
        IO.fotocelula = true;
      } else {
        IO.fotocelula = false;
      }
    }

    // Movimiento del cilindro (empuje)
    // Si el cilindro se extiende y la caja está en posición, la empujamos
    if (IO.cilindro_extendido && IO.caja_x >= 300 && !IO.caja_empujada) {
       IO.caja_x += 150 * dt; // Vuela hacia la bandeja
       if (IO.caja_x > 520) {
         IO.caja_empujada = true;
         IO.contador++;
         console.log("Caja empujada. Total:", IO.contador);
         if (IO.contador >= IO.lote_objetivo) IO.lote_completo = true;
       }
    }
  }
}