// Modelo de E/S de la escena. Por ahora solo define variables;
// la lógica de actualización llega en el Paso 3 (motor + escena animada).
export const IO = {
  // Entradas
  fotocelula: false,        // Caja detectada por la fotocélula
  
  // Salidas (las controla el GRAFCET)
  motor_cinta: false,
  cilindro_extendido: false,
  
  // Variables Físicas para la animación
  caja_x: 120,              // Posición X de la caja en la cinta
  caja_empujada: false,     // Si ya está en la bandeja
  
  // Contadores
  contador: 0,
  lote_objetivo: 10,
  lote_completo: false,

  reset() {
    this.fotocelula = false;
    this.motor_cinta = false;
    this.cilindro_extendido = false;
    this.caja_x = 120;
    this.caja_empujada = false;
    this.contador = 0;
    this.lote_completo = false;
  }
};