const { Categoria } = require('../models');

class CategoriaService {
  async listar() {
    return Categoria.findAll({ order: [['nombre', 'ASC']] });
  }

  async obtenerPorId(id) {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      const err = new Error('Categoría no encontrada');
      err.statusCode = 404;
      throw err;
    }
    return categoria;
  }

  async obtenerPorSlug(slug) {
    const categoria = await Categoria.findOne({ where: { slug } });
    if (!categoria) {
      const err = new Error('Categoría no encontrada');
      err.statusCode = 404;
      throw err;
    }
    return categoria;
  }

  async crear(data) {
    const existe = await Categoria.findOne({
      where: { [require('sequelize').Op.or]: [{ nombre: data.nombre }, { slug: data.slug }] }
    });
    if (existe) {
      const err = new Error('Ya existe una categoría con ese nombre o slug');
      err.statusCode = 400;
      throw err;
    }
    return Categoria.create(data);
  }

  async actualizar(id, data) {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      const err = new Error('Categoría no encontrada');
      err.statusCode = 404;
      throw err;
    }

    if (data.slug && data.slug !== categoria.slug) {
      const existeSlug = await Categoria.findOne({ where: { slug: data.slug } });
      if (existeSlug) {
        const err = new Error('El slug ya está en uso');
        err.statusCode = 400;
        throw err;
      }
    }

    await categoria.update(data);
    return categoria;
  }

  async eliminar(id) {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      const err = new Error('Categoría no encontrada');
      err.statusCode = 404;
      throw err;
    }

    const { Trabajo } = require('../models');
    const trabajosAsociados = await Trabajo.count({ where: { categoria_id: id } });
    if (trabajosAsociados > 0) {
      const err = new Error('No se puede eliminar la categoría porque tiene trabajos asociados');
      err.statusCode = 409;
      throw err;
    }

    await categoria.destroy();
  }
}

module.exports = new CategoriaService();
