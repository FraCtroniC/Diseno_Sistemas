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
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'El cuerpo de la solicitud es demasiado grande';
  } else if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400)) {
    statusCode = 400;
    message = 'JSON inválido en el cuerpo de la solicitud';
  }

  const details = err.details || null;

  res.status(statusCode).json({
    success: false,
    error: message,
    errors: details,
    statusCode: statusCode
  });
};
