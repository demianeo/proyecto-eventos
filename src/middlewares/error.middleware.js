export const errorHandler = (error, _request, response, _next) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Error interno del servidor' : error.message;

  response.status(statusCode).json({
    status: 'error',
    message
  });
};
