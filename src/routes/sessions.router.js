import { Router } from 'express';
import passport from 'passport';
import { getSessions, register, login, current, logout } from '../controllers/sessions.controller.js';

const router = Router();

const authenticate = (strategy, defaultFailure) => (request, response, next) => {
  passport.authenticate(strategy, { session: false }, (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return response.status(info?.statusCode || defaultFailure.statusCode).json({
        status: 'error',
        message: info?.apiMessage || defaultFailure.message
      });
    }

    request.user = user;
    return next();
  })(request, response, next);
};

router.get('/', getSessions);
router.post('/register', authenticate('register', { statusCode: 400, message: 'Faltan campos obligatorios' }), register);
router.post('/login', authenticate('login', { statusCode: 401, message: 'Credenciales inválidas' }), login);
router.get('/current', authenticate('current', { statusCode: 401, message: 'No autenticado' }), current);
router.post('/logout', logout);

export default router;
