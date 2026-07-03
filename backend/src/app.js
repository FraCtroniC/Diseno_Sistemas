const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middlewares/error.middleware');
const routes = require('./routes');
const oaiRoutes = require('./routes/oai.routes');
const feedRoutes = require('./routes/feed.routes');

const app = express();

// Middlewares globales de seguridad y formato
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
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
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
