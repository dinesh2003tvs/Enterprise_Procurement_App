const { prisma } = require('../config/prisma');
const { dbStore } = require('../config/db');

class UserRepository {
  async findByEmail(email) {
    if (!email) return null;
    try {
      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      });
      if (user) return user;
    } catch (err) {
      console.warn('[UserRepository.findByEmail] DB fallback:', err.message);
    }
    return dbStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findById(id) {
    if (!id) return null;
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });
      if (user) return user;
    } catch (err) {
      console.warn('[UserRepository.findById] DB fallback:', err.message);
    }
    return dbStore.users.find(u => u.id === id) || null;
  }

  async create(userData) {
    const id = userData.id || `usr-${Date.now()}`;
    try {
      const user = await prisma.user.create({
        data: {
          id,
          name: userData.name,
          email: userData.email,
          passwordHash: userData.passwordHash,
          role: userData.role,
          department: userData.department
        }
      });
      return user;
    } catch (err) {
      console.warn('[UserRepository.create] DB fallback:', err.message);
      const newUser = {
        id,
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
  }

  async findAll() {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, department: true, createdAt: true }
      });
      if (users && users.length > 0) return users;
    } catch (err) {
      console.warn('[UserRepository.findAll] DB fallback:', err.message);
    }
    return dbStore.users.map(({ passwordHash, ...u }) => u);
  }
}

const userRepository = new UserRepository();

module.exports = {
  userRepository,
  UserRepository
};
