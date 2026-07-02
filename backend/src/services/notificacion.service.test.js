jest.mock('../models', () => ({
  Notificacion: {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  Trabajo: {},
}))

const { Notificacion } = require('../models')
const notificacionService = require('./notificacion.service')

describe('NotificacionService', () => {
  beforeEach(() => { jest.clearAllMocks() })

  describe('crear', () => {
    it('creates a notification', async () => {
      Notificacion.create.mockResolvedValue({ id: 'n1', usuario_id: 'u1', tipo: 'publicado', mensaje: 'Test', trabajo_id: 't1' })
      const result = await notificacionService.crear('u1', 'publicado', 'Test', 't1')
      expect(result.id).toBe('n1')
      expect(Notificacion.create).toHaveBeenCalledWith({ usuario_id: 'u1', tipo: 'publicado', mensaje: 'Test', trabajo_id: 't1' })
    })
  })

  describe('listarPorUsuario', () => {
    it('returns paginated notifications', async () => {
      Notificacion.findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 'n1' }] })
      const result = await notificacionService.listarPorUsuario('u1')
      expect(result.total).toBe(1)
    })
  })

  describe('marcarLeida', () => {
    it('throws 404 if not found', async () => {
      Notificacion.findOne.mockResolvedValue(null)
      await expect(notificacionService.marcarLeida('n1', 'u1')).rejects.toThrow('Notificación no encontrada')
    })

    it('marks as read', async () => {
      const save = jest.fn()
      Notificacion.findOne.mockResolvedValue({ id: 'n1', leida: false, save })
      await notificacionService.marcarLeida('n1', 'u1')
      expect(save).toHaveBeenCalled()
    })
  })

  describe('marcarTodasLeidas', () => {
    it('updates all unread', async () => {
      Notificacion.update.mockResolvedValue([1])
      await notificacionService.marcarTodasLeidas('u1')
      expect(Notificacion.update).toHaveBeenCalledWith({ leida: true }, { where: { usuario_id: 'u1', leida: false } })
    })
  })

  describe('contarNoLeidas', () => {
    it('returns count', async () => {
      Notificacion.count.mockResolvedValue(3)
      const result = await notificacionService.contarNoLeidas('u1')
      expect(result).toBe(3)
    })
  })
})
