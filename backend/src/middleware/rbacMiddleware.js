const AppError = require('../utils/AppError');

/**
 * RBAC middleware checking if the authenticated user has one of the allowed roles.
 * @param  {...string} allowedRoles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'FORBIDDEN',
          `Access denied. Role ${req.user.role} does not have permission for this resource.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = {
  authorize
};

