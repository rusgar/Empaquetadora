import { IO } from '../core/ioModel.js';

const NS = 'http://www.w3.org/2000/svg';

// Colores por rama
const COLORES = [
  { base: '#f87171', oscuro: '#ef4444', sombra: '#dc2626', nombre: 'ROJO' },
  { base: '#60a5fa', oscuro: '#3b82f6', sombra: '#2563eb', nombre: 'AZUL' },
  { base: '#4ade80', oscuro: '#22c55e', sombra: '#16a34a', nombre: 'VERDE' }
];

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

function crearCubo(colorBase, colorOscuro, colorSombra) {
  const g = document.createElementNS(NS, 'g');

  const top = document.createElementNS(NS, 'polygon');
  top.setAttribute('points', '0,-24 28,-11 0,2 -28,-11');
  top.setAttribute('fill', colorBase);

  const left = document.createElementNS(NS, 'polygon');
  left.setAttribute('points', '-28,-11 -28,13 0,26 0,2');
  left.setAttribute('fill', colorOscuro);

  const right = document.createElementNS(NS, 'polygon');
  right.setAttribute('points', '0,2 28,-11 28,13 0,26');
  right.setAttribute('fill', colorSombra);

  g.append(top, left, right);
  return g;
}

// Puntos de destino por color
const DESTINOS = [
  { x: 890, y: 60 },   // Rojo
  { x: 890, y: 230 },  // Azul
  { x: 890, y: 400 }   // Verde
];

export function renderEmpaquetadora(container) {
  container.innerHTML = `
    <svg id="svg-escena" viewBox="0 0 1000 460" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Fondo -->
      <rect x="0" y="0" width="1000" height="460" rx="14" fill="#0b1220"/>

      <!-- Cinta principal -->
      <line x1="40" y1="230" x2="430" y2="230" stroke="#334155" stroke-width="86" stroke-linecap="round"/>
      <line x1="40" y1="230" x2="430" y2="230" stroke="#475569" stroke-width="6" stroke-dasharray="18 14" stroke-linecap="round" opacity="0.8"/>

      <!-- Ramas por color -->
      <line x1="430" y1="230" x2="880" y2="60" stroke="#334155" stroke-width="70" stroke-linecap="round"/>
      <line id="rama-0" x1="430" y1="230" x2="880" y2="60" stroke="#ef4444" stroke-width="5" stroke-dasharray="16 14" stroke-linecap="round" opacity="0.35"/>

      <line x1="430" y1="230" x2="880" y2="230" stroke="#334155" stroke-width="70" stroke-linecap="round"/>
      <line id="rama-1" x1="430" y1="230" x2="880" y2="230" stroke="#3b82f6" stroke-width="5" stroke-dasharray="16 14" stroke-linecap="round" opacity="0.35"/>

      <line x1="430" y1="230" x2="880" y2="400" stroke="#334155" stroke-width="70" stroke-linecap="round"/>
      <line id="rama-2" x1="430" y1="230" x2="880" y2="400" stroke="#22c55e" stroke-width="5" stroke-dasharray="16 14" stroke-linecap="round" opacity="0.35"/>

      <!-- Unión -->
      <circle cx="430" cy="230" r="44" fill="#334155"/>

      <!-- Flechas de avance -->
      <g fill="#94a3b8" opacity="0.7">
        <polygon points="170,222 195,230 170,238"/>
        <polygon points="290,222 315,230 290,238"/>
        <polygon points="560,145 582,135 588,155"/>
        <polygon points="560,222 582,230 560,238"/>
        <polygon points="560,315 582,325 588,305"/>
      </g>

      <!-- Fotocélula -->
      <g id="fotocelula">
        <rect x="422" y="168" width="16" height="34" rx="4" fill="#475569"/>
        <rect x="422" y="258" width="16" height="34" rx="4" fill="#475569"/>
        <circle id="foto-led-sup" cx="430" cy="202" r="9" fill="#38bdf8"/>
        <circle id="foto-led-inf" cx="430" cy="258" r="9" fill="#38bdf8"/>
        <line id="fotocelula-beam" x1="430" y1="211" x2="430" y2="249" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4 4" opacity="0.65"/>
        <text x="430" y="158" fill="#38bdf8" font-size="14" text-anchor="middle" font-weight="bold">FOTOCÉLULA</text>
      </g>

      <!-- Contenedor ROJO -->
      <g id="contenedor-0" transform="translate(800,0)">
        <rect x="0" y="0" width="180" height="110" rx="14" fill="#0f172a" stroke="#ef4444" stroke-width="4"/>
        <rect x="14" y="14" width="152" height="82" rx="10" fill="#0b1220" stroke="#dc2626" stroke-width="2"/>
        <text x="90" y="135" fill="#ef4444" font-size="20" text-anchor="middle" font-weight="bold">ROJO</text>
      </g>

      <!-- Contenedor AZUL -->
      <g id="contenedor-1" transform="translate(800,170)">
        <rect x="0" y="0" width="180" height="110" rx="14" fill="#0f172a" stroke="#3b82f6" stroke-width="4"/>
        <rect x="14" y="14" width="152" height="82" rx="10" fill="#0b1220" stroke="#2563eb" stroke-width="2"/>
        <text x="90" y="135" fill="#3b82f6" font-size="20" text-anchor="middle" font-weight="bold">AZUL</text>
      </g>

      <!-- Contenedor VERDE -->
      <g id="contenedor-2" transform="translate(800,340)">
        <rect x="0" y="0" width="180" height="110" rx="14" fill="#0f172a" stroke="#22c55e" stroke-width="4"/>
        <rect x="14" y="14" width="152" height="82" rx="10" fill="#0b1220" stroke="#16a34a" stroke-width="2"/>
        <text x="90" y="135" fill="#22c55e" font-size="20" text-anchor="middle" font-weight="bold">VERDE</text>
      </g>

      <!-- Caja en movimiento -->
      <g id="caja">
        <polygon id="caja-top" points="0,-24 28,-11 0,2 -28,-11" fill="#f87171"/>
        <polygon id="caja-left" points="-28,-11 -28,13 0,26 0,2" fill="#ef4444"/>
        <polygon id="caja-right" points="0,2 28,-11 28,13 0,26" fill="#dc2626"/>
      </g>
    </svg>
  `;
}

export function updateEmpaquetadora() {
  const caja = document.getElementById('caja');
  const beam = document.getElementById('fotocelula-beam');
  const ledSup = document.getElementById('foto-led-sup');
  const ledInf = document.getElementById('foto-led-inf');
  const contenedores = [0, 1, 2].map(i => document.getElementById(`contenedor-${i}`));

  // MOVIMIENTO DE LA CAJA
  if (caja) {
    let x, y;
    const destino = DESTINOS[IO.caja_color] || DESTINOS[0];

    if (IO.caja_x < 0.3) {
      // Tramo común: cinta principal
      const p = clamp01(IO.caja_x / 0.3);
      x = lerp(70, 430, p);
      y = 230;
    } else {
      // Rama seleccionada según el color
      const p = clamp01((IO.caja_x - 0.3) / 0.7);
      x = lerp(430, destino.x, p);
      y = lerp(230, destino.y, p);
    }

    caja.setAttribute('transform', `translate(${x}, ${y})`);

    // Color de la caja según caja_color
    const c = COLORES[IO.caja_color] || COLORES[0];
    document.getElementById('caja-top').setAttribute('fill', c.base);
    document.getElementById('caja-left').setAttribute('fill', c.oscuro);
    document.getElementById('caja-right').setAttribute('fill', c.sombra);
  }

  // FOTOCÉLULA
  const colorFoto = IO.fotocelula ? '#ef4444' : '#38bdf8';
  if (beam) {
    beam.setAttribute('stroke', colorFoto);
    beam.setAttribute('stroke-width', IO.fotocelula ? '5' : '3');
    beam.setAttribute('opacity', IO.fotocelula ? '1' : '0.65');
  }
  if (ledSup) ledSup.setAttribute('fill', colorFoto);
  if (ledInf) ledInf.setAttribute('fill', colorFoto);

  // RAMA ACTIVA SEGÚN EL COLOR
  [0, 1, 2].forEach(i => {
    const rama = document.getElementById(`rama-${i}`);
    if (rama) {
      rama.setAttribute('opacity', IO.caja_x > 0.25 && IO.caja_color === i ? '1' : '0.35');
    }
  });

  // LLENADO VISUAL DE CONTENEDORES
  contenedores.forEach((cont, idx) => {
    if (!cont) return;
    cont.querySelectorAll('.caja-apilada').forEach(e => e.remove());
    const colores = COLORES[idx];
    for (let i = 0; i < IO[`contador${idx + 1}`]; i++) {
      const cubo = crearCubo(colores.base, colores.oscuro, colores.sombra);
      const col = i % 4;
      const fila = Math.floor(i / 4);
      cubo.setAttribute('transform', `translate(${40 + col * 33}, ${70 - fila * 22}) scale(0.7)`);
      cubo.setAttribute('class', 'caja-apilada');
      cont.appendChild(cubo);
    }
  });
}
