const { validationResult } = require("express-validator");

// Middleware final de cada validator — devuelve todos los errores juntos
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });
  next();
};

module.exports = { handleValidationErrors };