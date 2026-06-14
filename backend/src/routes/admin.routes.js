const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = Router();

router.get('/stats', authMiddleware, roleMiddleware('admin'), adminController.getStats);

module.exports = router;
