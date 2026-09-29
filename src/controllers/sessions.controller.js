import sessionsService from '../services/sessions.service.js';

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
