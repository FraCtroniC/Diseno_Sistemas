const { Router } = require('express');
const authRoutes = require('./auth.routes');
const usuarioRoutes = require('./usuario.routes');
const categoriaRoutes = require('./categoria.routes');
const trabajoRoutes = require('./trabajo.routes');
const revisionRoutes = require('./revision.routes');
const carreraRoutes = require('./carrera.routes');
const tutorRoutes = require('./tutor.routes');
const estudianteRoutes = require('./estudiante.routes');
const adminRoutes = require('./admin.routes');
const notificacionRoutes = require('./notificacion.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/trabajos', trabajoRoutes);
router.use('/revisiones', revisionRoutes);
router.use('/carreras', carreraRoutes);
router.use('/tutores', tutorRoutes);
router.use('/estudiantes', estudianteRoutes);
router.use('/admin', adminRoutes);
router.use('/notificaciones', notificacionRoutes);

module.exports = router;
