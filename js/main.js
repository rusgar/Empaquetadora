import { renderEmpaquetadora, updateEmpaquetadora } from './scenes/empaquetadora.js';
import { crearCronometro } from './ui/cronometro.js';
import { EditorGrafcet } from './editor/editorGrafcet.js';
import { GrafcetModel } from './core/grafcetModel.js';
import { GrafcetEngine } from './core/grafcetEngine.js';
import { IO } from './core/ioModel.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Escena
  renderEmpaquetadora(document.getElementById('escena'));

  // 2. Cronómetro
  const cron = crearCronometro(document.getElementById('cronometro'));
  cron.start();

  // 3. Editor GRAFCET
  const editorContainer = document.getElementById('editor');
  editorContainer.innerHTML = ''; 
  
  const editor = new EditorGrafcet(editorContainer, () => {
    actualizarMetricas();
  });

  // 4. Motor de Simulación
  const engine = new GrafcetEngine();
  
  // Suscribirse a las actualizaciones del motor
  engine.onUpdate(() => {
    editor.setEtapasActivas(engine.etapasActivas);
    updateEmpaquetadora();
    actualizarMetricas();
  });

  // 5. Conectar Paleta
  document.querySelectorAll('.paleta-item').forEach(item => {
    item.addEventListener('click', () => {
      const tipo = item.getAttribute('data-tipo');
      if (tipo !== 'accion') {
        editor.agregarElemento(tipo);
        actualizarMetricas();
      }
    });
  });

  // 6. Actualizar métricas
  function actualizarMetricas() {
    document.getElementById('m-trans').textContent = GrafcetModel.transiciones.length;
    
    // Mostrar etapas activas
    const activasStr = Array.from(engine.etapasActivas).join(', ');
    document.getElementById('m-ciclo').textContent = activasStr || '--';
    
    // Contador
    document.getElementById('m-cajas').textContent = `${IO.contador} / ${IO.lote_objetivo}`;
    
    // Estados de validación (se irán afinando)
    document.getElementById('e-arranque').innerHTML = engine.enEjecucion ? '✅ Arranque' : '⏸ Arranque';
  }

  // 7. Botones
  document.getElementById('btn-run').addEventListener('click', () => {
    engine.start();
    actualizarMetricas();
  });
  
  document.getElementById('btn-pause').addEventListener('click', () => {
    engine.pause();
  });

  document.getElementById('btn-stop').addEventListener('click', () => {
    engine.stop();
    actualizarMetricas();
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    engine.reset();
    IO.reset();
    editor.setEtapasActivas(new Set()); // Limpiar visual
    updateEmpaquetadora();
    actualizarMetricas();
  });

  // Inicializar
  actualizarMetricas();
  console.log('[Paso 3] Motor listo.');
});