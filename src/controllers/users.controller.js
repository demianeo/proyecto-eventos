import usersService from '../services/users.service.js';

export const getUsers = async (_request, response, next) => {
  try {
    const users = await usersService.getUsers();
    response.status(200).json({
      status: 'success',
      payload: users
    });
  } catch (error) {
    next(error);
  }
};
