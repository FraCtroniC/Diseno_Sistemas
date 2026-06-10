const jwt = require('jsonwebtoken');
const environment = require('../../config/environment');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Token de acceso no proporcionado');
    err.statusCode = 401;
    throw err;
  }

  const token = authHeader.split(' ')[1];

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
