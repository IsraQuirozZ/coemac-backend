const prisma  = require("../config/prisma");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const crypto  = require("crypto");

const SALT_ROUNDS = 10;

// ── Resend API HTTP (no SMTP) ─────────────────────────────────────────────────
// Render bloquea SMTP saliente. Usamos la API REST de Resend sobre HTTPS (443)
// que Render sí permite. No necesita nodemailer.
const sendMail = async ({ to, subject, html }) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      from:    "COEMAC App <desarrollo@coemacnetworking.com>",
      to,
      subject,
      html,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("[Resend] Error:", data);
    throw new AppError(`Error enviando email: ${data.message || res.status}`, 500);
  }

  console.log("[Resend] Email enviado a:", to, "→ id:", data.id);
  return data;
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
      username:                 normalizedUsername,
      email:                    normalizedEmail,
      passwordHash:             hashedPassword,
      isVerified:               false,
      emailVerificationToken:   verificationToken,
      emailVerificationExpires: verificationExpires,
    },
  });

const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;
  await sendMail({
    to:      user.email,
    subject: "Verifica tu cuenta",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e5e5;border-radius:12px">
        <h2 style="color:#1A5C4B">Hola ${user.nombre},</h2>
        <p>Gracias por registrarte en COEMAC.</p>
        <p>Verifica tu cuenta pulsando el botón:</p>
        <div style="text-align:center">
          <a href="${verifyUrl}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#1A5C4B;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
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

  if (!user)                          throw new AppError("Invalid verification token", 400);
  if (!user.emailVerificationExpires) throw new AppError("Token inválido", 400);
  if (user.emailVerificationExpires < new Date()) throw new AppError("Verification token has expired", 400);
  if (user.isVerified) return { message: "Account already verified", email: user.email };

  await prisma.usuario.update({
    where: { id: user.id },
    data: { isVerified: true, emailVerificationToken: null, emailVerificationExpires: null },
  });

  return { message: "Account verified successfully", email: user.email };
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();
  const user = await prisma.usuario.findUnique({ where: { email: normalizedEmail } });

  if (!user)             throw new AppError("Invalid credentials", 401);
  if (!user.isVerified)  throw new AppError("Please verify your email before logging in.", 403);

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch)    throw new AppError("Invalid credentials", 401);
  if (!user.activo)      throw new AppError("Tu cuenta está desactivada. Contacta al administrador.", 403);

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
      to:      user.email,
      subject: "Recuperación de contraseña",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e5e5;border-radius:12px">
          <h2 style="color:#1A5C4B">Hola ${user.nombre},</h2>
          <p>Has solicitado restablecer tu contraseña en COEMAC.</p>
          <p>Pulsa el botón. El enlace expira en <strong>15 minutos</strong>.</p>
          <div style="text-align:center">
            <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#1A5C4B;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
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