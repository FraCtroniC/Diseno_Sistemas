const { Op } = require('sequelize');
const { Trabajo, Revision, Usuario, Categoria } = require('../models');
const { crear: crearNotificacion } = require('./notificacion.service');
const sseService = require('./sse.service');

const TRANSICIONES_PERMITIDAS = {
  bibliotecario: {
    borrador: ['en_revision']
  },
  repositor: {
    borrador: ['publicado'],
    en_revision: ['publicado', 'borrador']
  },
  admin: {
    borrador: ['publicado', 'en_revision', 'archivado'],
    en_revision: ['publicado', 'borrador', 'archivado'],
    publicado: ['archivado'],
    archivado: ['publicado', 'borrador']
  }
};

class RevisionService {
  async cambiarEstado(trabajoId, nuevoEstado, comentario, usuario) {
    const trabajo = await Trabajo.findByPk(trabajoId);
    if (!trabajo) {
      const err = new Error('Trabajo no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const estadoAnterior = trabajo.estado;
    if (estadoAnterior === nuevoEstado) {
      const err = new Error(`El trabajo ya está en estado "${nuevoEstado}"`);
      err.statusCode = 400;
      throw err;
    }

    const transiciones = TRANSICIONES_PERMITIDAS[usuario.rol];
    if (!transiciones) {
      const err = new Error('No tienes permiso para cambiar estados');
      err.statusCode = 403;
      throw err;
    }

    const destinos = transiciones[estadoAnterior];
    if (!destinos || !destinos.includes(nuevoEstado)) {
      const err = new Error(
        `No puedes cambiar de "${estadoAnterior}" a "${nuevoEstado}" con tu rol`
      );
      err.statusCode = 403;
      throw err;
    }

    if (nuevoEstado === 'borrador' && estadoAnterior === 'en_revision' && !comentario) {
      const err = new Error('Debes proporcionar un comentario al rechazar el trabajo');
      err.statusCode = 400;
      throw err;
    }

    trabajo.estado = nuevoEstado;

    if (nuevoEstado === 'publicado' && !trabajo.identificador) {
      const year = trabajo.anio || new Date().getFullYear();
      const count = await Trabajo.count({
        where: {
          identificador: { [Op.like]: `UNEFA-TCH-${year}-%` }
        }
      });
      trabajo.identificador = `UNEFA-TCH-${year}-${String(count + 1).padStart(4, '0')}`;
    }

    await trabajo.save();

    await Revision.create({
      trabajo_id: trabajoId,
      revisor_id: usuario.id,
      estado_anterior: estadoAnterior,
      estado_nuevo: nuevoEstado,
      comentario: comentario || null
    });

    if (nuevoEstado === 'publicado') {
      await crearNotificacion(
        trabajo.usuario_id, 'publicado',
        `Tu trabajo "${trabajo.titulo}" ha sido publicado.`,
        trabajoId
      );
      const noLeidas = await require('./notificacion.service').contarNoLeidas(trabajo.usuario_id);
      sseService.notifyUser(trabajo.usuario_id, { type: 'count', noLeidas });
    } else if (nuevoEstado === 'borrador' && estadoAnterior === 'en_revision') {
      await crearNotificacion(
        trabajo.usuario_id, 'rechazado',
        `Tu trabajo "${trabajo.titulo}" ha sido devuelto a borrador. Comentario: ${comentario || 'Sin comentarios'}`,
        trabajoId
      );
      const noLeidas = await require('./notificacion.service').contarNoLeidas(trabajo.usuario_id);
      sseService.notifyUser(trabajo.usuario_id, { type: 'count', noLeidas });
    } else if (nuevoEstado === 'en_revision') {
      const repositors = await Usuario.findAll({ where: { rol: 'repositor' } });
      const results = await Promise.all(repositors.map((r) =>
        crearNotificacion(
          r.id, 'pendiente_revision',
          `El trabajo "${trabajo.titulo}" está esperando revisión.`,
          trabajoId
        )
      ));
      for (const notif of results) {
        const noLeidas = await require('./notificacion.service').contarNoLeidas(notif.usuario_id);
        sseService.notifyUser(notif.usuario_id, { type: 'count', noLeidas });
      }
    }

    return trabajo;
  }

  async listarRevisiones(trabajoId) {
    return Revision.findAll({
      where: { trabajo_id: trabajoId },
      include: [
        { model: Usuario, as: 'revisor', attributes: ['id', 'nombre'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async listarPendientes() {
    const { count, rows } = await Trabajo.findAndCountAll({
      where: { estado: 'en_revision' },
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre', 'slug'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
      ],
      order: [['updatedAt', 'DESC']]
    });

    return {
      total: count,
      datos: rows
    };
  }
}

module.exports = new RevisionService();
