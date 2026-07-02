const { Version, Trabajo, Usuario } = require('../models');

class VersionService {
  async listar(trabajoId) {
    return Version.findAll({
      where: { trabajo_id: trabajoId },
      include: [{ model: Usuario, as: 'creador', attributes: ['id', 'nombre'] }],
      order: [['version', 'DESC']]
    });
  }

  async crearDesdeTrabajo(trabajo, usuarioId) {
    const maxVer = await Version.max('version', { where: { trabajo_id: trabajo.id } });
    const nuevaVersion = (maxVer || 0) + 1;

    return Version.create({
      trabajo_id: trabajo.id,
      version: nuevaVersion,
      datos: {
        titulo: trabajo.titulo,
        autor: trabajo.autor,
        tutor: trabajo.tutor,
        anio: trabajo.anio,
        resumen: trabajo.resumen,
        palabras_clave: trabajo.palabras_clave,
        categoria_id: trabajo.categoria_id,
        estado: trabajo.estado,
        identificador: trabajo.identificador
      },
      archivo_url: trabajo.archivo_url,
      created_by: usuarioId
    });
  }

  async restaurar(versionId, usuarioId) {
    const version = await Version.findByPk(versionId);
    if (!version) {
      const err = new Error('Versión no encontrada');
      err.statusCode = 404;
      throw err;
    }

    const trabajo = await Trabajo.findByPk(version.trabajo_id);
    if (!trabajo) {
      const err = new Error('Trabajo no encontrado');
      err.statusCode = 404;
      throw err;
    }

    await this.crearDesdeTrabajo(trabajo, usuarioId);

    const datos = version.datos;
    trabajo.titulo = datos.titulo;
    trabajo.autor = datos.autor;
    trabajo.tutor = datos.tutor;
    trabajo.anio = datos.anio;
    trabajo.resumen = datos.resumen;
    trabajo.palabras_clave = datos.palabras_clave;
    trabajo.categoria_id = datos.categoria_id;
    trabajo.estado = datos.estado;
    trabajo.archivo_url = version.archivo_url;
    await trabajo.save();

    return trabajo;
  }
}

module.exports = new VersionService();
