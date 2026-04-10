const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
const register = async ({ nombre, apellido, username, email, password }) => {
  let normalizedEmail = email.trim().toLowerCase();
  let normalizedUsername = username.trim().toLowerCase();

  const existingUser = await prisma.usuario.findFirst({
    where: {
      OR: [{ username: normalizedUsername }, { email: normalizedEmail }],
    },
  });

  if (existingUser) {
    let message = "User already exists";

    if (existingUser.username === normalizedUsername) {
      message = "Username already in use";
    } else if (existingUser.email === normalizedEmail) {
      message = "Email already in use";
    }

    const error = new Error(message);
    error.statusCode = 400;

    throw error;
  }

  const SALT_ROUNDS = 10;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.usuario.create({
    data: {
      nombre,
      apellido,
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash: hashedPassword,
    },
  });

  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    username: user.username,
    email: user.email,
  };
};

// LOGIN
const login = async ({ email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();

  const user = await prisma.usuario.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  const safeUser = {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    username: user.username,
    email: user.email,
    rol: user.rol,
  };

  return {
    user: safeUser,
    token,
  };
};

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      rol: user.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
};

module.exports = {
  register,
  login,
};
