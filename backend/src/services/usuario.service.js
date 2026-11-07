const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const { normalizeCedula, esCedulaDuplicada } = require('../utils/cedula');

const CAMPOS_ACTUALIZAR = ['nombre', 'username', 'email', 'rol', 'activo', 'cedula', 'telefono'];

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

    if (data.username) {
      const existeUsername = await Usuario.findOne({ where: { username: data.username } });
      if (existeUsername) {
        const err = new Error('El nombre de usuario ya está en uso');
        err.statusCode = 400;
        throw err;
      }
    }

    const hash = await bcrypt.hash(data.password, 10);
    const nuevoUsuario = {
      nombre: data.nombre,
      email: data.email,
      username: data.username || null,
      password_hash: hash
    };

    if (data.rol) {
      nuevoUsuario.rol = data.rol;
    }

    return Usuario.create(nuevoUsuario);
  }

  async actualizar(id, data) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      const err = new Error('Usuario no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const updateData = {};
    for (const campo of CAMPOS_ACTUALIZAR) {
      if (Object.prototype.hasOwnProperty.call(data, campo)) {
        updateData[campo] = data[campo];
      }
    }

    if (updateData.username === '') updateData.username = null;

    if (Object.prototype.hasOwnProperty.call(updateData, 'cedula')) {
      const cedula = normalizeCedula(updateData.cedula);
      if (cedula) {
        const existeCedula = await Usuario.findOne({ where: { cedula } });
        if (existeCedula && existeCedula.id !== id) {
          const err = new Error('La cédula ya está registrada');
          err.statusCode = 400;
          throw err;
        }
      }
      updateData.cedula = cedula;
    }

    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
    }

    if (data.email && data.email !== usuario.email) {
      const existe = await Usuario.findOne({ where: { email: data.email } });
      if (existe) {
        const err = new Error('El email ya está registrado');
        err.statusCode = 400;
        throw err;
      }
    }

    if (data.username && data.username !== usuario.username) {
      const existeUsername = await Usuario.findOne({ where: { username: data.username } });
      if (existeUsername) {
        const err = new Error('El nombre de usuario ya está en uso');
        err.statusCode = 400;
        throw err;
      }
    }

    try {
      await usuario.update(updateData);
    } catch (error) {
      if (esCedulaDuplicada(error)) {
        const err = new Error('La cédula ya está registrada');
        err.statusCode = 400;
        throw err;
      }
      throw error;
    }

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
