'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const hash = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('usuarios', [
      {
        id: '0becd959-117e-495d-8e46-cb5cecd89fab',
        nombre: 'Administrador',
        email: 'admin@unefa.edu.ve',
        password_hash: hash,
        rol: 'admin',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('usuarios', { email: 'admin@unefa.edu.ve' });
  }
};
