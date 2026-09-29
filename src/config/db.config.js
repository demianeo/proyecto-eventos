import mongoose from 'mongoose';
import env from './env.config.js';

export const connectMongoDB = async () => {
  if (!env.mongoUrl) {
    throw new Error('Falta configurar MONGO_URL en el archivo .env');
  }

  await mongoose.connect(env.mongoUrl);
  console.log('Conexión a MongoDB establecida');
};
