const { Trabajo, Categoria, Usuario } = require('../models');

function apellidos(nombreCompleto) {
  const parts = nombreCompleto.trim().split(/\s+/);
  if (parts.length <= 2) return parts.join(', ');
  return `${parts[0]}, ${parts.slice(1).join(' ')}`;
}

function generarAPA(trabajo) {
  const meta = trabajo.metadatos || {};
  const autor = apellidos(trabajo.autor);
  const year = trabajo.anio;
  const titulo = trabajo.titulo;
  const tipoDoc = meta.tipo_documento || 'Trabajo académico';
  const tipoLabel = {
    pregrado: 'Trabajo de pregrado',
    postgrado: 'Trabajo de postgrado',
    tesis: 'Tesis',
    tfg: 'Trabajo Final de Grado',
    pasantia: 'Informe de pasantía',
    articulo: 'Artículo',
    monografia: 'Monografía',
    trabajo: 'Trabajo',
    normativas: 'Normativa',
    institucional: 'Documento institucional',
    editorial: 'Publicación editorial',
    divulgacion: 'Material de divulgación'
  }[tipoDoc] || tipoDoc;
  const institucion = meta.institucion || 'UNEFA Núcleo Táchira';
  const url = trabajo.archivo_url ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}${trabajo.archivo_url}` : '';

  let cita = `${autor} (${year}). ${titulo}. [${tipoLabel}]. ${institucion}.`;
  if (url) cita += ` ${url}`;
  return cita;
}

function generarBibTeX(trabajo) {
  const meta = trabajo.metadatos || {};
  const autor = trabajo.autor;
  const year = trabajo.anio;
  const titulo = trabajo.titulo;
  const key = `${autor.split(/\s+/)[0]?.toLowerCase() || 'autor'}${year}`.replace(/[^a-z0-9]/gi, '');
  const institucion = meta.institucion || 'UNEFA Núcleo Táchira';
  const tipoDoc = meta.tipo_documento || 'misc';

  const bibType = {
    pregrado: 'phdthesis',
    postgrado: 'mastersthesis',
    tesis: 'phdthesis',
    tfg: 'mastersthesis',
    pasantia: 'techreport',
    articulo: 'article',
    monografia: 'book',
    normativas: 'misc',
    institucional: 'techreport',
    editorial: 'book',
    divulgacion: 'misc'
  }[tipoDoc] || 'misc';

  return `@${bibType}{${key},
  author = {${autor}},
  title = {${titulo}},
  year = {${year}},
  school = {${institucion}}
}`;
}

function generarRIS(trabajo) {
  const meta = trabajo.metadatos || {};
  const autor = trabajo.autor;
  const year = trabajo.anio;
  const titulo = trabajo.titulo;
  const institucion = meta.institucion || 'UNEFA Núcleo Táchira';
  const url = trabajo.archivo_url ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}${trabajo.archivo_url}` : '';

  const lines = [
    'TY  - THES',
    `AU  - ${autor}`,
    `PY  - ${year}`,
    `TI  - ${titulo}`,
    `PB  - ${institucion}`,
  ];
  if (url) lines.push(`UR  - ${url}`);
  lines.push('ER  - ');
  return lines.join('\n');
}

class CitaService {
  async generar(trabajoId, formato = 'apa') {
    const trabajo = await Trabajo.findByPk(trabajoId, {
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre', 'slug'] }
      ]
    });
    if (!trabajo) {
      const err = new Error('Trabajo no encontrado');
      err.statusCode = 404;
      throw err;
    }

    switch (formato) {
      case 'bibtex':
        return { formato, contenido: generarBibTeX(trabajo), extension: 'bib', mime: 'application/x-bibtex' };
      case 'ris':
        return { formato, contenido: generarRIS(trabajo), extension: 'ris', mime: 'application/x-research-info-systems' };
      case 'apa':
      default:
        return { formato, contenido: generarAPA(trabajo), extension: 'txt', mime: 'text/plain' };
    }
  }
}

module.exports = new CitaService();
