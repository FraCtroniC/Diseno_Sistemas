const express = require('express')
const request = require('supertest')

jest.mock('../models', () => ({
  Trabajo: { findAll: jest.fn() },
  Categoria: { name: 'Categoria' },
}))

jest.mock('../../config/environment', () => ({
  feedSiteUrl: 'https://repositorio.unefa.edu.ve',
}))

const { Trabajo } = require('../models')
const feedRoutes = require('./feed.routes')

const app = express()
app.use('/feed', feedRoutes)

describe('feed.routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Trabajo.findAll.mockResolvedValue([])
  })

  it('GET /feed/rss devuelve 200 y application/rss+xml', async () => {
    const res = await request(app).get('/feed/rss')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/rss\+xml/)
    expect(res.text).toContain('<rss version="2.0"')
  })

  it('GET /feed/atom devuelve 200 y application/atom+xml', async () => {
    const res = await request(app).get('/feed/atom')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/atom\+xml/)
    expect(res.text).toContain('<feed xmlns="http://www.w3.org/2005/Atom">')
  })

  it('devuelve 500 con mensaje claro si falla la generación RSS', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    Trabajo.findAll.mockRejectedValueOnce(new Error('DB caída'))

    const res = await request(app).get('/feed/rss')

    expect(res.status).toBe(500)
    expect(res.text).toBe('Error generando el feed RSS')
    errorSpy.mockRestore()
  })
})
