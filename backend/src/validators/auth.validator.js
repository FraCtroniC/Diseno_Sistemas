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
  body('cedula')
    .optional({ values: 'null' })
    .isString().withMessage('La cédula debe ser texto'),
  body('telefono')
    .optional({ values: 'null' })
    .isString().withMessage('El teléfono debe ser texto'),
  body('rol')
    .optional()
    .isIn(['admin', 'repositor', 'bibliotecario']).withMessage('Rol inválido')
];

const forgotPasswordRules = [
  body('email')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail()
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];

const resetPasswordRules = [
  body('token')
    .notEmpty().withMessage('Token requerido'),
  body('email')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];

const updateProfileRules = [
  body('email')
    .optional()
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('cedula')
    .optional({ values: 'null' })
    .isString().withMessage('La cédula debe ser texto'),
  body('telefono')
    .optional({ values: 'null' })
    .isString().withMessage('El teléfono debe ser texto'),
];

module.exports = { loginRules, registerRules, forgotPasswordRules, changePasswordRules, resetPasswordRules, updateProfileRules };
