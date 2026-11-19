const nivelService = require('../services/nivel.service');

class NivelController {
  async listar(req, res) {
    const niveles = await nivelService.listar();
    res.status(200).json({ success: true, data: niveles });
  }
}

module.exports = new NivelController();
