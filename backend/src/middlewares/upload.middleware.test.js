const multer = require('multer');
const upload = require('./upload.middleware');

describe('upload.middleware', () => {
  it('expone el límite de 10 MB compartido con el frontend', () => {
    expect(upload.MAX_PDF_SIZE_MB).toBe(10);
    expect(upload.MAX_PDF_SIZE_BYTES).toBe(10 * 1024 * 1024);
  });

  it('es una instancia de multer con el método single', () => {
    expect(typeof upload.single).toBe('function');
    expect(multer.MulterError).toBeDefined();
  });
});
