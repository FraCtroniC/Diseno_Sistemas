const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

jest.mock('../models', () => ({
  Usuario: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}))

jest.mock('../../config/environment', () => ({
  jwtSecret: 'test_secret',
  frontendUrl: 'http://localhost:5173',
  nodeEnv: 'test',
}))

jest.mock('./email.service', () => ({
  sendPasswordResetLink: jest.fn(),
}))

const { Usuario } = require('../models')
const authService = require('./auth.service')
const emailService = require('./email.service')

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('throws 401 if user not found', async () => {
      Usuario.findOne.mockResolvedValue(null)

      await expect(authService.login('test@test.com', 'pass123')).rejects.toThrow('Credenciales inválidas')
    })

    it('throws 401 if password is wrong', async () => {
      Usuario.findOne.mockResolvedValue({ password_hash: 'hash', activo: true })
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false)

      await expect(authService.login('test@test.com', 'wrong')).rejects.toThrow('Credenciales inválidas')
    })

    it('throws 403 if account is inactive', async () => {
      Usuario.findOne.mockResolvedValue({ password_hash: 'hash', activo: false })
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)

      await expect(authService.login('test@test.com', 'pass')).rejects.toThrow('Cuenta desactivada')
    })

    it('returns token and user on success', async () => {
      const mockUser = {
        id: 'u1',
        nombre: 'Test',
        email: 'test@test.com',
        username: 'testuser',
        rol: 'admin',
        cedula: '123',
        telefono: '555',
        password_hash: 'hash',
        activo: true,
      }
      Usuario.findOne.mockResolvedValue(mockUser)
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)
      jest.spyOn(jwt, 'sign').mockReturnValue('fake-token')

      const result = await authService.login('test@test.com', 'pass')

      expect(result.token).toBe('fake-token')
      expect(result.usuario.email).toBe('test@test.com')
      expect(result.usuario.username).toBe('testuser')
    })

    it('logs in with username instead of email', async () => {
      const mockUser = {
        id: 'u1',
        nombre: 'Test',
        email: 'test@test.com',
        username: 'testuser',
        rol: 'admin',
        cedula: null,
        telefono: null,
        password_hash: 'hash',
        activo: true,
      }
      Usuario.findOne
        .mockResolvedValueOnce(null)   // email lookup fails
        .mockResolvedValueOnce(mockUser) // username lookup succeeds
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)
      jest.spyOn(jwt, 'sign').mockReturnValue('username-token')

      const result = await authService.login('testuser', 'pass')

      expect(result.token).toBe('username-token')
      expect(result.usuario.username).toBe('testuser')
    })
  })

  describe('register', () => {
    it('throws 400 if email already exists', async () => {
      Usuario.findOne.mockResolvedValue({ id: 'existing' })

      await expect(authService.register({ email: 'dup@test.com', password: '123456' })).rejects.toThrow(
        'El email ya está registrado'
      )
    })

    it('creates user and returns token', async () => {
      Usuario.findOne.mockResolvedValue(null)
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-pass')
      Usuario.create.mockResolvedValue({
        id: 'new-id',
        nombre: 'New',
        email: 'new@test.com',
        username: null,
        rol: 'bibliotecario',
        cedula: null,
        telefono: null,
      })
      jest.spyOn(jwt, 'sign').mockReturnValue('new-token')

      const result = await authService.register({ nombre: 'New', email: 'new@test.com', password: '12345678' })

      expect(result.token).toBe('new-token')
      expect(result.usuario.email).toBe('new@test.com')
      expect(result.usuario.username).toBeNull()
    })

    it('throws 400 if username already exists', async () => {
      Usuario.findOne
        .mockResolvedValueOnce(null)    // email not taken
        .mockResolvedValueOnce({ id: 'existing' }) // username taken
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-pass')

      await expect(authService.register({
        nombre: 'New',
        email: 'new@test.com',
        username: 'taken',
        password: '12345678'
      })).rejects.toThrow('El nombre de usuario ya está en uso')
    })
  })

  describe('forgotPassword', () => {
    it('returns generic message if user not found', async () => {
      Usuario.findOne.mockResolvedValue(null)

      const result = await authService.forgotPassword('noone@test.com')

      expect(result.message).toBe('Si el correo está registrado, recibirás un enlace de restablecimiento.')
    })

    it('generates reset token and sends email', async () => {
      const mockUser = { id: 'u1', email: 'test@test.com', update: jest.fn() }
      Usuario.findOne.mockResolvedValue(mockUser)
      emailService.sendPasswordResetLink.mockResolvedValue()

      const result = await authService.forgotPassword('test@test.com')

      expect(mockUser.update).toHaveBeenCalled()
      expect(result.message).toBe('Si el correo está registrado, recibirás un enlace de restablecimiento.')
    })
  })

  describe('resetPassword', () => {
    it('throws 400 if token invalid/expired', async () => {
      Usuario.findOne.mockResolvedValue(null)

      await expect(authService.resetPassword('bad-token', 'test@test.com', 'newpass')).rejects.toThrow(
        'enlace de restablecimiento es inválido'
      )
    })

    it('updates password and clears token', async () => {
      const mockUser = { update: jest.fn((data) => Object.assign(mockUser, data)) }
      Usuario.findOne.mockResolvedValue(mockUser)
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hash')

      await authService.resetPassword('valid-token', 'test@test.com', 'newpass')

      expect(mockUser.update).toHaveBeenCalledWith(
        expect.objectContaining({ password_hash: 'new-hash', reset_token: null })
      )
    })
  })

  describe('changePassword', () => {
    it('throws 404 if user not found', async () => {
      Usuario.findByPk.mockResolvedValue(null)

      await expect(authService.changePassword('u1', 'old', 'new')).rejects.toThrow('Usuario no encontrado')
    })

    it('throws 400 if current password is wrong', async () => {
      Usuario.findByPk.mockResolvedValue({ password_hash: 'hash' })
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false)

      await expect(authService.changePassword('u1', 'wrong', 'new')).rejects.toThrow(
        'La contraseña actual no es correcta'
      )
    })

    it('updates password on success', async () => {
      const mockUser = { password_hash: 'hash', update: jest.fn() }
      Usuario.findByPk.mockResolvedValue(mockUser)
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hash')

      const result = await authService.changePassword('u1', 'old', 'newpass')

      expect(mockUser.update).toHaveBeenCalledWith({ password_hash: 'new-hash' })
      expect(result.message).toContain('actualizada')
    })
  })

  describe('perfil', () => {
    it('throws 404 if user not found', async () => {
      Usuario.findByPk.mockResolvedValue(null)

      await expect(authService.perfil('nonexistent')).rejects.toThrow('Usuario no encontrado')
    })

    it('returns user data without password_hash', async () => {
      Usuario.findByPk.mockResolvedValue({
        id: 'u1',
        nombre: 'Test',
        email: 'test@test.com',
        username: 'testuser',
        rol: 'admin',
        cedula: '123',
        telefono: '555',
      })

      const result = await authService.perfil('u1')

      expect(result.email).toBe('test@test.com')
      expect(result.nombre).toBe('Test')
      expect(result.username).toBe('testuser')
    })
  })

  describe('actualizarPerfil', () => {
    it('updates email, username, cedula and telefono', async () => {
      const userData = {
        id: 'u1',
        nombre: 'Test',
        email: 'old@test.com',
        username: 'olduser',
        rol: 'admin',
        cedula: null,
        telefono: null,
      }
      const mockUser = {
        ...userData,
        update: jest.fn(function (data) {
          Object.assign(this, data)
        }),
      }
      Usuario.findByPk.mockResolvedValue(mockUser)
      Usuario.findOne.mockResolvedValue(null)

      const result = await authService.actualizarPerfil('u1', {
        email: 'new@test.com',
        username: 'newuser',
        cedula: 'V-123',
        telefono: '555',
      })

      expect(mockUser.update).toHaveBeenCalled()
      expect(result.email).toBe('new@test.com')
      expect(result.username).toBe('newuser')
    })
  })
})
