require('./load-env');

const useSsl = process.env.DB_SSL !== 'false';

const dialectOptions = useSsl
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  : {};

const baseConfig = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'postgres',
  dialectOptions
};

module.exports = {
  development: {
    ...baseConfig,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      // Neon cobra un coste alto por abrir una conexión nueva (TLS + handshake).
      // Mantener las conexiones 60s evita pagar ese coste en cada carga del panel.
      idle: 60000
    },
    logging: process.env.DB_LOGGING === 'false' ? false : console.log
  },
  test: {
    ...baseConfig,
    pool: {
      max: Number.parseInt(process.env.DB_POOL_MAX, 10) || 5,
      min: Number.parseInt(process.env.DB_POOL_MIN, 10) || 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  },
  production: {
    ...baseConfig,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 60000
    },
    logging: false
  }
};
