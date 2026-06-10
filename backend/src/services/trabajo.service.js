const { Op } = require('sequelize');
const { Trabajo, Categoria, Usuario } = require('../models');
const { validarMetadatos } = require('../validators/metadatos.schema');

class TrabajoService {
  async listar({ pagina = 1, limite = 10, estado } = {}) {
    const offset = (pagina - 1) * limite;
    const where = {};
    if (estado) where.estado = estado;

    const { count, rows } = await Trabajo.findAndCountAll({
      where,
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre', 'slug'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: limite
    });

    return {
      total: count,
      pagina,
      limite,
      totalPaginas: Math.ceil(count / limite),
      datos: rows
    };
  }

  async obtenerPorId(id) {
    const trabajo = await Trabajo.findByPk(id, {
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre', 'slug'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
      ]
    });
    if (!trabajo) {
      const err = new Error('Trabajo no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return trabajo;
  }

  async crear(data, usuarioId) {
    if (data.metadatos) {
      data.metadatos = validarMetadatos(data.metadatos);
    }

    const categoria = await Categoria.findByPk(data.categoria_id);
    if (!categoria) {
      const err = new Error('Categoría no encontrada');
      err.statusCode = 404;
      throw err;
    }

    return Trabajo.create({
      ...data,
      usuario_id: usuarioId
    });
  }

  async actualizar(id, data, usuarioId) {
    const trabajo = await Trabajo.findByPk(id);
    if (!trabajo) {
      const err = new Error('Trabajo no encontrado');
      err.statusCode = 404;
      throw err;
    }

    if (data.metadatos) {
      data.metadatos = validarMetadatos(data.metadatos);
    }

    if (data.categoria_id) {
      const categoria = await Categoria.findByPk(data.categoria_id);
      if (!categoria) {
        const err = new Error('Categoría no encontrada');
        err.statusCode = 404;
        throw err;
      }
    }

    await trabajo.update({ ...data, usuario_id: usuarioId });
    return trabajo;
  }

  async eliminar(id) {
    const trabajo = await Trabajo.findByPk(id);
    if (!trabajo) {
      const err = new Error('Trabajo no encontrado');
      err.statusCode = 404;
      throw err;
    }
    await trabajo.destroy();
  }

  async cambiarEstado(id, estado) {
    const trabajo = await Trabajo.findByPk(id);
    if (!trabajo) {
      const err = new Error('Trabajo no encontrado');
      err.statusCode = 404;
      throw err;
    }
    trabajo.estado = estado;
    await trabajo.save();
    return trabajo;
  }

  async buscar({ q, categoria, anio, estado, pagina = 1, limite = 10 }) {
    const offset = (pagina - 1) * limite;
    const where = {};

    if (q) {
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${q}%` } },
        { autor: { [Op.iLike]: `%${q}%` } },
        { tutor: { [Op.iLike]: `%${q}%` } },
        { palabras_clave: { [Op.overlap]: [q] } }
      ];
    }

    if (categoria) where.categoria_id = categoria;
    if (anio) where.anio = anio;
    if (estado) where.estado = estado;

    const { count, rows } = await Trabajo.findAndCountAll({
      where,
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre', 'slug'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: limite
    });

    return {
      total: count,
      pagina,
      limite,
      totalPaginas: Math.ceil(count / limite),
      datos: rows
    };
  }

  async actualizarArchivo(id, archivoUrl) {
    const trabajo = await Trabajo.findByPk(id);
    if (!trabajo) {
      const err = new Error('Trabajo no encontrado');
      err.statusCode = 404;
      throw err;
    }
    trabajo.archivo_url = archivoUrl;
    await trabajo.save();
    return trabajo;
  }
}

module.exports = new TrabajoService();
