const { Router } = require('express');
const trabajoController = require('../controllers/trabajo.controller');
const revisionController = require('../controllers/revision.controller');
const comentarioController = require('../controllers/comentario.controller');
const versionController = require('../controllers/version.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const optionalAuthMiddleware = require('../middlewares/optional-auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validation.middleware');
const { createTrabajoRules, updateTrabajoRules, cambioEstadoRules, buscarRules, listarRules } = require('../validators/trabajo.validator');

const router = Router();

router.get('/buscar', optionalAuthMiddleware, buscarRules, validate, trabajoController.buscar);
router.get('/', optionalAuthMiddleware, listarRules, validate, trabajoController.listar);
router.get('/:id', optionalAuthMiddleware, trabajoController.obtenerPorId);
router.get('/:id/archivo', optionalAuthMiddleware, trabajoController.descargarArchivo);
router.get('/:id/cita', optionalAuthMiddleware, trabajoController.citar);
router.get('/:id/estadisticas', optionalAuthMiddleware, trabajoController.estadisticas);
router.get('/:id/comentarios', optionalAuthMiddleware, comentarioController.listar);
router.get('/:id/versiones', optionalAuthMiddleware, versionController.listar);

router.use(authMiddleware);
router.post('/:id/comentarios', comentarioController.crear);
router.put('/:id/comentarios/:comentarioId', comentarioController.actualizar);
router.delete('/:id/comentarios/:comentarioId', comentarioController.eliminar);
router.post('/:id/versiones/:versionId/restaurar', roleMiddleware('admin', 'repositor'), versionController.restaurar);

router.post('/', roleMiddleware('admin', 'repositor', 'bibliotecario'), upload.single('archivo'), createTrabajoRules, trabajoController.crear);
router.put('/:id', roleMiddleware('admin', 'repositor', 'bibliotecario'), upload.single('archivo'), updateTrabajoRules, trabajoController.actualizar);
router.delete('/:id', roleMiddleware('admin', 'repositor'), trabajoController.eliminar);
router.patch('/:id/estado', cambioEstadoRules, revisionController.cambiarEstado);

module.exports = router;
