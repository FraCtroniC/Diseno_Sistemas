const { Op, fn, col, literal } = require('sequelize');
const { Visita } = require('../models');

class EstadisticaService {
  async registrar(trabajoId, tipo) {
    return Visita.create({ trabajo_id: trabajoId, tipo });
  }

  async obtenerPorTrabajo(trabajoId) {
    const [vistas, descargas] = await Promise.all([
      Visita.count({ where: { trabajo_id: trabajoId, tipo: 'vista' } }),
      Visita.count({ where: { trabajo_id: trabajoId, tipo: 'descarga' } })
    ]);
    return { vistas, descargas };
  }
}

module.exports = new EstadisticaService();
