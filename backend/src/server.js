const environment = require('../config/environment');
const app = require('./app');
const { sequelize } = require('./models');

const PORT = environment.port;

function numeroPositivo(value, porDefecto) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : porDefecto;
}

async function startServer() {
  try {
    if (!environment.jwtSecret) {
      console.error('JWT_SECRET no está definido. Configura la variable de entorno.');
      process.exit(1);
    }

    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('¡Conexión a la base de datos establecida correctamente!');

    const server = app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
      console.log(`Modo: ${environment.nodeEnv}`);
    });

    // Límites para evitar conexiones lentas o solicitudes que nunca terminan.
    server.requestTimeout = numeroPositivo(process.env.REQUEST_TIMEOUT_MS, 30_000);
    server.headersTimeout = numeroPositivo(process.env.HEADERS_TIMEOUT_MS, 35_000);
    server.keepAliveTimeout = numeroPositivo(process.env.KEEP_ALIVE_TIMEOUT_MS, 65_000);
    server.timeout = numeroPositivo(process.env.SOCKET_TIMEOUT_MS, 120_000);

    const cerrar = async (senal) => {
      console.log(`Recibida ${senal}. Cerrando servidor...`);
      server.close(async () => {
        await sequelize.close().catch(() => {});
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10_000).unref();
    };

    process.once('SIGTERM', () => cerrar('SIGTERM'));
    process.once('SIGINT', () => cerrar('SIGINT'));
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
}

startServer();
