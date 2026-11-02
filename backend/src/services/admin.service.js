const { Op, fn, col, literal } = require('sequelize');
const { Trabajo, Usuario, Categoria, Visita } = require('../models');

function aNumero(valor) {
  const numero = parseInt(valor, 10);
  return Number.isNaN(numero) ? 0 : numero;
}

class AdminService {
  async getStats() {
    // Todas las consultas son independientes: se lanzan en paralelo para no
    // encadenar idas y vueltas de red contra la base de datos (Neon).
    const [
      trabajosPorEstado,
      usuariosPorActivo,
      visitasPorTipo,
      totalCategorias,
      publishedPorCategoria,
      normativasVigentes,
      trabajosPorMes,
      topTrabajos
    ] = await Promise.all([
      Trabajo.count({ group: ['estado'] }),
      Usuario.count({ group: ['activo'] }),
      Visita.count({ group: ['tipo'] }),
      Categoria.count(),
      Trabajo.findAll({
        attributes: [
          'categoria_id',
          [fn('COUNT', col('Trabajo.id')), 'count']
        ],
        where: { estado: 'publicado' },
        include: [{ model: Categoria, as: 'categoria', attributes: ['nombre', 'slug'] }],
        group: ['categoria_id', 'categoria.id']
      }),
      Trabajo.count({
        where: {
          estado: 'publicado',
          metadatos: {
            [Op.contains]: { tipo_documento: 'normativas' }
          }
        }
      }),
      Trabajo.findAll({
        attributes: [
          [fn('to_char', col('createdAt'), 'YYYY-MM'), 'mes'],
          [fn('COUNT', col('Trabajo.id')), 'cantidad']
        ],
        group: [fn('to_char', col('createdAt'), 'YYYY-MM')],
        order: [[literal('"mes"'), 'ASC']],
        limit: 12
      }),
      Visita.findAll({
        attributes: [
          'trabajo_id',
          [fn('COUNT', col('Visita.id')), 'total'],
          [fn('SUM', literal("CASE WHEN tipo = 'vista' THEN 1 ELSE 0 END")), 'vistas'],
          [fn('SUM', literal("CASE WHEN tipo = 'descarga' THEN 1 ELSE 0 END")), 'descargas']
        ],
        include: [{ model: Trabajo, as: 'trabajo', attributes: ['id', 'titulo', 'identificador'] }],
        group: ['trabajo_id', 'trabajo.id', 'trabajo.titulo', 'trabajo.identificador'],
        order: [[literal('"total"'), 'DESC']],
        limit: 5
      })
    ]);

    const conteoTrabajos = {};
    let totalDocumentos = 0;
    for (const fila of trabajosPorEstado) {
      const cantidad = aNumero(fila.count);
      totalDocumentos += cantidad;
      if (fila.estado) conteoTrabajos[fila.estado] = cantidad;
    }

    const publicados = conteoTrabajos.publicado || 0;
    const borradores = conteoTrabajos.borrador || 0;
    const enRevision = conteoTrabajos.en_revision || 0;
    const archivados = conteoTrabajos.archivado || 0;

    let totalUsuarios = 0;
    let usuariosActivos = 0;
    for (const fila of usuariosPorActivo) {
      const cantidad = aNumero(fila.count);
      totalUsuarios += cantidad;
      if (String(fila.activo) === 'true') usuariosActivos = cantidad;
    }

    let totalVisitas = 0;
    let totalVistas = 0;
    let totalDescargas = 0;
    for (const fila of visitasPorTipo) {
      const cantidad = aNumero(fila.count);
      totalVisitas += cantidad;
      if (fila.tipo === 'vista') totalVistas = cantidad;
      if (fila.tipo === 'descarga') totalDescargas = cantidad;
    }

    return {
      totalDocumentos,
      publicados,
      borradores,
      enRevision,
      archivados,
      porcentajePublicado: totalDocumentos > 0 ? Math.round((publicados / totalDocumentos) * 100) : 0,
      totalUsuarios,
      usuariosActivos,
      totalCategorias,
      normativasVigentes: aNumero(normativasVigentes),
      publishedPorCategoria: publishedPorCategoria.map((r) => ({
        categoriaId: r.categoria_id,
        nombre: r.categoria?.nombre ?? 'Sin categoría',
        slug: r.categoria?.slug ?? '',
        cantidad: aNumero(r.get('count'))
      })),
      trabajosPorMes: trabajosPorMes.map((r) => ({
        mes: r.get('mes'),
        cantidad: aNumero(r.get('cantidad'))
      })),
      visitas: { total: totalVisitas, vistas: totalVistas, descargas: totalDescargas },
      topTrabajos: topTrabajos.map((r) => ({
        id: r.trabajo_id,
        titulo: r.trabajo?.titulo ?? 'Sin título',
        identificador: r.trabajo?.identificador ?? '',
        total: aNumero(r.get('total')),
        vistas: aNumero(r.get('vistas')),
        descargas: aNumero(r.get('descargas'))
      }))
    };
  }
}

module.exports = new AdminService();
