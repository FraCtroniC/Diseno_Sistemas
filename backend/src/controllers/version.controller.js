const versionService = require('../services/version.service');

class VersionController {
  async listar(req, res) {
    const versiones = await versionService.listar(req.params.id);
    res.status(200).json({ success: true, data: versiones });
  }

  async restaurar(req, res) {
    const trabajo = await versionService.restaurar(req.params.versionId, req.user.id);
    res.status(200).json({ success: true, data: trabajo });
  }
}

module.exports = new VersionController();
