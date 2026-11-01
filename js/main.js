import { renderEmpaquetadora, updateEmpaquetadora } from './scenes/empaquetadora.js';
import { crearCronometro } from './ui/cronometro.js';
import { EditorGrafcet } from './editor/editorGrafcet.js';
import { GrafcetModel } from './core/grafcetModel.js';
import { GrafcetEngine } from './core/grafcetEngine.js';
import { IO } from './core/ioModel.js';

document.addEventListener('DOMContentLoaded', () => {
  renderEmpaquetadora(document.getElementById('escena'));
  
  const cron = crearCronometro(document.getElementById('cronometro'));
  cron.start();

  const editorContainer = document.getElementById('editor');
  editorContainer.innerHTML = ''; 
  
  const editor = new EditorGrafcet(editorContainer, () => {
    actualizarMetricas();
  });

  const engine = new GrafcetEngine();
  
  engine.onUpdate(() => {
    editor.setEtapasActivas(engine.etapasActivas);
    updateEmpaquetadora();
    actualizarMetricas();
  });

  // GRAFCET DE PRUEBA (Bifurcación)
  if (GrafcetModel.etapas.length === 0) {
    // Inicio
    const e1 = GrafcetModel.agregarEtapa(100, 150, true);
    e1.acciones = ['motor_cinta=1'];
    
    // Caja Grande
    const t2 = GrafcetModel.agregarTransicion(200, 100);
    t2.condicion = 'fotocelula==true && caja_grande==true';
    const e3 = GrafcetModel.agregarEtapa(300, 50, false);
    e3.acciones = ['motor_cinta=0', 'cilindro=1'];
    const t4 = GrafcetModel.agregarTransicion(400, 100);
    t4.condicion = 'caja_empujada == true';
    const e5 = GrafcetModel.agregarEtapa(500, 50, false);
    e5.acciones = ['cilindro=0', 'contador1+1'];

    // Caja Pequeña
    const t6 = GrafcetModel.agregarTransicion(200, 200);
    t6.condicion = 'fotocelula==true && caja_grande==false';
    const e7 = GrafcetModel.agregarEtapa(300, 250, false);
    e7.acciones = ['motor_cinta=1'];
    const t8 = GrafcetModel.agregarTransicion(400, 200);
    t8.condicion = 'fotocelula==true'; // Simplificación
    const e9 = GrafcetModel.agregarEtapa(500, 250, false);
    e9.acciones = ['contador2+1'];

    // Conexiones
    GrafcetModel.agregarConexion(e1.id, t2.id);
    GrafcetModel.agregarConexion(t2.id, e3.id);
    GrafcetModel.agregarConexion(e3.id, t4.id);
    GrafcetModel.agregarConexion(t4.id, e5.id);
    GrafcetModel.agregarConexion(e5.id, e1.id); // Vuelta

    GrafcetModel.agregarConexion(e1.id, t6.id);
    GrafcetModel.agregarConexion(t6.id, e7.id);
    GrafcetModel.agregarConexion(e7.id, t8.id);
    GrafcetModel.agregarConexion(t8.id, e9.id);
    GrafcetModel.agregarConexion(e9.id, e1.id); // Vuelta

    editor.render();
  }

  document.querySelectorAll('.paleta-item').forEach(item => {
    item.addEventListener('click', () => {
      const tipo = item.getAttribute('data-tipo');
      if (tipo !== 'accion') {
        editor.agregarElemento(tipo);
        actualizarMetricas();
      }
    });
  });

  function actualizarMetricas() {
    document.getElementById('m-trans').textContent = GrafcetModel.transiciones.length;
    const activasStr = Array.from(engine.etapasActivas).join(', ');
    document.getElementById('m-ciclo').textContent = activasStr || '--';
    
    // Actualizamos los dos contadores
    document.getElementById('m-cajas').innerHTML = `C1: ${IO.contador1} | C2: ${IO.contador2}`;
    
    if (engine.enEjecucion) {
      document.getElementById('e-arranque').innerHTML = '✅ Arranque';
      document.getElementById('e-arranque').style.color = 'var(--ok)';
    } else {
      document.getElementById('e-arranque').innerHTML = '⏸ Arranque';
      document.getElementById('e-arranque').style.color = 'var(--text-muted)';
    }
  }

  document.getElementById('btn-run').addEventListener('click', () => { engine.start(); actualizarMetricas(); });
  document.getElementById('btn-pause').addEventListener('click', () => { engine.pause(); });
  document.getElementById('btn-stop').addEventListener('click', () => { engine.stop(); actualizarMetricas(); });
  document.getElementById('btn-reset').addEventListener('click', () => {
    engine.reset();
    IO.reset();
    editor.setEtapasActivas(new Set());
    updateEmpaquetadora();
    actualizarMetricas();
  });

  // JSON Guardar/Cargar
  document.getElementById('btn-exportar').addEventListener('click', () => {
    const dataStr = GrafcetModel.exportarJSON();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grafcet_clasificadora.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const fileInput = document.getElementById('file-input');
  document.getElementById('btn-importar').addEventListener('click', () => { fileInput.click(); });

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

  actualizarMetricas();
});