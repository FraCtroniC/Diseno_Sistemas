const express = require('express');
const router = express.Router();
const areaController = require('../controllers/area.controller');
const { body, param, query } = require('express-validator');

const areaRules = [
  body('linea_operativa_id')
    .notEmpty().withMessage('La línea operativa es requerida')
    .isUUID().withMessage('linea_operativa_id debe ser un UUID válido'),
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),
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

const listarRules = [
  query('linea_operativa')
    .optional()
    .isUUID().withMessage('linea_operativa debe ser un UUID válido')
];

router.get('/', listarRules, areaController.listar);
router.get('/:id', idRule, areaController.obtenerPorId);
router.post('/', areaRules, areaController.crear);
router.put('/:id', idRule, areaRules, areaController.actualizar);
router.delete('/:id', idRule, areaController.eliminar);

module.exports = router;
