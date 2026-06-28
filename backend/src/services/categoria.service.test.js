jest.mock('../models', () => ({
  Categoria: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Trabajo: {
    count: jest.fn(),
  },
}))

const { Categoria, Trabajo } = require('../models')
const categoriaService = require('./categoria.service')

describe('CategoriaService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('listar', () => {
    it('returns all categorias ordered by name', async () => {
      Categoria.findAll.mockResolvedValue([{ id: 'c1', nombre: 'Ingeniería' }])

      const result = await categoriaService.listar()

      expect(result).toHaveLength(1)
      expect(Categoria.findAll).toHaveBeenCalledWith({ order: [['nombre', 'ASC']] })
    })
  })

  describe('obtenerPorId', () => {
    it('throws 404 if not found', async () => {
      Categoria.findByPk.mockResolvedValue(null)

      await expect(categoriaService.obtenerPorId('nonexistent')).rejects.toThrow('Categoría no encontrada')
    })

    it('returns categoria when found', async () => {
      Categoria.findByPk.mockResolvedValue({ id: 'c1', nombre: 'Test' })

      const result = await categoriaService.obtenerPorId('c1')

      expect(result.nombre).toBe('Test')
    })
  })

  describe('obtenerPorSlug', () => {
    it('throws 404 if slug not found', async () => {
      Categoria.findOne.mockResolvedValue(null)

      await expect(categoriaService.obtenerPorSlug('nonexistent')).rejects.toThrow('Categoría no encontrada')
    })

    it('returns categoria when slug matches', async () => {
      Categoria.findOne.mockResolvedValue({ id: 'c1', slug: 'test' })

      const result = await categoriaService.obtenerPorSlug('test')

      expect(result.slug).toBe('test')
    })
  })

  describe('crear', () => {
    it('throws 400 if nombre or slug already exists', async () => {
      Categoria.findOne.mockResolvedValue({ id: 'existing' })

      await expect(
        categoriaService.crear({ nombre: 'Dup', slug: 'dup' })
      ).rejects.toThrow('Ya existe una categoría con ese nombre o slug')
    })

    it('creates categoria', async () => {
      Categoria.findOne.mockResolvedValue(null)
      Categoria.create.mockResolvedValue({ id: 'new', nombre: 'New', slug: 'new' })

      const result = await categoriaService.crear({ nombre: 'New', slug: 'new' })

      expect(result.id).toBe('new')
    })
  })

  describe('actualizar', () => {
    it('throws 404 if not found', async () => {
      Categoria.findByPk.mockResolvedValue(null)

      await expect(categoriaService.actualizar('nonexistent', {})).rejects.toThrow('Categoría no encontrada')
    })

    it('throws 400 if slug already taken', async () => {
      Categoria.findByPk.mockResolvedValue({ id: 'c1', slug: 'old-slug' })
      Categoria.findOne.mockResolvedValue({ id: 'c2', slug: 'taken' })

      await expect(
        categoriaService.actualizar('c1', { slug: 'taken' })
      ).rejects.toThrow('El slug ya está en uso')
    })

    it('updates categoria', async () => {
      const mockCat = { id: 'c1', slug: 'old', update: jest.fn() }
      Categoria.findByPk.mockResolvedValue(mockCat)
      Categoria.findOne.mockResolvedValue(null)

      await categoriaService.actualizar('c1', { nombre: 'Updated' })

      expect(mockCat.update).toHaveBeenCalledWith({ nombre: 'Updated' })
    })
  })

  describe('eliminar', () => {
    it('throws 404 if not found', async () => {
      Categoria.findByPk.mockResolvedValue(null)

      await expect(categoriaService.eliminar('nonexistent')).rejects.toThrow('Categoría no encontrada')
    })

    it('throws 409 if has associated trabajos', async () => {
      Categoria.findByPk.mockResolvedValue({ id: 'c1' })
      Trabajo.count.mockResolvedValue(5)

      await expect(categoriaService.eliminar('c1')).rejects.toThrow('tiene trabajos asociados')
    })

    it('destroys categoria if no trabajos', async () => {
      const mockCat = { id: 'c1', destroy: jest.fn() }
      Categoria.findByPk.mockResolvedValue(mockCat)
      Trabajo.count.mockResolvedValue(0)

      await categoriaService.eliminar('c1')

      expect(mockCat.destroy).toHaveBeenCalled()
    })
  })
})
