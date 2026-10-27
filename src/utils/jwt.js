import jwt from 'jsonwebtoken';
import env from '../config/env.config.js';

export const getJwtSecret = () => {
  if (!env.jwtSecret) {
    throw new Error('Falta configurar JWT_SECRET en el archivo .env');
  }

  return env.jwtSecret;
};

export const generateToken = (payload) =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, getJwtSecret());
