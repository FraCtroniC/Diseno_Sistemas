const { Notificacion, Trabajo } = require('../models');
const sseService = require('./sse.service');

class NotificacionService {
  async crear(usuarioId, tipo, mensaje, trabajoId = null) {
    return Notificacion.create({
      usuario_id: usuarioId,
      tipo,
      mensaje,
      trabajo_id: trabajoId
    });
  }

  /**
   * Crea la notificación, recalcula el contador de no leídas del usuario
   * y lo envía por SSE para que la campana se actualice en tiempo real.
   */
  async crearYNotificar(usuarioId, tipo, mensaje, trabajoId = null) {
    await this.crear(usuarioId, tipo, mensaje, trabajoId);
    const noLeidas = await this.contarNoLeidas(usuarioId);
    sseService.notifyUser(usuarioId, { type: 'count', noLeidas });
    return noLeidas;
  }

  async listarPorUsuario(usuarioId, pagina, limite) {
    const paginaNum = Number.parseInt(pagina, 10);
    const limiteNum = Number.parseInt(limite, 10);
    const paginaSegura = Number.isInteger(paginaNum) && paginaNum > 0 ? paginaNum : 1;
    const limiteSeguro = Number.isInteger(limiteNum) && limiteNum > 0
      ? Math.min(limiteNum, 100)
      : 20;
    const offset = (paginaSegura - 1) * limiteSeguro;

    const { count, rows } = await Notificacion.findAndCountAll({
      where: { usuario_id: usuarioId },
      include: [
        { model: Trabajo, as: 'trabajo', attributes: ['id', 'titulo', 'identificador'] }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: limiteSeguro
    });

    return {
      total: count,
      pagina: paginaSegura,
      limite: limiteSeguro,
      totalPaginas: Math.ceil(count / limiteSeguro),
      datos: rows
    };
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
