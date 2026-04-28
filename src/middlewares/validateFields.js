const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

const validateFields = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatErrors = errors.array().map((err) => err.msg);

    return next(new AppError("Validation failed", 400, formatErrors));
  }

  next();
};

module.exports = validateFields;
