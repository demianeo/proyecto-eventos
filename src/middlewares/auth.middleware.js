import { verifyToken } from '../utils/jwt.js';

export const authMiddleware = (request, response, next) => {
  const token = request.cookies.currentUser;

  if (!token) {
    return response.status(401).json({
      status: 'error',
      message: 'No autenticado'
    });
  }

  try {
    const payload = verifyToken(token);

    request.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role
    };

    next();
  } catch (_error) {
    return response.status(401).json({
      status: 'error',
      message: 'No autenticado'
    });
  }
};
