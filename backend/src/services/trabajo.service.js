const { Op, literal } = require('sequelize');
const { Trabajo, Categoria, Usuario, Carrera, Tutor, Estudiante, sequelize } = require('../models');
const { validarMetadatos } = require('../validators/metadatos.schema');
const { extractTextFromPdf } = require('./pdf.service');

const CAMPOS_CREAR = ['titulo', 'autor', 'tutor', 'anio', 'resumen', 'palabras_clave', 'categoria_id', 'metadatos', 'estado'];
const CAMPOS_ACTUALIZAR = ['titulo', 'autor', 'tutor', 'anio', 'resumen', 'palabras_clave', 'categoria_id', 'metadatos', 'estado'];

function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

class TrabajoService {
  async listar({ pagina = 1, limite = 10, estado, usuario_id } = {}) {
    const offset = (pagina - 1) * limite;
    const where = {};
    if (estado) where.estado = estado;
    if (usuario_id) where.usuario_id = usuario_id;

    const includes = [
      { model: Categoria, as: 'categoria', attributes: ['id', 'nombre', 'slug'] },
      { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
      { model: Carrera, as: 'carrera', attributes: ['id', 'nombre', 'slug'] },
      { model: Tutor, as: 'tutorAsignado', attributes: ['id', 'nombre'] },
      { model: Estudiante, as: 'estudiante', attributes: ['id', 'nombre', 'cedula'] }
    ];

    const { count, rows } = await Trabajo.findAndCountAll({
      where,
      include: includes,
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
    const includes = [
      { model: Categoria, as: 'categoria', attributes: ['id', 'nombre', 'slug'] },
      { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
      { model: Carrera, as: 'carrera', attributes: ['id', 'nombre', 'slug'] },
      { model: Tutor, as: 'tutorAsignado', attributes: ['id', 'nombre'] },
      { model: Estudiante, as: 'estudiante', attributes: ['id', 'nombre', 'cedula'] }
    ];

    const trabajo = await Trabajo.findByPk(id, { include: includes });
    if (!trabajo) {
      const err = new Error('Trabajo no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return trabajo;
  }

  async crear(data, usuarioId, archivoUrl = null, archivoPath = null, rol = 'bibliotecario') {
    if (data.metadatos && typeof data.metadatos === 'string') {
      data.metadatos = JSON.parse(data.metadatos);
    }
    if (data.metadatos) {
      data.metadatos = validarMetadatos(data.metadatos);
    }

    const categoria = await Categoria.findByPk(data.categoria_id);
    if (!categoria) {
      const err = new Error('Categoría no encontrada');
      err.statusCode = 404;
      throw err;
    }

    if (rol === 'bibliotecario' && data.estado && data.estado !== 'borrador') {
      const err = new Error('Los bibliotecarios solo pueden crear trabajos en estado "borrador"');
      err.statusCode = 403;
      throw err;
    }
    if (rol === 'bibliotecario' || !data.estado) {
      data.estado = 'borrador';
    }

    let textoCompleto = null;
    if (archivoPath) {
      textoCompleto = await extractTextFromPdf(archivoPath);
    }

    return Trabajo.create({
      ...pick(data, CAMPOS_CREAR),
      archivo_url: archivoUrl,
      texto_completo: textoCompleto,
      usuario_id: usuarioId
    });
  }

  async actualizar(id, data, usuarioId, archivoUrl = null, archivoPath = null, rol = 'bibliotecario') {
    const trabajo = await Trabajo.findByPk(id);
    if (!trabajo) {
      const err = new Error('Trabajo no encontrado');
      err.statusCode = 404;
      throw err;
    }

    if (data.metadatos && typeof data.metadatos === 'string') {
      data.metadatos = JSON.parse(data.metadatos);
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

    if (rol === 'bibliotecario' && data.estado) {
      const err = new Error('Los bibliotecarios no pueden cambiar el estado directamente. Usa la opción "Solicitar revisión"');
      err.statusCode = 403;
      throw err;
    }

    const updateData = pick(data, CAMPOS_ACTUALIZAR);
    if (archivoUrl) {
      updateData.archivo_url = archivoUrl;
    }
    if (archivoPath) {
      updateData.texto_completo = await extractTextFromPdf(archivoPath);
    }
    await trabajo.update(updateData);
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

  async buscar({ q, categoria, tipo_documento, anio, estado, usuario_id, pagina = 1, limite = 10 }) {
    const offset = (pagina - 1) * limite;
    const where = {};
    const attributes = [
      'id', 'titulo', 'autor', 'tutor', 'anio', 'resumen',
      'palabras_clave', 'categoria_id', 'archivo_url', 'metadatos',
      'estado', 'usuario_id', 'identificador', 'createdAt', 'updatedAt'
    ];

    if (q) {
      const sq = q.replace(/'/g, "''");
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${q}%` } },
        { autor: { [Op.iLike]: `%${q}%` } },
        { tutor: { [Op.iLike]: `%${q}%` } },
        { palabras_clave: { [Op.overlap]: [q] } },
        literal(`to_tsvector('spanish', coalesce("texto_completo", '')) @@ plainto_tsquery('spanish', '${sq}')`)
      ];
      attributes.push([
        literal(`ts_headline('spanish', "texto_completo", plainto_tsquery('spanish', '${sq}'), 'MaxWords=35,MinWords=15,MaxFragments=2')`),
        'snippet'
      ]);
    }

    if (categoria) where.categoria_id = categoria;
    if (tipo_documento) {
      where.metadatos = {
        [Op.contains]: { tipo_documento }
      };
    }
    if (anio) where.anio = anio;
    if (estado) where.estado = estado;
    if (usuario_id) where.usuario_id = usuario_id;

    let order;
    if (q) {
      const sq = q.replace(/'/g, "''");
      order = [
        [literal(`ts_rank(to_tsvector('spanish', coalesce("texto_completo", '')), plainto_tsquery('spanish', '${sq}'))`), 'DESC'],
        ['createdAt', 'DESC']
      ];
    } else {
      order = [['createdAt', 'DESC']];
    }

    const includes = [
      { model: Categoria, as: 'categoria', attributes: ['id', 'nombre', 'slug'] },
      { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
      { model: Carrera, as: 'carrera', attributes: ['id', 'nombre', 'slug'] },
      { model: Tutor, as: 'tutorAsignado', attributes: ['id', 'nombre'] },
      { model: Estudiante, as: 'estudiante', attributes: ['id', 'nombre', 'cedula'] }
    ];

    const { count, rows } = await Trabajo.findAndCountAll({
      attributes,
      where,
      include: includes,
      order,
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
