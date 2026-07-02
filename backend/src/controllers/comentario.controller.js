const comentarioService = require('../services/comentario.service');

class ComentarioController {
  async listar(req, res) {
    const resultado = await comentarioService.listar(req.params.id);
    res.status(200).json({ success: true, ...resultado });
  }

  async crear(req, res) {
    const { comentario, calificacion } = req.body;
    if (!comentario || !comentario.trim()) {
      const err = new Error('El comentario es obligatorio');
      err.statusCode = 400;
      throw err;
    }
    const result = await comentarioService.crear(req.params.id, req.user.id, comentario, calificacion);
    res.status(201).json({ success: true, data: result });
  }
}

module.exports = new ComentarioController();
