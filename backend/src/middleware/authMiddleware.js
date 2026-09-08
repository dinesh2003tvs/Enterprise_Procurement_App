const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const AppError = require('../utils/AppError');
const { userRepository } = require('../repositories/userRepository');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('MISSING_TOKEN', 'Authorization token is required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('MISSING_TOKEN', 'Bearer token is missing', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      throw new AppError('INVALID_TOKEN', 'Invalid or expired token', 401);
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User belonging to this token no longer exists', 401);
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate
};

