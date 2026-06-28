const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { loginRules, registerRules, forgotPasswordRules, changePasswordRules, resetPasswordRules, updateProfileRules } = require('../validators/auth.validator');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' }
});

const router = Router();

router.post('/login', authLimiter, loginRules, authController.login);
router.post('/register', limiter, registerRules, authController.register);
router.post('/forgot-password', authLimiter, forgotPasswordRules, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordRules, authController.resetPassword);
router.post('/logout', authController.logout);
router.put('/change-password', authMiddleware, changePasswordRules, authController.changePassword);
router.get('/perfil', authMiddleware, authController.perfil);
router.put('/perfil', authMiddleware, updateProfileRules, authController.actualizarPerfil);

module.exports = router;
