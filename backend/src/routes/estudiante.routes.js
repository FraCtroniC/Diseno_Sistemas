const { Router } = require('express');
const estudianteController = require('../controllers/estudiante.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = Router();

router.get('/', estudianteController.listar);
router.get('/:id', estudianteController.obtenerPorId);

router.use(authMiddleware);
router.post('/', roleMiddleware('admin'), estudianteController.crear);
router.put('/:id', roleMiddleware('admin'), estudianteController.actualizar);
router.delete('/:id', roleMiddleware('admin'), estudianteController.eliminar);

module.exports = router;
