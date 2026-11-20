import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Catalog from '../pages/Catalog'
import type { DocumentItem, NivelAcademico } from '../types'

const mapToDocumentItems = vi.fn<() => DocumentItem[]>()
const fetchTrabajos = vi.fn().mockResolvedValue(undefined)

vi.mock('../stores/useTrabajoStore', () => ({
  useTrabajoStore: () => ({ mapToDocumentItems, fetchTrabajos, loading: false }),
}))

const maestria: NivelAcademico = {
  id: 'n2', nombre: 'Maestría', slug: 'maestria', grupo: 'postgrado', orden: 2,
}
const doctorado: NivelAcademico = {
  id: 'n3', nombre: 'Doctorado', slug: 'doctorado', grupo: 'postgrado', orden: 3,
}

const documentos: DocumentItem[] = [
  {
    id: '1', title: 'Tesis de recursos humanos', authors: ['Ana Pérez'], year: 2025,
    abstract: 'Resumen', status: 'published', 
    tipoDocumento: 'postgrado', carrera: 'Maestría en Recursos Humanos',
    carreraSlug: 'maestria-en-recursos-humanos', nivel: maestria,
  },
  {
    id: '2', title: 'Tesis doctoral en gerencia', authors: ['Luis Gómez'], year: 2024,
    abstract: 'Resumen', status: 'published', 
    tipoDocumento: 'postgrado', carrera: 'Doctorado en Ciencias Gerenciales',
    carreraSlug: 'doctorado-en-ciencias-gerenciales', nivel: doctorado,
  },
  {
    id: '3', title: 'Trabajo de grado', authors: ['Sara Díaz'], year: 2023,
    abstract: 'Resumen', status: 'published', 
    tipoDocumento: 'pregrado', carrera: 'Ingeniería de Sistemas',
    carreraSlug: 'ingenieria-de-sistemas',
  },
]

/** El título aparece en la tarjeta y en el panel "Destacado". */
function cuentaTitulo(titulo: string): number {
  return screen.queryAllByText(titulo).length
}

function renderCatalog(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/catalogo/:category" element={<Catalog />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Catálogo de posgrado', () => {
  beforeEach(() => {
    mapToDocumentItems.mockReturnValue(documentos)
  })

  it('muestra maestrías y doctorados en /catalogo/postgrado', () => {
    renderCatalog('/catalogo/postgrado')

    expect(cuentaTitulo('Tesis de recursos humanos')).toBeGreaterThan(0)
    expect(cuentaTitulo('Tesis doctoral en gerencia')).toBeGreaterThan(0)
    expect(cuentaTitulo('Trabajo de grado')).toBe(0)
  })

  it('filtra solo maestrías en la ruta dedicada', () => {
    renderCatalog('/catalogo/maestrias')

    expect(cuentaTitulo('Tesis de recursos humanos')).toBeGreaterThan(0)
    expect(cuentaTitulo('Tesis doctoral en gerencia')).toBe(0)
  })

  it('filtra solo doctorados en la ruta dedicada', () => {
    renderCatalog('/catalogo/doctorados')

    expect(cuentaTitulo('Tesis doctoral en gerencia')).toBeGreaterThan(0)
    expect(cuentaTitulo('Tesis de recursos humanos')).toBe(0)
  })

  it('filtra por programa con el parámetro ?programa=', () => {
    renderCatalog('/catalogo/maestrias?programa=maestria-en-recursos-humanos')

    expect(cuentaTitulo('Tesis de recursos humanos')).toBeGreaterThan(0)
    expect(cuentaTitulo('Tesis doctoral en gerencia')).toBe(0)
  })
})
