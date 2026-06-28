const jwt = require('jsonwebtoken');
const environment = require('../../config/environment');

module.exports = (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    const err = new Error('Token de acceso no proporcionado');
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = jwt.verify(token, environment.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    const err = new Error('Token inválido o expirado');
    err.statusCode = 401;
    throw err;
  }
};
