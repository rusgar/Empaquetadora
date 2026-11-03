// Modelo de datos para el GRAFCET del alumno
export const GrafcetModel = {
  etapas: [],
  transiciones: [],
  conexiones: [], // { origenId, destinoId }
  
  // Contadores para IDs únicos
  _nextId: 1,

  agregarEtapa(x, y, inicial = false) {
    const id = 'E' + this._nextId++;
    const etapa = { id, type: 'etapa', x, y, inicial, acciones: [] }; // <-- AQUÍ ESTÁ LA CLAVE
    this.etapas.push(etapa);
    return etapa;
  },

  agregarTransicion(x, y) {
    const id = 'T' + this._nextId++;
    const trans = { id, type: 'transicion', x, y, condicion: 'TRUE' };
    this.transiciones.push(trans);
    return trans;
  },

  agregarConexion(origenId, destinoId) {
    // Evitar duplicados o conexiones circulares básicas
    if (origenId === destinoId) return false;
    const existe = this.conexiones.find(c => 
      (c.origenId === origenId && c.destinoId === destinoId) || 
      (c.origenId === destinoId && c.destinoId === origenId)
    );
    if (!existe) {
      this.conexiones.push({ origenId, destinoId });
      return true;
    }
    return false;
  },

  getElemento(id) {
    return this.etapas.find(e => e.id === id) || this.transiciones.find(t => t.id === id);
  },

  // Importar desde Draw.io (XML)
  importarDrawio(xmlString) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');
      const cells = Array.from(doc.querySelectorAll('mxCell'));

      // Separar vértices y aristas
      const vertices = cells.filter(c => c.getAttribute('vertex') === '1');
      const edges = cells.filter(c => c.getAttribute('edge') === '1');

      if (vertices.length === 0) return false;

      // Limpiar modelo actual
      this.etapas = [];
      this.transiciones = [];
      this.conexiones = [];
      this._nextId = 1;

      // Mapa de id de Draw.io -> id de GRAFCET
      const idMap = new Map();

      // Crear etapas y transiciones
      vertices.forEach(v => {
        const geo = v.querySelector('mxGeometry');
        const x = parseFloat(geo?.getAttribute('x') || '0');
        const y = parseFloat(geo?.getAttribute('y') || '0');
        const style = v.getAttribute('style') || '';
        const value = (v.getAttribute('value') || '').trim();

        // Determinar tipo: etapa si el estilo contiene 'ellipse' o el valor empieza con E
        // transición si el estilo contiene 'rounded=0' o el valor empieza con T
        const esEtapa = style.includes('ellipse') || /^E\d/i.test(value) || value.toLowerCase().includes('etapa');
        const esTransicion = style.includes('rounded=0') || /^T\d/i.test(value) || value.toLowerCase().includes('trans');

        // Extraer acciones/condiciones del valor (formato: "E1\nmotor_cinta=1" o "T2: fotocelula==true")
        let acciones = [];
        let condicion = 'TRUE';
        const lineas = value.split(/\n|<br\s*\/?>/i).map(l => l.trim()).filter(l => l);
        const primeraLinea = lineas[0] || '';

        if (esEtapa) {
          const etapa = this.agregarEtapa(x, y, this.etapas.length === 0);
          // Buscar acciones en las líneas siguientes
          lineas.slice(1).forEach(l => {
            if (l.includes('=')) acciones.push(l);
          });
          etapa.acciones = acciones;
          idMap.set(v.getAttribute('id'), etapa.id);
        } else if (esTransicion) {
          const trans = this.agregarTransicion(x, y);
          // Buscar condición en las líneas siguientes o en la primera si contiene operadores
          if (lineas.length > 1) {
            condicion = lineas.slice(1).join(' ');
          } else if (primeraLinea.includes('==') || primeraLinea.includes('>') || primeraLinea.includes('&&')) {
            condicion = primeraLinea;
          }
          trans.condicion = condicion || 'TRUE';
          idMap.set(v.getAttribute('id'), trans.id);
        }
      });

      // Crear conexiones
      edges.forEach(e => {
        const source = idMap.get(e.getAttribute('source'));
        const target = idMap.get(e.getAttribute('target'));
        if (source && target) {
          this.agregarConexion(source, target);
        }
      });

      return true;
    } catch (err) {
      console.error('Error al importar Draw.io:', err);
      return false;
    }
  },
    exportarJSON() {
    return JSON.stringify({
      etapas: this.etapas,
      transiciones: this.transiciones,
      conexiones: this.conexiones,
      nextId: this._nextId
    }, null, 2);
  },

  importarJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this.etapas = data.etapas || [];
      this.transiciones = data.transiciones || [];
      this.conexiones = data.conexiones || [];
      this._nextId = data.nextId || 1;
      return true;
    } catch (e) {
      console.error("Error al importar JSON", e);
      return false;
    }
  }
};