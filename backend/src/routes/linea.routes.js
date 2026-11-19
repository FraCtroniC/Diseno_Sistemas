const express = require('express');
const router = express.Router();
const lineaController = require('../controllers/linea.controller');
const { body, param } = require('express-validator');

const lineaRules = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('sigla')
    .notEmpty().withMessage('La sigla es requerida')
    .isLength({ max: 10 }).withMessage('La sigla no puede exceder 10 caracteres'),
  body('slug')
    .notEmpty().withMessage('El slug es requerido')
    .matches(/^[a-z0-9-]+$/).withMessage('El slug solo puede contener minúsculas, números y guiones'),
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser texto'),
  body('orden')
    .optional()
    .isInt({ min: 0 }).withMessage('El orden debe ser un número entero positivo'),
  body('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser booleano')
];

const idRule = [
  param('id')
    .isUUID().withMessage('id debe ser un UUID válido')
];

router.get('/', lineaController.listar);
router.get('/:id', idRule, lineaController.obtenerPorId);
router.post('/', lineaRules, lineaController.crear);
router.put('/:id', idRule, lineaRules, lineaController.actualizar);
router.delete('/:id', idRule, lineaController.eliminar);

module.exports = router;
