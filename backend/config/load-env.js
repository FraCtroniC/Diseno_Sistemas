const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const nodeEnv = process.env.NODE_ENV || 'development';
const root = path.resolve(__dirname, '..');

// En test se carga únicamente .env.test y se fuerza la sobrescritura para que
// ninguna credencial de .env (Cloudinary, SMTP, Neon) se filtre a las pruebas.
// En el resto de entornos se mantiene el comportamiento original de .env.
const files = nodeEnv === 'test' ? ['.env.test'] : ['.env'];

for (const file of files) {
  const fullPath = path.join(root, file);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: nodeEnv === 'test' });
  }
}
