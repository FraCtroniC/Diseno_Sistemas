const { Op } = require('sequelize');
const { Trabajo, Categoria } = require('../models');

const BASE_URL = process.env.OAI_BASE_URL || 'http://localhost:3000/oai';
const REPOSITORY_NAME = 'UNEFA Táchira — Repositorio de Trabajos de Grado';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'repositorio@unefa.edu.ve';
const MAX_PER_PAGE = 50;

function escXml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function datestamp(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function dcElement(tag, value) {
  if (!value) return '';
  return `    <dc:${tag}>${escXml(value)}</dc:${tag}>\n`;
}

function buildDublinCore(t) {
  let xml = '    <oai_dc:dc\n';
  xml += '      xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"\n';
  xml += '      xmlns:dc="http://purl.org/dc/elements/1.1/"\n';
  xml += '      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '      xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/\n';
  xml += '        http://www.openarchives.org/OAI/2.0/oai_dc.xsd">\n';
  xml += dcElement('title', t.titulo);
  xml += dcElement('creator', t.autor);
  if (t.tutor) xml += dcElement('contributor', t.tutor);
  xml += dcElement('date', String(t.anio));
  xml += dcElement('type', 'Text');
  xml += dcElement('format', 'application/pdf');
  if (t.resumen) xml += dcElement('description', t.resumen);
  if (t.palabras_clave && t.palabras_clave.length) {
    t.palabras_clave.forEach(p => { xml += dcElement('subject', p); });
  }
  if (t.categoria && t.categoria.nombre) xml += dcElement('subject', t.categoria.nombre);
  if (t.identificador) xml += dcElement('identifier', t.identificador);
  if (t.archivo_url) xml += dcElement('identifier', t.archivo_url);
  xml += dcElement('language', 'es');
  xml += '    </oai_dc:dc>\n';
  return xml;
}

function buildHeader(t, identifierPrefix) {
  const oaiId = t.identificador || `${identifierPrefix}${t.id}`;
  const sets = t.categoria ? [escXml(t.categoria.nombre)] : [];
  let xml = `      <header>\n`;
  xml += `        <identifier>${escXml(oaiId)}</identifier>\n`;
  xml += `        <datestamp>${datestamp(t.updatedAt)}</datestamp>\n`;
  sets.forEach(s => { xml += `        <setSpec>${s}</setSpec>\n`; });
  xml += `      </header>\n`;
  return { xml, oaiId };
}

function buildRecord(t, identifierPrefix) {
  const { xml: header, oaiId } = buildHeader(t, identifierPrefix);
  let xml = `    <record>\n`;
  xml += header;
  xml += `      <metadata>\n`;
  xml += buildDublinCore(t);
  xml += `      </metadata>\n`;
  xml += `    </record>\n`;
  return xml;
}

function errorXml(code, message) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/
           http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>${new Date().toISOString()}</responseDate>
  <request>${escXml(BASE_URL)}</request>
  <error code="${escXml(code)}">${escXml(message)}</error>
</OAI-PMH>`;
}

function baseXml(verb, extraAttrs = '') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/
           http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>${new Date().toISOString()}</responseDate>
  <request verb="${escXml(verb)}"${extraAttrs}>${escXml(BASE_URL)}</request>
`;
}

function closeXml() {
  return `</OAI-PMH>`;
}

const identifierPrefix = 'oai:unefa.tachira.repositorio:';

async function identify() {
  let xml = baseXml('Identify');
  xml += `  <Identify>\n`;
  xml += `    <repositoryName>${escXml(REPOSITORY_NAME)}</repositoryName>\n`;
  xml += `    <baseURL>${escXml(BASE_URL)}</baseURL>\n`;
  xml += `    <protocolVersion>2.0</protocolVersion>\n`;
  xml += `    <adminEmail>${escXml(ADMIN_EMAIL)}</adminEmail>\n`;
  xml += `    <earliestDatestamp>2024-01-01T00:00:00Z</earliestDatestamp>\n`;
  xml += `    <deletedRecord>no</deletedRecord>\n`;
  xml += `    <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>\n`;
  xml += `  </Identify>\n`;
  xml += closeXml();
  return xml;
}

async function listMetadataFormats(identifier) {
  let xml;
  if (identifier) {
    const t = await Trabajo.findOne({ where: { [Op.or]: [{ identificador: identifier }, { id: identifier.replace(identifierPrefix, '') }] } });
    if (!t) return errorXml('idDoesNotExist', 'El identificador no existe en el repositorio.');
    xml = baseXml('ListMetadataFormats', ` identifier="${escXml(identifier)}"`);
  } else {
    xml = baseXml('ListMetadataFormats');
  }
  xml += `  <ListMetadataFormats>\n`;
  xml += `    <metadataFormat>\n`;
  xml += `      <metadataPrefix>oai_dc</metadataPrefix>\n`;
  xml += `      <schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>\n`;
  xml += `      <metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace>\n`;
  xml += `    </metadataFormat>\n`;
  xml += `  </ListMetadataFormats>\n`;
  xml += closeXml();
  return xml;
}

async function listSets() {
  const categorias = await Categoria.findAll({ order: [['nombre', 'ASC']] });
  let xml = baseXml('ListSets');
  xml += `  <ListSets>\n`;
  for (const cat of categorias) {
    xml += `    <set>\n`;
    xml += `      <setSpec>${escXml(cat.nombre)}</setSpec>\n`;
    xml += `      <setName>${escXml(cat.nombre)}</setName>\n`;
    if (cat.descripcion) xml += `      <setDescription><oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"><dc:description>${escXml(cat.descripcion)}</dc:description></oai_dc:dc></setDescription>\n`;
    xml += `    </set>\n`;
  }
  xml += `  </ListSets>\n`;
  xml += closeXml();
  return xml;
}

async function getRecord(identifier) {
  const t = await Trabajo.findOne({
    where: { estado: 'publicado', [Op.or]: [{ identificador: identifier }, { id: identifier.replace(identifierPrefix, '') }] },
    include: [{ model: Categoria, as: 'categoria', attributes: ['nombre'] }]
  });
  if (!t) return errorXml('idDoesNotExist', 'El identificador no existe en el repositorio.');
  let xml = baseXml('GetRecord', ` identifier="${escXml(identifier)}" metadataPrefix="oai_dc"`);
  xml += `  <GetRecord>\n`;
  xml += buildRecord(t, identifierPrefix);
  xml += `  </GetRecord>\n`;
  xml += closeXml();
  return xml;
}

async function listIdentifiers(metadataPrefix, set, from, until, resumptionToken) {
  return listCommon('ListIdentifiers', false, metadataPrefix, set, from, until, resumptionToken);
}

async function listRecords(metadataPrefix, set, from, until, resumptionToken) {
  return listCommon('ListRecords', true, metadataPrefix, set, from, until, resumptionToken);
}

async function listCommon(verb, includeMetadata, metadataPrefix, set, from, until, resumptionToken) {
  if (metadataPrefix && metadataPrefix !== 'oai_dc') {
    return errorXml('cannotDisseminateFormat', 'El formato de metadatos solicitado no está soportado.');
  }

  const where = { estado: 'publicado' };
  if (set) {
    const cat = await Categoria.findOne({ where: { nombre: set } });
    if (!cat) return errorXml('noRecordsMatch', 'No se encontraron registros para el conjunto especificado.');
    where.categoria_id = cat.id;
  }
  if (from) {
    where.updatedAt = { ...where.updatedAt, [Op.gte]: new Date(from) };
  }
  if (until) {
    const untilDate = new Date(until);
    untilDate.setHours(23, 59, 59, 999);
    where.updatedAt = { ...where.updatedAt, [Op.lte]: untilDate };
  }

  let offset = 0;
  let cursor = 0;
  if (resumptionToken) {
    try {
      const decoded = Buffer.from(resumptionToken, 'base64').toString();
      const parts = decoded.split(':');
      offset = parseInt(parts[0], 10);
      cursor = parseInt(parts[1], 10);
    } catch {
      return errorXml('badResumptionToken', 'Token de reanudación inválido.');
    }
  }

  const { count, rows } = await Trabajo.findAndCountAll({
    where,
    include: [{ model: Categoria, as: 'categoria', attributes: ['nombre'] }],
    order: [['updatedAt', 'DESC']],
    offset,
    limit: MAX_PER_PAGE + 1
  });

  if (count === 0) return errorXml('noRecordsMatch', 'No se encontraron registros.');

  const hasMore = rows.length > MAX_PER_PAGE;
  if (hasMore) rows.pop();

  let xml = baseXml(verb);
  xml += `  <${verb}>\n`;

  for (const t of rows) {
    if (includeMetadata) {
      xml += buildRecord(t, identifierPrefix);
    } else {
      const { xml: header } = buildHeader(t, identifierPrefix);
      xml += `    <record>\n${header}    </record>\n`;
    }
  }

  if (hasMore) {
    const nextOffset = offset + MAX_PER_PAGE;
    const nextCursor = cursor + rows.length;
    const token = Buffer.from(`${nextOffset}:${nextCursor}`).toString('base64');
    xml += `    <resumptionToken completeListSize="${count}" cursor="${cursor}">${escXml(token)}</resumptionToken>\n`;
  } else {
    xml += `    <resumptionToken completeListSize="${count}" cursor="${cursor}" />\n`;
  }

  xml += `  </${verb}>\n`;
  xml += closeXml();
  return xml;
}

module.exports = {
  errorXml,
  identify,
  listMetadataFormats,
  listSets,
  getRecord,
  listIdentifiers,
  listRecords
};
