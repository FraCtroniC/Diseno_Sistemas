const { Router } = require('express');
const categoriaController = require('../controllers/categoria.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { createCategoriaRules, updateCategoriaRules } = require('../validators/categoria.validator');

const router = Router();

router.get('/', categoriaController.listar);
router.get('/:id', categoriaController.obtenerPorId);

router.use(authMiddleware);

router.post('/', roleMiddleware('admin', 'repositor'), createCategoriaRules, categoriaController.crear);
router.put('/:id', roleMiddleware('admin', 'repositor'), updateCategoriaRules, categoriaController.actualizar);
router.delete('/:id', roleMiddleware('admin'), categoriaController.eliminar);

module.exports = router;
