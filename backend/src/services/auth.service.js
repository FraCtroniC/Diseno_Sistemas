const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const environment = require('../../config/environment');

class AuthService {
  async login(email, password) {
    const usuario = await Usuario.findOne({ where: { email } });
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
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      environment.jwtSecret,
      { expiresIn: '8h' }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
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

    const hash = await bcrypt.hash(data.password, 10);
    const usuario = await Usuario.create({
      nombre: data.nombre,
      email: data.email,
      password_hash: hash,
      rol: data.rol || 'bibliotecario'
    });

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    };
  }
}

module.exports = new AuthService();
