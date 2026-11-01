import { IO } from '../core/ioModel.js';

export function renderEmpaquetadora(container) {
  // Reescalamos el viewBox para que quepa la vista isométrica
  container.innerHTML = `
    <svg id="svg-escena" viewBox="0 0 800 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      
      <!-- Suelo -->
      <polygon points="400,50 780,250 400,450 20,250" fill="#1e293b" />
      
      <!-- Cinta Principal (Línea central) -->
      <polygon points="200,250 400,150 600,250 400,350" fill="#334155" stroke="#475569" stroke-width="2" />
      
      <!-- Cinta Secundaria A (Desvío Izquierda) -->
      <polygon points="350,275 250,325 150,275 250,225" fill="#334155" stroke="#475569" stroke-width="2" />
      
      <!-- Cinta Secundaria B (Sigue Recto) -->
      <polygon points="450,275 550,325 650,275 550,225" fill="#334155" stroke="#475569" stroke-width="2" />

      <!-- Fotocélula -->
      <rect x="380" y="200" width="40" height="4" fill="#38bdf8" transform="rotate(-26.5 400 200)"/>
      
      <!-- Pistón Empujador -->
      <g id="piston" transform="translate(400, 150)">
         <rect x="-15" y="0" width="30" height="40" fill="#64748b" rx="4"/>
         <rect id="vastago" x="-5" y="40" width="10" height="30" fill="#94a3b8"/>
      </g>

      <!-- Contenedor 1 (Final Cinta A) -->
      <g id="contenedor1" transform="translate(120, 250)">
        <polygon points="0,40 30,55 60,40 30,25" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
        <text x="30" y="45" fill="#22c55e" font-size="12" text-anchor="middle" font-weight="bold">CAJA 1</text>
      </g>

      <!-- Contenedor 2 (Final Cinta B) -->
      <g id="contenedor2" transform="translate(620, 250)">
        <polygon points="0,40 30,55 60,40 30,25" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
        <text x="30" y="45" fill="#22c55e" font-size="12" text-anchor="middle" font-weight="bold">CAJA 2</text>
      </g>

      <!-- Caja Física -->
      <g id="caja" transform="translate(200, 250)">
        <polygon points="0,20 20,30 40,20 20,10" fill="#f59e0b" />
        <polygon points="0,20 0,40 20,50 20,30" fill="#d97706" />
        <polygon points="20,30 40,20 40,40 20,50" fill="#b45309" />
        <text id="caja-texto" x="20" y="38" fill="#fff" font-size="10" text-anchor="middle" style="display:none;">✓</text>
      </g>

      <!-- Efecto Check -->
      <text id="check-flotante" x="0" y="0" fill="#22c55e" font-size="24" font-weight="bold" style="display:none;">✓</text>
    </svg>
  `;
}

export function updateEmpaquetadora() {
  const caja = document.getElementById('caja');
  const vastago = document.getElementById('vastago');
  const checkFlotante = document.getElementById('check-flotante');

  // Movimiento de la caja (Simulando la perspectiva)
  if (caja) {
    // Movimiento en X e Y para simular la diagonal
    // IO.caja_x va de 120 a 500 en la lógica, lo mapeamos a la diagonal
    let x = 200 + (IO.caja_x - 120); 
    let y = 250 - ((IO.caja_x - 120) * 0.5); // Sube en Y mientras avanza en X

    // Si está empujada, la movemos hacia la cinta izquierda (A)
    if (IO.caja_empujada) {
       x -= 100;
       y -= 50;
    }

    caja.setAttribute('transform', `translate(${x}, ${y})`);
  }
  
  if (vastago) {
    if (IO.cilindro_extendido) {
      vastago.setAttribute('height', '60');
      vastago.setAttribute('fill', '#ef4444'); // Rojo cuando empuja
    } else {
      vastago.setAttribute('height', '30');
      vastago.setAttribute('fill', '#94a3b8');
    }
  }

  // Mostrar check flotante cuando se ha empujado
  if (checkFlotante) {
    if (IO.timer_check > 0) {
      checkFlotante.style.display = 'block';
      checkFlotante.setAttribute('x', IO.caja_x + 150);
      checkFlotante.setAttribute('y', 200);
    } else {
      checkFlotante.style.display = 'none';
    }
  }
}