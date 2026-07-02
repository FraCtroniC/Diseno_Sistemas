const pdf = require('pdf-parse');
const fs = require('fs');

async function extractTextFromPdf(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text || null;
  } catch {
    return null;
  }
}

module.exports = { extractTextFromPdf };
