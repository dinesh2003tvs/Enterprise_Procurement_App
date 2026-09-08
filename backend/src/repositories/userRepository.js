const { dbStore } = require('../config/db');

class UserRepository {
  async findByEmail(email) {
    return dbStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findById(id) {
    return dbStore.users.find(u => u.id === id) || null;
  }

  async create(userData) {
    const newUser = {
      id: userData.id || `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      passwordHash: userData.passwordHash,
      role: userData.role,
      department: userData.department,
      createdAt: new Date()
    };
    dbStore.users.push(newUser);
    return newUser;
  }

  async findAll() {
    return dbStore.users.map(({ passwordHash, ...userWithoutPassword }) => userWithoutPassword);
  }
}

const userRepository = new UserRepository();

module.exports = {
  userRepository,
  UserRepository
};
