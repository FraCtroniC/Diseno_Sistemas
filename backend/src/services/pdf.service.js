const pdf = require('pdf-parse');

async function extractTextFromPdf(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text || null;
  } catch {
    return null;
  }
}

module.exports = { extractTextFromPdf };
