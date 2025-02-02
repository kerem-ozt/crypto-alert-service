const { User } = require('../models');

class UserRepository {
  async createUser(data) {
    return User.create(data);
  }

  async findUserByEmail(email) {
    return User.findOne({ where: { email } });
  }

  async findUserById(id) {
    return User.findByPk(id);
  }
}

module.exports = new UserRepository();
