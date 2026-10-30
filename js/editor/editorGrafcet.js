import { GrafcetModel } from '../core/grafcetModel.js';

export class EditorGrafcet {
  constructor(container, onUpdate) {
    this.container = container;
    this.onUpdate = onUpdate;
    
    // Crear SVG base
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.container.innerHTML = '';
    this.container.appendChild(this.svg);

    this.elementoSeleccionado = null;
    this.isDragging = false;
    this.dragTarget = null;
    this.offsetX = 0;
    this.offsetY = 0;

    this.initEventos();
    this.render();
  }

  initEventos() {
    // Movimiento global para arrastrar
    this.svg.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.dragTarget) {
        const pt = this.getMousePos(e);
        this.dragTarget.x = pt.x - this.offsetX;
        this.dragTarget.y = pt.y - this.offsetY;
        this.render();
      }
    });

    this.svg.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.dragTarget = null;
    });

    this.svg.addEventListener('mouseleave', () => {
      this.isDragging = false;
      this.dragTarget = null;
    });
  }

  getMousePos(evt) {
    const rect = this.svg.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  // Llamado desde main.js cuando se hace clic en la paleta
  agregarElemento(tipo) {
    const cx = this.container.clientWidth / 2;
    const cy = this.container.clientHeight / 2;
    // Añadir algo de aleatoriedad para que no se apilen
    const rx = cx + (Math.random() * 40 - 20);
    const ry = cy + (Math.random() * 40 - 20);

    if (tipo === 'etapa') {
      GrafcetModel.agregarEtapa(rx, ry, GrafcetModel.etapas.length === 0); // 1ª etapa es inicial
    } else if (tipo === 'transicion') {
      GrafcetModel.agregarTransicion(rx, ry);
    }
    this.render();
  }

  // Lógica de selección y creación de conexiones
  seleccionarNodo(id) {
    if (!this.elementoSeleccionado) {
      // Si no hay nada seleccionado, seleccionamos este
      this.elementoSeleccionado = id;
    } else {
      // Si ya había uno seleccionado...
      const el1 = GrafcetModel.getElemento(this.elementoSeleccionado);
      const el2 = GrafcetModel.getElemento(id);

      // Si son de distinto tipo, conectamos
      if (el1 && el2 && el1.type !== el2.type) {
        if (GrafcetModel.agregarConexion(el1.id, el2.id)) {
          this.elementoSeleccionado = null; // Resetear
        }
      } else {
        // Si es el mismo o mismo tipo, cambiamos la selección
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
      document.getElementById('input-cond').addEventListener('input', (e) => {
        el.condicion = e.target.value;
        this.onUpdate(); // Notificar a main.js
      });
    } else {
      panel.innerHTML = `
        <label>Etapa (${el.id}) - ${el.inicial ? 'INICIAL' : ''}</label>
        <input type="text" placeholder="Acciones (ej: motor=1)" disabled title="Próximamente">
      `;
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
      <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" class="flecha-conexion" />
      </marker>
    `;
    this.svg.appendChild(defs);

    // 2. Dibujar Etapas
    GrafcetModel.etapas.forEach(etapa => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${etapa.x}, ${etapa.y})`);
      g.setAttribute('class', `nodo-svg etapa-svg ${etapa.inicial ? 'inicial' : ''} ${this.elementoSeleccionado === etapa.id ? 'selected' : ''}`);
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '15');
      g.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '5');
      text.setAttribute('fill', etapa.inicial ? '#000' : '#fff');
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
      rect.setAttribute('x', '-20');
      rect.setAttribute('y', '-3');
      rect.setAttribute('width', '40');
      rect.setAttribute('height', '6');
      g.appendChild(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '25');
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
    // Click para seleccionar/conectar
    g.addEventListener('mousedown', (e) => {
      e.stopPropagation(); // Evitar que el lienzo se mueva
      this.seleccionarNodo(elemento.id);
      
      // Preparar arrastre
      this.isDragging = true;
      this.dragTarget = elemento;
      const pt = this.getMousePos(e);
      this.offsetX = pt.x - elemento.x;
      this.offsetY = pt.y - elemento.y;
    });
  }
}