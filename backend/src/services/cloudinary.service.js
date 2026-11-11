const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const environment = require('../../config/environment');

const LOCAL_MODE = environment.cloudinaryMode === 'local';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

function localFileName(originalName) {
  const base = path.basename(originalName || 'documento.pdf');
  const withoutExt = base.replace(/\.[^/.]+$/, '');
  const safe = withoutExt.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'documento';
  return `${Date.now()}-${crypto.randomUUID()}-${safe}.pdf`;
}

/**
 * Extrae el public_id de una URL de entrega de Cloudinary.
 * Ej: https://res.cloudinary.com/demo/raw/upload/v123/trabajos/mi-archivo.pdf
 *     -> trabajos/mi-archivo.pdf
 */
function extraerPublicId(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const parsed = new URL(url);
    if (!/(^|\.)res\.cloudinary\.com$/i.test(parsed.hostname)) return null;

    const partes = parsed.pathname.split('/').filter(Boolean);
    const uploadIndex = partes.indexOf('upload');
    if (uploadIndex === -1) return null;

    const resto = partes.slice(uploadIndex + 1);
    if (resto.length > 0 && /^v\d+$/.test(resto[0])) resto.shift();

    const publicId = decodeURIComponent(resto.join('/'));
    return publicId || null;
  } catch {
    return null;
  }
}

class CloudinaryService {
  /**
   * En modo local (pruebas) guarda el PDF en .local/uploads y devuelve una URL
   * servida por el propio backend. En modo normal usa Cloudinary.
   */
  async subirArchivo(buffer, originalName) {
    if (LOCAL_MODE) {
      await fs.mkdir(environment.localUploadDir, { recursive: true });
      const filename = localFileName(originalName);
      await fs.writeFile(path.join(environment.localUploadDir, filename), buffer);
      return {
        url: `${environment.backendUrl}/local-files/${encodeURIComponent(filename)}`,
        publicId: `local:${filename}`
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'trabajos',
          public_id: `${Date.now()}-${originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')}`,
          format: 'pdf'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );
      bufferToStream(buffer).pipe(uploadStream);
    });
  }

  async eliminarArchivo(publicId) {
    if (LOCAL_MODE && typeof publicId === 'string' && publicId.startsWith('local:')) {
      const filename = publicId.slice('local:'.length);
      try {
        await fs.unlink(path.join(environment.localUploadDir, filename));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      return { result: 'ok' };
    }

    return cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  }
}

module.exports = new CloudinaryService();
module.exports.extraerPublicId = extraerPublicId;
module.exports.LOCAL_MODE = LOCAL_MODE;
