export const IO = {
  // Entradas
  fotocelula: false,
  caja_grande: false, // <-- NUEVO: Indica si la caja actual es grande
  
  // Salidas
  motor_cinta: false,
  cilindro_extendido: false,
  
  // Físicas
  caja_x: 120,              
  caja_empujada: false,     
  
  // Contadores
  contador1: 0, // Cajas grandes (Caja 1)
  contador2: 0, // Cajas pequeñas (Caja 2)
  lote_objetivo: 10,
  lote_completo: false,
  timer_cilindro: 0,
  timer_check: 0,

  reset() {
    this.fotocelula = false;
    this.caja_grande = false;
    this.motor_cinta = false;
    this.cilindro_extendido = false;
    this.caja_x = 120;
    this.caja_empujada = false;
    this.contador1 = 0;
    this.contador2 = 0;
    this.lote_completo = false;
    this.timer_cilindro = 0;
    this.timer_check = 0;
  }
};