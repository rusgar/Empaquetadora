import { GrafcetModel } from '../core/grafcetModel.js';

export class EditorGrafcet {
  constructor(container, onUpdate) {
    this.container = container;
    this.onUpdate = onUpdate;
    this.etapasActivas = new Set();
    
    // Crear SVG base
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.style.display = 'block';
    this.container.innerHTML = '';
    this.container.appendChild(this.svg);

    this.elementoSeleccionado = null;
    this._firmaModelo = null;
    
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
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.dragTarget) {
        const pt = this.getMousePos(e);
        // Umbral de 3 píxeles para diferenciar clic de arrastre
        if (Math.abs(pt.x - this.startX) > 3 || Math.abs(pt.y - this.startY) > 3) {
          this.hasMoved = true;
        }
        
        if (this.hasMoved) {
          this.dragTarget.x = pt.x - this.offsetX;
          this.dragTarget.y = pt.y - this.offsetY;
          this.render();
        }
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging && !this.hasMoved && this.dragTarget) {
        this.seleccionarNodo(this.dragTarget.id);
      }
      this.isDragging = false;
      this.dragTarget = null;
      this.hasMoved = false;
    });

    this.svg.addEventListener('mousedown', (e) => {
      if (e.target === this.svg) {
        this.elementoSeleccionado = null;
        this.render();
        this.actualizarPanelPropiedades();
      }
    });
  }

  getMousePos(evt) {
    const pt = this.svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = this.svg.getScreenCTM();
    if (!ctm) return { x: evt.clientX, y: evt.clientY };
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }

  agregarElemento(tipo) {
    // Centro del área visible convertido a coordenadas del SVG
    const rect = this.svg.getBoundingClientRect();
    const centro = this.getMousePos({
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2
    });
    const cx = centro.x + (Math.random() * 100 - 50);
    const cy = centro.y + (Math.random() * 100 - 50);

    if (tipo === 'etapa') {
      GrafcetModel.agregarEtapa(cx, cy, GrafcetModel.etapas.length === 0);
    } else if (tipo === 'transicion') {
      GrafcetModel.agregarTransicion(cx, cy);
    }
    this.render();
  }

  seleccionarNodo(id) {
    if (!this.elementoSeleccionado) {
      this.elementoSeleccionado = id;
    } else {
      const el1 = GrafcetModel.getElemento(this.elementoSeleccionado);
      const el2 = GrafcetModel.getElemento(id);

      if (el1 && el2 && el1.type !== el2.type) {
        if (GrafcetModel.agregarConexion(el1.id, el2.id)) {
          console.log(`Conexión creada: ${el1.id} -> ${el2.id}`);
        }
        this.elementoSeleccionado = null;
      } else {
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
        <p style="font-size:0.7rem; color:#94a3b8; margin-top:5px;">Ej: fotocelula==true</p>
      `;
      panel.onmousedown = (e) => e.stopPropagation(); 
      
      document.getElementById('input-cond').addEventListener('input', (e) => {
        el.condicion = e.target.value;
        this.render(); // Para actualizar el texto en el lienzo
        this.onUpdate();
      });
    } else {
      // Panel de Edición de Acciones para Etapas
      panel.innerHTML = `
        <label>Acciones de Etapa (${el.id})</label>
        <input type="text" id="input-accion" placeholder="Ej: motor_cinta=1" value="${el.acciones ? el.acciones.join(', ') : ''}">
        <p style="font-size:0.7rem; color:#94a3b8; margin-top:5px;">Separa múltiples acciones por coma.</p>
      `;
      panel.onmousedown = (e) => e.stopPropagation();
      
      document.getElementById('input-accion').addEventListener('input', (e) => {
        // Convertir string "motor_cinta=1, cilindro=1" a array
        el.acciones = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
        this.render(); // Para dibujar el texto al lado
        this.onUpdate();
      });
    }
  }

  // NUEVO MÉTODO: Para pintar las etapas de verde
  setEtapasActivas(set) {
    this.etapasActivas = set;
    this.render();
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
      g.setAttribute('transform', `translate(${etapa.x}, ${etapa.y})`);
      
      const estaActiva = this.etapasActivas.has(etapa.id);
      
      g.setAttribute('class', `nodo-svg etapa-svg ${etapa.inicial ? 'inicial' : ''} ${this.elementoSeleccionado === etapa.id ? 'selected' : ''} ${estaActiva ? 'activa' : ''}`);
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '18');
      g.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '5');
      // El texto es negro si está activa o es inicial, blanco si no
      text.setAttribute('fill', (etapa.inicial || estaActiva) ? '#000' : '#fff');
      text.setAttribute('font-weight', 'bold');
      text.textContent = etapa.id;
      g.appendChild(text);

      // Dibujar las acciones a la derecha de la etapa
      if (etapa.acciones && etapa.acciones.length > 0) {
        const textAcciones = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textAcciones.setAttribute('x', '25');
        textAcciones.setAttribute('y', '0');
        textAcciones.setAttribute('class', 'accion-texto');
        
        etapa.acciones.forEach((acc, i) => {
            const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan.setAttribute('x', '25');
            tspan.setAttribute('dy', i === 0 ? '0' : '1.2em');
            tspan.textContent = acc;
            textAcciones.appendChild(tspan);
        });
        g.appendChild(textAcciones);
      }

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

      // Mostrar la condición al lado de la transición (si no es TRUE)
      if (trans.condicion && trans.condicion !== 'TRUE') {
        const textCond = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textCond.setAttribute('x', '-25');
        textCond.setAttribute('y', '-12');
        textCond.setAttribute('fill', '#f59e0b');
        textCond.setAttribute('font-size', '11');
        textCond.setAttribute('font-family', 'monospace');
        textCond.textContent = trans.condicion;
        g.appendChild(textCond);
      }

      this.attachEvents(g, trans);
      this.svg.appendChild(g);
    });

    // Auto-ajuste de la vista cuando cambia la estructura del GRAFCET
    const firma = GrafcetModel.etapas.map(e => e.id).join(',') + '|' +
                  GrafcetModel.transiciones.map(t => t.id).join(',') + '|' +
                  GrafcetModel.conexiones.length;
    if (firma !== this._firmaModelo) {
      this._firmaModelo = firma;
      this.ajustarVista();
    }
  }

  // Fuerza el reencuadre en la próxima llamada a render()
  solicitarAjuste() {
    this._firmaModelo = null;
  }

  ajustarVista() {
    if (typeof this.svg.getBBox !== 'function') return;

    let bbox = null;
    try {
      bbox = this.svg.getBBox();
    } catch (e) {
      bbox = null;
    }

    const hayElementos = GrafcetModel.etapas.length + GrafcetModel.transiciones.length > 0;
    if (!bbox || bbox.width === 0 || bbox.height === 0) {
      // Si el navegador aún no ha calculado el layout, reintenta en el siguiente frame
      if (hayElementos && !this._fitPendiente) {
        this._fitPendiente = true;
        requestAnimationFrame(() => {
          this._fitPendiente = false;
          this.ajustarVista();
        });
      }
      return;
    }

    const pad = 55;
    const anchoMin = this.container.clientWidth || 400;
    const altoMin = this.container.clientHeight || 300;
    const vw = Math.max(bbox.width + pad * 2, anchoMin);
    const vh = Math.max(bbox.height + pad * 2, altoMin);
    const vx = bbox.x - pad - (vw - (bbox.width + pad * 2)) / 2;
    const vy = bbox.y - pad - (vh - (bbox.height + pad * 2)) / 2;

    this.svg.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`);
  }

  attachEvents(g, elemento) {
    g.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      this.isDragging = true;
      this.hasMoved = false;
      this.dragTarget = elemento;
      
      const pt = this.getMousePos(e);
      this.startX = pt.x;
      this.startY = pt.y;

      this.offsetX = pt.x - elemento.x;
      this.offsetY = pt.y - elemento.y;
    });
  }
}