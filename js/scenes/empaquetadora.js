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

const FORMAS_NOMBRE = ['CAJA', 'TRIÁNGULO', 'CÍRCULO'];

// Posiciones de las secundarias (junction 1 -> junction 2)
const SECUNDARIAS = [
  { x: 650, y: 200 },  // caja
  { x: 650, y: 450 },  // triángulo
  { x: 650, y: 700 }   // círculo
];

// Posiciones de las terciarias: TERCIARIAS[forma][color] = {x, y}
const TERCIARIAS = [
  // caja
  [{ x: 950, y: 100 }, { x: 950, y: 200 }, { x: 950, y: 300 }],
  // triángulo
  [{ x: 950, y: 400 }, { x: 950, y: 500 }, { x: 950, y: 600 }],
  // círculo
  [{ x: 950, y: 700 }, { x: 950, y: 800 }, { x: 950, y: 900 }]
];

const SEC_COLORS = ['#f59e0b', '#a78bfa', '#38bdf8'];
const TER_COLORS = ['#ef4444', '#3b82f6', '#22c55e'];

function crearFormaSVG(forma, color) {
  const c = COLORES[color] || COLORES[0];
  const g = document.createElementNS(NS, 'g');

  if (forma === 0) {
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
    const tri = document.createElementNS(NS, 'polygon');
    tri.setAttribute('points', '0,-26 28,18 -28,18');
    tri.setAttribute('fill', c.base);
    tri.setAttribute('stroke', c.oscuro);
    tri.setAttribute('stroke-width', '3');
    g.appendChild(tri);
  } else {
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
  let svg = '';
  svg += `<svg id="svg-escena" viewBox="0 0 1200 1000" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect x="0" y="0" width="1200" height="1000" rx="14" fill="#0b1220"/>`;

  // Cinta principal
  svg += `<line x1="50" y1="450" x2="350" y2="450" stroke="#334155" stroke-width="86" stroke-linecap="round"/>`;
  svg += `<line x1="50" y1="450" x2="350" y2="450" stroke="#475569" stroke-width="6" stroke-dasharray="18 14" stroke-linecap="round" opacity="0.8"/>`;

  // Unión 1
  svg += `<circle cx="350" cy="450" r="44" fill="#334155"/>`;

  // Secundarias (3 formas)
  const secEnds = [[650, 200], [650, 450], [650, 700]];
  for (let i = 0; i < 3; i++) {
    svg += `<line x1="350" y1="450" x2="${secEnds[i][0]}" y2="${secEnds[i][1]}" stroke="#334155" stroke-width="70" stroke-linecap="round"/>`;
    svg += `<line id="rama-sec-${i}" x1="350" y1="450" x2="${secEnds[i][0]}" y2="${secEnds[i][1]}" stroke="${SEC_COLORS[i]}" stroke-width="5" stroke-dasharray="16 14" stroke-linecap="round" opacity="0.35"/>`;
  }

  // Uniones 2 (para todas las formas)
  for (let i = 0; i < 3; i++) {
    svg += `<circle id="union2-${i}" cx="650" cy="${secEnds[i][1]}" r="34" fill="#334155"/>`;
  }

  // Terciarias (9: 3 formas × 3 colores)
  for (let f = 0; f < 3; f++) {
    for (let c = 0; c < 3; c++) {
      const jx = 650, jy = secEnds[f][1];
      const tx = 1000, ty = TERCIARIAS[f][c].y;
      svg += `<line x1="${jx}" y1="${jy}" x2="${tx}" y2="${ty}" stroke="#334155" stroke-width="50" stroke-linecap="round"/>`;
      svg += `<line id="rama-ter-${f}-${c}" x1="${jx}" y1="${jy}" x2="${tx}" y2="${ty}" stroke="${TER_COLORS[c]}" stroke-width="4" stroke-dasharray="14 12" stroke-linecap="round" opacity="0.35"/>`;
    }
  }

  // Flechas
  svg += `<g fill="#94a3b8" opacity="0.7">`;
  svg += `<polygon points="190,442 215,450 190,458"/>`;
  svg += `<polygon points="480,330 500,320 505,340"/>`;
  svg += `<polygon points="480,442 505,450 480,458"/>`;
  svg += `<polygon points="480,560 500,570 505,550"/>`;
  svg += `<polygon points="810,150 830,140 835,160"/>`;
  svg += `<polygon points="810,442 835,450 810,458"/>`;
  svg += `<polygon points="810,740 830,750 835,730"/>`;
  svg += `</g>`;

  // Fotocélula 1
  svg += `<g id="fotocelula1">`;
  svg += `<rect x="342" y="396" width="16" height="34" rx="4" fill="#475569"/>`;
  svg += `<rect x="342" y="470" width="16" height="34" rx="4" fill="#475569"/>`;
  svg += `<circle id="foto1-led-sup" cx="350" cy="430" r="9" fill="#38bdf8"/>`;
  svg += `<circle id="foto1-led-inf" cx="350" cy="470" r="9" fill="#38bdf8"/>`;
  svg += `<line id="fotocelula1-beam" x1="350" y1="439" x2="350" y2="461" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4 4" opacity="0.65"/>`;
  svg += `<text x="350" y="386" fill="#38bdf8" font-size="13" text-anchor="middle" font-weight="bold">FC1</text>`;
  svg += `</g>`;

  // Fotocélula 2
  svg += `<g id="fotocelula2">`;
  svg += `<rect x="642" y="146" width="16" height="34" rx="4" fill="#475569"/>`;
  svg += `<rect x="642" y="220" width="16" height="34" rx="4" fill="#475569"/>`;
  svg += `<circle id="foto2-led-sup" cx="650" cy="180" r="9" fill="#38bdf8"/>`;
  svg += `<circle id="foto2-led-inf" cx="650" cy="220" r="9" fill="#38bdf8"/>`;
  svg += `<line id="fotocelula2-beam" x1="650" y1="189" x2="650" y2="211" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4 4" opacity="0.65"/>`;
  svg += `<text x="650" y="136" fill="#38bdf8" font-size="13" text-anchor="middle" font-weight="bold">FC2</text>`;
  svg += `</g>`;

  // Contenedores terciarios (9: 3 formas × 3 colores)
  const terColors = ['#ef4444', '#3b82f6', '#22c55e'];
  const terNames = ['ROJO', 'AZUL', 'VERDE'];
  for (let f = 0; f < 3; f++) {
    for (let c = 0; c < 3; c++) {
      const y = TERCIARIAS[f][c].y - 40;
      svg += `<g id="contenedor-ter-${f}-${c}" transform="translate(1000,${y})">`;
      svg += `<rect x="0" y="0" width="130" height="90" rx="12" fill="#0f172a" stroke="${terColors[c]}" stroke-width="3"/>`;
      svg += `<rect x="12" y="12" width="106" height="66" rx="8" fill="#0b1220" stroke="${terColors[c]}" stroke-width="2" opacity="0.6"/>`;
      svg += `<text x="65" y="115" fill="${terColors[c]}" font-size="14" text-anchor="middle" font-weight="bold">${terNames[c]}</text>`;
      svg += `</g>`;
    }
  }

  // Objeto en movimiento
  svg += `<g id="caja"></g>`;

  svg += `</svg>`;
  container.innerHTML = svg;
}

export function updateEmpaquetadora() {
  const cajaContainer = document.getElementById('caja');
  const foto1Beam = document.getElementById('fotocelula1-beam');
  const foto1LedSup = document.getElementById('foto1-led-sup');
  const foto1LedInf = document.getElementById('foto1-led-inf');
  const foto2Beam = document.getElementById('fotocelula2-beam');
  const foto2LedSup = document.getElementById('foto2-led-sup');
  const foto2LedInf = document.getElementById('foto2-led-inf');
  const foto2Group = document.getElementById('fotocelula2');

  // Actualizar forma del objeto en movimiento
  if (cajaContainer) {
    cajaContainer.innerHTML = '';
    const forma = crearFormaSVG(IO.forma, IO.color);
    cajaContainer.appendChild(forma);
  }

  // MOVIMIENTO DEL OBJETO
  if (cajaContainer) {
    let x, y;

    if (IO.fase === 0) {
      const p = clamp01(IO.progreso);
      x = lerp(50, 350, p);
      y = 450;
    } else if (IO.fase === 1) {
      x = 350; y = 450;
    } else if (IO.fase === 2) {
      const sec = SECUNDARIAS[IO.forma] || SECUNDARIAS[0];
      const p = clamp01(IO.progreso);
      x = lerp(350, sec.x, p);
      y = lerp(450, sec.y, p);
    } else if (IO.fase === 3) {
      const sec = SECUNDARIAS[IO.forma] || SECUNDARIAS[0];
      x = sec.x; y = sec.y;
    } else if (IO.fase === 4) {
      const ter = TERCIARIAS[IO.forma] ? TERCIARIAS[IO.forma][IO.color] : null;
      const target = ter || SECUNDARIAS[IO.forma] || SECUNDARIAS[0];
      const sec = SECUNDARIAS[IO.forma] || SECUNDARIAS[0];
      const p = clamp01(IO.progreso);
      x = lerp(sec.x, target.x, p);
      y = lerp(sec.y, target.y, p);
    } else {
      if (TERCIARIAS[IO.forma] && TERCIARIAS[IO.forma][IO.color]) {
        const ter = TERCIARIAS[IO.forma][IO.color];
        x = ter.x; y = ter.y;
      } else {
        const sec = SECUNDARIAS[IO.forma] || SECUNDARIAS[0];
        x = sec.x + 50; y = sec.y;
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

  // FOTOCÉLULA 2
  const esCaja = IO.forma === 0;
  if (foto2Group) foto2Group.setAttribute('opacity', esCaja ? '1' : '0.2');
  const colorFoto2 = IO.fotocelula2 ? '#ef4444' : '#38bdf8';
  if (foto2Beam) {
    foto2Beam.setAttribute('stroke', colorFoto2);
    foto2Beam.setAttribute('stroke-width', IO.fotocelula2 ? '5' : '3');
    foto2Beam.setAttribute('opacity', IO.fotocelula2 ? '1' : '0.65');
  }
  if (foto2LedSup) foto2LedSup.setAttribute('fill', colorFoto2);
  if (foto2LedInf) foto2LedInf.setAttribute('fill', colorFoto2);

  // RAMAS SECUNDARIAS ACTIVAS
  [0, 1, 2].forEach(i => {
    const rama = document.getElementById(`rama-sec-${i}`);
    if (rama) rama.setAttribute('opacity', IO.fase >= 2 && IO.forma === i ? '1' : '0.35');
  });

  // RAMAS TERCIARIAS ACTIVAS
  [0, 1, 2].forEach(f => {
    [0, 1, 2].forEach(c => {
      const rama = document.getElementById(`rama-ter-${f}-${c}`);
      if (rama) rama.setAttribute('opacity', IO.fase >= 4 && IO.forma === f && IO.color === c ? '1' : '0.35');
    });
  });

  // LLENADO VISUAL DE CONTENEDORES (9 terciarios)
  [0, 1, 2].forEach(f => {
    [0, 1, 2].forEach(c => {
      const cont = document.getElementById(`contenedor-ter-${f}-${c}`);
      if (!cont) return;
      cont.querySelectorAll('.caja-apilada').forEach(e => e.remove());
      const idx = f * 3 + c;
      const n = IO.contadores[idx] || 0;
      for (let i = 0; i < n; i++) {
        const forma = crearFormaSVG(f, c);
        const col = i % 3; const fila = Math.floor(i / 3);
        forma.setAttribute('transform', `translate(${25 + col * 30}, ${55 - fila * 18}) scale(0.5)`);
        forma.setAttribute('class', 'caja-apilada');
        cont.appendChild(forma);
      }
    });
  });
}
