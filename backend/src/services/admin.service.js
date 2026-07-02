const { Op, fn, col, literal } = require('sequelize');
const { Trabajo, Usuario, Categoria, Visita } = require('../models');

class AdminService {
  async getStats() {
    const totalDocumentos = await Trabajo.count();
    const publicados = await Trabajo.count({ where: { estado: 'publicado' } });
    const borradores = await Trabajo.count({ where: { estado: 'borrador' } });
    const enRevision = await Trabajo.count({ where: { estado: 'en_revision' } });
    const archivados = await Trabajo.count({ where: { estado: 'archivado' } });

    const totalUsuarios = await Usuario.count();
    const usuariosActivos = await Usuario.count({ where: { activo: true } });
    const totalCategorias = await Categoria.count();

    const publishedPorCategoria = await Trabajo.findAll({
      attributes: [
        'categoria_id',
        [fn('COUNT', col('Trabajo.id')), 'count']
      ],
      where: { estado: 'publicado' },
      include: [{ model: Categoria, as: 'categoria', attributes: ['nombre', 'slug'] }],
      group: ['categoria_id', 'categoria.id']
    });

    const normativasVigentes = await Trabajo.count({
      where: {
        estado: 'publicado',
        metadatos: {
          [Op.contains]: { tipo_documento: 'normativas' }
        }
      }
    });

    const trabajosPorMes = await Trabajo.findAll({
      attributes: [
        [fn('to_char', col('createdAt'), 'YYYY-MM'), 'mes'],
        [fn('COUNT', col('Trabajo.id')), 'cantidad']
      ],
      group: [fn('to_char', col('createdAt'), 'YYYY-MM')],
      order: [[literal('"mes"'), 'ASC']],
      limit: 12
    });

    const totalVisitas = await Visita.count();
    const totalVistas = await Visita.count({ where: { tipo: 'vista' } });
    const totalDescargas = await Visita.count({ where: { tipo: 'descarga' } });

    const topTrabajos = await Visita.findAll({
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
    });

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
      normativasVigentes,
      publishedPorCategoria: publishedPorCategoria.map((r) => ({
        categoriaId: r.categoria_id,
        nombre: r.categoria?.nombre ?? 'Sin categoría',
        slug: r.categoria?.slug ?? '',
        cantidad: parseInt(r.get('count'), 10)
      })),
      trabajosPorMes: trabajosPorMes.map((r) => ({
        mes: r.get('mes'),
        cantidad: parseInt(r.get('cantidad'), 10)
      })),
      visitas: { total: totalVisitas, vistas: totalVistas, descargas: totalDescargas },
      topTrabajos: topTrabajos.map((r) => ({
        id: r.trabajo_id,
        titulo: r.trabajo?.titulo ?? 'Sin título',
        identificador: r.trabajo?.identificador ?? '',
        total: parseInt(r.get('total'), 10),
        vistas: parseInt(r.get('vistas'), 10),
        descargas: parseInt(r.get('descargas'), 10)
      }))
    };
  }
}

module.exports = new AdminService();
