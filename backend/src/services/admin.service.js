const { Trabajo, Usuario, Categoria } = require('../models');

class AdminService {
  async getStats() {
    const totalDocumentos = await Trabajo.count();
    const publicados = await Trabajo.count({ where: { estado: 'publicado' } });
    const borradores = await Trabajo.count({ where: { estado: 'borrador' } });
    const archivados = await Trabajo.count({ where: { estado: 'archivado' } });

    const totalUsuarios = await Usuario.count();
    const usuariosActivos = await Usuario.count({ where: { activo: true } });
    const totalCategorias = await Categoria.count();

    const publishedPorCategoria = await Trabajo.findAll({
      attributes: [
        'categoria_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('Trabajo.id')), 'count']
      ],
      where: { estado: 'publicado' },
      include: [{ model: Categoria, as: 'categoria', attributes: ['nombre', 'slug'] }],
      group: ['categoria_id', 'categoria.id']
    });

    const normativasVigentes = await Trabajo.count({
      include: [{
        model: Categoria,
        as: 'categoria',
        where: { slug: 'normativas' }
      }],
      where: { estado: 'publicado' }
    });

    return {
      totalDocumentos,
      publicados,
      borradores,
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
      }))
    };
  }
}

module.exports = new AdminService();
