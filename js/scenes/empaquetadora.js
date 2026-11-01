import { IO } from '../core/ioModel.js';

export function renderEmpaquetadora(container) {
  // Escena más grande (viewBox más pequeño = más zoom)
  container.innerHTML = `
    <svg id="svg-escena" viewBox="0 0 600 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Suelo -->
      <polygon points="300,20 580,160 300,300 20,160" fill="#1e293b" />
      
      <!-- Cinta Principal -->
      <polygon points="150,160 300,85 450,160 300,235" fill="#334155" stroke="#475569" stroke-width="2" />
      
      <!-- Cinta Izquierda (Grandes - Azul) -->
      <polygon points="225,197 175,222 125,197 175,172" fill="#334155" stroke="#475569" stroke-width="2" />
      
      <!-- Cinta Derecha (Pequeñas - Amarillo) -->
      <polygon points="375,197 425,222 475,197 425,172" fill="#334155" stroke="#475569" stroke-width="2" />

      <!-- Fotocélula -->
      <rect x="290" y="140" width="20" height="4" fill="#38bdf8" transform="rotate(-26.5 300 142)"/>
      
      <!-- Pistón -->
      <g id="piston" transform="translate(300, 85)">
         <rect x="-10" y="0" width="20" height="30" fill="#64748b" rx="4"/>
         <rect id="vastago" x="-3" y="30" width="6" height="20" fill="#94a3b8"/>
      </g>

      <!-- Contenedor Izquierdo (Grandes - Azul) -->
      <g id="contenedor-azul" transform="translate(80, 160)">
        <polygon points="0,40 40,60 80,40 40,20" fill="#0f172a" stroke="#3b82f6" stroke-width="2"/>
        <text x="40" y="75" fill="#3b82f6" font-size="12" text-anchor="middle" font-weight="bold">GRANDES</text>
      </g>

      <!-- Contenedor Derecho (Pequeñas - Amarillo) -->
      <g id="contenedor-amarillo" transform="translate(440, 160)">
        <polygon points="0,40 40,60 80,40 40,20" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
        <text x="40" y="75" fill="#f59e0b" font-size="12" text-anchor="middle" font-weight="bold">PEQUEÑAS</text>
      </g>

      <!-- Caja en movimiento -->
      <g id="caja" transform="translate(150, 160)">
        <polygon points="0,15 15,22 30,15 15,8" fill="#f59e0b" id="caja-top"/>
        <polygon points="0,15 0,30 15,37 15,22" fill="#d97706" id="caja-left"/>
        <polygon points="15,22 30,15 30,30 15,37" fill="#b45309" id="caja-right"/>
      </g>
    </svg>
  `;
}

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Puntos del recorrido de la caja (coordenadas del SVG)
const RUTA = {
  inicio: { x: 150, y: 160 },          // vértice izquierdo de la cinta principal
  piston: { x: 300, y: 85 },           // pistón / bifurcación
  verticeDerecho: { x: 450, y: 160 },  // vértice derecho de la cinta principal
  grandes: { x: 120, y: 200 },         // centro del contenedor azul
  pequenas: { x: 480, y: 200 }         // centro del contenedor amarillo
};

// La caja se dibuja con su centro desplazado respecto al origen local
const CAJA_OFFSET = { x: 15, y: 22 };

export function updateEmpaquetadora() {
  const caja = document.getElementById('caja');
  const vastago = document.getElementById('vastago');
  const contAzul = document.getElementById('contenedor-azul');
  const contAmarillo = document.getElementById('contenedor-amarillo');

  // MOVIMIENTO
  if (caja) {
    let x, y;

    if (IO.caja_grande && (IO.cilindro_extendido || IO.caja_empujada)) {
      // Caja grande: el pistón la desvía hacia el contenedor azul
      const p = clamp01((IO.caja_x - 340) / (520 - 340));
      x = lerp(RUTA.piston.x, RUTA.grandes.x, p);
      y = lerp(RUTA.piston.y, RUTA.grandes.y, p);
    } else if (!IO.caja_grande && IO.caja_x > 340) {
      // Caja pequeña: sigue hasta el vértice derecho y entra en el contenedor
      const p1 = clamp01((IO.caja_x - 340) / (400 - 340));
      const px = lerp(RUTA.piston.x, RUTA.verticeDerecho.x, p1);
      const py = lerp(RUTA.piston.y, RUTA.verticeDerecho.y, p1);
      const p2 = clamp01(IO.timer_fin_caja / 1.0);
      x = lerp(px, RUTA.pequenas.x, p2);
      y = lerp(py, RUTA.pequenas.y, p2);
    } else {
      // Tramo común: desde el inicio hasta el pistón
      const p = clamp01((IO.caja_x - 120) / (340 - 120));
      x = lerp(RUTA.inicio.x, RUTA.piston.x, p);
      y = lerp(RUTA.inicio.y, RUTA.piston.y, p);
    }

    caja.setAttribute('transform', `translate(${x - CAJA_OFFSET.x}, ${y - CAJA_OFFSET.y})`);
    
    // COLOR DE LA CAJA (Azul si es grande, Amarillo si es pequeña)
    const colorBase = IO.caja_grande ? '#3b82f6' : '#f59e0b';
    const colorOscuro = IO.caja_grande ? '#2563eb' : '#d97706';
    const colorSombra = IO.caja_grande ? '#1d4ed8' : '#b45309';
    
    document.getElementById('caja-top').setAttribute('fill', colorBase);
    document.getElementById('caja-left').setAttribute('fill', colorOscuro);
    document.getElementById('caja-right').setAttribute('fill', colorSombra);
  }

  // PISTÓN
  if (vastago) {
    vastago.setAttribute('height', IO.cilindro_extendido ? '40' : '20');
    vastago.setAttribute('fill', IO.cilindro_extendido ? '#ef4444' : '#94a3b8');
  }

  // LLENADO VISUAL DE CONTENEDORES (Sin números, solo bloques)
  if (contAzul && contAmarillo) {
    // Limpiamos los dibujos anteriores
    contAzul.querySelectorAll('.caja-apilada').forEach(e => e.remove());
    contAmarillo.querySelectorAll('.caja-apilada').forEach(e => e.remove());

    // Dibujamos cajas azules apiladas (Grandes)
    for (let i = 0; i < IO.contador1; i++) {
        const box = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        // Lógica simple para apilar en cuadrícula
        const cx = 15 + (i % 3) * 10;
        const cy = 20 - Math.floor(i / 3) * 8;
        box.setAttribute('points', `${cx},${cy} ${cx+8},${cy+4} ${cx},${cy+8} ${cx-8},${cy+4}`);
        box.setAttribute('fill', '#3b82f6');
        box.setAttribute('class', 'caja-apilada');
        contAzul.appendChild(box);
    }

    // Dibujamos cajas amarillas apiladas (Pequeñas)
    for (let i = 0; i < IO.contador2; i++) {
        const box = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const cx = 15 + (i % 3) * 10;
        const cy = 20 - Math.floor(i / 3) * 8;
        box.setAttribute('points', `${cx},${cy} ${cx+8},${cy+4} ${cx},${cy+8} ${cx-8},${cy+4}`);
        box.setAttribute('fill', '#f59e0b');
        box.setAttribute('class', 'caja-apilada');
        contAmarillo.appendChild(box);
    }
  }
}