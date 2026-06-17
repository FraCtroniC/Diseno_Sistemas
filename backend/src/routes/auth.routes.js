const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { loginRules, registerRules, forgotPasswordRules, changePasswordRules, resetPasswordRules, updateProfileRules } = require('../validators/auth.validator');

const router = Router();

router.post('/login', loginRules, authController.login);
router.post('/register', registerRules, authController.register);
router.post('/forgot-password', forgotPasswordRules, authController.forgotPassword);
router.post('/reset-password', resetPasswordRules, authController.resetPassword);
router.put('/change-password', authMiddleware, changePasswordRules, authController.changePassword);
router.get('/perfil', authMiddleware, authController.perfil);
router.put('/perfil', authMiddleware, updateProfileRules, authController.actualizarPerfil);

module.exports = router;
