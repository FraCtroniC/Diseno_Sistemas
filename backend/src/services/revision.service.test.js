jest.mock('../models', () => ({
  Trabajo: { findByPk: jest.fn(), count: jest.fn(), findAndCountAll: jest.fn() },
  Revision: { create: jest.fn(), findAll: jest.fn() },
  Usuario: { findAll: jest.fn() },
  Categoria: {},
}))

const mockCrearYNotificar = jest.fn()

jest.mock('./notificacion.service', () => ({
  crearYNotificar: mockCrearYNotificar,
}))

const { Trabajo, Revision, Usuario } = require('../models')
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
      await expect(revisionService.cambiarEstado('t1', 'borrador', null, { rol: 'bibliotecario', id: 'u1' })).rejects.toThrow('comentario')
    })

    it('allows a bibliotecario to publish a work in review', async () => {
      const save = jest.fn()
      Trabajo.findByPk.mockResolvedValue({ id: 't1', estado: 'en_revision', titulo: 'Test', anio: 2026, usuario_id: 'u1', identificador: 'X', save })
      Revision.create.mockResolvedValue({})
      await revisionService.cambiarEstado('t1', 'publicado', null, { rol: 'bibliotecario', id: 'u2' })
      expect(save).toHaveBeenCalled()
    })

    it('does not allow a repositor to publish a work in review', async () => {
      Trabajo.findByPk.mockResolvedValue({ id: 't1', estado: 'en_revision', titulo: 'Test', usuario_id: 'u1', save: jest.fn() })
      await expect(revisionService.cambiarEstado('t1', 'publicado', null, { rol: 'repositor', id: 'u2' })).rejects.toThrow('No puedes cambiar')
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
      Trabajo.findByPk.mockResolvedValue({ id: 't1', estado: 'borrador', titulo: 'Test', anio: 2026, usuario_id: 'u1', identificador: 'X', save })
      Revision.create.mockResolvedValue({})
      await revisionService.cambiarEstado('t1', 'publicado', null, { rol: 'admin', id: 'u1' })
      expect(mockCrearYNotificar).toHaveBeenCalledWith('u1', 'publicado', expect.any(String), 't1')
    })

    it('notifies admins and bibliotecarios on en_revision', async () => {
      const save = jest.fn()
      Trabajo.findByPk.mockResolvedValue({ id: 't1', estado: 'borrador', titulo: 'Test', usuario_id: 'u1', save })
      Usuario.findAll.mockResolvedValue([{ id: 'r1' }, { id: 'r2' }])
      Revision.create.mockResolvedValue({})
      await revisionService.cambiarEstado('t1', 'en_revision', null, { rol: 'bibliotecario', id: 'u1' })
      expect(Usuario.findAll).toHaveBeenCalledWith({
        where: { rol: ['admin', 'bibliotecario'], activo: true }
      })
      expect(mockCrearYNotificar).toHaveBeenCalledTimes(2)
      expect(mockCrearYNotificar).toHaveBeenCalledWith('r1', 'pendiente_revision', expect.any(String), 't1')
      expect(mockCrearYNotificar).toHaveBeenCalledWith('r2', 'pendiente_revision', expect.any(String), 't1')
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
      expect(Trabajo.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { estado: 'en_revision' }
      }))
    })

    it('returns borradores when requested', async () => {
      Trabajo.findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 't1' }] })
      const result = await revisionService.listarPendientes('borrador')
      expect(result.total).toBe(1)
      expect(Trabajo.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { estado: 'borrador' }
      }))
    })

    it('rejects an invalid estado', async () => {
      await expect(revisionService.listarPendientes('publicado')).rejects.toThrow('Estado de cola no válido')
    })
  })
})
