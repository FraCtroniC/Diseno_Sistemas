const { Router } = require('express');
const carreraController = require('../controllers/carrera.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const { createCarreraRules, updateCarreraRules } = require('../validators/carrera.validator');
const { listarCarreraRules } = require('../validators/entidad.validator');

const router = Router();

router.get('/', listarCarreraRules, validate, carreraController.listar);
router.get('/:id', carreraController.obtenerPorId);

router.use(authMiddleware);
router.post('/', roleMiddleware('admin'), createCarreraRules, validate, carreraController.crear);
router.put('/:id', roleMiddleware('admin'), updateCarreraRules, validate, carreraController.actualizar);
router.delete('/:id', roleMiddleware('admin'), carreraController.eliminar);

module.exports = router;
