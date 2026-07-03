const { Comentario, Usuario } = require('../models');

class ComentarioService {
  async listar(trabajoId) {
    const { count, rows } = await Comentario.findAndCountAll({
      where: { trabajo_id: trabajoId },
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }],
      order: [['createdAt', 'DESC']]
    });
    const promedio = rows.length > 0
      ? rows.reduce((s, c) => s + (c.calificacion || 0), 0) / rows.filter(c => c.calificacion).length
      : 0;
    return { total: count, promedio: Math.round(promedio * 10) / 10, datos: rows };
  }

  async crear(trabajoId, usuarioId, comentario, calificacion) {
    if (calificacion != null && (calificacion < 1 || calificacion > 5)) {
      const err = new Error('La calificación debe estar entre 1 y 5');
      err.statusCode = 400;
      throw err;
    }
    return Comentario.create({ trabajo_id: trabajoId, usuario_id: usuarioId, comentario, calificacion });
  }

  async actualizar(comentarioId, usuarioId, comentario, calificacion) {
    const c = await Comentario.findByPk(comentarioId);
    if (!c) {
      const err = new Error('Comentario no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (c.usuario_id !== usuarioId) {
      const err = new Error('No tienes permiso para editar este comentario');
      err.statusCode = 403;
      throw err;
    }
    if (calificacion != null && (calificacion < 1 || calificacion > 5)) {
      const err = new Error('La calificación debe estar entre 1 y 5');
      err.statusCode = 400;
      throw err;
    }
    c.comentario = comentario || c.comentario;
    if (calificacion !== undefined) c.calificacion = calificacion;
    await c.save();
    return c;
  }

  async eliminar(comentarioId, usuarioId) {
    const c = await Comentario.findByPk(comentarioId);
    if (!c) {
      const err = new Error('Comentario no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (c.usuario_id !== usuarioId) {
      const err = new Error('No tienes permiso para eliminar este comentario');
      err.statusCode = 403;
      throw err;
    }
    await c.destroy();
    return { message: 'Comentario eliminado' };
  }
}

module.exports = new ComentarioService();
