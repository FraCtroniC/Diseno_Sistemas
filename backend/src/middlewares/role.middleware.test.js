const roleMiddleware = require('./role.middleware')

describe('role.middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {}
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    next = jest.fn()
  })

  it('throws 401 if no user in request', () => {
    const middleware = roleMiddleware('admin')

    expect(() => middleware(req, res, next)).toThrow('No autenticado')
  })

  it('throws 403 if user role is not permitted', () => {
    req.user = { rol: 'bibliotecario' }
    const middleware = roleMiddleware('admin', 'repositor')

    expect(() => middleware(req, res, next)).toThrow('Acceso denegado')
  })

  it('calls next if user has a permitted role', () => {
    req.user = { rol: 'admin' }
    const middleware = roleMiddleware('admin', 'repositor')

    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('calls next for bibliotecario when permitted', () => {
    req.user = { rol: 'bibliotecario' }
    const middleware = roleMiddleware('admin', 'repositor', 'bibliotecario')

    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
