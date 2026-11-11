const { Comentario, Usuario, Trabajo } = require('../models');
const notificacionService = require('./notificacion.service');

class ComentarioService {
  async listar(trabajoId) {
    const { count, rows } = await Comentario.findAndCountAll({
      where: { trabajo_id: trabajoId },
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }],
      order: [['createdAt', 'DESC']]
    });
    const conCalificacion = rows.filter(c => c.calificacion).length;
    const promedio = conCalificacion > 0
      ? rows.reduce((s, c) => s + (c.calificacion || 0), 0) / conCalificacion
      : 0;
    return { total: count, promedio: Math.round(promedio * 10) / 10, datos: rows };
  }

  async crear(trabajoId, usuarioId, comentario, calificacion) {
    if (calificacion != null && (calificacion < 1 || calificacion > 5)) {
      const err = new Error('La calificación debe estar entre 1 y 5');
      err.statusCode = 400;
      throw err;
    }
    const creado = await Comentario.create({ trabajo_id: trabajoId, usuario_id: usuarioId, comentario, calificacion });
    // Devolvemos el comentario con el usuario incluido, igual que en listar,
    // para que el frontend pueda renderizarlo sin necesidad de recargar.
    const completo = await Comentario.findByPk(creado.id, {
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }]
    });

    await this.notificarNuevoComentario(trabajoId, usuarioId, completo?.usuario?.nombre);

    return completo || creado;
  }

  /**
   * Avisa al autor del trabajo cuando otra persona comenta. Si la
   * notificación falla no debe impedir que el comentario se guarde.
   */
  async notificarNuevoComentario(trabajoId, usuarioId, nombreComentador) {
    try {
      const trabajo = await Trabajo.findByPk(trabajoId, { attributes: ['id', 'titulo', 'usuario_id'] });
      if (!trabajo || trabajo.usuario_id === usuarioId) return;

      await notificacionService.crearYNotificar(
        trabajo.usuario_id,
        'comentario',
        `Nuevo comentario de ${nombreComentador || 'un usuario'} en "${trabajo.titulo}".`,
        trabajoId
      );
    } catch (err) {
      console.error('No se pudo crear la notificación de comentario:', err);
    }
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
