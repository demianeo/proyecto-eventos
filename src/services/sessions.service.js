import usersRepository from '../repositories/users.repository.js';
import { toCurrentUserDTO } from '../dto/current-user.dto.js';
import { toUserDTO } from '../dto/user.dto.js';
import { createHash, isValidPassword } from '../utils/hash.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isBlank = (value) => typeof value !== 'string' || !value.trim();

class SessionsService {
  async registerUser(data = {}) {
    const { first_name, last_name, email, password } = data;

    if (isBlank(first_name) || isBlank(last_name) || isBlank(email) || isBlank(password)) {
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

    try {
      const user = await usersRepository.createUser({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: normalizedEmail,
        password: await createHash(password)
      });

      return toUserDTO(user);
    } catch (error) {
      if (error.code === 11000) {
        throw createError(409, 'El email ya está registrado');
      }

      throw error;
    }
  }

  async authenticateUser(email, password) {
    if (isBlank(email) || isBlank(password)) {
      throw createError(401, 'Credenciales inválidas');
    }

    const user = await usersRepository.findByEmail(email.trim().toLowerCase());

    if (!user || !(await isValidPassword(password, user.password))) {
      throw createError(401, 'Credenciales inválidas');
    }

    return toCurrentUserDTO(user);
  }
}

export default new SessionsService();
