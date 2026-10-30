// Cronómetro simple: arranca al cargar y muestra mm:ss.
// En pasos posteriores se conectará a RUN/PAUSE/STOP/RESET.
export function crearCronometro(el) {
  let segundos = 0;
  let intervalo = null;

  function pintar() {
    const m = String(Math.floor(segundos / 60)).padStart(2, '0');
    const s = String(segundos % 60).padStart(2, '0');
    el.textContent = `⏱ ${m}:${s}`;
  }

  return {
    start() {
      if (intervalo) return;
      intervalo = setInterval(() => { segundos++; pintar(); }, 1000);
    },
    pause() { clearInterval(intervalo); intervalo = null; },
    reset() { this.pause(); segundos = 0; pintar(); },
    get segundos() { return segundos; },
  };
}