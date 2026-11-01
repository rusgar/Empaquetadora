export const IO = {
  // Entradas
  fotocelula1: false, // Fotocélula del desviador 1 (por forma)
  fotocelula2: false, // Fotocélula del desviador 2 (por color)
  forma: 0,            // 0 = caja, 1 = triángulo, 2 = círculo
  color: 0,            // 0 = rojo, 1 = azul, 2 = verde, 3 = amarillo, 4 = morado

  // Salidas
  motor_cinta: false,

  // Físicas
  fase: 0,             // 0=principal, 1=unión1, 2=secundaria, 3=unión2, 4=terciaria, 5=fin
  progreso: 0,         // 0..1 dentro de la fase actual
  caja_empujada: false,
  timer_fin_caja: 0,

  // Contadores: [forma][color] -> índice = forma*5 + color
  contadores: new Array(15).fill(0),
  lote_objetivo: 15,
  lote_completo: false,

  reset() {
    this.fotocelula1 = false;
    this.fotocelula2 = false;
    this.forma = Math.floor(Math.random() * 3);
    this.color = Math.floor(Math.random() * 5);
    this.motor_cinta = false;
    this.fase = 0;
    this.progreso = 0;
    this.caja_empujada = false;
    this.timer_fin_caja = 0;
    this.contadores = new Array(15).fill(0);
    this.lote_completo = false;
  }
};