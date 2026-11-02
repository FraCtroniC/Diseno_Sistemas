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
  Version: {
    max: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
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
        rol: 'repositor',
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

  describe('PUT /api/v1/trabajos/:id (edición)', () => {
    let trabajoActual

    const trabajoConUpdate = () => {
      const trabajo = {
        id: 't1',
        titulo: 'Título original',
        autor: 'Autor original',
        tutor: null,
        anio: 2024,
        resumen: 'Resumen original',
        palabras_clave: ['antiguo'],
        categoria_id: 'cat-1',
        estado: 'publicado',
        metadatos: { tipo_documento: 'pregrado', idioma: 'es', paginas: 120 },
        archivo_url: 'https://cloudinary.com/archivo.pdf',
        identificador: 'UNEFAD-2024-001',
      }
      trabajo.update = jest.fn().mockResolvedValue(trabajo)
      return trabajo
    }

    beforeEach(() => {
      const { Trabajo, Categoria, Version } = require('../models')
      trabajoActual = trabajoConUpdate()
      Trabajo.findByPk.mockResolvedValue(trabajoActual)
      Categoria.findByPk.mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174000', nombre: 'Ingeniería' })
      Version.max.mockResolvedValue(null)
      Version.create.mockResolvedValue({})
    })

    it('actualiza los campos enviados y crea una versión previa', async () => {
      const { Version } = require('../models')

      const res = await request(app)
        .put('/api/v1/trabajos/t1')
        .field('titulo', 'Título editado')
        .field('autor', 'Autor editado')
        .field('anio', '2025')
        .field('categoria_id', '123e4567-e89b-12d3-a456-426614174000')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      expect(trabajoActual.update).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: 'Título editado', autor: 'Autor editado', anio: '2025' }),
      )
      expect(Version.create).toHaveBeenCalledTimes(1)
    })

    it('acepta palabras clave enviadas como string JSON (FormData)', async () => {
      const res = await request(app)
        .put('/api/v1/trabajos/t1')
        .field('titulo', 'Título editado')
        .field('palabras_clave', '["educación virtual", " aprendizaje ", ""]')

      expect(res.status).toBe(200)
      expect(trabajoActual.update).toHaveBeenCalledWith(
        expect.objectContaining({ palabras_clave: ['educación virtual', 'aprendizaje'] }),
      )
    })

    it('conserva el estado actual cuando no se envía el campo estado', async () => {
      const res = await request(app)
        .put('/api/v1/trabajos/t1')
        .field('titulo', 'Solo cambio el título')

      expect(res.status).toBe(200)

      const updateData = trabajoActual.update.mock.calls[0][0]
      expect(updateData).not.toHaveProperty('estado')
    })

    it('rechaza un año inválido sin modificar el trabajo', async () => {
      const { Trabajo } = require('../models')

      const res = await request(app)
        .put('/api/v1/trabajos/t1')
        .field('anio', '1800')

      expect(res.status).toBe(400)
      expect(Trabajo.findByPk).not.toHaveBeenCalled()
      expect(trabajoActual.update).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/v1/trabajos (creación)', () => {
    it('acepta palabras clave enviadas como string JSON y las guarda como arreglo', async () => {
      const { Trabajo, Categoria } = require('../models')
      Categoria.findByPk.mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174000' })
      Trabajo.create.mockImplementation((data) => Promise.resolve({ id: 'nuevo', ...data }))

      const res = await request(app)
        .post('/api/v1/trabajos')
        .field('titulo', 'Nuevo trabajo')
        .field('autor', 'Autora')
        .field('anio', '2025')
        .field('categoria_id', '123e4567-e89b-12d3-a456-426614174000')
        .field('palabras_clave', '["uno", "dos"]')
        .field('metadatos', JSON.stringify({ tipo_documento: 'pregrado', carrera: 'Educación' }))

      expect(res.status).toBe(201)
      expect(Trabajo.create).toHaveBeenCalledWith(
        expect.objectContaining({ palabras_clave: ['uno', 'dos'] }),
      )
    })
  })
})
