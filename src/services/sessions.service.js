import usersRepository from '../repositories/users.repository.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class SessionsService {
  async registerUser(data) {
    const { first_name, last_name, email, password } = data || {};

    if (
      typeof first_name !== 'string' || !first_name.trim() ||
      typeof last_name !== 'string' || !last_name.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || !password.trim()
    ) {
      throw createError(400, 'Faltan campos obligatorios');
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      throw createError(400, 'El email no tiene un formato válido');
    }

    if (password.length < 8) {
      throw createError(400, 'La contraseña debe tener al menos 8 caracteres');
    }

    const existingUser = await usersRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw createError(409, 'El email ya está registrado');
    }

    const hashedPassword = await createHash(password);

    return usersRepository.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });
  }

  async loginUser(data) {
    const { email, password } = data || {};

    if (
      typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || !password.trim()
    ) {
      throw createError(401, 'Credenciales inválidas');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await usersRepository.findByEmail(normalizedEmail);

    if (!user || !(await isValidPassword(password, user.password))) {
      throw createError(401, 'Credenciales inválidas');
    }

    return generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });
  }
}

export default new SessionsService();
