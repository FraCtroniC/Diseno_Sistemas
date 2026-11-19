const areaService = require('../services/area.service');
const { validationResult } = require('express-validator');

class AreaController {
  async listar(req, res) {
    const areas = await areaService.listar(req.query.linea_operativa);
    res.status(200).json({ success: true, data: areas });
  }

  async obtenerPorId(req, res) {
    const area = await areaService.obtenerPorId(req.params.id);
    res.status(200).json({ success: true, data: area });
  }

  async crear(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }
    const area = await areaService.crear(req.body);
    res.status(201).json({ success: true, data: area });
  }

  async actualizar(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }
    const area = await areaService.actualizar(req.params.id, req.body);
    res.status(200).json({ success: true, data: area });
  }

  async eliminar(req, res) {
    await areaService.eliminar(req.params.id);
    res.status(200).json({ success: true, message: 'Área estratégica eliminada correctamente' });
  }
}

module.exports = new AreaController();
