const { Op } = require('sequelize');
const { Tutor } = require('../models');

class TutorService {
  async listar({ q } = {}) {
    const where = {};
    if (q) {
      where.nombre = { [Op.iLike]: `%${q}%` };
    }
    return Tutor.findAll({ where, order: [['nombre', 'ASC']] });
  }

  async obtenerPorId(id) {
    const tutor = await Tutor.findByPk(id);
    if (!tutor) {
      const err = new Error('Tutor no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return tutor;
  }

  async crear(data) {
    return Tutor.create(data);
  }

  async actualizar(id, data) {
    const tutor = await this.obtenerPorId(id);
    await tutor.update(data);
    return tutor;
  }

  async eliminar(id) {
    const tutor = await this.obtenerPorId(id);
    await tutor.destroy();
  }
}

module.exports = new TutorService();
