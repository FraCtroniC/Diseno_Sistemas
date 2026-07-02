const { Trabajo, Categoria } = require('../models');
const { Op } = require('sequelize');

const SITE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const MAX_ITEMS = 50;

function escXml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function rssFeed() {
  const trabajos = await Trabajo.findAll({
    where: { estado: 'publicado' },
    include: [{ model: Categoria, as: 'categoria', attributes: ['nombre'] }],
    order: [['createdAt', 'DESC']],
    limit: MAX_ITEMS
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>UNEFA Táchira — Repositorio Digital</title>
    <link>${escXml(SITE_URL)}</link>
    <description>Últimas publicaciones del Repositorio Digital Núcleo Táchira</description>
    <language>es</language>
    <atom:link href="${escXml(SITE_URL)}/feed/rss" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;

  for (const t of trabajos) {
    const url = `${SITE_URL}/trabajos/${t.id}`;
    const cat = t.categoria ? t.categoria.nombre : 'General';
    xml += `    <item>
      <title>${escXml(t.titulo)}</title>
      <link>${escXml(url)}</link>
      <guid isPermaLink="true">${escXml(url)}</guid>
      <description>${escXml(t.resumen || 'Sin resumen')}</description>
      <author>${escXml(t.autor)}</author>
      <category>${escXml(cat)}</category>
      <pubDate>${new Date(t.createdAt).toUTCString()}</pubDate>
    </item>\n`;
  }

  xml += `  </channel>
</rss>`;
  return xml;
}

async function atomFeed() {
  const trabajos = await Trabajo.findAll({
    where: { estado: 'publicado' },
    include: [{ model: Categoria, as: 'categoria', attributes: ['nombre'] }],
    order: [['createdAt', 'DESC']],
    limit: MAX_ITEMS
  });

  const updated = trabajos.length > 0 ? new Date(trabajos[0].createdAt).toISOString() : new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>UNEFA Táchira — Repositorio Digital</title>
  <link href="${escXml(SITE_URL)}"/>
  <link rel="self" href="${escXml(SITE_URL)}/feed/atom" type="application/atom+xml"/>
  <updated>${updated}</updated>
  <id>${escXml(SITE_URL)}/</id>
  <author><name>UNEFA Táchira</name></author>\n`;

  for (const t of trabajos) {
    const url = `${SITE_URL}/trabajos/${t.id}`;
    const cat = t.categoria ? t.categoria.nombre : 'General';
    xml += `  <entry>
    <title>${escXml(t.titulo)}</title>
    <link href="${escXml(url)}"/>
    <id>${escXml(url)}</id>
    <updated>${new Date(t.updatedAt).toISOString()}</updated>
    <published>${new Date(t.createdAt).toISOString()}</published>
    <summary type="html">${escXml(t.resumen || 'Sin resumen')}</summary>
    <category term="${escXml(cat)}"/>
    <author><name>${escXml(t.autor)}</name></author>
  </entry>\n`;
  }

  xml += `</feed>`;
  return xml;
}

module.exports = { rssFeed, atomFeed };
