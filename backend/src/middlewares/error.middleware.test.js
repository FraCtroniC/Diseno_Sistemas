const errorMiddleware = require('./error.middleware')

describe('error.middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {}
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    next = jest.fn()
  })

  it('responds with 500 and default message for unknown errors', () => {
    const err = new Error('Something went wrong')

    errorMiddleware(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Something went wrong',
      errors: null,
      statusCode: 500,
    })
  })

  it('uses the error statusCode when provided', () => {
    const err = new Error('Not found')
    err.statusCode = 404

    errorMiddleware(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 })
    )
  })

  it('includes error details when present', () => {
    const err = new Error('Validation error')
    err.statusCode = 400
    err.details = [{ field: 'email', message: 'Invalid email' }]

    errorMiddleware(err, req, res, next)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: [{ field: 'email', message: 'Invalid email' }],
      })
    )
  })
})
