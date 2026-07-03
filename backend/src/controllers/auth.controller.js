const authService = require('../services/auth.service');
const { validationResult } = require('express-validator');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 2 * 60 * 60 * 1000,
  path: '/'
};

function setTokenCookie(res, token) {
  res.cookie('token', token, COOKIE_OPTIONS);
}

class AuthController {
  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const { identificador, email, password } = req.body;
    const resultado = await authService.login(identificador || email, password);

    setTokenCookie(res, resultado.token);

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

    setTokenCookie(res, usuario.token);

    res.status(201).json({
      success: true,
      data: usuario
    });
  }

  async forgotPassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const resultado = await authService.forgotPassword(req.body.email);

    res.status(200).json({
      success: true,
      data: resultado
    });
  }

  async resetPassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const { token, email, newPassword } = req.body;
    const resultado = await authService.resetPassword(token, email, newPassword);

    res.status(200).json({
      success: true,
      data: resultado
    });
  }

  async changePassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const { currentPassword, newPassword } = req.body;
    const resultado = await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      data: resultado
    });
  }

  async logout(req, res) {
    res.clearCookie('token', { path: '/' });
    res.status(200).json({ success: true, message: 'Sesión cerrada correctamente' });
  }

  async perfil(req, res) {
    const usuario = await authService.perfil(req.user.id);
    res.status(200).json({
      success: true,
      data: usuario
    });
  }

  async actualizarPerfil(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const usuario = await authService.actualizarPerfil(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: usuario
    });
  }
}

module.exports = new AuthController();
