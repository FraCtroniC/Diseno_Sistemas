const { body } = require('express-validator');
const { CEDULA_REGEX, normalizeCedula } = require('../utils/cedula');

const createUsuarioRules = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),
  body('username')
    .optional({ values: 'falsy' })
    .isLength({ max: 50 }).withMessage('El nombre de usuario no puede exceder 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('El nombre de usuario solo puede contener letras, números y guión bajo'),
  body('email')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('rol')
    .optional()
    .isIn(['admin', 'repositor', 'bibliotecario']).withMessage('Rol inválido')
];

const updateUsuarioRules = [
  body('nombre')
    .optional()
    .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),
  body('username')
    .optional({ values: 'falsy' })
    .isLength({ max: 50 }).withMessage('El nombre de usuario no puede exceder 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('El nombre de usuario solo puede contener letras, números y guión bajo'),
  body('email')
    .optional()
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('rol')
    .optional()
    .isIn(['admin', 'repositor', 'bibliotecario']).withMessage('Rol inválido'),
  body('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser booleano'),
  body('cedula')
    .optional({ values: 'falsy' })
    .customSanitizer(normalizeCedula)
    .matches(CEDULA_REGEX).withMessage('La cédula debe tener el formato V-12345678'),
  body('telefono')
    .optional({ values: 'falsy' })
    .isString().withMessage('El teléfono debe ser texto')
    .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres')
];

module.exports = { createUsuarioRules, updateUsuarioRules };
