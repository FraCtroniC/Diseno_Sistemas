const { Router } = require('express');
const trabajoController = require('../controllers/trabajo.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const { createTrabajoRules, updateTrabajoRules, cambioEstadoRules, buscarRules } = require('../validators/trabajo.validator');

const router = Router();

router.get('/buscar', buscarRules, trabajoController.buscar);
router.get('/', trabajoController.listar);
router.get('/:id', trabajoController.obtenerPorId);
router.get('/:id/archivo', trabajoController.descargarArchivo);

router.use(authMiddleware);

router.post('/', roleMiddleware('admin', 'repositor', 'bibliotecario'), upload.single('archivo'), createTrabajoRules, trabajoController.crear);
router.put('/:id', roleMiddleware('admin', 'repositor', 'bibliotecario'), upload.single('archivo'), updateTrabajoRules, trabajoController.actualizar);
router.delete('/:id', roleMiddleware('admin', 'repositor'), trabajoController.eliminar);
router.patch('/:id/estado', roleMiddleware('admin', 'repositor'), cambioEstadoRules, trabajoController.cambiarEstado);

module.exports = router;
