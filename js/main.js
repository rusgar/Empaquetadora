import { renderEmpaquetadora } from './scenes/empaquetadora.js';
import { crearCronometro } from './ui/cronometro.js';

document.addEventListener('DOMContentLoaded', () => {
  // Escena
  renderEmpaquetadora(document.getElementById('escena'));

  // Cronómetro
  const cron = crearCronometro(document.getElementById('cronometro'));
  cron.start();

  // Botones (sin lógica todavía, solo feedback en consola)
  const acciones = {
    'btn-run': 'RUN',
    'btn-pause': 'PAUSE',
    'btn-stop': 'STOP',
    'btn-reset': 'RESET',
    'btn-paso': 'PASO',
    'btn-entregar': 'ENTREGAR',
    'btn-docente': 'DOCENTE',
  };
  Object.entries(acciones).forEach(([id, nombre]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => {
      console.log(`[Paso 1] Botón pulsado: ${nombre}`);
    });
  });

  console.log('[Paso 1] Dashboard cargado. Escena y cronómetro listos.');
});