'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('trabajos', 'identificador', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true
    });
    await queryInterface.addIndex('trabajos', ['identificador']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('trabajos', 'identificador');
  }
};
