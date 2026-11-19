const lineaService = require('../services/linea.service');
const { validationResult } = require('express-validator');

class LineaController {
  async listar(req, res) {
    const lineas = await lineaService.listar();
    res.status(200).json({ success: true, data: lineas });
  }

  async obtenerPorId(req, res) {
    const linea = await lineaService.obtenerPorId(req.params.id);
    res.status(200).json({ success: true, data: linea });
  }

  async crear(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }
    const linea = await lineaService.crear(req.body);
    res.status(201).json({ success: true, data: linea });
  }

  async actualizar(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }
    const linea = await lineaService.actualizar(req.params.id, req.body);
    res.status(200).json({ success: true, data: linea });
  }

  async eliminar(req, res) {
    await lineaService.eliminar(req.params.id);
    res.status(200).json({ success: true, message: 'Línea operativa eliminada correctamente' });
  }
}

module.exports = new LineaController();
