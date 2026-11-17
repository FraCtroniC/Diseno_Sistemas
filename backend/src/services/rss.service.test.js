jest.mock('../models', () => ({
  Trabajo: { findAll: jest.fn() },
  Categoria: { name: 'Categoria' },
}))

jest.mock('../../config/environment', () => ({
  feedSiteUrl: 'https://repositorio.unefa.edu.ve/',
}))

const { Trabajo, Categoria } = require('../models')
const { rssFeed, atomFeed } = require('./rss.service')

const BASE = 'https://repositorio.unefa.edu.ve'

const trabajos = [
  {
    id: 'abc-123',
    titulo: 'Estudio & análisis <impacto>',
    resumen: 'Resumen con & y <tags>',
    autor: 'Ana Pérez',
    createdAt: new Date('2026-11-10T12:00:00.000Z'),
    updatedAt: new Date('2026-11-11T12:00:00.000Z'),
    categoria: { nombre: 'Ingeniería' },
  },
  {
    id: 'def-456',
    titulo: 'Sin categoría',
    resumen: null,
    autor: 'Luis Gómez',
    createdAt: new Date('2026-11-01T08:30:00.000Z'),
    updatedAt: new Date('2026-11-02T08:30:00.000Z'),
    categoria: null,
  },
]

describe('rss.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Trabajo.findAll.mockResolvedValue(trabajos)
  })

  describe('consulta', () => {
    it('solo pide trabajos publicados, ordenados por fecha y limitados a 50', async () => {
      await rssFeed()

      expect(Trabajo.findAll).toHaveBeenCalledWith({
        where: { estado: 'publicado' },
        include: [{ model: Categoria, as: 'categoria', attributes: ['nombre'] }],
        order: [['createdAt', 'DESC']],
        limit: 50,
      })
    })
  })

  describe('rssFeed', () => {
    it('genera XML RSS 2.0 con enlaces públicos normalizados', async () => {
      const xml = await rssFeed()

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">')
      expect(xml).toContain(`<link>${BASE}</link>`)
      expect(xml).not.toContain(`${BASE}//`)
      expect(xml).toContain(`<atom:link href="${BASE}/feed/rss" rel="self" type="application/rss+xml"/>`)
      expect(xml).toContain(`<link>${BASE}/trabajos/abc-123</link>`)
      expect(xml).toContain(`<guid isPermaLink="true">${BASE}/trabajos/abc-123</guid>`)
      expect(xml).toContain('<pubDate>Tue, 10 Nov 2026 12:00:00 GMT</pubDate>')
      expect(xml).toContain('<category>Ingeniería</category>')
      expect(xml).toContain('<category>General</category>')
      expect(xml).toContain('<description>Sin resumen</description>')
    })

    it('escapa los caracteres reservados del XML', async () => {
      const xml = await rssFeed()

      expect(xml).toContain('<title>Estudio &amp; análisis &lt;impacto&gt;</title>')
      expect(xml).toContain('<description>Resumen con &amp; y &lt;tags&gt;</description>')
      expect(xml).not.toContain('Estudio & análisis')
    })

    it('devuelve un canal válido aunque no haya publicaciones', async () => {
      Trabajo.findAll.mockResolvedValueOnce([])

      const xml = await rssFeed()

      expect(xml).toContain('<channel>')
      expect(xml).not.toContain('<item>')
    })
  })

  describe('atomFeed', () => {
    it('genera XML Atom con entradas, fechas y categorías', async () => {
      const xml = await atomFeed()

      expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">')
      expect(xml).toContain(`<link rel="self" href="${BASE}/feed/atom" type="application/atom+xml"/>`)
      expect(xml).toContain(`<id>${BASE}/trabajos/abc-123</id>`)
      expect(xml).toContain('<updated>2026-11-10T12:00:00.000Z</updated>')
      expect(xml).toContain('<updated>2026-11-11T12:00:00.000Z</updated>')
      expect(xml).toContain('<published>2026-11-10T12:00:00.000Z</published>')
      expect(xml).toContain('<summary type="html">Resumen con &amp; y &lt;tags&gt;</summary>')
      expect(xml).toContain('<category term="Ingeniería"/>')
      expect(xml).toContain('<author><name>Ana Pérez</name></author>')
    })

    it('devuelve un feed válido aunque no haya publicaciones', async () => {
      Trabajo.findAll.mockResolvedValueOnce([])

      const xml = await atomFeed()

      expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">')
      expect(xml).not.toContain('<entry>')
    })
  })
})
