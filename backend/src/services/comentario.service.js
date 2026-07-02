const { Comentario, Usuario } = require('../models');

class ComentarioService {
  async listar(trabajoId) {
    const { count, rows } = await Comentario.findAndCountAll({
      where: { trabajo_id: trabajoId },
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }],
      order: [['createdAt', 'DESC']]
    });
    const promedio = rows.length > 0
      ? rows.reduce((s, c) => s + (c.calificacion || 0), 0) / rows.filter(c => c.calificacion).length
      : 0;
    return { total: count, promedio: Math.round(promedio * 10) / 10, datos: rows };
  }

  async crear(trabajoId, usuarioId, comentario, calificacion) {
    if (calificacion != null && (calificacion < 1 || calificacion > 5)) {
      const err = new Error('La calificación debe estar entre 1 y 5');
      err.statusCode = 400;
      throw err;
    }
    return Comentario.create({ trabajo_id: trabajoId, usuario_id: usuarioId, comentario, calificacion });
  }
}

module.exports = new ComentarioService();
