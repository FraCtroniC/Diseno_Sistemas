const app = require('./app');
const environment = require('../config/environment');
const { sequelize } = require('./models');

const PORT = environment.port;

async function startServer() {
  try {
    if (!environment.jwtSecret) {
      console.error('JWT_SECRET no está definido. Configura la variable de entorno.');
      process.exit(1);
    }

    console.log('Conectando a la base de datos de Neon...');
    await sequelize.authenticate();
    console.log('¡Conexión a la base de datos establecida correctamente!');

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
      console.log(`Modo: ${environment.nodeEnv}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
}

startServer();
