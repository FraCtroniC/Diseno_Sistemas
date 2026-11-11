export const MAX_PDF_SIZE_MB = 10
export const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024

/** Valida tipo y tamaño de un PDF. Devuelve el mensaje de error o undefined si es válido. */
export function validatePdfFile(file: File | null | undefined): string | undefined {
  if (!file) return undefined
  if (file.type && file.type !== 'application/pdf') return 'El archivo debe ser un PDF.'
  if (file.size > MAX_PDF_SIZE_BYTES) {
    return `El archivo PDF no puede superar los ${MAX_PDF_SIZE_MB} MB.`
  }
  return undefined
}
