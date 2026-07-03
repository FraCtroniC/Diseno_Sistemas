require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { sequelize, Trabajo } = require('../src/models');
const cloudinaryService = require('../src/services/cloudinary.service');

function generatePDFBuffer(title, author, year) {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 215 >>
stream
BT
/F1 18 Tf
50 700 Td
(${title}) Tj
/F1 12 Tf
50 650 Td
(Autor: ${author}) Tj
50 630 Td
(Ano: ${year}) Tj
50 590 Td
(Documento generado por el Repositorio Digital UNEFA) Tj
50 570 Td
(Nucleo Tachira) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000546 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
618
%%EOF`;

  return Buffer.from(content, 'utf-8');
}

async function main() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Conectado!\n');

    const trabajos = await Trabajo.findAll({ where: { archivo_url: null } });
    console.log(`Se encontraron ${trabajos.length} trabajos sin archivo PDF.\n`);

    for (const t of trabajos) {
      const title = t.titulo || 'Sin titulo';
      const author = t.autor || 'Sin autor';
      const year = t.anio || new Date().getFullYear();
      const pdfBuffer = generatePDFBuffer(title, author, year);

      try {
        console.log(`Subiendo PDF para: "${title}"...`);
        const result = await cloudinaryService.subirArchivo(pdfBuffer, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
        t.archivo_url = result.url;
        await t.save();
        console.log(`  OK -> ${result.url}\n`);
      } catch (uploadErr) {
        console.error(`  ERROR al subir "${title}": ${uploadErr.message}\n`);
      }
    }

    const conArchivo = await Trabajo.count({ where: { archivo_url: { [require('sequelize').Op.ne]: null } } });
    const total = await Trabajo.count();
    console.log(`Resumen: ${conArchivo}/${total} trabajos tienen PDF adjunto.`);
  } catch (err) {
    console.error('Error general:', err);
  } finally {
    await sequelize.close();
  }
}

main();
