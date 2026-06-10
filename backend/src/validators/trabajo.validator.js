const { body, param, query } = require('express-validator');

const createTrabajoRules = [
  body('titulo')
    .notEmpty().withMessage('El título es requerido')
    .isLength({ max: 300 }).withMessage('El título no puede exceder 300 caracteres'),
  body('autor')
    .notEmpty().withMessage('El autor es requerido')
    .isLength({ max: 200 }).withMessage('El autor no puede exceder 200 caracteres'),
  body('tutor')
    .optional()
    .isLength({ max: 200 }).withMessage('El tutor no puede exceder 200 caracteres'),
  body('anio')
    .notEmpty().withMessage('El año es requerido')
    .isInt({ min: 1900, max: 2100 }).withMessage('El año debe ser un número entre 1900 y 2100'),
  body('resumen')
    .optional()
    .isString().withMessage('El resumen debe ser texto'),
  body('palabras_clave')
    .optional()
    .isArray().withMessage('palabras_clave debe ser un arreglo'),
  body('categoria_id')
    .notEmpty().withMessage('La categoría es requerida')
    .isUUID().withMessage('categoria_id debe ser un UUID válido'),
  body('metadatos')
    .optional()
    .isObject().withMessage('metadatos debe ser un objeto JSON')
];

const updateTrabajoRules = [
  body('titulo')
    .optional()
    .isLength({ max: 300 }).withMessage('El título no puede exceder 300 caracteres'),
  body('autor')
    .optional()
    .isLength({ max: 200 }).withMessage('El autor no puede exceder 200 caracteres'),
  body('tutor')
    .optional()
    .isLength({ max: 200 }).withMessage('El tutor no puede exceder 200 caracteres'),
  body('anio')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('El año debe ser un número entre 1900 y 2100'),
  body('resumen')
    .optional()
    .isString().withMessage('El resumen debe ser texto'),
  body('palabras_clave')
    .optional()
    .isArray().withMessage('palabras_clave debe ser un arreglo'),
  body('categoria_id')
    .optional()
    .isUUID().withMessage('categoria_id debe ser un UUID válido'),
  body('estado')
    .optional()
    .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),
  body('metadatos')
    .optional()
    .isObject().withMessage('metadatos debe ser un objeto JSON')
];

const cambioEstadoRules = [
  body('estado')
    .notEmpty().withMessage('El estado es requerido')
    .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido')
];

const buscarRules = [
  query('q')
    .optional()
    .isString().withMessage('El término de búsqueda debe ser texto'),
  query('categoria')
    .optional()
    .isUUID().withMessage('categoria debe ser un UUID válido'),
  query('anio')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('Año inválido'),
  query('estado')
    .optional()
    .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),
  query('pagina')
    .optional()
    .isInt({ min: 1 }).withMessage('pagina debe ser un entero positivo'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limite debe ser entre 1 y 100')
];

module.exports = { createTrabajoRules, updateTrabajoRules, cambioEstadoRules, buscarRules };
