import { describe, expect, it } from 'vitest'
import { MAX_PDF_SIZE_BYTES, MAX_PDF_SIZE_MB, validatePdfFile } from './pdfValidation'

function fakeFile(overrides: Partial<File> = {}): File {
  return { name: 'documento.pdf', type: 'application/pdf', size: 1024, ...overrides } as File
}

describe('validatePdfFile', () => {
  it('expone el límite de 10 MB', () => {
    expect(MAX_PDF_SIZE_MB).toBe(10)
    expect(MAX_PDF_SIZE_BYTES).toBe(10 * 1024 * 1024)
  })

  it('acepta un PDF dentro del límite', () => {
    expect(validatePdfFile(fakeFile())).toBeUndefined()
  })

  it('acepta un PDF de exactamente 10 MB', () => {
    expect(validatePdfFile(fakeFile({ size: MAX_PDF_SIZE_BYTES }))).toBeUndefined()
  })

  it('rechaza un archivo que no es PDF', () => {
    expect(validatePdfFile(fakeFile({ type: 'image/png' }))).toBe('El archivo debe ser un PDF.')
  })

  it('rechaza un PDF que supera los 10 MB', () => {
    expect(validatePdfFile(fakeFile({ size: MAX_PDF_SIZE_BYTES + 1 }))).toBe(
      'El archivo PDF no puede superar los 10 MB.',
    )
  })

  it('no valida cuando no hay archivo', () => {
    expect(validatePdfFile(null)).toBeUndefined()
    expect(validatePdfFile(undefined)).toBeUndefined()
  })
})
