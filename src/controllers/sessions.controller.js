import sessionsService from '../services/sessions.service.js';
import env from '../config/env.config.js';

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

export const register = async (request, response, next) => {
  try {
    const user = await sessionsService.registerUser(request.body);

    response.status(201).json({
      status: 'success',
      payload: user
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (request, response, next) => {
  try {
    const token = await sessionsService.loginUser(request.body);

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
    payload: request.user
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
