const { body } = require('express-validator');

const createCarreraRules = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 200 }).withMessage('El nombre no puede exceder 200 caracteres'),
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser texto'),
  body('slug')
    .notEmpty().withMessage('El slug es requerido')
    .matches(/^[a-z0-9-]+$/).withMessage('El slug solo puede contener minúsculas, números y guiones'),
  body('nivel_id')
    .optional({ nullable: true })
    .isUUID().withMessage('nivel_id debe ser un UUID válido')
];

const updateCarreraRules = [
  body('nombre')
    .optional()
    .isLength({ max: 200 }).withMessage('El nombre no puede exceder 200 caracteres'),
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser texto'),
  body('slug')
    .optional()
    .matches(/^[a-z0-9-]+$/).withMessage('El slug solo puede contener minúsculas, números y guiones'),
  body('nivel_id')
    .optional({ nullable: true })
    .isUUID().withMessage('nivel_id debe ser un UUID válido')
];

module.exports = { createCarreraRules, updateCarreraRules };
