const revisionService = require('../services/revision.service');

class RevisionController {
  async cambiarEstado(req, res) {
    const { comentario } = req.body;
    const { estado } = req.body;
    const trabajo = await revisionService.cambiarEstado(req.params.id, estado, comentario, req.user);
    res.status(200).json({ success: true, data: trabajo });
  }

  async listarRevisiones(req, res) {
    const revisiones = await revisionService.listarRevisiones(req.params.id);
    res.status(200).json({ success: true, data: revisiones });
  }

  async listarPendientes(req, res) {
    const resultado = await revisionService.listarPendientes();
    res.status(200).json({ success: true, ...resultado });
  }
}

module.exports = new RevisionController();
