const notificacionService = require('../services/notificacion.service');
const sseService = require('../services/sse.service');

class NotificacionController {
  async listar(req, res) {
    const { pagina, limite } = req.query;
    const resultado = await notificacionService.listarPorUsuario(req.user.id, pagina, limite);
    res.status(200).json({ success: true, ...resultado });
  }

  async marcarLeida(req, res) {
    const notif = await notificacionService.marcarLeida(req.params.id, req.user.id);
    const noLeidas = await notificacionService.contarNoLeidas(req.user.id);
    sseService.notifyUser(req.user.id, { type: 'count', noLeidas });
    res.status(200).json({ success: true, data: notif });
  }

  async marcarTodasLeidas(req, res) {
    await notificacionService.marcarTodasLeidas(req.user.id);
    sseService.notifyUser(req.user.id, { type: 'count', noLeidas: 0 });
    res.status(200).json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  }

  async contarNoLeidas(req, res) {
    const count = await notificacionService.contarNoLeidas(req.user.id);
    res.status(200).json({ success: true, data: { noLeidas: count } });
  }

  async stream(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const noLeidas = await notificacionService.contarNoLeidas(req.user.id);
    res.write(`data: ${JSON.stringify({ type: 'count', noLeidas })}\n\n`);

    sseService.addClient(req.user.id, res);

    const keepAlive = setInterval(() => {
      res.write(':keepalive\n\n');
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
    });
  }
}

module.exports = new NotificacionController();
