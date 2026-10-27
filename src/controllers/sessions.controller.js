import env from '../config/env.config.js';
import { toCurrentUserDTO } from '../dto/current-user.dto.js';
import { generateToken } from '../utils/jwt.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 3600000,
  secure: env.nodeEnv === 'production'
};

export const getSessions = (_request, response) => {
  response.status(200).json({
    status: 'success',
    payload: []
  });
};

export const register = (request, response) => {
  response.status(201).json({
    status: 'success',
    payload: request.user
  });
};

export const login = (request, response, next) => {
  try {
    const token = generateToken({
      id: request.user.id,
      email: request.user.email,
      role: request.user.role
    });

    response.cookie('currentUser', token, cookieOptions);
    response.status(200).json({
      status: 'success',
      message: 'Login correcto'
    });
  } catch (error) {
    next(error);
  }
};

export const current = (request, response) => {
  response.status(200).json({
    status: 'success',
    payload: toCurrentUserDTO(request.user)
  });
};

export const logout = (_request, response) => {
  response.clearCookie('currentUser', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production'
  });

  response.status(200).json({
    status: 'success',
    message: 'Sesión cerrada'
  });
};
