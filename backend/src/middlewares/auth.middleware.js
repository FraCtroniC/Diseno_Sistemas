const jwt = require('jsonwebtoken');
const environment = require('../../config/environment');
const { Usuario } = require('../models');

function extractToken(req) {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.slice(7);
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

module.exports = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    const err = new Error('Token de acceso no proporcionado');
    err.statusCode = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, environment.jwtSecret);
  } catch {
    const err = new Error('Token inválido o expirado');
    err.statusCode = 401;
    throw err;
  }

  // Se revalida contra la base para que desactivar un usuario o cambiar su rol
  // tenga efecto inmediato, sin esperar a que expire el JWT.
  const usuario = await Usuario.findByPk(decoded.id, {
    attributes: ['id', 'nombre', 'email', 'username', 'rol', 'activo']
  });

  if (!usuario || !usuario.activo) {
    const err = new Error('Token inválido o usuario inactivo');
    err.statusCode = 401;
    throw err;
  }

  req.user = usuario.get({ plain: true });
  next();
};
