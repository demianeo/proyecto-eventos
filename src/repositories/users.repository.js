import usersDao from '../dao/users.dao.js';

class UsersRepository {
  findByEmail(email) {
    return usersDao.findOne({ email });
  }

  findUserById(id) {
    return usersDao.findById(id);
  }

  createUser(userData) {
    return usersDao.create(userData);
  }

  updateUser(id, data) {
    return usersDao.updateById(id, data);
  }

  findUsers(filter = {}) {
    return usersDao.find(filter);
  }

  countUsers(filter = {}) {
    return usersDao.count(filter);
  }
}

export default new UsersRepository();
