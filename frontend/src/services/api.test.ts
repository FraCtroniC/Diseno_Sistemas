import { describe, expect, it } from 'vitest'
import { AxiosHeaders } from 'axios'
import api from './api'

/**
 * Regresión: el cliente no debe forzar `Content-Type: application/json` global,
 * porque axios convierte el FormData a JSON y el archivo se pierde ("archivo": {}).
 * Con la configuración correcta, el FormData se conserva (multipart) y los
 * objetos planos siguen enviándose como JSON.
 */
describe('api (cliente axios)', () => {
  const transformRequest = api.defaults.transformRequest
  const transform = (Array.isArray(transformRequest) ? transformRequest[0] : transformRequest) as unknown as
    (data: unknown, headers: AxiosHeaders) => unknown

  it('conserva el FormData para que el navegador envíe multipart con el archivo', () => {
    const headers = new AxiosHeaders()
    const formData = new FormData()
    formData.append('titulo', 'Título de prueba')
    formData.append('archivo', new Blob(['%PDF-1.4'], { type: 'application/pdf' }), 'trabajo.pdf')

    const result = transform(formData, headers)

    expect(result).toBe(formData)
    expect(headers.getContentType()).toBeUndefined()
  })

  it('envía los objetos planos como JSON', () => {
    const headers = new AxiosHeaders()

    const result = transform({ titulo: 'Título de prueba' }, headers)

    expect(result).toBe(JSON.stringify({ titulo: 'Título de prueba' }))
    expect(headers.getContentType()).toBe('application/json')
  })
})
