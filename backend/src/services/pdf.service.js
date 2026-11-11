const { PDFParse } = require('pdf-parse');

async function extractTextFromPdf(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text || null;
  } catch {
    return null;
  } finally {
    try {
      await parser.destroy();
    } catch {
      // Si el parser no llegó a inicializarse, la limpieza también puede fallar.
    }
  }
}

module.exports = { extractTextFromPdf };
