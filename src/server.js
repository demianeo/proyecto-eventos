import app from './app.js';
import env from './config/env.config.js';
import { connectMongoDB } from './config/db.config.js';

const startServer = async () => {
  try {
    await connectMongoDB();

    app.listen(env.port, () => {
      console.log(`Servidor activo en el puerto ${env.port} (${env.nodeEnv})`);
    });
  } catch (error) {
    console.error(`No fue posible iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

startServer();
