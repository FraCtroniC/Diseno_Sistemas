jest.mock('../models', () => ({
  Carrera: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  NivelAcademico: {},
  Trabajo: {
    count: jest.fn(),
  },
  Estudiante: {
    count: jest.fn(),
  },
}))

const { Carrera, Trabajo, Estudiante } = require('../models')
const { nivelIdPorSlug } = require('../../database/catalogo-academico')
const carreraService = require('./carrera.service')

describe('CarreraService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('listar', () => {
    it('returns all carreras ordered by name', async () => {
      Carrera.findAll.mockResolvedValue([{ id: 'c1', nombre: 'Ingeniería Civil' }])

      const result = await carreraService.listar()

      expect(result).toHaveLength(1)
      expect(Carrera.findAll).toHaveBeenCalledWith(expect.objectContaining({
        order: [['nombre', 'ASC']],
        include: expect.any(Array)
      }))
    })

    it('filters by nivel slug', async () => {
      Carrera.findAll.mockResolvedValue([])

      await carreraService.listar({ nivel: 'maestria' })

      expect(Carrera.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { '$nivel.slug$': 'maestria' }
      }))
    })
  })

  describe('obtenerPorId', () => {
    it('throws 404 if not found', async () => {
      Carrera.findByPk.mockResolvedValue(null)

      await expect(carreraService.obtenerPorId('nonexistent')).rejects.toThrow('Carrera no encontrada')
    })

    it('returns carrera when found', async () => {
      Carrera.findByPk.mockResolvedValue({ id: 'c1', nombre: 'Ingeniería Civil' })

      const result = await carreraService.obtenerPorId('c1')

      expect(result.nombre).toBe('Ingeniería Civil')
    })
  })

  describe('crear', () => {
    it('throws 400 if nombre or slug already exists', async () => {
      Carrera.findOne.mockResolvedValue({ id: 'existing' })

      await expect(
        carreraService.crear({ nombre: 'Duplicada', slug: 'duplicada' })
      ).rejects.toThrow('Ya existe una carrera con ese nombre o slug')
    })

    it('creates carrera', async () => {
      Carrera.findOne.mockResolvedValue(null)
      Carrera.create.mockResolvedValue({ id: 'new', nombre: 'Nueva', slug: 'nueva' })

      const result = await carreraService.crear({ nombre: 'Nueva', slug: 'nueva' })

      expect(result.id).toBe('new')
      expect(Carrera.create).toHaveBeenCalledWith({
        nombre: 'Nueva',
        slug: 'nueva',
        nivel_id: nivelIdPorSlug('pregrado')
      })
    })

    it('respects an explicit nivel_id', async () => {
      Carrera.findOne.mockResolvedValue(null)
      const nivelId = nivelIdPorSlug('doctorado')
      Carrera.create.mockResolvedValue({ id: 'new', nombre: 'Nueva', slug: 'nueva', nivel_id: nivelId })

      await carreraService.crear({ nombre: 'Nueva', slug: 'nueva', nivel_id: nivelId })

      expect(Carrera.create).toHaveBeenCalledWith(expect.objectContaining({ nivel_id: nivelId }))
    })
  })

  describe('actualizar', () => {
    it('throws 404 if not found', async () => {
      Carrera.findByPk.mockResolvedValue(null)

      await expect(carreraService.actualizar('nonexistent', {})).rejects.toThrow('Carrera no encontrada')
    })

    it('throws 400 if slug already taken', async () => {
      Carrera.findByPk.mockResolvedValue({ id: 'c1', slug: 'old-slug', nombre: 'Vieja' })
      Carrera.findOne.mockResolvedValue({ id: 'c2', slug: 'taken' })

      await expect(
        carreraService.actualizar('c1', { slug: 'taken' })
      ).rejects.toThrow('El slug ya está en uso')
    })

    it('throws 400 if nombre already taken', async () => {
      Carrera.findByPk.mockResolvedValue({ id: 'c1', slug: 'slug', nombre: 'Vieja' })
      Carrera.findOne.mockResolvedValue({ id: 'c2', nombre: 'Tomada' })

      await expect(
        carreraService.actualizar('c1', { nombre: 'Tomada' })
      ).rejects.toThrow('Ya existe una carrera con ese nombre')
    })

    it('updates carrera', async () => {
      const mockCarrera = { id: 'c1', slug: 'old', nombre: 'Vieja', update: jest.fn() }
      Carrera.findByPk.mockResolvedValue(mockCarrera)
      Carrera.findOne.mockResolvedValue(null)

      await carreraService.actualizar('c1', { nombre: 'Actualizada' })

      expect(mockCarrera.update).toHaveBeenCalledWith({ nombre: 'Actualizada' })
    })
  })

  describe('eliminar', () => {
    it('throws 404 if not found', async () => {
      Carrera.findByPk.mockResolvedValue(null)

      await expect(carreraService.eliminar('nonexistent')).rejects.toThrow('Carrera no encontrada')
    })

    it('throws 409 if has associated trabajos', async () => {
      Carrera.findByPk.mockResolvedValue({ id: 'c1' })
      Trabajo.count.mockResolvedValue(3)
      Estudiante.count.mockResolvedValue(0)

      await expect(carreraService.eliminar('c1')).rejects.toThrow('tiene trabajos o estudiantes asociados')
    })

    it('throws 409 if has associated estudiantes', async () => {
      Carrera.findByPk.mockResolvedValue({ id: 'c1' })
      Trabajo.count.mockResolvedValue(0)
      Estudiante.count.mockResolvedValue(2)

      await expect(carreraService.eliminar('c1')).rejects.toThrow('tiene trabajos o estudiantes asociados')
    })

    it('destroys carrera if there are no associations', async () => {
      const mockCarrera = { id: 'c1', destroy: jest.fn() }
      Carrera.findByPk.mockResolvedValue(mockCarrera)
      Trabajo.count.mockResolvedValue(0)
      Estudiante.count.mockResolvedValue(0)

      await carreraService.eliminar('c1')

      expect(mockCarrera.destroy).toHaveBeenCalled()
    })
  })
})
