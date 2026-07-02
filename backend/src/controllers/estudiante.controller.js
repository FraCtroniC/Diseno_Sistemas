const estudianteService = require('../services/estudiante.service');

class EstudianteController {
  async listar(req, res) {
    const estudiantes = await estudianteService.listar({
      q: req.query.q,
      carrera_id: req.query.carrera_id
    });
    res.status(200).json({ success: true, data: estudiantes });
  }

  async obtenerPorId(req, res) {
    const estudiante = await estudianteService.obtenerPorId(req.params.id);
    res.status(200).json({ success: true, data: estudiante });
  }

  async crear(req, res) {
    const estudiante = await estudianteService.crear(req.body);
    res.status(201).json({ success: true, data: estudiante });
  }

  async actualizar(req, res) {
    const estudiante = await estudianteService.actualizar(req.params.id, req.body);
    res.status(200).json({ success: true, data: estudiante });
  }

  async eliminar(req, res) {
    await estudianteService.eliminar(req.params.id);
    res.status(200).json({ success: true, message: 'Estudiante eliminado' });
  }
}

module.exports = new EstudianteController();
