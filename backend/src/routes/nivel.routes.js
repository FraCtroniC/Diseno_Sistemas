const { Router } = require('express');
const nivelController = require('../controllers/nivel.controller');

const router = Router();

router.get('/', nivelController.listar);

module.exports = router;
