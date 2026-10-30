// Modelo de datos para el GRAFCET del alumno
export const GrafcetModel = {
  etapas: [],
  transiciones: [],
  conexiones: [], // { origenId, destinoId }
  
  // Contadores para IDs únicos
  _nextId: 1,

  agregarEtapa(x, y, inicial = false) {
    const id = 'E' + this._nextId++;
    const etapa = { id, type: 'etapa', x, y, inicial };
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
  }
};