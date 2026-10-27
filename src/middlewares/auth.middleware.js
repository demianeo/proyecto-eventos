import { verifyToken } from '../utils/jwt.js';

export const authMiddleware = (request, response, next) => {
  const token = request.cookies?.currentUser;

  if (!token) {
    return response.status(401).json({
      status: 'error',
      message: 'No autenticado'
    });
  }

  try {
    const { id, email, role } = verifyToken(token);

    if (!id || !email || !role) {
      throw new Error('Token incompleto');
    }

    request.user = { id, email, role };
    return next();
  } catch (_error) {
    return response.status(401).json({
      status: 'error',
      message: 'No autenticado'
    });
  }
};
