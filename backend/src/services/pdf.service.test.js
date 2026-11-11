jest.mock('pdf-parse', () => {
  const getText = jest.fn();
  const destroy = jest.fn();
  const PDFParse = jest.fn(() => ({ getText, destroy }));
  return { PDFParse, __mock: { getText, destroy } };
});

const { PDFParse, __mock } = require('pdf-parse');
const { extractTextFromPdf } = require('./pdf.service');

describe('extractTextFromPdf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __mock.destroy.mockResolvedValue();
  });

  it('extrae el texto usando la API de pdf-parse v2 y libera el parser', async () => {
    const buffer = Buffer.from('%PDF-1.4');
    __mock.getText.mockResolvedValue({ text: 'Contenido del PDF' });

    const resultado = await extractTextFromPdf(buffer);

    expect(PDFParse).toHaveBeenCalledWith({ data: buffer });
    expect(resultado).toBe('Contenido del PDF');
    expect(__mock.destroy).toHaveBeenCalledTimes(1);
  });

  it('devuelve null cuando la extracción falla, sin propagar el error', async () => {
    __mock.getText.mockRejectedValue(new Error('PDF inválido'));

    await expect(extractTextFromPdf(Buffer.from('x'))).resolves.toBeNull();
    expect(__mock.destroy).toHaveBeenCalledTimes(1);
  });

  it('devuelve null cuando el PDF no contiene texto', async () => {
    __mock.getText.mockResolvedValue({ text: '' });

    await expect(extractTextFromPdf(Buffer.from('x'))).resolves.toBeNull();
  });

  it('no falla si destroy() también lanza un error', async () => {
    __mock.getText.mockResolvedValue({ text: 'Texto' });
    __mock.destroy.mockRejectedValue(new Error('destroy falló'));

    await expect(extractTextFromPdf(Buffer.from('x'))).resolves.toBe('Texto');
  });
});
