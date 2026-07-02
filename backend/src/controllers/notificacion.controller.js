const notificacionService = require('../services/notificacion.service');

class NotificacionController {
  async listar(req, res) {
    const { pagina, limite } = req.query;
    const resultado = await notificacionService.listarPorUsuario(req.user.id, pagina, limite);
    res.status(200).json({ success: true, ...resultado });
  }

  async marcarLeida(req, res) {
    const notif = await notificacionService.marcarLeida(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: notif });
  }

  async marcarTodasLeidas(req, res) {
    await notificacionService.marcarTodasLeidas(req.user.id);
    res.status(200).json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  }

  async contarNoLeidas(req, res) {
    const count = await notificacionService.contarNoLeidas(req.user.id);
    res.status(200).json({ success: true, data: { noLeidas: count } });
  }
}

module.exports = new NotificacionController();
