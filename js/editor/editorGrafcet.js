import { GrafcetModel } from '../core/grafcetModel.js';

export class EditorGrafcet {
  constructor(container, onUpdate) {
    this.container = container;
    this.onUpdate = onUpdate;
    
    // Crear SVG base
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.style.display = 'block';
    this.container.innerHTML = '';
    this.container.appendChild(this.svg);

    this.elementoSeleccionado = null;
    
    // Variables para el arrastre
    this.isDragging = false;
    this.hasMoved = false;
    this.dragTarget = null;
    this.startX = 0;
    this.startY = 0;

    this.initEventos();
    this.render();
  }

  initEventos() {
    // Capturamos el movimiento a nivel de documento para que no falle
    // si el ratón se sale del lienzo mientras arrastramos.
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.dragTarget) {
        const pt = this.getMousePos(e);
        // Si se mueve más de 3 píxeles, consideramos que es un arrastre real
        if (Math.abs(pt.x - this.startX) > 3 || Math.abs(pt.y - this.startY) > 3) {
          this.hasMoved = true;
        }
        
        if (this.hasMoved) {
          this.dragTarget.x = pt.x;
          this.dragTarget.y = pt.y;
          this.render();
        }
      }
    });

    document.addEventListener('mouseup', () => {
      // Al soltar, si no se ha movido, es un clic (seleccionar/conectar)
      if (this.isDragging && !this.hasMoved && this.dragTarget) {
        this.seleccionarNodo(this.dragTarget.id);
      }
      this.isDragging = false;
      this.dragTarget = null;
      this.hasMoved = false;
    });

    // Deseleccionar si se hace clic en el fondo del lienzo
    this.svg.addEventListener('mousedown', (e) => {
      if (e.target === this.svg) {
        this.elementoSeleccionado = null;
        this.render();
        this.actualizarPanelPropiedades();
      }
    });
  }

  getMousePos(evt) {
    // Usamos getBoundingClientRect para calcular la posición exacta
    // relativa al SVG, independientemente del scroll o bordes.
    const rect = this.svg.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  agregarElemento(tipo) {
    // Los añadimos un poco alejados del centro para que no se superpongan
    const cx = this.container.clientWidth / 2 + (Math.random() * 100 - 50);
    const cy = this.container.clientHeight / 2 + (Math.random() * 100 - 50);

    if (tipo === 'etapa') {
      GrafcetModel.agregarEtapa(cx, cy, GrafcetModel.etapas.length === 0);
    } else if (tipo === 'transicion') {
      GrafcetModel.agregarTransicion(cx, cy);
    }
    this.render();
  }

  seleccionarNodo(id) {
    if (!this.elementoSeleccionado) {
      // Primer clic: seleccionar
      this.elementoSeleccionado = id;
    } else {
      // Segundo clic: intentar conectar
      const el1 = GrafcetModel.getElemento(this.elementoSeleccionado);
      const el2 = GrafcetModel.getElemento(id);

      if (el1 && el2 && el1.type !== el2.type) {
        // Si son de distinto tipo, conectamos (Etapa->Transición o Transición->Etapa)
        if (GrafcetModel.agregarConexion(el1.id, el2.id)) {
          console.log(`Conexión creada: ${el1.id} -> ${el2.id}`);
        }
        this.elementoSeleccionado = null; // Limpiar selección tras conectar
      } else {
        // Si son del mismo tipo o el mismo, cambiamos la selección
        this.elementoSeleccionado = (this.elementoSeleccionado === id) ? null : id;
      }
    }
    this.render();
    this.actualizarPanelPropiedades();
  }

  actualizarPanelPropiedades() {
    let panel = document.getElementById('panel-props');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'panel-props';
      panel.className = 'panel-propiedades';
      this.container.appendChild(panel);
    }

    if (!this.elementoSeleccionado) {
      panel.classList.remove('activo');
      return;
    }

    const el = GrafcetModel.getElemento(this.elementoSeleccionado);
    if (!el) return;

    panel.classList.add('activo');
    if (el.type === 'transicion') {
      panel.innerHTML = `
        <label>Condición de Transición (${el.id})</label>
        <input type="text" id="input-cond" value="${el.condicion}">
      `;
      // Evitar que el input cierre la selección al hacer clic
      panel.onmousedown = (e) => e.stopPropagation(); 
      
      document.getElementById('input-cond').addEventListener('input', (e) => {
        el.condicion = e.target.value;
        this.onUpdate();
      });
    } else {
      panel.innerHTML = `
        <label>Etapa (${el.id}) - ${el.inicial ? 'INICIAL' : ''}</label>
        <p style="font-size:0.75rem; color:#94a3b8;">Haz clic en una transición para conectarla.</p>
      `;
      panel.onmousedown = (e) => e.stopPropagation();
    }
  }

  render() {
    this.svg.innerHTML = '';

    // 1. Dibujar conexiones (líneas)
    GrafcetModel.conexiones.forEach(conn => {
      const origen = GrafcetModel.getElemento(conn.origenId);
      const destino = GrafcetModel.getElemento(conn.destinoId);
      if (origen && destino) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', origen.x);
        line.setAttribute('y1', origen.y);
        line.setAttribute('x2', destino.x);
        line.setAttribute('y2', destino.y);
        line.setAttribute('class', 'linea-conexion');
        line.setAttribute('marker-end', 'url(#arrow)');
        this.svg.appendChild(line);
      }
    });

    // Definir flecha para las líneas
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="arrow" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" class="flecha-conexion" />
      </marker>
    `;
    this.svg.appendChild(defs);

    // 2. Dibujar Etapas
    GrafcetModel.etapas.forEach(etapa => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      // Centramos el nodo en el cursor usando translate
      g.setAttribute('transform', `translate(${etapa.x}, ${etapa.y})`);
      g.setAttribute('class', `nodo-svg etapa-svg ${etapa.inicial ? 'inicial' : ''} ${this.elementoSeleccionado === etapa.id ? 'selected' : ''}`);
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '18'); // Un poco más grande para clicar fácil
      g.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '5');
      text.setAttribute('fill', etapa.inicial ? '#000' : '#fff');
      text.setAttribute('font-weight', 'bold');
      text.textContent = etapa.id;
      g.appendChild(text);

      this.attachEvents(g, etapa);
      this.svg.appendChild(g);
    });

    // 3. Dibujar Transiciones
    GrafcetModel.transiciones.forEach(trans => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${trans.x}, ${trans.y})`);
      g.setAttribute('class', `nodo-svg transicion-svg ${this.elementoSeleccionado === trans.id ? 'selected' : ''}`);
      
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', '-25');
      rect.setAttribute('y', '-4');
      rect.setAttribute('width', '50');
      rect.setAttribute('height', '8');
      rect.setAttribute('rx', '2');
      g.appendChild(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '30');
      text.setAttribute('y', '4');
      text.setAttribute('fill', '#94a3b8');
      text.setAttribute('font-size', '10');
      text.textContent = trans.id;
      g.appendChild(text);

      this.attachEvents(g, trans);
      this.svg.appendChild(g);
    });
  }

  attachEvents(g, elemento) {
    g.addEventListener('mousedown', (e) => {
      e.stopPropagation(); // Evita que se active el clic en el fondo
      e.preventDefault(); // Evita selección de texto no deseada
      
      this.isDragging = true;
      this.hasMoved = false;
      this.dragTarget = elemento;
      
      const pt = this.getMousePos(e);
      this.startX = pt.x;
      this.startY = pt.y;

      // Guardamos el offset para que el nodo no salte al centro del ratón
      this.offsetX = pt.x - elemento.x;
      this.offsetY = pt.y - elemento.y;
    });
  }
}