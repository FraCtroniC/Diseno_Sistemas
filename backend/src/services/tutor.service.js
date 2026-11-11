const { Op } = require('sequelize');
const { Tutor } = require('../models');

const ATRIBUTOS_PUBLICOS = ['id', 'nombre'];

class TutorService {
  async listar({ q, limite = 100 } = {}) {
    const where = {};
    if (q) {
      where.nombre = { [Op.iLike]: `%${q}%` };
    }

    const limiteNum = Number.parseInt(limite, 10);
    const limiteSeguro = Number.isInteger(limiteNum) && limiteNum > 0
      ? Math.min(limiteNum, 200)
      : 100;

    return Tutor.findAll({
      where,
      attributes: ATRIBUTOS_PUBLICOS,
      order: [['nombre', 'ASC']],
      limit: limiteSeguro
    });
  }

  async obtenerPorId(id) {
    const tutor = await Tutor.findByPk(id, { attributes: ATRIBUTOS_PUBLICOS });
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
