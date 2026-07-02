const { Router } = require('express');
const notificacionController = require('../controllers/notificacion.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/', notificacionController.listar);
router.get('/contar', notificacionController.contarNoLeidas);
router.patch('/:id/leer', notificacionController.marcarLeida);
router.post('/leer-todas', notificacionController.marcarTodasLeidas);

module.exports = router;
