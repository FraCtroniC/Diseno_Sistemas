const { Router } = require('express');
const carreraController = require('../controllers/carrera.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = Router();

router.get('/', carreraController.listar);
router.get('/:id', carreraController.obtenerPorId);

router.use(authMiddleware);
router.post('/', roleMiddleware('admin'), carreraController.crear);
router.put('/:id', roleMiddleware('admin'), carreraController.actualizar);
router.delete('/:id', roleMiddleware('admin'), carreraController.eliminar);

module.exports = router;
