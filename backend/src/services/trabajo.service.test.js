jest.mock('../models', () => ({
  Trabajo: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Categoria: {
    findByPk: jest.fn(),
  },
  Usuario: {},
  sequelize: {
    escape: jest.fn((value) => `'${String(value).replace(/'/g, "''")}'`),
  },
}))

jest.mock('../validators/metadatos.schema', () => ({
  validarMetadatos: jest.fn((m) => m),
}))

const mockCrearYNotificar = jest.fn()

jest.mock('./notificacion.service', () => ({
  crearYNotificar: mockCrearYNotificar,
}))

const { Trabajo, Categoria } = require('../models')
const trabajoService = require('./trabajo.service')

describe('TrabajoService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('listar', () => {
    it('returns paginated results', async () => {
      Trabajo.findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 't1', titulo: 'Test' }] })

      const result = await trabajoService.listar({ pagina: 1, limite: 10 })

      expect(result.total).toBe(1)
      expect(result.datos).toHaveLength(1)
      expect(result.totalPaginas).toBe(1)
    })

    it('filters by estado', async () => {
      Trabajo.findAndCountAll.mockResolvedValue({ count: 0, rows: [] })

      await trabajoService.listar({ estado: 'publicado' })

      expect(Trabajo.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ estado: 'publicado' }),
        })
      )
    })

    it('forces published state for anonymous requests', async () => {
      Trabajo.findAndCountAll.mockResolvedValue({ count: 0, rows: [] })

      await trabajoService.listar({})

      expect(Trabajo.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ estado: 'publicado' }),
        })
      )
    })

    it('rejects anonymous requests for non-published states', async () => {
      await expect(trabajoService.listar({ estado: 'borrador' })).rejects.toThrow('No tienes permiso')
    })

    it('limits repositor results to their own drafts', async () => {
      Trabajo.findAndCountAll.mockResolvedValue({ count: 0, rows: [] })

      await trabajoService.listar({
        estado: 'borrador',
        solicitante: { id: 'u1', rol: 'repositor' }
      })

      expect(Trabajo.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ estado: 'borrador', usuario_id: 'u1' }),
        })
      )
    })

    it('allows admin to filter by any state and user', async () => {
      Trabajo.findAndCountAll.mockResolvedValue({ count: 0, rows: [] })

      await trabajoService.listar({
        estado: 'borrador',
        usuario_id: 'u2',
        solicitante: { id: 'admin1', rol: 'admin' }
      })

      expect(Trabajo.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ estado: 'borrador', usuario_id: 'u2' }),
        })
      )
    })

    it('caps the page size at 100', async () => {
      Trabajo.findAndCountAll.mockResolvedValue({ count: 0, rows: [] })

      const result = await trabajoService.listar({ limite: 999 })

      expect(result.limite).toBe(100)
      expect(Trabajo.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      )
    })
  })

  describe('obtenerPorId', () => {
    it('throws 404 if not found', async () => {
      Trabajo.findByPk.mockResolvedValue(null)

      await expect(trabajoService.obtenerPorId('nonexistent')).rejects.toThrow('Trabajo no encontrado')
    })

    it('returns trabajo when found and published', async () => {
      Trabajo.findByPk.mockResolvedValue({ id: 't1', titulo: 'Test', estado: 'publicado' })

      const result = await trabajoService.obtenerPorId('t1')

      expect(result.id).toBe('t1')
    })

    it('hides drafts from anonymous users', async () => {
      Trabajo.findByPk.mockResolvedValue({ id: 't1', titulo: 'Test', estado: 'borrador', usuario_id: 'u1' })

      await expect(trabajoService.obtenerPorId('t1')).rejects.toThrow('Trabajo no encontrado')
    })

    it('allows the owner to see their own draft', async () => {
      Trabajo.findByPk.mockResolvedValue({ id: 't1', titulo: 'Test', estado: 'borrador', usuario_id: 'u1' })

      const result = await trabajoService.obtenerPorId('t1', { id: 'u1', rol: 'repositor' })

      expect(result.id).toBe('t1')
    })

    it('hides another author draft from a repositor', async () => {
      Trabajo.findByPk.mockResolvedValue({ id: 't1', titulo: 'Test', estado: 'borrador', usuario_id: 'u1' })

      await expect(
        trabajoService.obtenerPorId('t1', { id: 'u2', rol: 'repositor' })
      ).rejects.toThrow('Trabajo no encontrado')
    })

    it('allows admin to see any draft', async () => {
      Trabajo.findByPk.mockResolvedValue({ id: 't1', titulo: 'Test', estado: 'borrador', usuario_id: 'u1' })

      const result = await trabajoService.obtenerPorId('t1', { id: 'admin1', rol: 'admin' })

      expect(result.id).toBe('t1')
    })
  })

  describe('crear', () => {
    it('throws 404 if categoria not found', async () => {
      Categoria.findByPk.mockResolvedValue(null)

      await expect(
        trabajoService.crear({ titulo: 'Test', categoria_id: 'cat1', autor: 'Author', anio: 2024 }, 'u1')
      ).rejects.toThrow('Categoría no encontrada')
    })

    it('creates trabajo successfully', async () => {
      Categoria.findByPk.mockResolvedValue({ id: 'cat1' })
      Trabajo.create.mockResolvedValue({ id: 't1', titulo: 'Test' })

      const result = await trabajoService.crear(
        { titulo: 'Test', categoria_id: 'cat1', autor: 'Author', anio: 2024 },
        'u1'
      )

      expect(result.id).toBe('t1')
      expect(Trabajo.create).toHaveBeenCalledWith(
        expect.objectContaining({ usuario_id: 'u1', titulo: 'Test' })
      )
    })

    it('blocks non-admin roles from creating published works', async () => {
      Categoria.findByPk.mockResolvedValue({ id: 'cat1' })

      await expect(
        trabajoService.crear(
          { titulo: 'Test', categoria_id: 'cat1', autor: 'Author', anio: 2024, estado: 'publicado' },
          'u1', null, null, 'repositor'
        )
      ).rejects.toThrow('Solo los administradores')
    })

    it('notifies the author when created as published', async () => {
      Categoria.findByPk.mockResolvedValue({ id: 'cat1' })
      Trabajo.create.mockResolvedValue({ id: 't1', titulo: 'Test', usuario_id: 'u1', estado: 'publicado' })
      mockCrearYNotificar.mockResolvedValue(1)

      await trabajoService.crear(
        { titulo: 'Test', categoria_id: 'cat1', autor: 'Author', anio: 2024, estado: 'publicado' },
        'u1', null, null, 'admin'
      )

      expect(mockCrearYNotificar).toHaveBeenCalledWith('u1', 'publicado', expect.any(String), 't1')
    })
  })

  describe('actualizar', () => {
    it('throws 404 if trabajo not found', async () => {
      Trabajo.findByPk.mockResolvedValue(null)

      await expect(trabajoService.actualizar('nonexistent', {})).rejects.toThrow('Trabajo no encontrado')
    })

    it('validates categoria if provided', async () => {
      Trabajo.findByPk.mockResolvedValue({ id: 't1', update: jest.fn() })
      Categoria.findByPk.mockResolvedValue(null)

      await expect(
        trabajoService.actualizar('t1', { categoria_id: 'bad-cat' })
      ).rejects.toThrow('Categoría no encontrada')
    })

    it('blocks non-admin roles from changing estado directly', async () => {
      Trabajo.findByPk.mockResolvedValue({ id: 't1', usuario_id: 'u1', update: jest.fn() })

      await expect(
        trabajoService.actualizar('t1', { estado: 'publicado' }, 'u1', null, null, 'repositor')
      ).rejects.toThrow('No puedes cambiar el estado')
    })

    it('blocks a repositor from editing another author work', async () => {
      Trabajo.findByPk.mockResolvedValue({ id: 't1', usuario_id: 'u1', update: jest.fn() })

      await expect(
        trabajoService.actualizar('t1', { titulo: 'Cambiado' }, 'u2', null, null, 'repositor')
      ).rejects.toThrow('No tienes permiso para modificar este trabajo')
    })

    it('notifies the author when an admin publishes via update', async () => {
      const mockTrabajo = {
        id: 't1',
        titulo: 'Test',
        usuario_id: 'autor1',
        estado: 'borrador',
        update: jest.fn(function (data) { Object.assign(this, data) }),
      }
      Trabajo.findByPk.mockResolvedValue(mockTrabajo)
      mockCrearYNotificar.mockResolvedValue(1)

      await trabajoService.actualizar('t1', { estado: 'publicado' }, 'u1', null, null, 'admin')

      expect(mockCrearYNotificar).toHaveBeenCalledWith('autor1', 'publicado', expect.any(String), 't1')
    })
  })

  describe('eliminar', () => {
    it('throws 404 if not found', async () => {
      Trabajo.findByPk.mockResolvedValue(null)

      await expect(trabajoService.eliminar('nonexistent')).rejects.toThrow('Trabajo no encontrado')
    })

    it('destroys trabajo when the owner requests it', async () => {
      const mockTrabajo = { id: 't1', usuario_id: 'u1', destroy: jest.fn() }
      Trabajo.findByPk.mockResolvedValue(mockTrabajo)

      await trabajoService.eliminar('t1', 'u1', 'repositor')

      expect(mockTrabajo.destroy).toHaveBeenCalled()
    })

    it('blocks a repositor from deleting another author work', async () => {
      const mockTrabajo = { id: 't1', usuario_id: 'u1', destroy: jest.fn() }
      Trabajo.findByPk.mockResolvedValue(mockTrabajo)

      await expect(
        trabajoService.eliminar('t1', 'u2', 'repositor')
      ).rejects.toThrow('No tienes permiso para eliminar este trabajo')
      expect(mockTrabajo.destroy).not.toHaveBeenCalled()
    })

    it('allows admin to delete any work', async () => {
      const mockTrabajo = { id: 't1', usuario_id: 'u1', destroy: jest.fn() }
      Trabajo.findByPk.mockResolvedValue(mockTrabajo)

      await trabajoService.eliminar('t1', 'admin1', 'admin')

      expect(mockTrabajo.destroy).toHaveBeenCalled()
    })
  })

  describe('cambiarEstado', () => {
    it('updates estado and saves', async () => {
      const mockTrabajo = { id: 't1', estado: 'borrador', save: jest.fn() }
      Trabajo.findByPk.mockResolvedValue(mockTrabajo)

      const result = await trabajoService.cambiarEstado('t1', 'publicado')

      expect(result.estado).toBe('publicado')
      expect(mockTrabajo.save).toHaveBeenCalled()
    })
  })

  describe('buscar', () => {
    it('returns paginated search results', async () => {
      Trabajo.findAndCountAll.mockResolvedValue({ count: 2, rows: [{ id: 't1' }, { id: 't2' }] })

      const result = await trabajoService.buscar({ q: 'test', pagina: 1, limite: 10 })

      expect(result.total).toBe(2)
      expect(result.datos).toHaveLength(2)
    })

    it('filters by categoria, anio, estado', async () => {
      Trabajo.findAndCountAll.mockResolvedValue({ count: 0, rows: [] })

      await trabajoService.buscar({ categoria: 'cat1', anio: 2024, estado: 'publicado' })

      expect(Trabajo.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoria_id: 'cat1',
            anio: 2024,
            estado: 'publicado',
          }),
        })
      )
    })

    it('forces published state for anonymous searches', async () => {
      Trabajo.findAndCountAll.mockResolvedValue({ count: 0, rows: [] })

      await trabajoService.buscar({ q: 'sistema' })

      expect(Trabajo.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ estado: 'publicado' }),
        })
      )
    })

    it('rejects anonymous searches for drafts', async () => {
      await expect(
        trabajoService.buscar({ estado: 'borrador' })
      ).rejects.toThrow('No tienes permiso')
    })

    it('escapes the search term instead of interpolating it', async () => {
      Trabajo.findAndCountAll.mockResolvedValue({ count: 0, rows: [] })
      const { sequelize } = require('../models')

      await trabajoService.buscar({ q: "' OR 1=1 --" })

      expect(sequelize.escape).toHaveBeenCalledWith("' OR 1=1 --")
    })

    it('caps search results at 100', async () => {
      Trabajo.findAndCountAll.mockResolvedValue({ count: 0, rows: [] })

      const result = await trabajoService.buscar({ limite: 999 })

      expect(result.limite).toBe(100)
      expect(Trabajo.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      )
    })
  })
})
