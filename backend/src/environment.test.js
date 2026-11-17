jest.mock('../config/load-env', () => ({}))

describe('config/environment', () => {
  const FRONTEND_URL = process.env.FRONTEND_URL
  const FEED_SITE_URL = process.env.FEED_SITE_URL

  function cargar() {
    jest.resetModules()
    return require('../config/environment')
  }

  afterEach(() => {
    if (FRONTEND_URL === undefined) delete process.env.FRONTEND_URL
    else process.env.FRONTEND_URL = FRONTEND_URL
    if (FEED_SITE_URL === undefined) delete process.env.FEED_SITE_URL
    else process.env.FEED_SITE_URL = FEED_SITE_URL
    jest.resetModules()
  })

  it('normaliza FRONTEND_URL sin barra final para CORS y enlaces', () => {
    process.env.FRONTEND_URL = 'https://diseno-sistemas.vercel.app/'
    delete process.env.FEED_SITE_URL

    const environment = cargar()

    expect(environment.frontendUrl).toBe('https://diseno-sistemas.vercel.app')
    expect(environment.feedSiteUrl).toBe('https://diseno-sistemas.vercel.app')
  })

  it('FEED_SITE_URL tiene prioridad y también se normaliza', () => {
    process.env.FRONTEND_URL = 'https://diseno-sistemas.vercel.app/'
    process.env.FEED_SITE_URL = 'https://repositorio.unefa.edu.ve/'

    const environment = cargar()

    expect(environment.frontendUrl).toBe('https://diseno-sistemas.vercel.app')
    expect(environment.feedSiteUrl).toBe('https://repositorio.unefa.edu.ve')
  })

  it('usa localhost por defecto cuando no hay variables configuradas', () => {
    delete process.env.FRONTEND_URL
    delete process.env.FEED_SITE_URL

    const environment = cargar()

    expect(environment.frontendUrl).toBe('http://localhost:5173')
    expect(environment.feedSiteUrl).toBe('http://localhost:5173')
  })
})
