const categoriaService = require('../services/categoria.service');
const { validationResult } = require('express-validator');

class CategoriaController {
  async listar(req, res) {
    const categorias = await categoriaService.listar();
    res.status(200).json({ success: true, data: categorias });
  }

  async obtenerPorId(req, res) {
    const categoria = await categoriaService.obtenerPorId(req.params.id);
    res.status(200).json({ success: true, data: categoria });
  }

  async crear(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const categoria = await categoriaService.crear(req.body);
    res.status(201).json({ success: true, data: categoria });
  }

  async actualizar(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const categoria = await categoriaService.actualizar(req.params.id, req.body);
    res.status(200).json({ success: true, data: categoria });
  }

  async eliminar(req, res) {
    await categoriaService.eliminar(req.params.id);
    res.status(200).json({ success: true, message: 'Categoría eliminada correctamente' });
  }
}

module.exports = new CategoriaController();
