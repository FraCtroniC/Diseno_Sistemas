const { Sequelize } = require('sequelize');
const environment = require('../../config/environment');
const databaseConfig = require('../../config/database');

const env = environment.nodeEnv || 'development';
const config = databaseConfig[env];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const UsuarioModel = require('./Usuario');
const CategoriaModel = require('./Categoria');
const TrabajoModel = require('./Trabajo');

const Usuario = UsuarioModel(sequelize);
const Categoria = CategoriaModel(sequelize);
const Trabajo = TrabajoModel(sequelize);

Object.values({ Usuario, Categoria, Trabajo }).forEach((model) => {
  if (model.associate) {
    model.associate({ Usuario, Categoria, Trabajo });
  }
});

const db = {
  sequelize,
  Sequelize,
  Usuario,
  Categoria,
  Trabajo
};

module.exports = db;
