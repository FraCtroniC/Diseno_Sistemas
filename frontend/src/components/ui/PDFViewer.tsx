import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

interface PDFViewerProps {
  url: string
  filename?: string
}

export default function PDFViewer({ url, filename }: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  function onLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setLoading(false)
  }

  function onLoadError() {
    setLoading(false)
    setError(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="text-sm font-medium text-slate-600">
            Pág. {pageNumber} de {numPages}
          </span>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={scale <= 0.5}
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-[3rem] text-center text-sm font-medium text-slate-600">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            disabled={scale >= 2.5}
            onClick={() => setScale((s) => Math.min(2.5, s + 0.25))}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            +
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-unefa px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
          >
            Descargar
          </a>
        </div>
      </div>

      <div className="flex justify-center rounded-xl border border-slate-200 bg-slate-50 p-4">
        {loading ? (
          <div className="flex h-96 items-center justify-center text-sm text-slate-500">
            Cargando PDF...
          </div>
        ) : error ? (
          <div className="flex h-96 items-center justify-center text-sm text-rose-600">
            No se pudo cargar el PDF.{' '}
            <a href={url} target="_blank" rel="noopener noreferrer" className="ml-1 font-semibold underline">
              Descargar directamente
            </a>
          </div>
        ) : (
          <Document file={url} onLoadSuccess={onLoadSuccess} onLoadError={onLoadError}>
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-xl"
            />
          </Document>
        )}
      </div>
    </div>
  )
}
