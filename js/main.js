import { renderEmpaquetadora } from './scenes/empaquetadora.js';
import { crearCronometro } from './ui/cronometro.js';
import { EditorGrafcet } from './editor/editorGrafcet.js';
import { GrafcetModel } from './core/grafcetModel.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Escena
  renderEmpaquetadora(document.getElementById('escena'));

  // 2. Cronómetro
  const cron = crearCronometro(document.getElementById('cronometro'));
  cron.start();

  // 3. Editor GRAFCET
  const editorContainer = document.getElementById('editor');
  // Quitamos el placeholder
  editorContainer.innerHTML = ''; 
  
  const editor = new EditorGrafcet(editorContainer, () => {
    actualizarMetricas();
  });

  // 4. Conectar Paleta con Editor
  document.querySelectorAll('.paleta-item').forEach(item => {
    item.addEventListener('click', () => {
      const tipo = item.getAttribute('data-tipo');
      if (tipo !== 'accion') { // La acción la trataremos más adelante
        editor.agregarElemento(tipo);
        actualizarMetricas();
      }
    });
  });

  // 5. Actualizar métricas básicas
  function actualizarMetricas() {
    document.getElementById('m-trans').textContent = GrafcetModel.transiciones.length;
    // En el futuro calcularemos la etapa activa real
    document.getElementById('m-ciclo').textContent = GrafcetModel.etapas.length > 0 ? GrafcetModel.etapas[0].id : '--';
  }

  // 6. Botones de la barra inferior
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
      console.log(`[Paso 2] Botón pulsado: ${nombre}`);
    });
  });

  console.log('[Paso 2] Editor GRAFCET cargado.');
});