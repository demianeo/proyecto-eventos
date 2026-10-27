import User from '../models/User.js';

class UsersDao {
  findById(id) {
    return User.findById(id);
  }

  findOne(filter) {
    return User.findOne(filter);
  }

  create(userData) {
    return User.create(userData);
  }

  find(filter = {}) {
    return User.find(filter);
  }

  updateById(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  count(filter = {}) {
    return User.countDocuments(filter);
  }
}

export default new UsersDao();
