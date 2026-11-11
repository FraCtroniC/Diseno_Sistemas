const { Router } = require('express');
const estudianteController = require('../controllers/estudiante.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const { listarEstudianteRules } = require('../validators/entidad.validator');

const router = Router();

// Los datos de estudiantes incluyen cédula y teléfono: solo personal autorizado.
router.get('/', authMiddleware, roleMiddleware('admin', 'bibliotecario'), listarEstudianteRules, validate, estudianteController.listar);
router.get('/:id', authMiddleware, roleMiddleware('admin', 'bibliotecario'), estudianteController.obtenerPorId);

router.post('/', authMiddleware, roleMiddleware('admin'), estudianteController.crear);
router.put('/:id', authMiddleware, roleMiddleware('admin'), estudianteController.actualizar);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), estudianteController.eliminar);

module.exports = router;
