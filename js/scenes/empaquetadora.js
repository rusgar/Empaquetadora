// Escena estática de la empaquetadora (SVG inline).
// En el Paso 3 se animará según IO.
export function renderEmpaquetadora(container) {
  container.innerHTML = `
    <svg viewBox="0 0 600 260" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Suelo -->
      <rect x="0" y="220" width="600" height="40" fill="#1e293b"/>
      <!-- Cinta transportadora -->
      <rect x="40" y="190" width="360" height="20" rx="6" fill="#475569"/>
      <circle cx="60" cy="200" r="10" fill="#334155"/>
      <circle cx="380" cy="200" r="10" fill="#334155"/>
      <!-- Caja sobre la cinta -->
      <rect id="caja" x="120" y="160" width="40" height="30" fill="#f59e0b" stroke="#0f172a"/>
      <!-- Fotocélula -->
      <rect x="300" y="150" width="8" height="40" fill="#38bdf8"/>
      <line x1="308" y1="170" x2="340" y2="170" stroke="#38bdf8" stroke-dasharray="4 3"/>
      <!-- Cilindro empujador -->
      <rect x="420" y="170" width="30" height="40" fill="#64748b"/>
      <rect id="vastago" x="450" y="185" width="40" height="10" fill="#94a3b8"/>
      <!-- Bandeja de salida -->
      <rect x="500" y="180" width="80" height="30" rx="4" fill="#334155" stroke="#475569"/>
      <text x="540" y="200" fill="#94a3b8" font-size="10" text-anchor="middle">SALIDA</text>
      <!-- Etiquetas -->
      <text x="140" y="150" fill="#94a3b8" font-size="10">CAJA</text>
      <text x="304" y="145" fill="#38bdf8" font-size="10">FOTOCÉLULA</text>
      <text x="435" y="160" fill="#94a3b8" font-size="10">CILINDRO</text>
    </svg>
  `;
}