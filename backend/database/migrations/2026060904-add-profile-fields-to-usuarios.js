'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'cedula', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
    await queryInterface.addColumn('usuarios', 'telefono', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('usuarios', 'cedula');
    await queryInterface.removeColumn('usuarios', 'telefono');
  }
};
