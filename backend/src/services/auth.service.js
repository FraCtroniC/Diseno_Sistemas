const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Usuario } = require('../models');
const environment = require('../../config/environment');
const emailService = require('./email.service');

class AuthService {
  async login(identificador, password) {
    const loginInput = (identificador || '').trim().toLowerCase();
    let usuario = await Usuario.findOne({ where: { email: loginInput } });

    if (!usuario && loginInput) {
      usuario = await Usuario.findOne({
        where: { username: { [Op.iLike]: loginInput } }
      });
    }

    if (!usuario && loginInput && !loginInput.includes('@')) {
      const candidatos = await Usuario.findAll({
        where: {
          email: {
            [Op.iLike]: `${loginInput}@%`
          }
        },
        limit: 2
      });

      if (candidatos.length === 1) {
        [usuario] = candidatos;
      }
    }

    if (!usuario) {
      const err = new Error('Credenciales inválidas');
      err.statusCode = 401;
      throw err;
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      const err = new Error('Credenciales inválidas');
      err.statusCode = 401;
      throw err;
    }

    if (!usuario.activo) {
      const err = new Error('Cuenta desactivada');
      err.statusCode = 403;
      throw err;
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, username: usuario.username, rol: usuario.rol },
      environment.jwtSecret,
      { expiresIn: '2h' }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        username: usuario.username,
        rol: usuario.rol,
        cedula: usuario.cedula,
        telefono: usuario.telefono
      }
    };
  }

  async register(data) {
    const existe = await Usuario.findOne({ where: { email: data.email } });
    if (existe) {
      const err = new Error('El email ya está registrado');
      err.statusCode = 400;
      throw err;
    }

    if (data.username) {
      const existeUsername = await Usuario.findOne({ where: { username: data.username } });
      if (existeUsername) {
        const err = new Error('El nombre de usuario ya está en uso');
        err.statusCode = 400;
        throw err;
      }
    }

    const hash = await bcrypt.hash(data.password, 10);
    const usuario = await Usuario.create({
      nombre: data.nombre,
      email: data.email,
      username: data.username || null,
      password_hash: hash,
      cedula: data.cedula || null,
      telefono: data.telefono || null,
      rol: 'bibliotecario'
    });

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, username: usuario.username, rol: usuario.rol },
      environment.jwtSecret,
      { expiresIn: '2h' }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        username: usuario.username,
        rol: usuario.rol,
        cedula: usuario.cedula,
        telefono: usuario.telefono
      }
    };
  }

  async forgotPassword(email) {
    const usuario = await Usuario.findOne({ where: { email } });
    const message = 'Si el correo está registrado, recibirás un enlace de restablecimiento.';

    if (!usuario) {
      return { message };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    await usuario.update({
      reset_token: resetToken,
      reset_token_expires: expires
    });

    const resetLink = `${environment.frontendUrl}/reset-password#token=${resetToken}&email=${encodeURIComponent(email)}`;

    try {
      await emailService.sendPasswordResetLink(email, resetLink);
    } catch (emailErr) {
      console.error('Error al enviar correo de recuperación:', emailErr.message);
      await usuario.update({ reset_token: null, reset_token_expires: null });
      if (environment.nodeEnv !== 'development') {
        return { message };
      }
      return { message: 'Modo desarrollo — link de restablecimiento generado, pero no se pudo enviar el correo.', resetLink, devMode: true };
    }

    return { message };
  }

  async resetPassword(token, email, newPassword) {
    const { Op } = require('sequelize');
    const usuario = await Usuario.findOne({
      where: {
        email,
        reset_token: token,
        reset_token_expires: { [Op.gt]: new Date() }
      }
    });

    if (!usuario) {
      const err = new Error('El enlace de restablecimiento es inválido o ha expirado');
      err.statusCode = 400;
      throw err;
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await usuario.update({
      password_hash: hash,
      reset_token: null,
      reset_token_expires: null
    });

    return { message: 'Contraseña restablecida correctamente. Ahora puedes iniciar sesión.' };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      const err = new Error('Usuario no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const valida = await bcrypt.compare(currentPassword, usuario.password_hash);
    if (!valida) {
      const err = new Error('La contraseña actual no es correcta');
      err.statusCode = 400;
      throw err;
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await usuario.update({ password_hash: hash });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async perfil(id) {
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!usuario) {
      const err = new Error('Usuario no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      username: usuario.username,
      rol: usuario.rol,
      cedula: usuario.cedula,
      telefono: usuario.telefono
    };
  }

  async actualizarPerfil(id, data) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      const err = new Error('Usuario no encontrado');
      err.statusCode = 404;
      throw err;
    }

    if (data.username !== undefined && data.username !== usuario.username) {
      const existeUsername = await Usuario.findOne({ where: { username: data.username } });
      if (existeUsername) {
        const err = new Error('El nombre de usuario ya está en uso');
        err.statusCode = 400;
        throw err;
      }
    }

    const updateData = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.username !== undefined) updateData.username = data.username || null;
    if (data.cedula !== undefined) updateData.cedula = data.cedula || null;
    if (data.telefono !== undefined) updateData.telefono = data.telefono || null;

    await usuario.update(updateData);

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      username: usuario.username,
      rol: usuario.rol,
      cedula: usuario.cedula,
      telefono: usuario.telefono
    };
  }
}

module.exports = new AuthService();
