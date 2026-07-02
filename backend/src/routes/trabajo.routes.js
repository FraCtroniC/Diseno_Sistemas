const { Router } = require('express');
const trabajoController = require('../controllers/trabajo.controller');
const revisionController = require('../controllers/revision.controller');
const comentarioController = require('../controllers/comentario.controller');
const versionController = require('../controllers/version.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const { createTrabajoRules, updateTrabajoRules, cambioEstadoRules, buscarRules } = require('../validators/trabajo.validator');

const router = Router();

router.get('/buscar', buscarRules, trabajoController.buscar);
router.get('/', trabajoController.listar);
router.get('/:id', trabajoController.obtenerPorId);
router.get('/:id/archivo', trabajoController.descargarArchivo);
router.get('/:id/cita', trabajoController.citar);
router.get('/:id/estadisticas', trabajoController.estadisticas);
router.get('/:id/comentarios', comentarioController.listar);
router.get('/:id/versiones', versionController.listar);

router.use(authMiddleware);
router.post('/:id/comentarios', comentarioController.crear);
router.post('/:id/versiones/:versionId/restaurar', roleMiddleware('admin', 'repositor'), versionController.restaurar);

router.post('/', roleMiddleware('admin', 'repositor', 'bibliotecario'), upload.single('archivo'), createTrabajoRules, trabajoController.crear);
router.put('/:id', roleMiddleware('admin', 'repositor', 'bibliotecario'), upload.single('archivo'), updateTrabajoRules, trabajoController.actualizar);
router.delete('/:id', roleMiddleware('admin', 'repositor'), trabajoController.eliminar);
router.patch('/:id/estado', cambioEstadoRules, revisionController.cambiarEstado);

module.exports = router;
