jest.mock('../models', () => ({
  Visita: {
    create: jest.fn(),
    count: jest.fn(),
  },
}))

const { Visita } = require('../models')
const estadisticaService = require('./estadistica.service')

describe('EstadisticaService', () => {
  beforeEach(() => { jest.clearAllMocks() })

  describe('registrar', () => {
    it('creates a visita', async () => {
      Visita.create.mockResolvedValue({ id: 'v1' })
      const result = await estadisticaService.registrar('t1', 'vista')
      expect(result.id).toBe('v1')
      expect(Visita.create).toHaveBeenCalledWith({ trabajo_id: 't1', tipo: 'vista' })
    })
  })

  describe('obtenerPorTrabajo', () => {
    it('returns view and download counts', async () => {
      Visita.count.mockResolvedValueOnce(10).mockResolvedValueOnce(3)
      const result = await estadisticaService.obtenerPorTrabajo('t1')
      expect(result).toEqual({ vistas: 10, descargas: 3 })
    })
  })
})
