import usersDao from '../dao/users.dao.js';

const toPublicUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;

  return {
    id: userObject._id.toString(),
    first_name: userObject.first_name,
    last_name: userObject.last_name,
    email: userObject.email,
    role: userObject.role
  };
};

class UsersRepository {
  findByEmail(email) {
    return usersDao.findByEmail(email);
  }

  async create(userData) {
    const user = await usersDao.create(userData);
    return toPublicUser(user);
  }
}

export default new UsersRepository();
