const authService = require('../services/auth.service');
const { validationResult } = require('express-validator');

class AuthController {
  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const { email, password } = req.body;
    const resultado = await authService.login(email, password);

    res.status(200).json({
      success: true,
      data: resultado
    });
  }

  async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const usuario = await authService.register(req.body);

    res.status(201).json({
      success: true,
      data: usuario
    });
  }

  async perfil(req, res) {
    res.status(200).json({
      success: true,
      data: req.user
    });
  }
}

module.exports = new AuthController();
