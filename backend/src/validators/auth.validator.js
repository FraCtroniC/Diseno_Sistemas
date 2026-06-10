const { body } = require('express-validator');

const loginRules = [
  body('email')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

const registerRules = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),
  body('email')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .optional()
    .isIn(['admin', 'repositor', 'bibliotecario']).withMessage('Rol inválido')
];

module.exports = { loginRules, registerRules };
