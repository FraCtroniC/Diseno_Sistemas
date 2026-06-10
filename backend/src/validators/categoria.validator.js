const { body } = require('express-validator');

const createCategoriaRules = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser texto'),
  body('slug')
    .notEmpty().withMessage('El slug es requerido')
    .matches(/^[a-z0-9-]+$/).withMessage('El slug solo puede contener minúsculas, números y guiones')
];

const updateCategoriaRules = [
  body('nombre')
    .optional()
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser texto'),
  body('slug')
    .optional()
    .matches(/^[a-z0-9-]+$/).withMessage('El slug solo puede contener minúsculas, números y guiones')
];

module.exports = { createCategoriaRules, updateCategoriaRules };
