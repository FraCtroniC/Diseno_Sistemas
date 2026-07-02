const carreraService = require('../services/carrera.service');

class CarreraController {
  async listar(req, res) {
    const carreras = await carreraService.listar();
    res.status(200).json({ success: true, data: carreras });
  }

  async obtenerPorId(req, res) {
    const carrera = await carreraService.obtenerPorId(req.params.id);
    res.status(200).json({ success: true, data: carrera });
  }

  async crear(req, res) {
    const carrera = await carreraService.crear(req.body);
    res.status(201).json({ success: true, data: carrera });
  }

  async actualizar(req, res) {
    const carrera = await carreraService.actualizar(req.params.id, req.body);
    res.status(200).json({ success: true, data: carrera });
  }

  async eliminar(req, res) {
    await carreraService.eliminar(req.params.id);
    res.status(200).json({ success: true, message: 'Carrera eliminada' });
  }
}

module.exports = new CarreraController();
