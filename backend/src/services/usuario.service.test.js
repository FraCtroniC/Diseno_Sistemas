const bcrypt = require('bcryptjs')

jest.mock('../models', () => ({
  Usuario: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}))

const { Usuario } = require('../models')
const usuarioService = require('./usuario.service')

describe('UsuarioService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('listar', () => {
    it('returns all usuarios ordered by name', async () => {
      Usuario.findAll.mockResolvedValue([{ id: 'u1', nombre: 'Alice' }])

      const result = await usuarioService.listar()

      expect(result).toHaveLength(1)
      expect(Usuario.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['nombre', 'ASC']] })
      )
    })
  })

  describe('obtenerPorId', () => {
    it('throws 404 if not found', async () => {
      Usuario.findByPk.mockResolvedValue(null)

      await expect(usuarioService.obtenerPorId('nonexistent')).rejects.toThrow('Usuario no encontrado')
    })

    it('returns usuario when found', async () => {
      Usuario.findByPk.mockResolvedValue({ id: 'u1', nombre: 'Test' })

      const result = await usuarioService.obtenerPorId('u1')

      expect(result.nombre).toBe('Test')
    })
  })

  describe('crear', () => {
    it('throws 400 if email already exists', async () => {
      Usuario.findOne.mockResolvedValue({ id: 'existing' })

      await expect(
        usuarioService.crear({ nombre: 'New', email: 'dup@test.com', password: '123456' })
      ).rejects.toThrow('El email ya está registrado')
    })

    it('creates usuario with hashed password', async () => {
      Usuario.findOne.mockResolvedValue(null)
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed')
      Usuario.create.mockResolvedValue({ id: 'new', nombre: 'New', email: 'new@test.com' })

      const result = await usuarioService.crear({
        nombre: 'New',
        email: 'new@test.com',
        password: '123456',
        rol: 'bibliotecario',
      })

      expect(Usuario.create).toHaveBeenCalledWith(
        expect.objectContaining({ password_hash: 'hashed' })
      )
      expect(result.id).toBe('new')
    })
  })

  describe('actualizar', () => {
    it('throws 404 if not found', async () => {
      Usuario.findByPk.mockResolvedValue(null)

      await expect(usuarioService.actualizar('nonexistent', {})).rejects.toThrow('Usuario no encontrado')
    })

    it('hashes password if provided', async () => {
      const mockUser = { id: 'u1', email: 'test@test.com', update: jest.fn(), toJSON: () => ({ id: 'u1' }) }
      Usuario.findByPk.mockResolvedValue(mockUser)
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hash')

      await usuarioService.actualizar('u1', { password: 'newpass' })

      expect(mockUser.update).toHaveBeenCalledWith(
        expect.objectContaining({ password_hash: 'new-hash' })
      )
    })
  })

  describe('eliminar', () => {
    it('throws 404 if not found', async () => {
      Usuario.findByPk.mockResolvedValue(null)

      await expect(usuarioService.eliminar('nonexistent')).rejects.toThrow('Usuario no encontrado')
    })

    it('destroys usuario', async () => {
      const mockUser = { destroy: jest.fn() }
      Usuario.findByPk.mockResolvedValue(mockUser)

      await usuarioService.eliminar('u1')

      expect(mockUser.destroy).toHaveBeenCalled()
    })
  })

  describe('cambiarEstado', () => {
    it('toggles activo and saves', async () => {
      const mockUser = { activo: false, save: jest.fn() }
      Usuario.findByPk.mockResolvedValue(mockUser)

      await usuarioService.cambiarEstado('u1', true)

      expect(mockUser.activo).toBe(true)
      expect(mockUser.save).toHaveBeenCalled()
    })
  })
})
