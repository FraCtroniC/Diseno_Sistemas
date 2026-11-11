const multer = require('multer');

const MAX_PDF_SIZE_MB = 10;
const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    const err = new Error('Solo se permiten archivos PDF');
    err.statusCode = 400;
    cb(err, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_PDF_SIZE_BYTES }
});

module.exports = upload;
module.exports.MAX_PDF_SIZE_MB = MAX_PDF_SIZE_MB;
module.exports.MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_BYTES;
