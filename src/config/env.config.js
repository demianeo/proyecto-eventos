import dotenv from 'dotenv';

dotenv.config();

const env = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUrl: process.env.MONGO_URL
};

export default env;
