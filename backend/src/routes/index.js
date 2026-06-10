const { Router } = require('express');
const authRoutes = require('./auth.routes');
const usuarioRoutes = require('./usuario.routes');
const categoriaRoutes = require('./categoria.routes');
const trabajoRoutes = require('./trabajo.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/trabajos', trabajoRoutes);

module.exports = router;
