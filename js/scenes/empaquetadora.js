import { IO } from '../core/ioModel.js';

export function renderEmpaquetadora(container) {
  container.innerHTML = `
    <svg id="svg-escena" viewBox="0 0 600 260" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="220" width="600" height="40" fill="#1e293b"/>
      <rect x="40" y="190" width="360" height="20" rx="6" fill="#475569"/>
      
      <!-- Ruedas de la cinta (giran si hay movimiento) -->
      <circle id="rueda1" cx="60" cy="200" r="10" fill="#334155" />
      <circle id="rueda2" cx="380" cy="200" r="10" fill="#334155" />

      <!-- Caja -->
      <rect id="caja" x="120" y="160" width="40" height="30" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
      
      <!-- Check de éxito -->
      <circle id="circulo-check" cx="140" cy="175" r="20" fill="#22c55e" style="display:none;" />
      <text id="check-caja" x="140" y="183" font-size="24" fill="#fff" text-anchor="middle" font-weight="bold" style="display:none;">✓</text>

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
  const circuloCheck = document.getElementById('circulo-check');
  const rueda1 = document.getElementById('rueda1');
  const rueda2 = document.getElementById('rueda2');

  if (caja) {
    caja.setAttribute('x', IO.caja_x);
    
    // Efecto visual: vibración mientras la cinta está en marcha
    if (IO.motor_cinta && !IO.caja_empujada && IO.caja_x < 340) {
      // Temblor de la caja
      const offsetY = Math.sin(Date.now() / 30) * 2; 
      caja.setAttribute('y', 160 + offsetY);
      
      // Rotación de las ruedas de la cinta
      rueda1.setAttribute('transform', `rotate(${Date.now() % 360}, 60, 200)`);
      rueda2.setAttribute('transform', `rotate(${Date.now() % 360}, 380, 200)`);
    } else {
      caja.setAttribute('y', 160);
    }
  }
  
  if (vastago) {
    if (IO.cilindro_extendido) {
      // El vástago se mueve suavemente
      vastago.setAttribute('x', '400');
    } else {
      vastago.setAttribute('x', '450');
    }
  }

  if (haz) {
    haz.setAttribute('stroke', IO.fotocelula ? '#ef4444' : '#38bdf8');
    haz.setAttribute('stroke-width', IO.fotocelula ? '3' : '1');
  }

  if (check && circuloCheck) {
    if (IO.timer_check > 0 && IO.caja_empujada) {
      check.style.display = 'block';
      circuloCheck.style.display = 'block';
      
      const checkX = IO.caja_x + 20;
      check.setAttribute('x', checkX);
      circuloCheck.setAttribute('cx', checkX);
      circuloCheck.setAttribute('cy', 175);
      circuloCheck.setAttribute('r', 18);
      check.setAttribute('y', 183);
    } else {
      check.style.display = 'none';
      circuloCheck.style.display = 'none';
    }
  }
}