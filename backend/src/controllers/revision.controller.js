const revisionService = require('../services/revision.service');
const trabajoService = require('../services/trabajo.service');

class RevisionController {
  async cambiarEstado(req, res) {
    const { comentario } = req.body;
    const { estado } = req.body;
    const trabajo = await revisionService.cambiarEstado(req.params.id, estado, comentario, req.user);
    res.status(200).json({ success: true, data: trabajo });
  }

  async listarRevisiones(req, res) {
    // El historial de revisión puede contener comentarios internos de borradores.
    await trabajoService.obtenerPorId(req.params.id, req.user);
    const revisiones = await revisionService.listarRevisiones(req.params.id);
    res.status(200).json({ success: true, data: revisiones });
  }

  async listarPendientes(req, res) {
    const estado = typeof req.query.estado === 'string' ? req.query.estado : undefined;
    const resultado = await revisionService.listarPendientes(estado);
    res.status(200).json({ success: true, ...resultado });
  }
}

module.exports = new RevisionController();
