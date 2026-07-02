const { Carrera } = require('../models');

class CarreraService {
  async listar() {
    return Carrera.findAll({ order: [['nombre', 'ASC']] });
  }

  async obtenerPorId(id) {
    const carrera = await Carrera.findByPk(id);
    if (!carrera) {
      const err = new Error('Carrera no encontrada');
      err.statusCode = 404;
      throw err;
    }
    return carrera;
  }

  async crear(data) {
    return Carrera.create(data);
  }

  async actualizar(id, data) {
    const carrera = await this.obtenerPorId(id);
    await carrera.update(data);
    return carrera;
  }

  async eliminar(id) {
    const carrera = await this.obtenerPorId(id);
    await carrera.destroy();
  }
}

module.exports = new CarreraService();
