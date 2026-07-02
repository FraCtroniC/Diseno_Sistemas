const tutorService = require('../services/tutor.service');

class TutorController {
  async listar(req, res) {
    const tutores = await tutorService.listar({ q: req.query.q });
    res.status(200).json({ success: true, data: tutores });
  }

  async obtenerPorId(req, res) {
    const tutor = await tutorService.obtenerPorId(req.params.id);
    res.status(200).json({ success: true, data: tutor });
  }

  async crear(req, res) {
    const tutor = await tutorService.crear(req.body);
    res.status(201).json({ success: true, data: tutor });
  }

  async actualizar(req, res) {
    const tutor = await tutorService.actualizar(req.params.id, req.body);
    res.status(200).json({ success: true, data: tutor });
  }

  async eliminar(req, res) {
    await tutorService.eliminar(req.params.id);
    res.status(200).json({ success: true, message: 'Tutor eliminado' });
  }
}

module.exports = new TutorController();
