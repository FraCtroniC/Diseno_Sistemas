const request = require('supertest')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

jest.mock('../middlewares/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { id: 'test-user-id', nombre: 'Test', email: 'test@test.com', rol: 'admin' }
    next()
  }
})

jest.mock('../models', () => ({
  Usuario: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
  },
  Trabajo: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  Categoria: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
}))

jest.mock('../../config/environment', () => ({
  jwtSecret: 'test_secret',
  frontendUrl: 'http://localhost:5173',
  nodeEnv: 'test',
}))

jest.mock('../services/email.service', () => ({
  sendPasswordResetLink: jest.fn(),
}))

jest.mock('../validators/metadatos.schema', () => ({
  validarMetadatos: jest.fn((m) => m),
}))

const app = require('../app')
const { Usuario } = require('../models')

describe('API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /health', () => {
    it('returns 200 with status UP', async () => {
      const res = await request(app).get('/health')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.status).toBe('UP')
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('returns 400 for invalid payload', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: '' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('returns 401 for wrong credentials', async () => {
      Usuario.findOne.mockResolvedValue(null)

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'noone@test.com', password: '12345678' })

      expect(res.status).toBe(401)
    })

    it('returns 200 with token on success', async () => {
      Usuario.findOne.mockResolvedValue({
        id: 'u1',
        nombre: 'Test',
        email: 'test@test.com',
        rol: 'admin',
        cedula: null,
        telefono: null,
        activo: true,
        password_hash: 'hashed',
      })
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)
      jest.spyOn(jwt, 'sign').mockReturnValue('fake-token')

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com', password: '12345678' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.token).toBe('fake-token')
    })
  })

  describe('POST /api/v1/auth/register', () => {
    it('returns 201 on successful registration', async () => {
      Usuario.findOne.mockResolvedValue(null)
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed')
      Usuario.create.mockResolvedValue({
        id: 'new-u',
        nombre: 'New',
        email: 'new@test.com',
        rol: 'bibliotecario',
        cedula: null,
        telefono: null,
      })
      jest.spyOn(jwt, 'sign').mockReturnValue('new-token')

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ nombre: 'New', email: 'new@test.com', password: '12345678' })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.token).toBe('new-token')
    })
  })

  describe('GET /api/v1/auth/perfil (protected)', () => {
    it('returns user profile', async () => {
      Usuario.findByPk.mockResolvedValue({
        id: 'u1',
        nombre: 'Test',
        email: 'test@test.com',
        rol: 'admin',
        cedula: null,
        telefono: null,
      })

      const res = await request(app)
        .get('/api/v1/auth/perfil')
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(200)
      expect(res.body.data.email).toBe('test@test.com')
    })
  })

  describe('GET /api/v1/categorias (public)', () => {
    it('returns list of categorias', async () => {
      const { Categoria } = require('../models')
      Categoria.findAll.mockResolvedValue([
        { id: 'c1', nombre: 'Ingeniería', slug: 'ingenieria', descripcion: null },
      ])

      const res = await request(app).get('/api/v1/categorias')

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
    })
  })

  describe('GET /api/v1/trabajos (public)', () => {
    it('returns paginated trabajos', async () => {
      const { Trabajo } = require('../models')
      Trabajo.findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 't1', titulo: 'Test' }] })

      const res = await request(app).get('/api/v1/trabajos')

      expect(res.status).toBe(200)
      expect(res.body.total).toBe(1)
    })
  })
})
