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

export function updateEmpaquetadora() {
  const caja = document.getElementById('caja');
  const vastago = document.getElementById('vastago');
  const contAzul = document.getElementById('contenedor-azul');
  const contAmarillo = document.getElementById('contenedor-amarillo');

  // MOVIMIENTO
  if (caja) {
    let x = 150 + (IO.caja_x - 120) * 0.8; // Ajuste de escala
    let y = 160 - ((IO.caja_x - 120) * 0.4);

    if (IO.caja_empujada) { x -= 50; y -= 25; } // Desvío visual

    caja.setAttribute('transform', `translate(${x}, ${y})`);
    
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