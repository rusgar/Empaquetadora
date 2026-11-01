export const IO = {
  // Entradas
  fotocelula: false,
  caja_color: 0, // 0 = rojo, 1 = azul, 2 = verde
  caja_grande: false, // Derivado de caja_color (rojo = grande)

  // Salidas
  motor_cinta: false,

  // Físicas
  caja_x: 0, // 0..1: 0-0.3 cinta principal, 0.3-1.0 rama seleccionada
  caja_empujada: false,

  // Contadores (uno por rama/color)
  contador1: 0, // Rama 0 (rojo)
  contador2: 0, // Rama 1 (azul)
  contador3: 0, // Rama 2 (verde)
  lote_objetivo: 10,
  lote_completo: false,
  timer_fin_caja: 0,

  reset() {
    this.fotocelula = false;
    this.caja_color = Math.floor(Math.random() * 3);
    this.caja_grande = (this.caja_color === 0);
    this.motor_cinta = false;
    this.caja_x = 0;
    this.caja_empujada = false;
    this.contador1 = 0;
    this.contador2 = 0;
    this.contador3 = 0;
    this.lote_completo = false;
    this.timer_fin_caja = 0;
  }
};