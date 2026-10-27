import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import sessionsService from '../services/sessions.service.js';
import { getJwtSecret } from '../utils/jwt.js';

const passportError = (statusCode, apiMessage) => ({ statusCode, apiMessage });

const cookieExtractor = (request) => request?.cookies?.currentUser || null;

const handlePassportError = (error, done) => {
  if (error.statusCode) {
    return done(null, false, passportError(error.statusCode, error.message));
  }

  return done(error);
};

export const initializePassport = () => {
  passport.use(
    'register',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      async (request, email, password, done) => {
        try {
          const user = await sessionsService.registerUser({
            ...request.body,
            email,
            password
          });

          return done(null, user);
        } catch (error) {
          return handlePassportError(error, done);
        }
      }
    )
  );

  passport.use(
    'login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          return done(null, await sessionsService.authenticateUser(email, password));
        } catch (error) {
          return handlePassportError(error, done);
        }
      }
    )
  );

  passport.use(
    'current',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: getJwtSecret()
      },
      async (payload, done) => {
        const { id, email, role } = payload;

        if (!id || !email || !role) {
          return done(null, false);
        }

        return done(null, { id, email, role });
      }
    )
  );
};
