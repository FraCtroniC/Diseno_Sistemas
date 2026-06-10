const usuarioService = require('../services/usuario.service');
const { validationResult } = require('express-validator');

class UsuarioController {
  async listar(req, res) {
    const usuarios = await usuarioService.listar();
    res.status(200).json({ success: true, data: usuarios });
  }

  async obtenerPorId(req, res) {
    const usuario = await usuarioService.obtenerPorId(req.params.id);
    res.status(200).json({ success: true, data: usuario });
  }

  async crear(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const usuario = await usuarioService.crear(req.body);
    res.status(201).json({ success: true, data: usuario });
  }

  async actualizar(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const usuario = await usuarioService.actualizar(req.params.id, req.body);
    res.status(200).json({ success: true, data: usuario });
  }

  async eliminar(req, res) {
    await usuarioService.eliminar(req.params.id);
    res.status(200).json({ success: true, message: 'Usuario eliminado correctamente' });
  }

  async cambiarEstado(req, res) {
    const { activo } = req.body;
    const usuario = await usuarioService.cambiarEstado(req.params.id, activo);
    res.status(200).json({ success: true, data: usuario });
  }
}

module.exports = new UsuarioController();
