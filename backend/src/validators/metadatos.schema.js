const Joi = require('joi');

const metadatosSchema = Joi.object({
  tipo_documento: Joi.string().valid('pregrado', 'postgrado', 'normativas', 'institucional', 'editorial', 'divulgacion', 'tesis', 'tfg', 'pasantia', 'articulo', 'monografia', 'trabajo').optional(),
  idioma: Joi.string().valid('es', 'en', 'pt').optional(),
  paginas: Joi.number().integer().min(5).max(5000).optional(),
  institucion: Joi.string().max(200).optional(),
  carrera: Joi.string().max(200).optional(),
  tutor_academico: Joi.string().max(200).optional(),
  tutor_industrial: Joi.string().max(200).optional(),
  linea_investigacion: Joi.string().max(200).optional(),
  deposito_legal: Joi.string().max(100).optional(),
  isbn: Joi.string().max(20).optional(),
  issn: Joi.string().max(20).optional(),
  doi: Joi.string().uri().optional()
}).min(0).unknown(false);

function validarMetadatos(metadatos) {
  const { error, value } = metadatosSchema.validate(metadatos, { abortEarly: false });
  if (error) {
    const err = new Error('Validación de metadatos fallida');
    err.statusCode = 400;
    err.details = error.details.map((d) => d.message);
    throw err;
  }
  return value;
}

module.exports = { metadatosSchema, validarMetadatos };
