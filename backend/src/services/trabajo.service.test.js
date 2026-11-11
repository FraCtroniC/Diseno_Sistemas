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
  })

  describe('obtenerPorId', () => {
    it('throws 404 if not found', async () => {
      Trabajo.findByPk.mockResolvedValue(null)

      await expect(trabajoService.obtenerPorId('nonexistent')).rejects.toThrow('Trabajo no encontrado')
    })

    it('returns trabajo when found', async () => {
      Trabajo.findByPk.mockResolvedValue({ id: 't1', titulo: 'Test' })

      const result = await trabajoService.obtenerPorId('t1')

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
      Trabajo.findByPk.mockResolvedValue({ id: 't1', update: jest.fn() })

      await expect(
        trabajoService.actualizar('t1', { estado: 'publicado' }, 'u1', null, null, 'repositor')
      ).rejects.toThrow('No puedes cambiar el estado')
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

    it('destroys trabajo', async () => {
      const mockTrabajo = { id: 't1', destroy: jest.fn() }
      Trabajo.findByPk.mockResolvedValue(mockTrabajo)

      await trabajoService.eliminar('t1')

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
  })
})
