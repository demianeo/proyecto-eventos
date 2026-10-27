import usersRepository from '../repositories/users.repository.js';
import { toUserDTO } from '../dto/user.dto.js';

class UsersService {
  async getUsers() {
    const users = await usersRepository.findUsers();
    return users.map(toUserDTO);
  }
}

export default new UsersService();
