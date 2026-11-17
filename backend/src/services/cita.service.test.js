jest.mock('../models', () => ({
  Trabajo: { findByPk: jest.fn() },
  Categoria: { name: 'Categoria' },
  Usuario: {},
}))

jest.mock('../../config/environment', () => ({
  feedSiteUrl: 'https://repositorio.unefa.edu.ve/',
}))

const { Trabajo } = require('../models')
const citaService = require('./cita.service')

const BASE = 'https://repositorio.unefa.edu.ve'

const trabajoBase = {
  id: 't1',
  titulo: 'Trabajo de prueba',
  autor: 'Ana Pérez',
  anio: 2026,
  metadatos: {},
}

async function generar(archivo_url, formato = 'apa') {
  Trabajo.findByPk.mockResolvedValueOnce({ ...trabajoBase, archivo_url })
  return (await citaService.generar('t1', formato)).contenido
}

describe('cita.service', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('no pega la base a una URL absoluta de Cloudinary en APA', async () => {
    const url = 'https://res.cloudinary.com/demo/raw/upload/v1/trabajos/t.pdf'

    const cita = await generar(url)

    expect(cita).toContain(url)
    expect(cita).not.toContain(`${BASE}https:`)
  })

  it('conserva la URL absoluta del almacenamiento local en RIS', async () => {
    const url = 'http://localhost:5000/local-files/t.pdf'

    const ris = await generar(url, 'ris')

    expect(ris).toContain(`UR  - ${url}`)
    expect(ris).not.toContain(`${BASE}http:`)
  })

  it('agrega la base pública a rutas relativas con una sola barra', async () => {
    const apa = await generar('trabajos/t.pdf')
    const ris = await generar('/trabajos/t.pdf', 'ris')

    expect(apa).toContain(`${BASE}/trabajos/t.pdf`)
    expect(ris).toContain(`UR  - ${BASE}/trabajos/t.pdf`)
    expect(ris).not.toContain(`${BASE}//trabajos`)
  })

  it('conserva URLs relativas al protocolo', async () => {
    const url = '//cdn.ejemplo.com/t.pdf'

    expect(await generar(url)).toContain(url)
  })

  it('omite la URL cuando no hay archivo', async () => {
    const apa = await generar(null)
    const ris = await generar(null, 'ris')

    expect(apa).not.toContain('http')
    expect(ris).not.toContain('UR  -')
  })

  it('sigue generando BibTeX con el tipo derivado de los metadatos', async () => {
    Trabajo.findByPk.mockResolvedValueOnce({
      ...trabajoBase,
      archivo_url: 'https://res.cloudinary.com/demo/t.pdf',
      metadatos: { tipo_documento: 'tesis' },
    })

    const bib = (await citaService.generar('t1', 'bibtex')).contenido

    expect(bib).toContain('@phdthesis{')
  })
})
