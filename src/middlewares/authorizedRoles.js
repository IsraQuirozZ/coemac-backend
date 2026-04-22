const AppError = require("../utils/AppError");

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const userRole = req.user.rol;

    if (!allowedRoles.includes(userRole)) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
};
