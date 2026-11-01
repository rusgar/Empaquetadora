import { GrafcetModel } from '../core/grafcetModel.js';

export class EditorGrafcet {
  constructor(container, onUpdate) {
    this.container = container;
    this.onUpdate = onUpdate;
    this.inspectorContainer = document.getElementById('inspector');
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
    this._zoomManual = false;
    
    // Variables para el arrastre
    this.isDragging = false;
    this.hasMoved = false;
    this.dragTarget = null;
    this.startX = 0;
    this.startY = 0;

    this.initEventos();
    this.render();
    this.actualizarInspector();
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
        this.actualizarInspector();
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
    this.actualizarInspector();
  }

  // ===== Inspector de instrucciones (columna izquierda) =====
  actualizarInspector() {
    const cont = this.inspectorContainer;
    if (!cont) return;

    if (!this.elementoSeleccionado) {
      cont.innerHTML = `
        <div class="insp-vacio">
          Selecciona una <b>etapa</b> o una <b>transición</b> en el lienzo
          para editar sus instrucciones aquí.
        </div>`;
      return;
    }

    const el = GrafcetModel.getElemento(this.elementoSeleccionado);
    if (!el) {
      this.elementoSeleccionado = null;
      this.actualizarInspector();
      return;
    }

    if (el.type === 'etapa') {
      this.renderInspectorEtapa(el, cont);
    } else {
      this.renderInspectorTransicion(el, cont);
    }
  }

  renderInspectorEtapa(el, cont) {
    if (!el.acciones) el.acciones = [];
    const disponibles = [
      'motor_cinta=1', 'motor_cinta=0',
      'cilindro=1', 'cilindro=0',
      'contador1+1', 'contador2+1'
    ].filter(a => !el.acciones.includes(a));

    cont.innerHTML = `
      <h3>Instrucciones <span class="insp-id">${el.id}</span></h3>
      <div class="insp-sub">Acciones de la etapa</div>
      <div class="chips">
        ${el.acciones.length
          ? el.acciones.map((a, i) => `
              <span class="chip">${a}<button data-quitar="${i}" title="Quitar">×</button></span>`).join('')
          : '<span class="insp-vacio">Sin acciones todavía.</span>'}
      </div>
      <div class="insp-sub">Añadir acción</div>
      <div class="var-grid">
        ${disponibles.map(a => `<button class="chip-add" data-agregar="${a}">+ ${a}</button>`).join('')}
      </div>
    `;

    cont.querySelectorAll('[data-agregar]').forEach(btn => {
      btn.addEventListener('click', () => {
        const accion = btn.getAttribute('data-agregar');
        if (!el.acciones.includes(accion)) el.acciones.push(accion);
        this.render();
        this.actualizarInspector();
        this.onUpdate();
      });
    });

    cont.querySelectorAll('[data-quitar]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.getAttribute('data-quitar'), 10);
        el.acciones.splice(i, 1);
        this.render();
        this.actualizarInspector();
        this.onUpdate();
      });
    });
  }

  renderInspectorTransicion(el, cont) {
    const variables = [
      'fotocelula1', 'fotocelula2', 'forma', 'color',
      'motor_cinta', 'caja_empujada', 'timer_fin_caja',
      'contador1', 'contador2', 'contador3', 'contador4', 'contador5',
      'contador6', 'contador7', 'contador8', 'contador9'
    ];
    const operadores = ['==', '!=', '>', '<', '&&', '||', '!', 'true', 'false'];
    const presets = [
      'fotocelula1==true && forma==0',
      'fotocelula1==true && forma==1',
      'fotocelula1==true && forma==2',
      'fotocelula2==true && color==0',
      'fotocelula2==true && color==1',
      'fotocelula2==true && color==2',
      'caja_empujada == true',
      'TRUE'
    ];
    const cond = (el.condicion || '').replace(/"/g, '&quot;');

    cont.innerHTML = `
      <h3>Condición <span class="insp-id">${el.id}</span></h3>
      <input id="insp-cond" class="cond-input" type="text" value="${cond}" placeholder="Ej: fotocelula==true">
      <div class="insp-sub">Variables</div>
      <div class="var-grid">
        ${variables.map(v => `<button class="var-btn" data-insert="${v}">${v}</button>`).join('')}
      </div>
      <div class="insp-sub">Operadores</div>
      <div class="var-grid">
        ${operadores.map(o => `<button class="var-btn" data-insert="${o}">${o}</button>`).join('')}
      </div>
      <div class="insp-sub">Condiciones típicas</div>
      ${presets.map(p => `<button class="preset-btn" data-preset="${p}">${p}</button>`).join('')}
    `;

    const input = cont.querySelector('#insp-cond');
    const aplicar = (valor) => {
      el.condicion = valor;
      this.render();
      this.onUpdate();
    };

    input.addEventListener('input', (e) => aplicar(e.target.value));

    cont.querySelectorAll('[data-insert]').forEach(btn => {
      btn.addEventListener('click', () => {
        const texto = btn.getAttribute('data-insert');
        const ini = (document.activeElement === input && input.selectionStart != null)
          ? input.selectionStart
          : input.value.length;
        const fin = (document.activeElement === input && input.selectionEnd != null)
          ? input.selectionEnd
          : input.value.length;
        const nuevo = input.value.slice(0, ini) + texto + input.value.slice(fin);
        input.value = nuevo;
        input.focus();
        input.setSelectionRange(ini + texto.length, ini + texto.length);
        aplicar(nuevo);
      });
    });

    cont.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const texto = btn.getAttribute('data-preset');
        input.value = texto;
        aplicar(texto);
      });
    });
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
      circle.setAttribute('r', '22');
      g.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '5');
      // El texto es negro si está activa o es inicial, blanco si no
      text.setAttribute('fill', (etapa.inicial || estaActiva) ? '#000' : '#fff');
      text.setAttribute('font-weight', 'bold');
      text.textContent = etapa.id;
      g.appendChild(text);

      // Badge con el número de acciones (el detalle está en la paleta)
      if (etapa.acciones && etapa.acciones.length > 0) {
        const badge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        badge.setAttribute('transform', 'translate(26, -24)');

        const bCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bCircle.setAttribute('r', '10');
        bCircle.setAttribute('fill', '#1d4ed8');
        bCircle.setAttribute('stroke', '#93c5fd');
        bCircle.setAttribute('stroke-width', '1.5');
        badge.appendChild(bCircle);

        const bText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        bText.setAttribute('text-anchor', 'middle');
        bText.setAttribute('dy', '4');
        bText.setAttribute('fill', '#dbeafe');
        bText.setAttribute('font-size', '11');
        bText.setAttribute('font-weight', 'bold');
        bText.textContent = etapa.acciones.length;
        badge.appendChild(bText);

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = etapa.acciones.join(', ');
        badge.appendChild(title);

        g.appendChild(badge);
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

      // Etiqueta corta de la condición (el texto completo está en la paleta)
      if (trans.condicion && trans.condicion !== 'TRUE') {
        const textCond = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textCond.setAttribute('x', '0');
        textCond.setAttribute('y', '-12');
        textCond.setAttribute('text-anchor', 'middle');
        textCond.setAttribute('fill', '#fbbf24');
        textCond.setAttribute('font-size', '10');
        textCond.setAttribute('font-family', 'monospace');

        const condicion = trans.condicion;
        textCond.textContent = condicion.length > 18
          ? condicion.slice(0, 17) + '…'
          : condicion;

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = condicion;
        textCond.appendChild(title);

        g.appendChild(textCond);
      }

      this.attachEvents(g, trans);
      this.svg.appendChild(g);
    });

    // Auto-ajuste de la vista cuando cambia la estructura del GRAFCET
    const firma = GrafcetModel.etapas.map(e => e.id).join(',') + '|' +
                  GrafcetModel.transiciones.map(t => t.id).join(',') + '|' +
                  GrafcetModel.conexiones.length;
    if (firma !== this._firmaModelo && !this._zoomManual) {
      this._firmaModelo = firma;
      this.ajustarVista();
    }

    // Pista cuando el lienzo está vacío
    if (GrafcetModel.etapas.length === 0 && GrafcetModel.transiciones.length === 0) {
      const hint = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      hint.setAttribute('x', '50%');
      hint.setAttribute('y', '50%');
      hint.setAttribute('text-anchor', 'middle');
      hint.setAttribute('fill', '#64748b');
      hint.setAttribute('font-size', '14');
      hint.textContent = 'Lienzo vacío. Añade etapas/transiciones o pulsa DOCENTE.';
      this.svg.appendChild(hint);
    }
  }

  // Fuerza el reencuadre en la próxima llamada a render()
  solicitarAjuste() {
    this._firmaModelo = null;
    this._zoomManual = false;
  }

  // Zoom manual
  zoom(factor) {
    const vb = this.svg.getAttribute('viewBox');
    if (!vb) { this.solicitarAjuste(); this.render(); return; }
    const parts = vb.split(/\s+/).map(Number);
    if (parts.length !== 4) return;
    const [vx, vy, vw, vh] = parts;
    const cx = vx + vw / 2;
    const cy = vy + vh / 2;
    const newW = vw / factor;
    const newH = vh / factor;
    this.svg.setAttribute('viewBox', `${cx - newW / 2} ${cy - newH / 2} ${newW} ${newH}`);
    this._zoomManual = true;
  }
  zoomIn() { this.zoom(1.25); }
  zoomOut() { this.zoom(0.8); }
  fitView() { this.solicitarAjuste(); this.render(); }

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