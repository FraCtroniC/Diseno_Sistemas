const { Router } = require('express');
const authRoutes = require('./auth.routes');
const usuarioRoutes = require('./usuario.routes');
const trabajoRoutes = require('./trabajo.routes');
const revisionRoutes = require('./revision.routes');
const carreraRoutes = require('./carrera.routes');
const nivelRoutes = require('./nivel.routes');
const tutorRoutes = require('./tutor.routes');
const estudianteRoutes = require('./estudiante.routes');
const adminRoutes = require('./admin.routes');
const notificacionRoutes = require('./notificacion.routes');
const lineaRoutes = require('./linea.routes');
const areaRoutes = require('./area.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/trabajos', trabajoRoutes);
router.use('/revisiones', revisionRoutes);
router.use('/carreras', carreraRoutes);
router.use('/niveles-academicos', nivelRoutes);
router.use('/tutores', tutorRoutes);
router.use('/estudiantes', estudianteRoutes);
router.use('/admin', adminRoutes);
router.use('/notificaciones', notificacionRoutes);
router.use('/lineas-operativas', lineaRoutes);
router.use('/areas-estrategicas', areaRoutes);

module.exports = router;
