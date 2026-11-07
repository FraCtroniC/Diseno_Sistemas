const CEDULA_REGEX = /^[VEJGP]-\d{6,9}$/;

/**
 * Deja la cédula en el formato canónico almacenado: "V-12345678".
 * Acepta valores como "v 12.345.678", "V12345678" o "V-12345678".
 */
function normalizeCedula(value) {
  if (value === null || value === undefined) return null;

  const limpio = String(value).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!limpio) return null;

  const match = limpio.match(/^([VEJGP])(\d+)$/);
  return match ? `${match[1]}-${match[2]}` : limpio;
}

function esCedulaDuplicada(error) {
  if (!error || error.name !== 'SequelizeUniqueConstraintError') return false;

  const campos = error.fields || {};
  const restriccion = error.parent?.constraint || '';
  return Boolean(campos.cedula) || /cedula/i.test(restriccion);
}

module.exports = { CEDULA_REGEX, normalizeCedula, esCedulaDuplicada };
