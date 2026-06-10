const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorMiddleware = require('./middlewares/error.middleware');
const routes = require('./routes');

const app = express();

// Middlewares globales de seguridad y formato
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

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
