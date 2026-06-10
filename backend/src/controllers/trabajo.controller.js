const trabajoService = require('../services/trabajo.service');
const { validationResult } = require('express-validator');

class TrabajoController {
  async listar(req, res) {
    const { pagina, limite, estado } = req.query;
    const resultado = await trabajoService.listar({ pagina, limite, estado });
    res.status(200).json({ success: true, ...resultado });
  }

  async obtenerPorId(req, res) {
    const trabajo = await trabajoService.obtenerPorId(req.params.id);
    res.status(200).json({ success: true, data: trabajo });
  }

  async crear(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const trabajo = await trabajoService.crear(req.body, req.user.id);
    res.status(201).json({ success: true, data: trabajo });
  }

  async actualizar(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const trabajo = await trabajoService.actualizar(req.params.id, req.body, req.user.id);
    res.status(200).json({ success: true, data: trabajo });
  }

  async eliminar(req, res) {
    await trabajoService.eliminar(req.params.id);
    res.status(200).json({ success: true, message: 'Trabajo eliminado correctamente' });
  }

  async cambiarEstado(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const trabajo = await trabajoService.cambiarEstado(req.params.id, req.body.estado);
    res.status(200).json({ success: true, data: trabajo });
  }

  async buscar(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const resultado = await trabajoService.buscar(req.query);
    res.status(200).json({ success: true, ...resultado });
  }
}

module.exports = new TrabajoController();
