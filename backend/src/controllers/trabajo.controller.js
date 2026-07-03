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
    if (req.file) {
      archivoBuffer = req.file.buffer;
      const result = await cloudinaryService.subirArchivo(req.file.buffer, req.file.originalname);
      archivoUrl = result.url;
    }
    const trabajo = await trabajoService.crear(req.body, req.user.id, archivoUrl, archivoBuffer, req.user.rol);
    res.status(201).json({ success: true, data: trabajo });
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
    await versionService.crearDesdeTrabajo(trabajoActual, req.user.id);

    let archivoUrl = null;
    let archivoBuffer = null;
    if (req.file) {
      archivoBuffer = req.file.buffer;
      const result = await cloudinaryService.subirArchivo(req.file.buffer, req.file.originalname);
      archivoUrl = result.url;
    }
    const trabajo = await trabajoService.actualizar(req.params.id, req.body, req.user.id, archivoUrl, archivoBuffer, req.user.rol);
    res.status(200).json({ success: true, data: trabajo });
  }

  async eliminar(req, res) {
    await trabajoService.eliminar(req.params.id);
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
