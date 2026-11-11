const { extraerPublicId } = require('./cloudinary.service');

describe('extraerPublicId', () => {
  it('extrae el public_id de una URL raw con versión', () => {
    expect(
      extraerPublicId('https://res.cloudinary.com/demo/raw/upload/v1794314400/trabajos/1783118954200-Prueba_1.pdf')
    ).toBe('trabajos/1783118954200-Prueba_1.pdf');
  });

  it('extrae el public_id cuando la URL no incluye versión', () => {
    expect(
      extraerPublicId('https://res.cloudinary.com/demo/raw/upload/trabajos/archivo.pdf')
    ).toBe('trabajos/archivo.pdf');
  });

  it('decodifica nombres con caracteres codificados', () => {
    expect(
      extraerPublicId('https://res.cloudinary.com/demo/raw/upload/v1/trabajos/An%C3%A1lisis%20Final.pdf')
    ).toBe('trabajos/Análisis Final.pdf');
  });

  it('devuelve null para URLs que no son de Cloudinary', () => {
    expect(extraerPublicId('https://example.com/trabajos/archivo.pdf')).toBeNull();
    expect(extraerPublicId('https://res.cloudinary.com.evil.com/raw/upload/v1/a.pdf')).toBeNull();
  });

  it('devuelve null para valores inválidos', () => {
    expect(extraerPublicId(null)).toBeNull();
    expect(extraerPublicId(undefined)).toBeNull();
    expect(extraerPublicId('')).toBeNull();
    expect(extraerPublicId('no-es-una-url')).toBeNull();
  });
});
