export const IO = {
  // Entradas
  fotocelula: false,        
  
  // Salidas (las controla el GRAFCET)
  motor_cinta: false,
  cilindro_extendido: false,
  
  // Variables Físicas para la animación
  caja_x: 120,              // Posición X de la caja en la cinta
  caja_empujada: false,     // IMPORTANTE: Debe empezar en FALSE
  
  // Contadores
  contador: 0,
  lote_objetivo: 10,
  lote_completo: false,
  timer_cilindro: 0,
  timer_check: 0,

  reset() {
    this.fotocelula = false;
    this.motor_cinta = false;
    this.cilindro_extendido = false;
    this.caja_x = 120;
    this.caja_empujada = false;
    this.contador = 0;
    this.timer_cilindro = 0;
    this.lote_completo = false;
    this.timer_check = 0;
  }
};