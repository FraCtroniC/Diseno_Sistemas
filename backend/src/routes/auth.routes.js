const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { loginRules, registerRules } = require('../validators/auth.validator');

const router = Router();

router.post('/login', loginRules, authController.login);
router.post('/register', registerRules, authController.register);
router.get('/perfil', authMiddleware, authController.perfil);

module.exports = router;
