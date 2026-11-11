const { query } = require('express-validator');

const listarEntidadRules = [
  query('q')
    .optional()
    .isString().withMessage('q debe ser texto')
    .trim()
    .isLength({ max: 200 }).withMessage('q no puede exceder 200 caracteres'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 200 }).withMessage('limite debe ser entre 1 y 200')
    .toInt()
];

const listarEstudianteRules = [
  ...listarEntidadRules,
  query('carrera_id')
    .optional()
    .isUUID().withMessage('carrera_id debe ser un UUID válido')
];

module.exports = { listarEntidadRules, listarEstudianteRules };
