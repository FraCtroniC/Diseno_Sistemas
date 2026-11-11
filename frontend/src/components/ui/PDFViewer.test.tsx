import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PDFViewer from './PDFViewer'

// El Document debe montarse siempre; si react-pdf no recibe el archivo nunca
// dispara onLoadSuccess y la vista previa queda bloqueada en "Cargando PDF...".
vi.mock('react-pdf', () => ({
  pdfjs: {
    version: '0.0.0-test',
    GlobalWorkerOptions: { workerSrc: '' },
  },
  Document: function MockDocument({
    file,
    loading,
    error,
    children,
  }: {
    file: string
    loading?: ReactNode
    error?: ReactNode
    children?: ReactNode
  }) {
    if (!file) return <div data-testid="pdf-error">{error}</div>
    return (
      <div data-testid="pdf-document" data-file={file}>
        <div data-testid="pdf-loading">{loading}</div>
        {children}
      </div>
    )
  },
  Page: function MockPage({ pageNumber }: { pageNumber: number }) {
    return <div data-testid="pdf-page">{`Página ${pageNumber}`}</div>
  },
}))

describe('PDFViewer', () => {
  const url = 'https://res.cloudinary.com/cjgcxzci/raw/upload/v1/trabajos/archivo.pdf'

  it('monta el Document con la URL aunque el PDF siga cargando', () => {
    render(<PDFViewer url={url} />)

    // Regresión: antes el Document solo se renderizaba cuando loading era false,
    // lo que impedía que onLoadSuccess nunca se disparara (bloqueo eterno).
    expect(screen.getByTestId('pdf-document')).toHaveAttribute('data-file', url)
    expect(screen.getByTestId('pdf-loading')).toHaveTextContent('Cargando PDF...')
  })

  it('renderiza la primera página del documento', () => {
    render(<PDFViewer url={url} />)

    expect(screen.getByTestId('pdf-page')).toHaveTextContent('Página 1')
  })

  it('ofrece descargar el archivo mientras carga', () => {
    render(<PDFViewer url={url} />)

    const enlace = screen.getByRole('link', { name: 'Descargar' })
    expect(enlace).toHaveAttribute('href', url)
    expect(enlace).toHaveAttribute('target', '_blank')
  })

  it('deshabilita la paginación mientras no haya páginas conocidas', () => {
    render(<PDFViewer url={url} />)

    expect(screen.getByRole('button', { name: /Anterior/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled()
  })
})
