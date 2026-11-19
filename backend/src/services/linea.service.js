const { LineaOperativa } = require('../models');
const { Op } = require('sequelize');

class LineaService {
  async listar() {
    return LineaOperativa.findAll({
      where: { activo: true },
      order: [['orden', 'ASC'], ['nombre', 'ASC']]
    });
  }

  async obtenerPorId(id) {
    const linea = await LineaOperativa.findByPk(id);
    if (!linea) {
      const err = new Error('Línea operativa no encontrada');
      err.statusCode = 404;
      throw err;
    }
    return linea;
  }

  async obtenerPorSlug(slug) {
    const linea = await LineaOperativa.findOne({ where: { slug, activo: true } });
    if (!linea) {
      const err = new Error('Línea operativa no encontrada');
      err.statusCode = 404;
      throw err;
    }
    return linea;
  }

  async crear(data) {
    const existe = await LineaOperativa.findOne({
      where: { [Op.or]: [{ nombre: data.nombre }, { slug: data.slug }, { sigla: data.sigla }] }
    });
    if (existe) {
      const err = new Error('Ya existe una línea operativa con ese nombre, sigla o slug');
      err.statusCode = 400;
      throw err;
    }
    return LineaOperativa.create(data);
  }

  async actualizar(id, data) {
    const linea = await LineaOperativa.findByPk(id);
    if (!linea) {
      const err = new Error('Línea operativa no encontrada');
      err.statusCode = 404;
      throw err;
    }

    if (data.slug && data.slug !== linea.slug) {
      const existeSlug = await LineaOperativa.findOne({ where: { slug: data.slug } });
      if (existeSlug) {
        const err = new Error('El slug ya está en uso');
        err.statusCode = 400;
        throw err;
      }
    }

    await linea.update(data);
    return linea;
  }

  async eliminar(id) {
    const linea = await LineaOperativa.findByPk(id);
    if (!linea) {
      const err = new Error('Línea operativa no encontrada');
      err.statusCode = 404;
      throw err;
    }

    const { AreaEstrategica } = require('../models');
    const areasCount = await AreaEstrategica.count({ where: { linea_operativa_id: id } });
    if (areasCount > 0) {
      const err = new Error('No se puede eliminar la línea porque tiene áreas estratégicas asociadas');
      err.statusCode = 409;
      throw err;
    }

    const { Trabajo } = require('../models');
    const trabajosCount = await Trabajo.count({ where: { linea_operativa_id: id } });
    if (trabajosCount > 0) {
      const err = new Error('No se puede eliminar la línea porque tiene trabajos asociados');
      err.statusCode = 409;
      throw err;
    }

    await linea.destroy();
  }
}

module.exports = new LineaService();
