module.exports = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      const err = new Error('No autenticado');
      err.statusCode = 401;
      throw err;
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      const err = new Error(`Acceso denegado. Roles permitidos: ${rolesPermitidos.join(', ')}`);
      err.statusCode = 403;
      throw err;
    }

    next();
  };
};
