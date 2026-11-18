const { Op } = require('sequelize');
const { Carrera, Trabajo, Estudiante } = require('../models');

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
    const existe = await Carrera.findOne({
      where: { [Op.or]: [{ nombre: data.nombre }, { slug: data.slug }] }
    });
    if (existe) {
      const err = new Error('Ya existe una carrera con ese nombre o slug');
      err.statusCode = 400;
      throw err;
    }
    return Carrera.create(data);
  }

  async actualizar(id, data) {
    const carrera = await this.obtenerPorId(id);

    if (data.slug && data.slug !== carrera.slug) {
      const existeSlug = await Carrera.findOne({ where: { slug: data.slug } });
      if (existeSlug) {
        const err = new Error('El slug ya está en uso');
        err.statusCode = 400;
        throw err;
      }
    }

    if (data.nombre && data.nombre !== carrera.nombre) {
      const existeNombre = await Carrera.findOne({ where: { nombre: data.nombre } });
      if (existeNombre) {
        const err = new Error('Ya existe una carrera con ese nombre');
        err.statusCode = 400;
        throw err;
      }
    }

    await carrera.update(data);
    return carrera;
  }

  async eliminar(id) {
    const carrera = await this.obtenerPorId(id);

    const [trabajosAsociados, estudiantesAsociados] = await Promise.all([
      Trabajo.count({ where: { carrera_id: id } }),
      Estudiante.count({ where: { carrera_id: id } })
    ]);

    if (trabajosAsociados > 0 || estudiantesAsociados > 0) {
      const err = new Error('No se puede eliminar la carrera porque tiene trabajos o estudiantes asociados');
      err.statusCode = 409;
      throw err;
    }

    await carrera.destroy();
  }
}

module.exports = new CarreraService();
