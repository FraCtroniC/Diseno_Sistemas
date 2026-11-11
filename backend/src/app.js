const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const environment = require('../config/environment');
const errorMiddleware = require('./middlewares/error.middleware');
const routes = require('./routes');
const oaiRoutes = require('./routes/oai.routes');
const feedRoutes = require('./routes/feed.routes');

const app = express();

app.disable('x-powered-by');

// Detrás de Render hay un proxy inverso. Sin esto, el rate limit vería la IP
// del proxy para todos los clientes. En local se deja desactivado.
const trustProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS, 10);
if (Number.isInteger(trustProxyHops) && trustProxyHops >= 0) {
  app.set('trust proxy', trustProxyHops);
} else if (environment.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// En modo local las pruebas no hablan con Cloudinary: los PDFs se sirven desde .local/uploads.
if (environment.cloudinaryMode === 'local') {
  app.use('/local-files', express.static(environment.localUploadDir));
}

const globalLimiter = rateLimit({
  windowMs: Number.parseInt(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000,
  max: Number.parseInt(process.env.GLOBAL_RATE_LIMIT_MAX, 10) || 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' },
  skip: (req) => req.path === '/health' || req.path.startsWith('/local-files')
});

// Middlewares globales de seguridad y formato
app.use(globalLimiter);
app.use(cors({ origin: environment.frontendUrl, credentials: true }));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));
if (process.env.HTTP_LOGGING !== 'false') {
  app.use(morgan(environment.nodeEnv === 'test' ? 'tiny' : 'dev'));
}
app.use(cookieParser());
app.use(express.json({
  limit: process.env.JSON_BODY_LIMIT || '1mb',
  parameterLimit: 1000
}));
app.use(express.urlencoded({
  extended: true,
  limit: process.env.URLENCODED_BODY_LIMIT || '1mb',
  parameterLimit: 1000
}));

// Ruta de comprobación de salud (Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    timestamp: new Date()
  });
});

// Montaje de rutas API
app.use('/api/v1', routes);

// OAI-PMH endpoint para Google Scholar y recolectores
app.use('/oai', oaiRoutes);

// RSS/Atom feeds
app.use('/feed', feedRoutes);

// Middleware unificado de manejo de errores (Siempre al final)
app.use(errorMiddleware);

module.exports = app;
