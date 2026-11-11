const { Router } = require('express');
const tutorController = require('../controllers/tutor.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const { listarEntidadRules } = require('../validators/entidad.validator');

const router = Router();

// La consulta pública solo expone id y nombre; nunca email, cédula ni teléfono.
router.get('/', listarEntidadRules, validate, tutorController.listar);
router.get('/:id', tutorController.obtenerPorId);

router.use(authMiddleware);
router.post('/', roleMiddleware('admin'), tutorController.crear);
router.put('/:id', roleMiddleware('admin'), tutorController.actualizar);
router.delete('/:id', roleMiddleware('admin'), tutorController.eliminar);

module.exports = router;
