module.exports = (err, req, res, next) => {
  console.error(err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  const details = err.details || null;

  res.status(statusCode).json({
    success: false,
    error: message,
    errors: details,
    statusCode: statusCode
  });
};
