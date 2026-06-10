const { Router } = require('express');
const usuarioController = require('../controllers/usuario.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { createUsuarioRules, updateUsuarioRules } = require('../validators/usuario.validator');

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.obtenerPorId);
router.post('/', createUsuarioRules, usuarioController.crear);
router.put('/:id', updateUsuarioRules, usuarioController.actualizar);
router.delete('/:id', usuarioController.eliminar);
router.patch('/:id/estado', usuarioController.cambiarEstado);

module.exports = router;
