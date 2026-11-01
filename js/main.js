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

  // GRAFCET DE PRUEBA (Clasificación por color: rojo/azul/verde)
  if (GrafcetModel.etapas.length === 0) {
    const e1 = GrafcetModel.agregarEtapa(60, 160, true);
    e1.acciones = ['motor_cinta=1'];

    // ---- Rama 0: ROJO ----
    const t2 = GrafcetModel.agregarTransicion(130, 70);
    t2.condicion = 'fotocelula==true && caja_color==0';
    const e3 = GrafcetModel.agregarEtapa(210, 60, false);
    e3.acciones = ['motor_cinta=1'];
    const t4 = GrafcetModel.agregarTransicion(290, 70);
    t4.condicion = 'caja_empujada == true';
    const e5 = GrafcetModel.agregarEtapa(370, 60, false);
    e5.acciones = ['motor_cinta=0', 'contador1+1'];

    // ---- Rama 1: AZUL ----
    const t6 = GrafcetModel.agregarTransicion(130, 160);
    t6.condicion = 'fotocelula==true && caja_color==1';
    const e7 = GrafcetModel.agregarEtapa(210, 160, false);
    e7.acciones = ['motor_cinta=1'];
    const t8 = GrafcetModel.agregarTransicion(290, 160);
    t8.condicion = 'caja_empujada == true';
    const e9 = GrafcetModel.agregarEtapa(370, 160, false);
    e9.acciones = ['motor_cinta=0', 'contador2+1'];

    // ---- Rama 2: VERDE ----
    const t10 = GrafcetModel.agregarTransicion(130, 250);
    t10.condicion = 'fotocelula==true && caja_color==2';
    const e11 = GrafcetModel.agregarEtapa(210, 260, false);
    e11.acciones = ['motor_cinta=1'];
    const t12 = GrafcetModel.agregarTransicion(290, 250);
    t12.condicion = 'caja_empujada == true';
    const e13 = GrafcetModel.agregarEtapa(370, 260, false);
    e13.acciones = ['motor_cinta=0', 'contador3+1'];

    // Retorno común al inicio (convergencia OR de las 3 ramas)
    const t14 = GrafcetModel.agregarTransicion(450, 160);
    t14.condicion = 'TRUE';

    // Conexiones
    GrafcetModel.agregarConexion(e1.id, t2.id);
    GrafcetModel.agregarConexion(t2.id, e3.id);
    GrafcetModel.agregarConexion(e3.id, t4.id);
    GrafcetModel.agregarConexion(t4.id, e5.id);

    GrafcetModel.agregarConexion(e1.id, t6.id);
    GrafcetModel.agregarConexion(t6.id, e7.id);
    GrafcetModel.agregarConexion(e7.id, t8.id);
    GrafcetModel.agregarConexion(t8.id, e9.id);

    GrafcetModel.agregarConexion(e1.id, t10.id);
    GrafcetModel.agregarConexion(t10.id, e11.id);
    GrafcetModel.agregarConexion(e11.id, t12.id);
    GrafcetModel.agregarConexion(t12.id, e13.id);

    GrafcetModel.agregarConexion(e5.id, t14.id);
    GrafcetModel.agregarConexion(e9.id, t14.id);
    GrafcetModel.agregarConexion(e13.id, t14.id);
    GrafcetModel.agregarConexion(t14.id, e1.id);

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
    
    // Suma total de cajas
    const totalCajas = IO.contador1 + IO.contador2 + IO.contador3;
    document.getElementById('m-cajas').innerHTML = `C1: ${IO.contador1} | C2: ${IO.contador2} | C3: ${IO.contador3} (<b>${totalCajas}/10</b>)`;
    
    if (engine.enEjecucion) {
      document.getElementById('e-arranque').innerHTML = '✅ Arranque';
      document.getElementById('e-arranque').style.color = 'var(--ok)';
    } else {
      document.getElementById('e-arranque').innerHTML = '⏸ Arranque';
      document.getElementById('e-arranque').style.color = 'var(--text-muted)';
    }

    if (IO.lote_completo) {
      document.getElementById('e-contador').innerHTML = '✅ Lote completo';
      document.getElementById('e-contador').style.color = 'var(--ok)';
    } else {
      document.getElementById('e-contador').innerHTML = '⏸ En proceso';
      document.getElementById('e-contador').style.color = 'var(--text-muted)';
    }
  }

  document.getElementById('btn-run').addEventListener('click', () => { engine.start(); actualizarMetricas(); });
  document.getElementById('btn-pause').addEventListener('click', () => { engine.pause(); });
  document.getElementById('btn-stop').addEventListener('click', () => { engine.stop(); actualizarMetricas(); });
  document.getElementById('btn-reset').addEventListener('click', () => {
    IO.reset();
    engine.reset();
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
        IO.reset();
        engine.reset();
        editor.solicitarAjuste();
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