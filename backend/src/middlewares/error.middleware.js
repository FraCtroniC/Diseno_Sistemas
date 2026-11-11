const multer = require('multer');
const { MAX_PDF_SIZE_MB } = require('./upload.middleware');

module.exports = (err, req, res, next) => {
  console.error(err.stack || err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      message = `El archivo PDF supera el tamaño máximo permitido (${MAX_PDF_SIZE_MB} MB)`;
    } else {
      statusCode = 400;
      message = `Error al procesar el archivo: ${err.message}`;
    }
  }

  const details = err.details || null;

  res.status(statusCode).json({
    success: false,
    error: message,
    errors: details,
    statusCode: statusCode
  });
};
