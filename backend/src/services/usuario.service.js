const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

class UsuarioService {
  async listar() {
    return Usuario.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['nombre', 'ASC']]
    });
  }

  async obtenerPorId(id) {
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!usuario) {
      const err = new Error('Usuario no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return usuario;
  }

  async crear(data) {
    const existe = await Usuario.findOne({ where: { email: data.email } });
    if (existe) {
      const err = new Error('El email ya está registrado');
      err.statusCode = 400;
      throw err;
    }

    const hash = await bcrypt.hash(data.password, 10);
    return Usuario.create({
      nombre: data.nombre,
      email: data.email,
      password_hash: hash,
      rol: data.rol || 'bibliotecario'
    });
  }

  async actualizar(id, data) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      const err = new Error('Usuario no encontrado');
      err.statusCode = 404;
      throw err;
    }

    if (data.password) {
      data.password_hash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    if (data.email && data.email !== usuario.email) {
      const existe = await Usuario.findOne({ where: { email: data.email } });
      if (existe) {
        const err = new Error('El email ya está registrado');
        err.statusCode = 400;
        throw err;
      }
    }

    await usuario.update(data);
    const { password_hash, ...usuarioSinPassword } = usuario.toJSON();
    return usuarioSinPassword;
  }

  async eliminar(id) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      const err = new Error('Usuario no encontrado');
      err.statusCode = 404;
      throw err;
    }
    await usuario.destroy();
  }

  async cambiarEstado(id, activo) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      const err = new Error('Usuario no encontrado');
      err.statusCode = 404;
      throw err;
    }
    usuario.activo = activo;
    await usuario.save();
    return usuario;
  }
}

module.exports = new UsuarioService();
