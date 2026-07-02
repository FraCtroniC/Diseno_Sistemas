const { Op } = require('sequelize');
const { Estudiante, Carrera } = require('../models');

class EstudianteService {
  async listar({ q, carrera_id } = {}) {
    const where = {};
    if (q) {
      where.nombre = { [Op.iLike]: `%${q}%` };
    }
    if (carrera_id) where.carrera_id = carrera_id;
    return Estudiante.findAll({
      where,
      include: [{ model: Carrera, as: 'carrera', attributes: ['id', 'nombre', 'slug'] }],
      order: [['nombre', 'ASC']]
    });
  }

  async obtenerPorId(id) {
    const estudiante = await Estudiante.findByPk(id, {
      include: [{ model: Carrera, as: 'carrera', attributes: ['id', 'nombre', 'slug'] }]
    });
    if (!estudiante) {
      const err = new Error('Estudiante no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return estudiante;
  }

  async crear(data) {
    return Estudiante.create(data);
  }

  async actualizar(id, data) {
    const estudiante = await this.obtenerPorId(id);
    await estudiante.update(data);
    return estudiante;
  }

  async eliminar(id) {
    const estudiante = await this.obtenerPorId(id);
    await estudiante.destroy();
  }
}

module.exports = new EstudianteService();
