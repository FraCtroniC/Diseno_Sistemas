const { AreaEstrategica, LineaOperativa } = require('../models');
const { Op } = require('sequelize');

class AreaService {
  async listar(lineaOperativaId) {
    const where = { activo: true };
    if (lineaOperativaId) where.linea_operativa_id = lineaOperativaId;
    return AreaEstrategica.findAll({
      where,
      order: [['orden', 'ASC'], ['nombre', 'ASC']]
    });
  }

  async obtenerPorId(id) {
    const area = await AreaEstrategica.findByPk(id);
    if (!area) {
      const err = new Error('Área estratégica no encontrada');
      err.statusCode = 404;
      throw err;
    }
    return area;
  }

  async obtenerPorSlug(slug) {
    const area = await AreaEstrategica.findOne({ where: { slug, activo: true } });
    if (!area) {
      const err = new Error('Área estratégica no encontrada');
      err.statusCode = 404;
      throw err;
    }
    return area;
  }

  async crear(data) {
    const linea = await LineaOperativa.findByPk(data.linea_operativa_id);
    if (!linea) {
      const err = new Error('Línea operativa no encontrada');
      err.statusCode = 404;
      throw err;
    }

    const existe = await AreaEstrategica.findOne({
      where: {
        linea_operativa_id: data.linea_operativa_id,
        [Op.or]: [{ nombre: data.nombre }, { slug: data.slug }]
      }
    });
    if (existe) {
      const err = new Error('Ya existe un área estratégica con ese nombre o slug en esta línea');
      err.statusCode = 400;
      throw err;
    }
    return AreaEstrategica.create(data);
  }

  async actualizar(id, data) {
    const area = await AreaEstrategica.findByPk(id);
    if (!area) {
      const err = new Error('Área estratégica no encontrada');
      err.statusCode = 404;
      throw err;
    }

    if (data.linea_operativa_id && data.linea_operativa_id !== area.linea_operativa_id) {
      const linea = await LineaOperativa.findByPk(data.linea_operativa_id);
      if (!linea) {
        const err = new Error('Línea operativa no encontrada');
        err.statusCode = 404;
        throw err;
      }
    }

    if (data.slug && data.slug !== area.slug) {
      const existeSlug = await AreaEstrategica.findOne({
        where: {
          linea_operativa_id: data.linea_operativa_id || area.linea_operativa_id,
          slug: data.slug
        }
      });
      if (existeSlug) {
        const err = new Error('El slug ya está en uso en esta línea');
        err.statusCode = 400;
        throw err;
      }
    }

    await area.update(data);
    return area;
  }

  async eliminar(id) {
    const area = await AreaEstrategica.findByPk(id);
    if (!area) {
      const err = new Error('Área estratégica no encontrada');
      err.statusCode = 404;
      throw err;
    }

    const { Trabajo } = require('../models');
    const trabajosCount = await Trabajo.count({
      include: [{
        model: require('../models').AreaEstrategica,
        as: 'areasEstrategicas',
        where: { id },
        through: { attributes: [] }
      }]
    });
    if (trabajosCount > 0) {
      const err = new Error('No se puede eliminar el área porque tiene trabajos asociados');
      err.statusCode = 409;
      throw err;
    }

    await area.destroy();
  }
}

module.exports = new AreaService();
