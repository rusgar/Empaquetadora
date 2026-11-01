import { IO } from '../core/ioModel.js';

const NS = 'http://www.w3.org/2000/svg';

// Puntos del recorrido de la caja (coordenadas del SVG)
const RUTA = {
  inicio: { x: 70, y: 230 },
  junction: { x: 430, y: 230 },
  grandes: { x: 890, y: 80 },
  pequenas: { x: 890, y: 360 }
};

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

export function renderEmpaquetadora(container) {
  container.innerHTML = `
    <svg id="svg-escena" viewBox="0 0 1000 460" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-azul" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-amarillo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Fondo -->
      <rect x="0" y="0" width="1000" height="460" rx="14" fill="#0b1220"/>

      <!-- Cinta principal -->
      <line x1="40" y1="230" x2="430" y2="230" stroke="#334155" stroke-width="86" stroke-linecap="round"/>
      <line x1="40" y1="230" x2="430" y2="230" stroke="#475569" stroke-width="6" stroke-dasharray="18 14" stroke-linecap="round" opacity="0.8"/>

      <!-- Bifurcación superior: cajas GRANDES -->
      <line x1="430" y1="230" x2="880" y2="90" stroke="#334155" stroke-width="74" stroke-linecap="round"/>
      <line id="rama-grandes" x1="430" y1="230" x2="880" y2="90" stroke="#3b82f6" stroke-width="5" stroke-dasharray="16 14" stroke-linecap="round" opacity="0.35"/>

      <!-- Bifurcación inferior: cajas PEQUEÑAS -->
      <line x1="430" y1="230" x2="880" y2="370" stroke="#334155" stroke-width="74" stroke-linecap="round"/>
      <line id="rama-pequenas" x1="430" y1="230" x2="880" y2="370" stroke="#f59e0b" stroke-width="5" stroke-dasharray="16 14" stroke-linecap="round" opacity="0.35"/>

      <!-- Unión en Y -->
      <circle cx="430" cy="230" r="44" fill="#334155"/>

      <!-- Flechas de avance -->
      <g fill="#94a3b8" opacity="0.7">
        <polygon points="170,222 195,230 170,238"/>
        <polygon points="290,222 315,230 290,238"/>
        <polygon points="560,182 582,170 588,192"/>
        <polygon points="560,278 582,290 588,268"/>
      </g>

      <!-- Fotocélula en el punto de decisión -->
      <g id="fotocelula">
        <rect x="422" y="168" width="16" height="34" rx="4" fill="#475569"/>
        <rect x="422" y="258" width="16" height="34" rx="4" fill="#475569"/>
        <circle id="foto-led-sup" cx="430" cy="202" r="9" fill="#38bdf8"/>
        <circle id="foto-led-inf" cx="430" cy="258" r="9" fill="#38bdf8"/>
        <line id="fotocelula-beam" x1="430" y1="211" x2="430" y2="249" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4 4" opacity="0.65"/>
        <text x="430" y="158" fill="#38bdf8" font-size="14" text-anchor="middle" font-weight="bold">FOTOCÉLULA</text>
      </g>

      <!-- Compuerta desviadora -->
      <g id="compuerta" transform="rotate(18 430 230)">
        <rect x="430" y="222" width="96" height="16" rx="8" fill="#f59e0b" stroke="#b45309" stroke-width="3"/>
        <circle cx="430" cy="230" r="12" fill="#475569" stroke="#94a3b8" stroke-width="3"/>
      </g>
      <text x="430" y="300" fill="#94a3b8" font-size="13" text-anchor="middle">DESVIADOR</text>

      <!-- Contenedor GRANDES -->
      <g id="contenedor-azul" transform="translate(800,20)">
        <rect x="0" y="0" width="180" height="120" rx="14" fill="#0f172a" stroke="#3b82f6" stroke-width="4"/>
        <rect x="14" y="14" width="152" height="92" rx="10" fill="#0b1220" stroke="#1d4ed8" stroke-width="2"/>
        <text x="90" y="148" fill="#3b82f6" font-size="20" text-anchor="middle" font-weight="bold">GRANDES</text>
      </g>

      <!-- Contenedor PEQUEÑAS -->
      <g id="contenedor-amarillo" transform="translate(800,300)">
        <rect x="0" y="0" width="180" height="120" rx="14" fill="#0f172a" stroke="#f59e0b" stroke-width="4"/>
        <rect x="14" y="14" width="152" height="92" rx="10" fill="#0b1220" stroke="#b45309" stroke-width="2"/>
        <text x="90" y="148" fill="#f59e0b" font-size="20" text-anchor="middle" font-weight="bold">PEQUEÑAS</text>
      </g>

      <!-- Caja en movimiento -->
      <g id="caja">
        <polygon id="caja-top" points="0,-24 28,-11 0,2 -28,-11" fill="#f59e0b"/>
        <polygon id="caja-left" points="-28,-11 -28,13 0,26 0,2" fill="#d97706"/>
        <polygon id="caja-right" points="0,2 28,-11 28,13 0,26" fill="#b45309"/>
      </g>
    </svg>
  `;
}

export function updateEmpaquetadora() {
  const caja = document.getElementById('caja');
  const compuerta = document.getElementById('compuerta');
  const beam = document.getElementById('fotocelula-beam');
  const ledSup = document.getElementById('foto-led-sup');
  const ledInf = document.getElementById('foto-led-inf');
  const ramaGrandes = document.getElementById('rama-grandes');
  const ramaPequenas = document.getElementById('rama-pequenas');
  const contAzul = document.getElementById('contenedor-azul');
  const contAmarillo = document.getElementById('contenedor-amarillo');

  // MOVIMIENTO DE LA CAJA
  if (caja) {
    let x, y;

    if (IO.caja_grande && (IO.cilindro_extendido || IO.caja_empujada)) {
      // Caja grande: la compuerta la desvía por la rama superior
      const p = clamp01((IO.caja_x - 340) / (520 - 340));
      x = lerp(RUTA.junction.x, RUTA.grandes.x, p);
      y = lerp(RUTA.junction.y, RUTA.grandes.y, p);
    } else if (!IO.caja_grande && IO.caja_x > 340) {
      // Caja pequeña: sigue por la rama inferior
      const p = clamp01((IO.caja_x - 340) / (400 - 340));
      x = lerp(RUTA.junction.x, RUTA.pequenas.x, p);
      y = lerp(RUTA.junction.y, RUTA.pequenas.y, p);
    } else {
      // Tramo común: desde el inicio hasta la fotocélula
      const p = clamp01((IO.caja_x - 120) / (340 - 120));
      x = lerp(RUTA.inicio.x, RUTA.junction.x, p);
      y = lerp(RUTA.inicio.y, RUTA.junction.y, p);
    }

    caja.setAttribute('transform', `translate(${x}, ${y})`);

    // Color de la caja: azul si es grande, amarilla si es pequeña
    const colorBase = IO.caja_grande ? '#60a5fa' : '#fbbf24';
    const colorOscuro = IO.caja_grande ? '#3b82f6' : '#f59e0b';
    const colorSombra = IO.caja_grande ? '#2563eb' : '#d97706';
    document.getElementById('caja-top').setAttribute('fill', colorBase);
    document.getElementById('caja-left').setAttribute('fill', colorOscuro);
    document.getElementById('caja-right').setAttribute('fill', colorSombra);
  }

  // COMPUERTA DESVIADORA
  if (compuerta) {
    const angulo = IO.cilindro_extendido ? -18 : 18;
    compuerta.setAttribute('transform', `rotate(${angulo} 430 230)`);
    const barra = compuerta.querySelector('rect');
    if (barra) {
      barra.setAttribute('fill', IO.cilindro_extendido ? '#3b82f6' : '#f59e0b');
    }
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

  // RAMA ACTIVA SEGÚN EL TIPO DE CAJA
  if (ramaGrandes) {
    ramaGrandes.setAttribute('opacity', IO.caja_x > 300 && IO.caja_grande ? '1' : '0.35');
  }
  if (ramaPequenas) {
    ramaPequenas.setAttribute('opacity', IO.caja_x > 300 && !IO.caja_grande ? '1' : '0.35');
  }

  // LLENADO VISUAL DE CONTENEDORES
  if (contAzul && contAmarillo) {
    contAzul.querySelectorAll('.caja-apilada').forEach(e => e.remove());
    contAmarillo.querySelectorAll('.caja-apilada').forEach(e => e.remove());

    const apilar = (cont, cantidad, colores) => {
      for (let i = 0; i < cantidad; i++) {
        const cubo = crearCubo(...colores);
        const col = i % 4;
        const fila = Math.floor(i / 4);
        cubo.setAttribute('transform', `translate(${40 + col * 33}, ${80 - fila * 24}) scale(0.7)`);
        cubo.setAttribute('class', 'caja-apilada');
        cont.appendChild(cubo);
      }
    };

    apilar(contAzul, IO.contador1, ['#60a5fa', '#3b82f6', '#2563eb']);
    apilar(contAmarillo, IO.contador2, ['#fbbf24', '#f59e0b', '#d97706']);
  }
}
