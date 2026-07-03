'use strict';
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = {
  up: async (queryInterface) => {
    const rawPassword = process.env.ADMIN_PASSWORD || `admin_${crypto.randomUUID().split('-')[0]}`;
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`[ADVERTENCIA] Usando contraseña generada para admin: ${rawPassword}`);
      console.log('[ADVERTENCIA] Define ADMIN_PASSWORD en .env para evitar contraseñas aleatorias.');
    }
    const hash = await bcrypt.hash(rawPassword, 10);

    await queryInterface.bulkInsert('usuarios', [
      {
        id: '0becd959-117e-495d-8e46-cb5cecd89fab',
        nombre: 'Administrador',
        email: 'admin@unefa.edu.ve',
        username: 'admin',
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
