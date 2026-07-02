const { Router } = require('express');
const tutorController = require('../controllers/tutor.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = Router();

router.get('/', tutorController.listar);
router.get('/:id', tutorController.obtenerPorId);

router.use(authMiddleware);
router.post('/', roleMiddleware('admin'), tutorController.crear);
router.put('/:id', roleMiddleware('admin'), tutorController.actualizar);
router.delete('/:id', roleMiddleware('admin'), tutorController.eliminar);

module.exports = router;
