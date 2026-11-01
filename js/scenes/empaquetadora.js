import { IO } from '../core/ioModel.js';

const NS = 'http://www.w3.org/2000/svg';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Formas: 0=caja, 1=triángulo, 2=círculo
// Colores: 0=rojo, 1=azul, 2=verde
const COLORES = [
  { base: '#f87171', oscuro: '#ef4444', sombra: '#dc2626', nombre: 'ROJO' },
  { base: '#60a5fa', oscuro: '#3b82f6', sombra: '#2563eb', nombre: 'AZUL' },
  { base: '#4ade80', oscuro: '#22c55e', sombra: '#16a34a', nombre: 'VERDE' }
];

// Puntos del recorrido (coordenadas del SVG)
// Fase 0: principal (50,400)->(350,400)
// Fase 2: secundaria (según forma)
// Fase 4: terciaria (según color, solo para caja)
const SECUNDARIAS = [
  { x: 650, y: 200 },  // caja
  { x: 650, y: 400 },  // triángulo
  { x: 650, y: 600 }   // círculo
];
const TERCIARIAS = [
  { x: 950, y: 100 },  // rojo
  { x: 950, y: 200 },  // azul
  { x: 950, y: 300 }   // verde
];

function crearForma(forma, color) {
  const c = COLORES[color] || COLORES[0];
  const g = document.createElementNS(NS, 'g');

  if (forma === 0) {
    // Caja (cubo)
    const top = document.createElementNS(NS, 'polygon');
    top.setAttribute('points', '0,-24 28,-11 0,2 -28,-11');
    top.setAttribute('fill', c.base);
    const left = document.createElementNS(NS, 'polygon');
    left.setAttribute('points', '-28,-11 -28,13 0,26 0,2');
    left.setAttribute('fill', c.oscuro);
    const right = document.createElementNS(NS, 'polygon');
    right.setAttribute('points', '0,2 28,-11 28,13 0,26');
    right.setAttribute('fill', c.sombra);
    g.append(top, left, right);
  } else if (forma === 1) {
    // Triángulo
    const tri = document.createElementNS(NS, 'polygon');
    tri.setAttribute('points', '0,-26 28,18 -28,18');
    tri.setAttribute('fill', c.base);
    tri.setAttribute('stroke', c.oscuro);
    tri.setAttribute('stroke-width', '3');
    g.appendChild(tri);
  } else {
    // Círculo
    const circ = document.createElementNS(NS, 'circle');
    circ.setAttribute('r', '24');
    circ.setAttribute('fill', c.base);
    circ.setAttribute('stroke', c.oscuro);
    circ.setAttribute('stroke-width', '3');
    g.appendChild(circ);
  }
  return g;
}

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

export function renderEmpaquetadora(container) {
  container.innerHTML = `
    <svg id="svg-escena" viewBox="0 0 1150 700" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Fondo -->
      <rect x="0" y="0" width="1150" height="700" rx="14" fill="#0b1220"/>

      <!-- Cinta principal -->
      <line x1="50" y1="400" x2="350" y2="400" stroke="#334155" stroke-width="86" stroke-linecap="round"/>
      <line x1="50" y1="400" x2="350" y2="400" stroke="#475569" stroke-width="6" stroke-dasharray="18 14" stroke-linecap="round" opacity="0.8"/>

      <!-- Unión 1 -->
      <circle cx="350" cy="400" r="44" fill="#334155"/>

      <!-- Secundaria 0: CAJA (hacia arriba) -->
      <line x1="350" y1="400" x2="650" y2="200" stroke="#334155" stroke-width="70" stroke-linecap="round"/>
      <line id="rama-sec-0" x1="350" y1="400" x2="650" y2="200" stroke="#f59e0b" stroke-width="5" stroke-dasharray="16 14" stroke-linecap="round" opacity="0.35"/>

      <!-- Secundaria 1: TRIÁNGULO (horizontal) -->
      <line x1="350" y1="400" x2="650" y2="400" stroke="#334155" stroke-width="70" stroke-linecap="round"/>
      <line id="rama-sec-1" x1="350" y1="400" x2="650" y2="400" stroke="#a78bfa" stroke-width="5" stroke-dasharray="16 14" stroke-linecap="round" opacity="0.35"/>

      <!-- Secundaria 2: CÍRCULO (hacia abajo) -->
      <line x1="350" y1="400" x2="650" y2="600" stroke="#334155" stroke-width="70" stroke-linecap="round"/>
      <line id="rama-sec-2" x1="350" y1="400" x2="650" y2="600" stroke="#38bdf8" stroke-width="5" stroke-dasharray="16 14" stroke-linecap="round" opacity="0.35"/>

      <!-- Unión 2 (solo para caja) -->
      <circle id="union2" cx="650" cy="200" r="38" fill="#334155"/>

      <!-- Terciarias (solo para caja): 3 colores -->
      <line x1="650" y1="200" x2="950" y2="100" stroke="#334155" stroke-width="60" stroke-linecap="round"/>
      <line id="rama-ter-0" x1="650" y1="200" x2="950" y2="100" stroke="#ef4444" stroke-width="4" stroke-dasharray="14 12" stroke-linecap="round" opacity="0.35"/>

      <line x1="650" y1="200" x2="950" y2="200" stroke="#334155" stroke-width="60" stroke-linecap="round"/>
      <line id="rama-ter-1" x1="650" y1="200" x2="950" y2="200" stroke="#3b82f6" stroke-width="4" stroke-dasharray="14 12" stroke-linecap="round" opacity="0.35"/>

      <line x1="650" y1="200" x2="950" y2="300" stroke="#334155" stroke-width="60" stroke-linecap="round"/>
      <line id="rama-ter-2" x1="650" y1="200" x2="950" y2="300" stroke="#22c55e" stroke-width="4" stroke-dasharray="14 12" stroke-linecap="round" opacity="0.35"/>

      <!-- Flechas de avance -->
      <g fill="#94a3b8" opacity="0.7">
        <polygon points="190,392 215,400 190,408"/>
        <polygon points="480,310 500,300 505,320"/>
        <polygon points="480,392 505,400 480,408"/>
        <polygon points="480,480 500,490 505,470"/>
        <polygon points="780,150 800,140 805,160"/>
        <polygon points="780,192 805,200 780,208"/>
        <polygon points="780,240 800,250 805,230"/>
      </g>

      <!-- Fotocélula 1 -->
      <g id="fotocelula1">
        <rect x="342" y="346" width="16" height="34" rx="4" fill="#475569"/>
        <rect x="342" y="420" width="16" height="34" rx="4" fill="#475569"/>
        <circle id="foto1-led-sup" cx="350" cy="380" r="9" fill="#38bdf8"/>
        <circle id="foto1-led-inf" cx="350" cy="420" r="9" fill="#38bdf8"/>
        <line id="fotocelula1-beam" x1="350" y1="389" x2="350" y2="411" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4 4" opacity="0.65"/>
        <text x="350" y="336" fill="#38bdf8" font-size="13" text-anchor="middle" font-weight="bold">FC1</text>
      </g>

      <!-- Fotocélula 2 (solo caja) -->
      <g id="fotocelula2">
        <rect x="642" y="146" width="16" height="34" rx="4" fill="#475569"/>
        <rect x="642" y="220" width="16" height="34" rx="4" fill="#475569"/>
        <circle id="foto2-led-sup" cx="650" cy="180" r="9" fill="#38bdf8"/>
        <circle id="foto2-led-inf" cx="650" cy="220" r="9" fill="#38bdf8"/>
        <line id="fotocelula2-beam" x1="650" y1="189" x2="650" y2="211" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4 4" opacity="0.65"/>
        <text x="650" y="136" fill="#38bdf8" font-size="13" text-anchor="middle" font-weight="bold">FC2</text>
      </g>

      <!-- Contenedor: TRIÁNGULO -->
      <g id="contenedor-tri" transform="translate(700,340)">
        <rect x="0" y="0" width="160" height="110" rx="14" fill="#0f172a" stroke="#a78bfa" stroke-width="4"/>
        <rect x="14" y="14" width="132" height="82" rx="10" fill="#0b1220" stroke="#7c3aed" stroke-width="2"/>
        <text x="80" y="135" fill="#a78bfa" font-size="18" text-anchor="middle" font-weight="bold">TRIÁNGULO</text>
      </g>

      <!-- Contenedor: CÍRCULO -->
      <g id="contenedor-circ" transform="translate(700,540)">
        <rect x="0" y="0" width="160" height="110" rx="14" fill="#0f172a" stroke="#38bdf8" stroke-width="4"/>
        <rect x="14" y="14" width="132" height="82" rx="10" fill="#0b1220" stroke="#0284c7" stroke-width="2"/>
        <text x="80" y="135" fill="#38bdf8" font-size="18" text-anchor="middle" font-weight="bold">CÍRCULO</text>
      </g>

      <!-- Contenedores TERCIARIOS (caja por color) -->
      <g id="contenedor-ter-0" transform="translate(1000,40)">
        <rect x="0" y="0" width="130" height="90" rx="12" fill="#0f172a" stroke="#ef4444" stroke-width="3"/>
        <rect x="12" y="12" width="106" height="66" rx="8" fill="#0b1220" stroke="#dc2626" stroke-width="2"/>
        <text x="65" y="115" fill="#ef4444" font-size="16" text-anchor="middle" font-weight="bold">ROJO</text>
      </g>
      <g id="contenedor-ter-1" transform="translate(1000,140)">
        <rect x="0" y="0" width="130" height="90" rx="12" fill="#0f172a" stroke="#3b82f6" stroke-width="3"/>
        <rect x="12" y="12" width="106" height="66" rx="8" fill="#0b1220" stroke="#2563eb" stroke-width="2"/>
        <text x="65" y="115" fill="#3b82f6" font-size="16" text-anchor="middle" font-weight="bold">AZUL</text>
      </g>
      <g id="contenedor-ter-2" transform="translate(1000,240)">
        <rect x="0" y="0" width="130" height="90" rx="12" fill="#0f172a" stroke="#22c55e" stroke-width="3"/>
        <rect x="12" y="12" width="106" height="66" rx="8" fill="#0b1220" stroke="#16a34a" stroke-width="2"/>
        <text x="65" y="115" fill="#22c55e" font-size="16" text-anchor="middle" font-weight="bold">VERDE</text>
      </g>

      <!-- Caja/objeto en movimiento -->
      <g id="caja"></g>
    </svg>
  `;
}

// Forma del objeto en movimiento
function crearFormaSVG(forma, color) {
  const c = COLORES[color] || COLORES[0];
  const g = document.createElementNS(NS, 'g');

  if (forma === 0) {
    // Caja
    const top = document.createElementNS(NS, 'polygon');
    top.setAttribute('points', '0,-24 28,-11 0,2 -28,-11');
    top.setAttribute('fill', c.base);
    const left = document.createElementNS(NS, 'polygon');
    left.setAttribute('points', '-28,-11 -28,13 0,26 0,2');
    left.setAttribute('fill', c.oscuro);
    const right = document.createElementNS(NS, 'polygon');
    right.setAttribute('points', '0,2 28,-11 28,13 0,26');
    right.setAttribute('fill', c.sombra);
    g.append(top, left, right);
  } else if (forma === 1) {
    // Triángulo
    const tri = document.createElementNS(NS, 'polygon');
    tri.setAttribute('points', '0,-26 28,18 -28,18');
    tri.setAttribute('fill', c.base);
    tri.setAttribute('stroke', c.oscuro);
    tri.setAttribute('stroke-width', '3');
    g.appendChild(tri);
  } else {
    // Círculo
    const circ = document.createElementNS(NS, 'circle');
    circ.setAttribute('r', '24');
    circ.setAttribute('fill', c.base);
    circ.setAttribute('stroke', c.oscuro);
    circ.setAttribute('stroke-width', '3');
    g.appendChild(circ);
  }
  return g;
}

export function updateEmpaquetadora() {
  const cajaContainer = document.getElementById('caja');
  const foto1Beam = document.getElementById('fotocelula1-beam');
  const foto1LedSup = document.getElementById('foto1-led-sup');
  const foto1LedInf = document.getElementById('foto1-led-inf');
  const foto2Beam = document.getElementById('fotocelula2-beam');
  const foto2LedSup = document.getElementById('foto2-led-sup');
  const foto2LedInf = document.getElementById('foto2-led-inf');
  const ramaSec = [0, 1, 2].map(i => document.getElementById(`rama-sec-${i}`));
  const ramaTer = [0, 1, 2].map(i => document.getElementById(`rama-ter-${i}`));

  // Actualizar la forma de la caja en movimiento
  if (cajaContainer) {
    cajaContainer.innerHTML = '';
    const forma = crearFormaSVG(IO.forma, IO.color);
    cajaContainer.appendChild(forma);
  }

  // MOVIMIENTO DEL OBJETO
  if (cajaContainer) {
    let x, y;

    if (IO.fase === 0) {
      // Cinta principal: (50,400) -> (350,400)
      const p = clamp01(IO.progreso);
      x = lerp(50, 350, p);
      y = 400;
    } else if (IO.fase === 1) {
      // Unión 1: estacionario
      x = 350; y = 400;
    } else if (IO.fase === 2) {
      // Secundaria: según forma
      const sec = SECUNDARIAS[IO.forma] || SECUNDARIAS[0];
      const p = clamp01(IO.progreso);
      x = lerp(350, sec.x, p);
      y = lerp(400, sec.y, p);
    } else if (IO.fase === 3) {
      // Unión 2: estacionario (solo caja)
      x = 650; y = 200;
    } else if (IO.fase === 4) {
      // Terciaria: según color (solo caja)
      const ter = TERCIARIAS[IO.color] || TERCIARIAS[0];
      const p = clamp01(IO.progreso);
      x = lerp(650, ter.x, p);
      y = lerp(200, ter.y, p);
    } else {
      // Fin: en el contenedor
      if (IO.forma === 0) {
        const ter = TERCIARIAS[IO.color] || TERCIARIAS[0];
        x = ter.x; y = ter.y;
      } else if (IO.forma === 1) {
        x = 780; y = 395;
      } else {
        x = 780; y = 595;
      }
    }

    cajaContainer.setAttribute('transform', `translate(${x}, ${y})`);
  }

  // FOTOCÉLULA 1
  const colorFoto1 = IO.fotocelula1 ? '#ef4444' : '#38bdf8';
  if (foto1Beam) {
    foto1Beam.setAttribute('stroke', colorFoto1);
    foto1Beam.setAttribute('stroke-width', IO.fotocelula1 ? '5' : '3');
    foto1Beam.setAttribute('opacity', IO.fotocelula1 ? '1' : '0.65');
  }
  if (foto1LedSup) foto1LedSup.setAttribute('fill', colorFoto1);
  if (foto1LedInf) foto1LedInf.setAttribute('fill', colorFoto1);

  // FOTOCÉLULA 2 (solo visible si forma==0)
  const union2 = document.getElementById('union2');
  if (union2) union2.setAttribute('opacity', IO.forma === 0 ? '1' : '0.3');
  const foto2Group = document.getElementById('fotocelula2');
  if (foto2Group) foto2Group.setAttribute('opacity', IO.forma === 0 ? '1' : '0.3');
  const colorFoto2 = IO.fotocelula2 ? '#ef4444' : '#38bdf8';
  if (foto2Beam) {
    foto2Beam.setAttribute('stroke', colorFoto2);
    foto2Beam.setAttribute('stroke-width', IO.fotocelula2 ? '5' : '3');
    foto2Beam.setAttribute('opacity', IO.fotocelula2 ? '1' : '0.65');
  }
  if (foto2LedSup) foto2LedSup.setAttribute('fill', colorFoto2);
  if (foto2LedInf) foto2LedInf.setAttribute('fill', colorFoto2);

  // RAMAS SECUNDARIAS ACTIVAS
  ramaSec.forEach((rama, i) => {
    if (rama) rama.setAttribute('opacity', IO.fase >= 2 && IO.forma === i ? '1' : '0.35');
  });

  // RAMAS TERCIARIAS ACTIVAS (solo caja)
  ramaTer.forEach((rama, i) => {
    if (rama) rama.setAttribute('opacity', IO.fase >= 4 && IO.forma === 0 && IO.color === i ? '1' : '0.35');
  });

  // LLENADO VISUAL DE CONTENEDORES
  // Triángulo
  const contTri = document.getElementById('contenedor-tri');
  if (contTri) {
    contTri.querySelectorAll('.caja-apilada').forEach(e => e.remove());
    // contador index 3 = triángulo
    const n = IO.contadores[3] || 0;
    for (let i = 0; i < n; i++) {
      const cubo = crearCubo('#a78bfa', '#7c3aed', '#5b21b6');
      const col = i % 4; const fila = Math.floor(i / 4);
      cubo.setAttribute('transform', `translate(${30 + col * 28}, ${70 - fila * 20}) scale(0.6)`);
      cubo.setAttribute('class', 'caja-apilada');
      contTri.appendChild(cubo);
    }
  }

  // Círculo
  const contCirc = document.getElementById('contenedor-circ');
  if (contCirc) {
    contCirc.querySelectorAll('.caja-apilada').forEach(e => e.remove());
    const n = IO.contadores[4] || 0;
    for (let i = 0; i < n; i++) {
      const cubo = crearCubo('#38bdf8', '#0284c7', '#075985');
      const col = i % 4; const fila = Math.floor(i / 4);
      cubo.setAttribute('transform', `translate(${30 + col * 28}, ${70 - fila * 20}) scale(0.6)`);
      cubo.setAttribute('class', 'caja-apilada');
      contCirc.appendChild(cubo);
    }
  }

  // Terciarios (caja por color)
  [0, 1, 2].forEach(idx => {
    const cont = document.getElementById(`contenedor-ter-${idx}`);
    if (!cont) return;
    cont.querySelectorAll('.caja-apilada').forEach(e => e.remove());
    const n = IO.contadores[idx] || 0;
    const colores = COLORES[idx];
    for (let i = 0; i < n; i++) {
      const cubo = crearCubo(colores.base, colores.oscuro, colores.sombra);
      const col = i % 3; const fila = Math.floor(i / 3);
      cubo.setAttribute('transform', `translate(${25 + col * 30}, ${55 - fila * 18}) scale(0.5)`);
      cubo.setAttribute('class', 'caja-apilada');
      cont.appendChild(cubo);
    }
  });
}
