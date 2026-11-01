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

  // GRAFCET DE EJEMPLO (Sistema completo: 3 formas × 3 colores)
  // Se carga solo con el botón DOCENTE, no al iniciar. El alumno empieza vacío.
  function cargarGrafcetEjemplo() {
    GrafcetModel.etapas = [];
    GrafcetModel.transiciones = [];
    GrafcetModel.conexiones = [];
    GrafcetModel._nextId = 1;
    const e1 = GrafcetModel.agregarEtapa(60, 400, true);
    e1.acciones = ['motor_cinta=1'];

    // ---- FORMA 0: CAJA (pasa por desviador 2 de color) ----
    const t2 = GrafcetModel.agregarTransicion(130, 300);
    t2.condicion = 'fotocelula1==true && forma==0';
    const e3 = GrafcetModel.agregarEtapa(210, 280, false);
    e3.acciones = ['motor_cinta=1'];

    const t4 = GrafcetModel.agregarTransicion(290, 300);
    t4.condicion = 'fotocelula2==true && color==0';
    const e5 = GrafcetModel.agregarEtapa(370, 260, false);
    e5.acciones = ['motor_cinta=1', 'contador1+1'];

    const t6 = GrafcetModel.agregarTransicion(290, 400);
    t6.condicion = 'fotocelula2==true && color==1';
    const e7 = GrafcetModel.agregarEtapa(370, 400, false);
    e7.acciones = ['motor_cinta=1', 'contador2+1'];

    const t8 = GrafcetModel.agregarTransicion(290, 500);
    t8.condicion = 'fotocelula2==true && color==2';
    const e9 = GrafcetModel.agregarEtapa(370, 540, false);
    e9.acciones = ['motor_cinta=1', 'contador3+1'];

    // ---- FORMA 1: TRIÁNGULO (desviador 2 por color) ----
    const t10 = GrafcetModel.agregarTransicion(130, 500);
    t10.condicion = 'fotocelula1==true && forma==1';
    const e11 = GrafcetModel.agregarEtapa(210, 480, false);
    e11.acciones = ['motor_cinta=1'];

    const t12 = GrafcetModel.agregarTransicion(290, 460);
    t12.condicion = 'fotocelula2==true && color==0';
    const e13 = GrafcetModel.agregarEtapa(370, 440, false);
    e13.acciones = ['motor_cinta=1', 'contador4+1'];

    const t14 = GrafcetModel.agregarTransicion(290, 500);
    t14.condicion = 'fotocelula2==true && color==1';
    const e15 = GrafcetModel.agregarEtapa(370, 500, false);
    e15.acciones = ['motor_cinta=1', 'contador5+1'];

    const t16 = GrafcetModel.agregarTransicion(290, 540);
    t16.condicion = 'fotocelula2==true && color==2';
    const e17 = GrafcetModel.agregarEtapa(370, 580, false);
    e17.acciones = ['motor_cinta=1', 'contador6+1'];

    // ---- FORMA 2: CÍRCULO (desviador 2 por color) ----
    const t18 = GrafcetModel.agregarTransicion(130, 620);
    t18.condicion = 'fotocelula1==true && forma==2';
    const e19 = GrafcetModel.agregarEtapa(210, 660, false);
    e19.acciones = ['motor_cinta=1'];

    const t20 = GrafcetModel.agregarTransicion(290, 600);
    t20.condicion = 'fotocelula2==true && color==0';
    const e21 = GrafcetModel.agregarEtapa(370, 580, false);
    e21.acciones = ['motor_cinta=1', 'contador7+1'];

    const t22 = GrafcetModel.agregarTransicion(290, 640);
    t22.condicion = 'fotocelula2==true && color==1';
    const e23 = GrafcetModel.agregarEtapa(370, 640, false);
    e23.acciones = ['motor_cinta=1', 'contador8+1'];

    const t24 = GrafcetModel.agregarTransicion(290, 680);
    t24.condicion = 'fotocelula2==true && color==2';
    const e25 = GrafcetModel.agregarEtapa(370, 720, false);
    e25.acciones = ['motor_cinta=1', 'contador9+1'];

    // Retornos al inicio (convergencia OR)
    const t26 = GrafcetModel.agregarTransicion(450, 160);
    t26.condicion = 'caja_empujada == true';
    const t27 = GrafcetModel.agregarTransicion(450, 200);
    t27.condicion = 'caja_empujada == true';
    const t28 = GrafcetModel.agregarTransicion(450, 280);
    t28.condicion = 'caja_empujada == true';
    const t29 = GrafcetModel.agregarTransicion(450, 390);
    t29.condicion = 'caja_empujada == true';
    const t30 = GrafcetModel.agregarTransicion(450, 440);
    t30.condicion = 'caja_empujada == true';
    const t31 = GrafcetModel.agregarTransicion(450, 500);
    t31.condicion = 'caja_empujada == true';
    const t32 = GrafcetModel.agregarTransicion(450, 580);
    t32.condicion = 'caja_empujada == true';
    const t33 = GrafcetModel.agregarTransicion(450, 640);
    t33.condicion = 'caja_empujada == true';
    const t34 = GrafcetModel.agregarTransicion(450, 720);
    t34.condicion = 'caja_empujada == true';

    // Conexiones (forma 0: caja)
    GrafcetModel.agregarConexion(e1.id, t2.id);
    GrafcetModel.agregarConexion(t2.id, e3.id);
    GrafcetModel.agregarConexion(e3.id, t4.id);
    GrafcetModel.agregarConexion(t4.id, e5.id);
    GrafcetModel.agregarConexion(e3.id, t6.id);
    GrafcetModel.agregarConexion(t6.id, e7.id);
    GrafcetModel.agregarConexion(e3.id, t8.id);
    GrafcetModel.agregarConexion(t8.id, e9.id);

    // Forma 1: triángulo
    GrafcetModel.agregarConexion(e1.id, t10.id);
    GrafcetModel.agregarConexion(t10.id, e11.id);
    GrafcetModel.agregarConexion(e11.id, t12.id);
    GrafcetModel.agregarConexion(t12.id, e13.id);
    GrafcetModel.agregarConexion(e11.id, t14.id);
    GrafcetModel.agregarConexion(t14.id, e15.id);
    GrafcetModel.agregarConexion(e11.id, t16.id);
    GrafcetModel.agregarConexion(t16.id, e17.id);

    // Forma 2: círculo
    GrafcetModel.agregarConexion(e1.id, t18.id);
    GrafcetModel.agregarConexion(t18.id, e19.id);
    GrafcetModel.agregarConexion(e19.id, t20.id);
    GrafcetModel.agregarConexion(t20.id, e21.id);
    GrafcetModel.agregarConexion(e19.id, t22.id);
    GrafcetModel.agregarConexion(t22.id, e23.id);
    GrafcetModel.agregarConexion(e19.id, t24.id);
    GrafcetModel.agregarConexion(t24.id, e25.id);

    // Retornos
    GrafcetModel.agregarConexion(e5.id, t26.id);
    GrafcetModel.agregarConexion(e7.id, t27.id);
    GrafcetModel.agregarConexion(e9.id, t28.id);
    GrafcetModel.agregarConexion(e13.id, t29.id);
    GrafcetModel.agregarConexion(e15.id, t30.id);
    GrafcetModel.agregarConexion(e17.id, t31.id);
    GrafcetModel.agregarConexion(e21.id, t32.id);
    GrafcetModel.agregarConexion(e23.id, t33.id);
    GrafcetModel.agregarConexion(e25.id, t34.id);

    GrafcetModel.agregarConexion(t26.id, e1.id);
    GrafcetModel.agregarConexion(t27.id, e1.id);
    GrafcetModel.agregarConexion(t28.id, e1.id);
    GrafcetModel.agregarConexion(t29.id, e1.id);
    GrafcetModel.agregarConexion(t30.id, e1.id);
    GrafcetModel.agregarConexion(t31.id, e1.id);
    GrafcetModel.agregarConexion(t32.id, e1.id);
    GrafcetModel.agregarConexion(t33.id, e1.id);
    GrafcetModel.agregarConexion(t34.id, e1.id);

    editor.render();
  }

  // Botón DOCENTE: carga el GRAFCET de ejemplo completo
  document.getElementById('btn-docente').addEventListener('click', () => {
    cargarGrafcetEjemplo();
    IO.reset();
    engine.reset();
    editor.setEtapasActivas(new Set());
    updateEmpaquetadora();
    actualizarMetricas();
    // alert('✅ GRAFCET de ejemplo (docente) cargado.');
  });

  // Botón ENTREGAR: exporta el trabajo del alumno
  document.getElementById('btn-entregar').addEventListener('click', () => {
    const dataStr = GrafcetModel.exportarJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grafcet_alumno.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Pestañas: alternar entre Escena y Editor
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('panel-' + btn.dataset.tab);
      if (panel) panel.classList.add('active');
      if (btn.dataset.tab === 'editor') {
        editor.solicitarAjuste();
        editor.render();
        editor.setEtapasActivas(engine.etapasActivas);
      } else {
        updateEmpaquetadora();
      }
    });
  });

  document.getElementById('btn-zoom-in').addEventListener('click', () => { editor.zoomIn(); });
  document.getElementById('btn-zoom-out').addEventListener('click', () => { editor.zoomOut(); });
  document.getElementById('btn-zoom-fit').addEventListener('click', () => { editor.fitView(); });

  // Zoom de la escena
  let sceneScale = 1.5;
  const sceneSvg = () => document.querySelector('#escena svg');
  const applySceneScale = () => {
    const svg = sceneSvg();
    if (svg) svg.style.transform = `scale(${sceneScale})`;
  };
  document.getElementById('btn-scene-zoom-in').addEventListener('click', () => { sceneScale = Math.min(3, sceneScale * 1.25); applySceneScale(); });
  document.getElementById('btn-scene-zoom-out').addEventListener('click', () => { sceneScale = Math.max(0.5, sceneScale * 0.8); applySceneScale(); });
  document.getElementById('btn-scene-zoom-fit').addEventListener('click', () => { sceneScale = 1.5; applySceneScale(); });

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
    const totalCajas = IO.contadores.reduce((a, b) => a + b, 0);
    document.getElementById('m-cajas').innerHTML = `C1:${IO.contadores[0]} C2:${IO.contadores[1]} C3:${IO.contadores[2]} C4:${IO.contadores[3]} C5:${IO.contadores[4]} C6:${IO.contadores[5]} C7:${IO.contadores[6]} C8:${IO.contadores[7]} C9:${IO.contadores[8]} (<b>${totalCajas}/10</b>)`;
    
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