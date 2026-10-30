// Modelo de E/S de la escena. Por ahora solo define variables;
// la lógica de actualización llega en el Paso 3 (motor + escena animada).
export const IO = {
  // Entradas
  fotocelula: false,        // caja detectada por la fotocélula
  caja_en_posicion: false,  // caja lista para ser empujada
  // Salidas
  motor_cinta: false,
  cilindro_extendido: false,
  // Contadores / estado
  contador: 0,
  lote_completo: false,
  lote_objetivo: 10,
};