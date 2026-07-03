jest.mock('../models', () => ({
  Trabajo: { findByPk: jest.fn(), count: jest.fn(), findAndCountAll: jest.fn() },
  Revision: { create: jest.fn(), findAll: jest.fn() },
  Usuario: { findAll: jest.fn() },
  Categoria: {},
}))

const mockCrear = jest.fn()
const mockContarNoLeidas = jest.fn()

jest.mock('./notificacion.service', () => ({
  crear: mockCrear,
  contarNoLeidas: mockContarNoLeidas,
}))

jest.mock('./sse.service', () => ({
  notifyUser: jest.fn(),
  addClient: jest.fn(),
}))

const { Trabajo, Revision, Usuario } = require('../models')
const { notifyUser } = require('./sse.service')
const revisionService = require('./revision.service')

describe('RevisionService', () => {
  beforeEach(() => { jest.clearAllMocks() })

  describe('cambiarEstado', () => {
    it('throws 404 if trabajo not found', async () => {
      Trabajo.findByPk.mockResolvedValue(null)
      await expect(revisionService.cambiarEstado('x', 'publicado', null, { rol: 'admin', id: 'u1' })).rejects.toThrow('Trabajo no encontrado')
    })

    it('throws 400 if already in that estado', async () => {
      Trabajo.findByPk.mockResolvedValue({ id: 't1', estado: 'publicado', titulo: 'Test', usuario_id: 'u1', save: jest.fn() })
      await expect(revisionService.cambiarEstado('t1', 'publicado', null, { rol: 'admin', id: 'u1' })).rejects.toThrow('ya está en estado')
    })

    it('throws 403 for invalid role transition', async () => {
      Trabajo.findByPk.mockResolvedValue({ id: 't1', estado: 'borrador', titulo: 'Test', usuario_id: 'u1', save: jest.fn() })
      await expect(revisionService.cambiarEstado('t1', 'publicado', null, { rol: 'bibliotecario', id: 'u1' })).rejects.toThrow('No puedes cambiar')
    })

    it('requires comment when rejecting', async () => {
      Trabajo.findByPk.mockResolvedValue({ id: 't1', estado: 'en_revision', titulo: 'Test', usuario_id: 'u1', save: jest.fn() })
      await expect(revisionService.cambiarEstado('t1', 'borrador', null, { rol: 'repositor', id: 'u1' })).rejects.toThrow('comentario')
    })

    it('generates identifier on publish', async () => {
      const save = jest.fn()
      Trabajo.findByPk.mockResolvedValue({ id: 't1', estado: 'borrador', titulo: 'Test', anio: 2026, usuario_id: 'u1', identificador: null, save })
      Trabajo.count.mockResolvedValue(5)
      Revision.create.mockResolvedValue({})
      await revisionService.cambiarEstado('t1', 'publicado', null, { rol: 'admin', id: 'u1' })
      expect(save).toHaveBeenCalled()
    })

    it('creates notification on publish', async () => {
      const save = jest.fn()
      mockContarNoLeidas.mockResolvedValue(1)
      Trabajo.findByPk.mockResolvedValue({ id: 't1', estado: 'borrador', titulo: 'Test', anio: 2026, usuario_id: 'u1', identificador: 'X', save })
      Revision.create.mockResolvedValue({})
      await revisionService.cambiarEstado('t1', 'publicado', null, { rol: 'admin', id: 'u1' })
      expect(mockCrear).toHaveBeenCalledWith('u1', 'publicado', expect.any(String), 't1')
      expect(mockContarNoLeidas).toHaveBeenCalledWith('u1')
      expect(notifyUser).toHaveBeenCalledWith('u1', { type: 'count', noLeidas: 1 })
    })

    it('notifies repositors on en_revision', async () => {
      const save = jest.fn()
      Trabajo.findByPk.mockResolvedValue({ id: 't1', estado: 'borrador', titulo: 'Test', usuario_id: 'u1', save })
      Usuario.findAll.mockResolvedValue([{ id: 'r1' }, { id: 'r2' }])
      Revision.create.mockResolvedValue({})
      mockCrear.mockResolvedValue({ usuario_id: 'r1' })
      mockContarNoLeidas.mockResolvedValue(1)
      await revisionService.cambiarEstado('t1', 'en_revision', null, { rol: 'bibliotecario', id: 'u1' })
      expect(mockCrear).toHaveBeenCalledTimes(2)
      expect(notifyUser).toHaveBeenCalled()
    })
  })

  describe('listarRevisiones', () => {
    it('returns revisiones ordered by createdAt DESC', async () => {
      Revision.findAll.mockResolvedValue([{ id: 'r1' }])
      const result = await revisionService.listarRevisiones('t1')
      expect(result).toHaveLength(1)
    })
  })

  describe('listarPendientes', () => {
    it('returns trabajos en_revision', async () => {
      Trabajo.findAndCountAll.mockResolvedValue({ count: 2, rows: [{ id: 't1' }, { id: 't2' }] })
      const result = await revisionService.listarPendientes()
      expect(result.total).toBe(2)
    })
  })
})
