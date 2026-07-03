const { body } = require('express-validator');

const loginRules = [
  body('identificador')
    .optional({ values: 'falsy' })
    .isString().withMessage('El identificador debe ser texto')
    .trim(),
  body('email')
    .optional({ values: 'falsy' })
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body().custom((_, { req }) => {
    if (!req.body.identificador && !req.body.email) {
      throw new Error('Debe enviar usuario o correo');
    }
    return true;
  }),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
];

const registerRules = [
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
  body('cedula')
    .optional({ values: 'null' })
    .isString().withMessage('La cédula debe ser texto'),
  body('telefono')
    .optional({ values: 'null' })
    .isString().withMessage('El teléfono debe ser texto'),
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
    .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
];

const resetPasswordRules = [
  body('token')
    .notEmpty().withMessage('Token requerido'),
  body('email')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
];

const updateProfileRules = [
  body('username')
    .optional({ values: 'falsy' })
    .isLength({ max: 50 }).withMessage('El nombre de usuario no puede exceder 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('El nombre de usuario solo puede contener letras, números y guión bajo'),
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
