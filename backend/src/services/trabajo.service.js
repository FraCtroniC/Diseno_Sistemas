const { Op, literal } = require('sequelize');
const { Trabajo, Categoria, Usuario, Carrera, Tutor, Estudiante, sequelize } = require('../models');
const { validarMetadatos } = require('../validators/metadatos.schema');
const { extractTextFromPdf } = require('./pdf.service');
const notificacionService = require('./notificacion.service');

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

const ROLES_CON_VISIBILIDAD_TOTAL = ['admin', 'bibliotecario'];

function normalizarPaginacion(pagina, limite, limitePorDefecto = 10) {
  const paginaNum = Number.parseInt(pagina, 10);
  const limiteNum = Number.parseInt(limite, 10);
  return {
    pagina: Number.isInteger(paginaNum) && paginaNum > 0 ? paginaNum : 1,
    limite: Number.isInteger(limiteNum) && limiteNum > 0 ? Math.min(limiteNum, 100) : limitePorDefecto
  };
}

function puedeVerTodo(usuario) {
  return Boolean(usuario && ROLES_CON_VISIBILIDAD_TOTAL.includes(usuario.rol));
}

function puedeVerTrabajo(trabajo, usuario) {
  if (trabajo.estado === 'publicado') return true;
  if (!usuario) return false;
  return puedeVerTodo(usuario) || trabajo.usuario_id === usuario.id;
}

function puedeGestionarTrabajo(trabajo, usuarioId, rol) {
  return rol === 'admin' || rol === 'bibliotecario' || trabajo.usuario_id === usuarioId;
}

function aplicarVisibilidad(where, { estado, usuario_id, solicitante }) {
  if (!solicitante) {
    if (estado && estado !== 'publicado') {
      const err = new Error('No tienes permiso para consultar trabajos en ese estado');
      err.statusCode = 403;
      throw err;
    }
    if (usuario_id) {
      const err = new Error('No tienes permiso para filtrar por usuario');
      err.statusCode = 403;
      throw err;
    }
    where.estado = 'publicado';
    return;
  }

  if (puedeVerTodo(solicitante)) {
    if (estado) where.estado = estado;
    if (usuario_id) where.usuario_id = usuario_id;
    return;
  }

  // Autor/repositor: solo puede consultar sus propios trabajos no publicados.
  if (usuario_id && usuario_id !== solicitante.id) {
    const err = new Error('No tienes permiso para consultar trabajos de otro usuario');
    err.statusCode = 403;
    throw err;
  }

  if (estado && estado !== 'publicado') {
    where.estado = estado;
    where.usuario_id = solicitante.id;
    return;
  }

  if (usuario_id === solicitante.id) {
    where.usuario_id = solicitante.id;
    if (estado) where.estado = estado;
    return;
  }

  where.estado = 'publicado';
}

class TrabajoService {
  async listar({ pagina, limite, estado, usuario_id, solicitante } = {}) {
    const paginacion = normalizarPaginacion(pagina, limite);
    const offset = (paginacion.pagina - 1) * paginacion.limite;
    const where = {};
    aplicarVisibilidad(where, { estado, usuario_id, solicitante });

    const includes = [
      { model: Categoria, as: 'categoria', attributes: ['id', 'nombre', 'slug'] },
      { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
      { model: Carrera, as: 'carrera', attributes: ['id', 'nombre', 'slug'] },
      { model: Tutor, as: 'tutorAsignado', attributes: ['id', 'nombre'] },
      { model: Estudiante, as: 'estudiante', attributes: ['id', 'nombre'] }
    ];

    const { count, rows } = await Trabajo.findAndCountAll({
      where,
      include: includes,
      order: [['createdAt', 'DESC']],
      offset,
      limit: paginacion.limite
    });

    return {
      total: count,
      pagina: paginacion.pagina,
      limite: paginacion.limite,
      totalPaginas: Math.ceil(count / paginacion.limite),
      datos: rows
    };
  }

  async obtenerPorId(id, solicitante) {
    const includes = [
      { model: Categoria, as: 'categoria', attributes: ['id', 'nombre', 'slug'] },
      { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
      { model: Carrera, as: 'carrera', attributes: ['id', 'nombre', 'slug'] },
      { model: Tutor, as: 'tutorAsignado', attributes: ['id', 'nombre'] },
      { model: Estudiante, as: 'estudiante', attributes: ['id', 'nombre'] }
    ];

    const trabajo = await Trabajo.findByPk(id, { include: includes });
    if (!trabajo || !puedeVerTrabajo(trabajo, solicitante)) {
      const err = new Error('Trabajo no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return trabajo;
  }

  async crear(data, usuarioId, archivoUrl = null, archivoBuffer = null, rol = 'bibliotecario') {
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

    if (rol !== 'admin' && data.estado && data.estado !== 'borrador') {
      const err = new Error('Solo los administradores pueden crear trabajos publicados directamente');
      err.statusCode = 403;
      throw err;
    }
    if (rol !== 'admin' || !data.estado) {
      data.estado = 'borrador';
    }

    let textoCompleto = null;
    if (archivoBuffer) {
      textoCompleto = await extractTextFromPdf(archivoBuffer);
    }

    const trabajo = await Trabajo.create({
      ...pick(data, CAMPOS_CREAR),
      archivo_url: archivoUrl,
      texto_completo: textoCompleto,
      usuario_id: usuarioId
    });

    // Publicación directa (solo admin): avisamos al autor, igual que en el flujo de revisión.
    if (trabajo.estado === 'publicado') {
      await this.notificarPublicacion(trabajo);
    }

    return trabajo;
  }

  /**
   * Avisa al autor de un trabajo cuando este queda publicado. Si la
   * notificación falla no debe impedir que la publicación se complete.
   */
  async notificarPublicacion(trabajo) {
    try {
      await notificacionService.crearYNotificar(
        trabajo.usuario_id,
        'publicado',
        `Tu trabajo "${trabajo.titulo}" ha sido publicado.`,
        trabajo.id
      );
    } catch (err) {
      console.error('No se pudo crear la notificación de publicación:', err);
    }
  }

  async actualizar(id, data, usuarioId, archivoUrl = null, archivoBuffer = null, rol = 'bibliotecario') {
    const trabajo = await Trabajo.findByPk(id);
    if (!trabajo) {
      const err = new Error('Trabajo no encontrado');
      err.statusCode = 404;
      throw err;
    }

    if (!puedeGestionarTrabajo(trabajo, usuarioId, rol)) {
      const err = new Error('No tienes permiso para modificar este trabajo');
      err.statusCode = 403;
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

    if (rol !== 'admin' && data.estado) {
      const err = new Error('No puedes cambiar el estado directamente. Usa la opción "Solicitar revisión"');
      err.statusCode = 403;
      throw err;
    }

    const updateData = pick(data, CAMPOS_ACTUALIZAR);
    if (archivoUrl) {
      updateData.archivo_url = archivoUrl;
    }
    if (archivoBuffer) {
      updateData.texto_completo = await extractTextFromPdf(archivoBuffer);
    }
    const estadoAnterior = trabajo.estado;
    await trabajo.update(updateData);

    // Publicación directa al editar (solo admin): avisamos al autor.
    if (trabajo.estado === 'publicado' && estadoAnterior !== 'publicado') {
      await this.notificarPublicacion(trabajo);
    }

    return trabajo;
  }

  async eliminar(id, usuarioId, rol) {
    const trabajo = await Trabajo.findByPk(id);
    if (!trabajo) {
      const err = new Error('Trabajo no encontrado');
      err.statusCode = 404;
      throw err;
    }

    if (!puedeGestionarTrabajo(trabajo, usuarioId, rol)) {
      const err = new Error('No tienes permiso para eliminar este trabajo');
      err.statusCode = 403;
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

  async buscar({ q, categoria, tipo_documento, anio, estado, usuario_id, pagina, limite, solicitante } = {}) {
    const paginacion = normalizarPaginacion(pagina, limite);
    const offset = (paginacion.pagina - 1) * paginacion.limite;
    const where = {};
    const attributes = [
      'id', 'titulo', 'autor', 'tutor', 'anio', 'resumen',
      'palabras_clave', 'categoria_id', 'archivo_url', 'metadatos',
      'estado', 'usuario_id', 'identificador', 'createdAt', 'updatedAt'
    ];

    aplicarVisibilidad(where, { estado, usuario_id, solicitante });

    if (q) {
      // sequelize.escape genera un literal SQL seguro; nunca se interpola q directamente.
      const qEscapado = sequelize.escape(q);
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${q}%` } },
        { autor: { [Op.iLike]: `%${q}%` } },
        { tutor: { [Op.iLike]: `%${q}%` } },
        { palabras_clave: { [Op.overlap]: [q] } },
        literal(`"search_vector" @@ plainto_tsquery('spanish', ${qEscapado})`)
      ];
      attributes.push([
        literal(`ts_headline('spanish', "texto_completo", plainto_tsquery('spanish', ${qEscapado}), 'MaxWords=35,MinWords=15,MaxFragments=2')`),
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

    let order;
    if (q) {
      const qEscapado = sequelize.escape(q);
      order = [
        [literal(`ts_rank("search_vector", plainto_tsquery('spanish', ${qEscapado}))`), 'DESC'],
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
      { model: Estudiante, as: 'estudiante', attributes: ['id', 'nombre'] }
    ];

    const { count, rows } = await Trabajo.findAndCountAll({
      attributes,
      where,
      include: includes,
      order,
      offset,
      limit: paginacion.limite
    });

    return {
      total: count,
      pagina: paginacion.pagina,
      limite: paginacion.limite,
      totalPaginas: Math.ceil(count / paginacion.limite),
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
