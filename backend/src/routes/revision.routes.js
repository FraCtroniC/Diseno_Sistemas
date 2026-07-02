const { Router } = require('express');
const revisionController = require('../controllers/revision.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/pendientes', roleMiddleware('admin', 'repositor'), revisionController.listarPendientes);
router.get('/:id', revisionController.listarRevisiones);
router.patch('/:id/estado', revisionController.cambiarEstado);

module.exports = router;
