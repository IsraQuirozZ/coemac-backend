const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const crypto = require("crypto");

const SALT_ROUNDS = 10;

// ── Nodemailer ────────────────────────────────────────────────────────────────
let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    const nodemailer = require("nodemailer");

    // LOG de diagnóstico — eliminar tras confirmar que funciona
    console.log("[SMTP] Configurando transporter con:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      passSet: !!process.env.SMTP_PASS,
    });

    transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT),
      // Puerto 465 → secure: true (SSL directo)
      // Puerto 587 → secure: false (STARTTLS)
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // En Render a veces el certificado del hosting compartido no coincide
      // Si el host es un hosting propio (cPanel, Plesk) esto es necesario
      tls: {
        rejectUnauthorized: false,
      },
      // Timeout explícito — Render puede tardar más en conectar
      connectionTimeout: 10000,
      socketTimeout:     10000,
    });
  }
  return transporter;
};

// ── Función auxiliar de envío con diagnóstico completo ───────────────────────
const sendMail = async (options) => {
  const t = getTransporter();

  // Verifica la conexión antes de enviar — esto aparecerá en los logs de Render
  await t.verify().catch((err) => {
    console.error("[SMTP] Fallo en verify():", err.message, err.code);
    throw new AppError(`Error de conexión SMTP: ${err.message}`, 500);
  });

  const info = await t.sendMail(options);
  console.log("[SMTP] Email enviado:", info.messageId, "→", options.to);
  return info;
};

// ── REGISTER ──────────────────────────────────────────────────────────────────
const register = async ({ nombre, apellido, username, email, password }) => {
  const normalizedEmail    = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  const existingUser = await prisma.usuario.findFirst({
    where: { OR: [{ username: normalizedUsername }, { email: normalizedEmail }] },
  });

  if (existingUser) {
    const message = existingUser.username === normalizedUsername
      ? "Username already in use"
      : "Email already in use";
    throw new AppError(message, 400);
  }

  const hashedPassword      = await bcrypt.hash(password, SALT_ROUNDS);
  const verificationToken   = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 1000 * 60 * 60); // 1h

  const user = await prisma.usuario.create({
    data: {
      nombre,
      apellido,
      username:                  normalizedUsername,
      email:                     normalizedEmail,
      passwordHash:              hashedPassword,
      isVerified:                false, // false hasta que verifique el email
      emailVerificationToken:    verificationToken,
      emailVerificationExpires:  verificationExpires,
    },
  });

  const verifyUrl = `${process.env.APP_DEEP_LINK_URL}/verifyEmail?token=${verificationToken}`;

  // Ahora el error de SMTP se propaga — aparecerá en los logs de Render
  await sendMail({
    from:    `"COEMAC App" <desarrollo@coemacnetworking.com>`,
    to:      user.email,
    subject: "Verifica tu cuenta",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e5e5;border-radius:12px">
        <h2 style="color:#1A5C4B">Hola ${user.nombre},</h2>
        <p>Gracias por registrarte en COEMAC.</p>
        <p>Verifica tu cuenta pulsando el botón:</p>
        <div style="text-align:center">
          <a href="${verifyUrl}"
             style="display:inline-block;margin:20px 0;padding:14px 28px;background:#1A5C4B;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
            Verificar cuenta
          </a>
        </div>
        <p style="color:#888;font-size:13px">El enlace expira en <strong>1 hora</strong>.</p>
      </div>
    `,
  });

  return { message: "Verification email sent. Please check your inbox." };
};

// ── VERIFY EMAIL ──────────────────────────────────────────────────────────────
const verifyEmail = async ({ token }) => {
  if (!token) throw new AppError("Verification token is required", 400);

  const user = await prisma.usuario.findFirst({
    where: { emailVerificationToken: token },
  });

  if (!user)                        throw new AppError("Invalid verification token", 400);
  if (!user.emailVerificationExpires) throw new AppError("Token inválido", 400);
  if (user.emailVerificationExpires < new Date()) throw new AppError("Verification token has expired", 400);
  if (user.isVerified) return { message: "Account already verified", email: user.email };

  await prisma.usuario.update({
    where: { id: user.id },
    data: {
      isVerified:               true,
      emailVerificationToken:   null,
      emailVerificationExpires: null,
    },
  });

  return { message: "Account verified successfully", email: user.email };
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();
  const user = await prisma.usuario.findUnique({ where: { email: normalizedEmail } });

  if (!user) throw new AppError("Invalid credentials", 401);
  if (!user.isVerified) throw new AppError("Please verify your email before logging in.", 403);

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) throw new AppError("Invalid credentials", 401);
  if (!user.activo)   throw new AppError("Tu cuenta está desactivada. Contacta al administrador.", 403);

  return {
    token: generateToken(user),
    user: { id: user.id, nombre: user.nombre, apellido: user.apellido, username: user.username, email: user.email, rol: user.rol },
  };
};

const generateToken = (user) =>
  jwt.sign(
    { userId: user.id, username: user.username, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
const forgotPassword = async ({ identifier }) => {
  const isEmail = identifier.includes("@");
  const user = await prisma.usuario.findFirst({
    where: isEmail ? { email: identifier } : { telefono: identifier },
  });

  if (!user) {
    console.log(`[Security] Reset attempt for unknown identifier: ${identifier}`);
    return;
  }

  const resetToken = jwt.sign(
    { userId: user.id, purpose: "password_reset" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const resetUrl = `${process.env.APP_DEEP_LINK_URL}/resetPassword?token=${resetToken}`;

  if (isEmail) {
    await sendMail({
      from:    `"COEMAC App" <desarrollo@coemacnetworking.com>`,
      to:      user.email,
      subject: "Recuperación de contraseña",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e5e5;border-radius:12px">
          <h2 style="color:#1A5C4B">Hola ${user.nombre},</h2>
          <p>Has solicitado restablecer tu contraseña en COEMAC.</p>
          <p>Pulsa el botón. El enlace expira en <strong>15 minutos</strong>.</p>
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
  }
};

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
const resetPassword = async ({ token, newPassword }) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") throw new AppError("El enlace ha expirado. Solicita uno nuevo.", 400);
    throw new AppError("Enlace inválido.", 400);
  }

  if (decoded.purpose !== "password_reset") throw new AppError("Token no válido para esta operación.", 400);

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.usuario.update({ where: { id: decoded.userId }, data: { passwordHash } });
};

module.exports = { register, verifyEmail, login, forgotPassword, resetPassword };