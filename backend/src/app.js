const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const errorMiddleware = require('./middlewares/error.middleware');
const routes = require('./routes');

const app = express();

// Middlewares globales de seguridad y formato
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos (PDFs subidos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Middleware unificado de manejo de errores (Siempre al final)
app.use(errorMiddleware);

module.exports = app;
