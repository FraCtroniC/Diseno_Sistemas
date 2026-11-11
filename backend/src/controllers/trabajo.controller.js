const trabajoService = require('../services/trabajo.service');
const citaService = require('../services/cita.service');
const estadisticaService = require('../services/estadistica.service');
const versionService = require('../services/version.service');
const cloudinaryService = require('../services/cloudinary.service');
const { validationResult } = require('express-validator');

class TrabajoController {
  async listar(req, res) {
    const { pagina, limite, estado, usuario_id } = req.query;
    const resultado = await trabajoService.listar({ pagina, limite, estado, usuario_id });
    res.status(200).json({ success: true, ...resultado });
  }

  async obtenerPorId(req, res) {
    const trabajo = await trabajoService.obtenerPorId(req.params.id);
    estadisticaService.registrar(req.params.id, 'vista').catch(() => {});
    res.status(200).json({ success: true, data: trabajo });
  }

  async crear(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    let archivoUrl = null;
    let archivoBuffer = null;
    let archivoPublicId = null;
    if (req.file) {
      archivoBuffer = req.file.buffer;
      const result = await cloudinaryService.subirArchivo(req.file.buffer, req.file.originalname);
      archivoUrl = result.url;
      archivoPublicId = result.publicId;
    }

    try {
      const trabajo = await trabajoService.crear(req.body, req.user.id, archivoUrl, archivoBuffer, req.user.rol);
      res.status(201).json({ success: true, data: trabajo });
    } catch (error) {
      // Si la creación falla después de subir el archivo, no dejamos huérfanos en Cloudinary.
      if (archivoPublicId) {
        await cloudinaryService.eliminarArchivo(archivoPublicId).catch(() => {});
      }
      throw error;
    }
  }

  async actualizar(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const trabajoActual = await trabajoService.obtenerPorId(req.params.id);

    let archivoUrl = null;
    let archivoBuffer = null;
    let archivoPublicId = null;
    if (req.file) {
      archivoBuffer = req.file.buffer;
      const result = await cloudinaryService.subirArchivo(req.file.buffer, req.file.originalname);
      archivoUrl = result.url;
      archivoPublicId = result.publicId;
    }

    try {
      await versionService.crearDesdeTrabajo(trabajoActual, req.user.id);
      const trabajo = await trabajoService.actualizar(req.params.id, req.body, req.user.id, archivoUrl, archivoBuffer, req.user.rol);
      res.status(200).json({ success: true, data: trabajo });
    } catch (error) {
      // El PDF recién subido no quedó asociado a ninguna versión: se elimina.
      if (archivoPublicId) {
        await cloudinaryService.eliminarArchivo(archivoPublicId).catch(() => {});
      }
      throw error;
    }
  }

  async eliminar(req, res) {
    const trabajo = await trabajoService.obtenerPorId(req.params.id);
    const versiones = await versionService.listar(req.params.id);

    await trabajoService.eliminar(req.params.id);

    // Se eliminan de Cloudinary el archivo actual y los de versiones anteriores.
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const urls = new Set(
      [trabajo.archivo_url, ...versiones.map((version) => version.archivo_url)]
        .filter((url) => typeof url === 'string' && (!cloudName || url.includes(`res.cloudinary.com/${cloudName}/`)))
    );
    const publicIds = [...urls]
      .map((url) => cloudinaryService.extraerPublicId(url))
      .filter(Boolean);

    const resultados = await Promise.allSettled(
      publicIds.map((publicId) => cloudinaryService.eliminarArchivo(publicId))
    );
    resultados.forEach((resultado) => {
      if (resultado.status === 'rejected') {
        console.error('No se pudo eliminar un archivo de Cloudinary:', resultado.reason?.message || resultado.reason);
      }
    });

    res.status(200).json({ success: true, message: 'Trabajo eliminado correctamente' });
  }

  async cambiarEstado(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const trabajo = await trabajoService.cambiarEstado(req.params.id, req.body.estado);
    res.status(200).json({ success: true, data: trabajo });
  }

  async estadisticas(req, res) {
    const stats = await estadisticaService.obtenerPorTrabajo(req.params.id);
    res.status(200).json({ success: true, data: stats });
  }

  async citar(req, res) {
    const formato = req.query.formato || 'apa';
    const result = await citaService.generar(req.params.id, formato);
    res.setHeader('Content-Type', result.mime);
    res.setHeader('Content-Disposition', `attachment; filename="cita-${req.params.id.slice(0, 8)}.${result.extension}"`);
    res.status(200).send(result.contenido);
  }

  async descargarArchivo(req, res) {
    const trabajo = await trabajoService.obtenerPorId(req.params.id);
    if (!trabajo.archivo_url) {
      const err = new Error('El trabajo no tiene un archivo asociado');
      err.statusCode = 404;
      throw err;
    }
    estadisticaService.registrar(req.params.id, 'descarga').catch(() => {});
    res.redirect(trabajo.archivo_url);
  }

  async buscar(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Error de validación');
      err.statusCode = 400;
      err.details = errors.array();
      throw err;
    }

    const resultado = await trabajoService.buscar(req.query);
    res.status(200).json({ success: true, ...resultado });
  }
}

module.exports = new TrabajoController();
