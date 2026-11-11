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

/**
 * Autenticación opcional para endpoints públicos: si hay token válido,
 * rellena req.user; si no hay token, continúa como anónimo.
 */
module.exports = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, environment.jwtSecret);
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: ['id', 'nombre', 'email', 'username', 'rol', 'activo']
    });

    if (!usuario || !usuario.activo) {
      const err = new Error('Token inválido o usuario inactivo');
      err.statusCode = 401;
      throw err;
    }

    req.user = usuario.get({ plain: true });
    return next();
  } catch (error) {
    if (error.statusCode) throw error;
    const err = new Error('Token inválido o expirado');
    err.statusCode = 401;
    throw err;
  }
};
