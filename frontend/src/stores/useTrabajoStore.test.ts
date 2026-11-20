import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useTrabajoStore } from './useTrabajoStore'
import { trabajoService } from '../services/trabajoService'

vi.mock('../services/trabajoService', () => ({
  trabajoService: { listar: vi.fn() },
}))

/**
 * Regresión: cuando `GET /trabajos` fallaba, el store dejaba la lista vacía en
 * silencio y la app mostraba "0 resultados" como si no hubiera publicaciones.
 * Ahora el fallo se expone como `error` para que la UI pueda mostrarlo.
 */
describe('useTrabajoStore', () => {
  beforeEach(() => {
    useTrabajoStore.setState({ trabajos: [], loading: false, total: 0, error: null })
    vi.mocked(trabajoService.listar).mockReset()
  })

  it('expone un error cuando la carga falla', async () => {
    vi.mocked(trabajoService.listar).mockRejectedValue(new Error('500'))

    await useTrabajoStore.getState().fetchTrabajos()

    const { error, loading, total } = useTrabajoStore.getState()
    expect(error).toBe('No se pudo cargar el catálogo de trabajos.')
    expect(loading).toBe(false)
    expect(total).toBe(0)
  })

  it('limpia el error tras una carga exitosa', async () => {
    useTrabajoStore.setState({ error: 'No se pudo cargar el catálogo de trabajos.' })
    vi.mocked(trabajoService.listar).mockResolvedValue({
      data: { datos: [], total: 0 },
    } as never)

    await useTrabajoStore.getState().fetchTrabajos()

    expect(useTrabajoStore.getState().error).toBeNull()
  })

  it('limpia un error previo antes de reintentar', async () => {
    useTrabajoStore.setState({ error: 'No se pudo cargar el catálogo de trabajos.' })
    vi.mocked(trabajoService.listar).mockResolvedValue({
      data: { datos: [], total: 0 },
    } as never)

    const promesa = useTrabajoStore.getState().fetchTrabajos()

    expect(useTrabajoStore.getState().error).toBeNull()
    await promesa
  })
})
