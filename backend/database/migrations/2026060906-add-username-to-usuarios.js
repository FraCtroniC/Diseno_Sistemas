'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'username', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('usuarios', 'username');
  }
};
