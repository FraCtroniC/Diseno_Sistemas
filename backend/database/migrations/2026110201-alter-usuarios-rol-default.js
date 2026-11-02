'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      "ALTER TABLE usuarios ALTER COLUMN rol SET DEFAULT 'repositor';"
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      "ALTER TABLE usuarios ALTER COLUMN rol SET DEFAULT 'bibliotecario';"
    );
  }
};
