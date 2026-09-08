const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const AppError = require('../utils/AppError');
const { userRepository } = require('../repositories/userRepository');

class AuthService {
  async login(email, password) {
    if (!email || !password) {
      throw new AppError('VALIDATION_ERROR', 'Email and password are required', 400);
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // JWT Payload matching Phase 2 §15: userId, name, email, role, department
    const payload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }
    const { passwordHash, ...userProfile } = user;
    return userProfile;
  }
}

const authService = new AuthService();

module.exports = {
  authService,
  AuthService
};
