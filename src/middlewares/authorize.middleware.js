const forbidden = (response) => response.status(403).json({
  status: 'error',
  message: 'No tenés permisos para realizar esta acción'
});

export const authorize = (...allowedRoles) => (request, response, next) => {
  if (!request.user) {
    return response.status(401).json({
      status: 'error',
      message: 'No autenticado'
    });
  }

  if (!allowedRoles.includes(request.user.role)) {
    return forbidden(response);
  }

  return next();
};
