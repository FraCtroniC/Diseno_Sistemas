const multer = require('multer')
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

  it('maps LIMIT_FILE_SIZE to 413 with a clear message', () => {
    const err = new multer.MulterError('LIMIT_FILE_SIZE')

    errorMiddleware(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(413)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('10 MB'),
        statusCode: 413,
      })
    )
  })

  it('maps other Multer errors to 400', () => {
    const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'archivo')

    errorMiddleware(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Error al procesar el archivo'),
        statusCode: 400,
      })
    )
  })
})
