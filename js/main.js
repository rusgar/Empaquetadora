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
  
  engine.onUpdate(() => {
    editor.setEtapasActivas(engine.etapasActivas);
    updateEmpaquetadora();
    actualizarMetricas();
  });

  // 5. TRUCO DE DESARROLLO: Cargar GRAFCET de prueba si está vacío
    // 5. TRUCO DE DESARROLLO: Cargar GRAFCET de prueba si está vacío
  if (GrafcetModel.etapas.length === 0) {
    const e1 = GrafcetModel.agregarEtapa(100, 120, true);
    e1.acciones = ['motor_cinta=1'];
    
    const e3 = GrafcetModel.agregarEtapa(300, 120, false);
    e3.acciones = ['motor_cinta=0', 'cilindro=1'];
    
    const e5 = GrafcetModel.agregarEtapa(500, 120, false);
    e5.acciones = ['cilindro=0', 'contador+1'];

    const t2 = GrafcetModel.agregarTransicion(200, 170);
    t2.condicion = 'fotocelula==true';
    
    const t4 = GrafcetModel.agregarTransicion(400, 170);
     t4.condicion = 'caja_empujada == true'; 
    
    const t6 = GrafcetModel.agregarTransicion(600, 170);
    t6.condicion = 'contador<10';

    GrafcetModel.agregarConexion(e1.id, t2.id);
    GrafcetModel.agregarConexion(t2.id, e3.id);
    GrafcetModel.agregarConexion(e3.id, t4.id);
    GrafcetModel.agregarConexion(t4.id, e5.id);
    GrafcetModel.agregarConexion(e5.id, t6.id);
    GrafcetModel.agregarConexion(t6.id, e1.id);

    editor.render();
  }

  // 6. Conectar Paleta
  document.querySelectorAll('.paleta-item').forEach(item => {
    item.addEventListener('click', () => {
      const tipo = item.getAttribute('data-tipo');
      if (tipo !== 'accion') {
        editor.agregarElemento(tipo);
        actualizarMetricas();
      }
    });
  });

  // 7. Actualizar métricas
  function actualizarMetricas() {
    document.getElementById('m-trans').textContent = GrafcetModel.transiciones.length;
    
    const activasStr = Array.from(engine.etapasActivas).join(', ');
    document.getElementById('m-ciclo').textContent = activasStr || '--';
    
    document.getElementById('m-cajas').textContent = `${IO.contador} / ${IO.lote_objetivo}`;
    
    if (engine.enEjecucion) {
      document.getElementById('e-arranque').innerHTML = '✅ Arranque';
      document.getElementById('e-arranque').style.color = 'var(--ok)';
    } else {
      document.getElementById('e-arranque').innerHTML = '⏸ Arranque';
      document.getElementById('e-arranque').style.color = 'var(--text-muted)';
    }

    // Validación del Contador
    if (IO.contador >= 10) {
      document.getElementById('e-contador').innerHTML = '✅ Contador 10 (Lote completo)';
      document.getElementById('e-contador').style.color = 'var(--ok)';
    } else {
      document.getElementById('e-contador').innerHTML = '⏸ Contador 10';
      document.getElementById('e-contador').style.color = 'var(--text-muted)';
    }
  }

  // 8. Botones
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
    editor.setEtapasActivas(new Set());
    updateEmpaquetadora();
    actualizarMetricas();
  });

  // Inicializar
  actualizarMetricas();
  console.log('[Desarrollo] Todo listo. GRAFCET de prueba cargado.');
    // --- LÓGICA GUARDAR Y CARGAR (PASO 5) ---
  document.getElementById('btn-exportar').addEventListener('click', () => {
    const dataStr = GrafcetModel.exportarJSON();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grafcet_empaquetadora.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const fileInput = document.getElementById('file-input');
  document.getElementById('btn-importar').addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const exito = GrafcetModel.importarJSON(event.target.result);
      if (exito) {
        engine.reset(); 
        IO.reset();
        editor.render(); 
        editor.setEtapasActivas(new Set());
        updateEmpaquetadora();
        actualizarMetricas();
        alert("✅ GRAFCET cargado correctamente.");
      } else {
        alert("❌ Error al leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
    fileInput.value = ''; 
  });

});