import { IO } from '../core/ioModel.js';

export function renderEmpaquetadora(container) {
  container.innerHTML = `
    <svg id="svg-escena" viewBox="0 0 600 260" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Suelo -->
      <rect x="0" y="220" width="600" height="40" fill="#1e293b"/>
      <!-- Cinta -->
      <rect x="40" y="190" width="360" height="20" rx="6" fill="#475569"/>
      <circle cx="60" cy="200" r="10" fill="#334155"/>
      <circle cx="380" cy="200" r="10" fill="#334155"/>
      <!-- Caja -->
      <rect id="caja" x="120" y="160" width="40" height="30" fill="#f59e0b" stroke="#0f172a"/>
      <!-- Check de éxito en la caja -->
      <text id="check-caja" x="140" y="182" font-size="22" fill="#22c55e" text-anchor="middle" font-weight="bold" style="display:none;">✅</text>
      <!-- Fotocélula -->
      <rect x="300" y="150" width="8" height="40" fill="#38bdf8"/>
      <line id="haz-foto" x1="308" y1="170" x2="340" y2="170" stroke="#38bdf8" stroke-dasharray="4 3"/>
      <!-- Cilindro -->
      <rect x="420" y="170" width="30" height="40" fill="#64748b"/>
      <rect id="vastago" x="450" y="185" width="40" height="10" fill="#94a3b8"/>
      <!-- Bandeja -->
      <rect x="500" y="180" width="80" height="30" rx="4" fill="#334155" stroke="#475569"/>
    </svg>
  `;
}

export function updateEmpaquetadora() {
  const caja = document.getElementById('caja');
  const vastago = document.getElementById('vastago');
  const haz = document.getElementById('haz-foto');
  const check = document.getElementById('check-caja');

  if (caja) {
    caja.setAttribute('x', IO.caja_x);
    // Ocultar la caja si se está mostrando el check (para que no se mueva)
    if (IO.timer_check > 0) {
      caja.setAttribute('fill', '#f59e0b'); 
    }
  }
  
  if (vastago) {
    if (IO.cilindro_extendido) {
      vastago.setAttribute('x', '400');
    } else {
      vastago.setAttribute('x', '450');
    }
  }

  if (haz) {
    haz.setAttribute('stroke', IO.fotocelula ? '#ef4444' : '#38bdf8');
    haz.setAttribute('stroke-width', IO.fotocelula ? '3' : '1');
  }

  // Lógica del check
  if (check) {
    if (IO.timer_check > 0 && IO.caja_empujada) {
      check.style.display = 'block'; // Mostrar check
      check.setAttribute('x', IO.caja_x + 20); // Centrarlo sobre la caja
    } else {
      check.style.display = 'none'; // Ocultar check
    }
  }
}