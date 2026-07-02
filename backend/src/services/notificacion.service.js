const { Notificacion, Trabajo } = require('../models');

class NotificacionService {
  async crear(usuarioId, tipo, mensaje, trabajoId = null) {
    return Notificacion.create({
      usuario_id: usuarioId,
      tipo,
      mensaje,
      trabajo_id: trabajoId
    });
  }

  async listarPorUsuario(usuarioId, pagina = 1, limite = 20) {
    const offset = (pagina - 1) * limite;
    const { count, rows } = await Notificacion.findAndCountAll({
      where: { usuario_id: usuarioId },
      include: [
        { model: Trabajo, as: 'trabajo', attributes: ['id', 'titulo', 'identificador'] }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: limite
    });

    return { total: count, datos: rows };
  }

  async marcarLeida(notificacionId, usuarioId) {
    const notif = await Notificacion.findOne({
      where: { id: notificacionId, usuario_id: usuarioId }
    });
    if (!notif) {
      const err = new Error('Notificación no encontrada');
      err.statusCode = 404;
      throw err;
    }
    notif.leida = true;
    await notif.save();
    return notif;
  }

  async marcarTodasLeidas(usuarioId) {
    await Notificacion.update(
      { leida: true },
      { where: { usuario_id: usuarioId, leida: false } }
    );
  }

  async contarNoLeidas(usuarioId) {
    return Notificacion.count({
      where: { usuario_id: usuarioId, leida: false }
    });
  }
}

module.exports = new NotificacionService();
