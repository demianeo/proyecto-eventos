import User from '../models/User.js';

class UsersDao {
  findByEmail(email) {
    return User.findOne({ email });
  }

  create(userData) {
    return User.create(userData);
  }
}

export default new UsersDao();
