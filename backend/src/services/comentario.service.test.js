jest.mock('../models', () => ({
  Comentario: {
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  },
  Usuario: {},
}))

const { Comentario } = require('../models')
const comentarioService = require('./comentario.service')

describe('ComentarioService', () => {
  beforeEach(() => { jest.clearAllMocks() })

  describe('listar', () => {
    it('returns comments with average rating', async () => {
      Comentario.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: [
          { id: 'c1', calificacion: 5, usuario: { id: 'u1', nombre: 'A' } },
          { id: 'c2', calificacion: 3, usuario: { id: 'u2', nombre: 'B' } },
        ]
      })
      const result = await comentarioService.listar('t1')
      expect(result.total).toBe(2)
      expect(result.promedio).toBe(4)
    })

    it('returns 0 average when no ratings', async () => {
      Comentario.findAndCountAll.mockResolvedValue({ count: 0, rows: [] })
      const result = await comentarioService.listar('t1')
      expect(result.promedio).toBe(0)
    })
  })

  describe('crear', () => {
    it('throws if calificacion out of range', async () => {
      await expect(comentarioService.crear('t1', 'u1', 'Bueno', 6)).rejects.toThrow('1 y 5')
      await expect(comentarioService.crear('t1', 'u1', 'Bueno', 0)).rejects.toThrow('1 y 5')
    })

    it('creates comment', async () => {
      Comentario.create.mockResolvedValue({ id: 'c1', comentario: 'Buen trabajo', calificacion: 4 })
      const result = await comentarioService.crear('t1', 'u1', 'Buen trabajo', 4)
      expect(result.comentario).toBe('Buen trabajo')
    })

    it('creates comment without rating', async () => {
      Comentario.create.mockResolvedValue({ id: 'c2', comentario: 'Ok', calificacion: null })
      const result = await comentarioService.crear('t1', 'u1', 'Ok', null)
      expect(result.calificacion).toBeNull()
    })
  })
})
