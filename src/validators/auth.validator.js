const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
const usernameRegex = /^[a-zA-Z0-9_]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const validateCreateUser = (req, res, next) => {
  const errors = [];

  const allowedFields = ["nombre", "apellido", "username", "email", "password"];

  if (
    Object.keys(req.body).forEach((key) => {
      if (!allowedFields.includes(key)) {
        errors.push(`Field "${key}" is not allowed`);
      }
    })
  );

  const { nombre, apellido, username, email, password } = req.body;

  const nombreTrimmed = nombre?.trim();
  const apellidoTrimmed = apellido?.trim();
  const usernameTrimmed = username?.trim().toLowerCase();
  const emailTrimmed = email?.trim().toLowerCase();

  // NOMBRE
  if (!nombreTrimmed || typeof nombre !== "string") {
    errors.push("Nombre is required and must be a string");
  } else if (nombreTrimmed.length < 3 || nombreTrimmed.length > 50) {
    errors.push("Nombre must be between 3 and 50 characters long");
  } else if (!nombreRegex.test(nombreTrimmed)) {
    errors.push("Nombre must contain only letters and spaces");
  }

  // APELLIDO
  if (!apellidoTrimmed || typeof apellido !== "string") {
    errors.push("Apellido is required and must be a string");
  } else if (apellidoTrimmed.length < 3 || apellidoTrimmed.length > 50) {
    errors.push("Apellido must be between 3 and 50 characters long");
  } else if (!nombreRegex.test(apellidoTrimmed)) {
    errors.push("Apellido must contain only letters and spaces");
  }

  // USERNAME
  if (!usernameTrimmed || typeof usernameTrimmed !== "string") {
    errors.push("Username is required and must be a string");
  } else if (usernameTrimmed.length < 3 || usernameTrimmed.length > 20) {
    errors.push("Username must be between 3 and 20 characters long");
  } else if (!usernameRegex.test(usernameTrimmed)) {
    errors.push("Username must contain only letters, numbers and underscores");
  }

  // EMAIL
  if (!emailTrimmed || typeof emailTrimmed !== "string") {
    errors.push("Email is required and must be a string");
  } else if (emailTrimmed.length > 100) {
    errors.push("Email must be less than 100 characters long");
  } else if (!emailRegex.test(emailTrimmed)) {
    errors.push("Email must be a valid email address");
  }

  // PASSWORD
  if (!password || typeof password !== "string") {
    errors.push("Password is required and must be a string");
  } else if (!passwordRegex.test(password)) {
    errors.push(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // NORMALIZE
  req.body.nombre =
    nombreTrimmed.charAt(0).toUpperCase() +
    nombreTrimmed.slice(1).toLowerCase();

  req.body.apellido =
    apellidoTrimmed.charAt(0).toUpperCase() +
    apellidoTrimmed.slice(1).toLowerCase();

  req.body.username = usernameTrimmed;
  req.body.email = emailTrimmed;

  next();
};

// LOGIN
const validateLoginUser = (req, res, next) => {
  const errors = [];

  const { email, password } = req.body;
  const emailTrimmed = email?.trim().toLowerCase();

  if (!emailTrimmed || typeof email !== "string") {
    errors.push("Email is required and must be a string");
  } else if (emailTrimmed.length > 100) {
    errors.push("Email must be less than 100 characters long");
  } else if (!emailRegex.test(emailTrimmed)) {
    errors.push("Email must be a valid email address");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // NORMALIZE
  req.body.email = emailTrimmed;

  next();
};

module.exports = {
  validateCreateUser,
  validateLoginUser,
};
