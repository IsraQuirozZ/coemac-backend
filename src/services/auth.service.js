const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

// Configuración global de seguridad
const SALT_ROUNDS = 10;

// ── Nodemailer (lazy init) ──────────────────────────────────────────────────
let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    const nodemailer = require("nodemailer");
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

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
    throw new AppError(message, 400);
  }

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
    throw new AppError("Invalid credentials", 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      username: user.username,
      email: user.email,
      rol: user.rol,
    },
    token,
  };
};

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
};

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
const forgotPassword = async ({ identifier }) => {
  const isEmail = identifier.includes("@");

  const user = await prisma.usuario.findFirst({
    where: isEmail ? { email: identifier } : { telefono: identifier },
  });

  if (!user) {
    console.log(
      `[Security] Reset attempt for unknown identifier: ${identifier}`,
    );
    return; // Retorno silencioso
  }

  const resetToken = jwt.sign(
    { userId: user.id, purpose: "password_reset" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const resetUrl = `${process.env.APP_DEEP_LINK_URL}?token=${resetToken}`;

  try {
    if (isEmail) {
      await getTransporter().sendMail({
        from: `"COEMAC App" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Recuperación de contraseña",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e5e5;border-radius:12px">
            <h2 style="color:#1A5C4B">Hola ${user.nombre},</h2>
            <p>Has solicitado restablecer tu contraseña en COEMAC.</p>
            <p>Pulsa el botón para crear una nueva. El enlace expira en <strong>15 minutos</strong>.</p>
            <div style="text-align:center">
                <a href="${resetUrl}"
                   style="display:inline-block;margin:20px 0;padding:14px 28px;background:#1A5C4B;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
                  Restablecer contraseña
                </a>
            </div>
            <p style="color:#888;font-size:13px">Si no solicitaste este cambio, ignora este correo.</p>
          </div>
        `,
      });
      console.log(`✅ Email de recuperación enviado a: ${user.email}`);
    }
    // Aquí podrías añadir el bloque de Twilio para SMS si identifier no tiene @
  } catch (err) {
    console.error(
      "[Auth] Error enviando mensaje de recuperación:",
      err.message,
    );
  }
};

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
const resetPassword = async ({ token, newPassword }) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError")
      throw new AppError("El enlace ha expirado. Solicita uno nuevo.", 400);
    throw new AppError("Enlace inválido.", 400);
  }

  if (decoded.purpose !== "password_reset")
    throw new AppError("Token no válido para esta operación.", 400);

  // Ahora SALT_ROUNDS está disponible globalmente en el archivo
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.usuario.update({
    where: { id: decoded.userId },
    data: { passwordHash },
  });

  // console.log(`✅ Contraseña actualizada para el usuario ID: ${decoded.userId}`);
  return;
};

module.exports = { register, login, forgotPassword, resetPassword };
