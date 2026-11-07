'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Las cédulas vacías se tratan como "sin cédula" para no chocar con el índice único.
    await queryInterface.sequelize.query(`
      UPDATE usuarios
      SET cedula = NULL
      WHERE cedula IS NOT NULL AND trim(cedula) = ''
    `);

    // Normaliza las cédulas existentes al formato canónico "V-12345678".
    await queryInterface.sequelize.query(`
      UPDATE usuarios
      SET cedula = regexp_replace(
        regexp_replace(upper(trim(cedula)), '[^A-Z0-9]', '', 'g'),
        '^([VEJGP])([0-9]+)$',
        '\\1-\\2'
      )
      WHERE cedula IS NOT NULL
    `);

    const [duplicados] = await queryInterface.sequelize.query(`
      SELECT cedula, COUNT(*)::int AS total
      FROM usuarios
      WHERE cedula IS NOT NULL
      GROUP BY cedula
      HAVING COUNT(*) > 1
      ORDER BY cedula
    `);

    if (duplicados.length > 0) {
      const detalle = duplicados.map((item) => item.cedula).join(', ');
      throw new Error(
        `No se puede crear el índice único de cédula. Corrige estas cédulas duplicadas antes de migrar: ${detalle}`
      );
    }

    await queryInterface.addIndex('usuarios', ['cedula'], {
      unique: true,
      name: 'usuarios_cedula_unique'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('usuarios', 'usuarios_cedula_unique');
  }
};
