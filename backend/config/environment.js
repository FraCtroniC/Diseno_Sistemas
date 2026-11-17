require('./load-env');

const path = require('path');

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  // El navegador envía el Origin sin barra final y auth.service.js/cita.service.js
  // concatenan rutas a esta base: se normaliza una sola vez para ambos casos.
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  // Base pública para los enlaces generados en RSS/Atom/OAI. Separa el dominio
  // del frontend (lo que ve el suscriptor) del CORS y del backend que genera el XML.
  feedSiteUrl: (process.env.FEED_SITE_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  cloudinaryMode: process.env.CLOUDINARY_MODE || 'cloudinary',
  localUploadDir: process.env.LOCAL_UPLOAD_DIR || path.resolve(__dirname, '../../.local/uploads'),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@repositorio.unefa.edu.ve'
  }
};
