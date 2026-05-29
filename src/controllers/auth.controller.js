const authService = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.body);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await authService.login(req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body);
    res.status(200).json({
      success: true,
      message: "Si la cuenta existe, recibirás un enlace de recuperación.",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body);
    res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente.",
    });
  } catch (error) {
    next(error);
  }
};
 
// GET /api/auth/verify-email?token=xxx
// Redirige al deep link de la app — los emails no pueden abrir coemac-app:// directamente
const verifyEmailRedirect = (req, res) => {
  const { token } = req.query;
 
  if (!token) {
    return res.status(400).send("Token no proporcionado.");
  }
 
  // Redirige al deep link — Android/iOS abrirán la app automáticamente
  const deepLink = `coemac-app://verifyEmail?token=${token}`;
  res.redirect(deepLink);
};
 
// GET /api/auth/reset-password-redirect?token=xxx
const resetPasswordRedirect = (req, res) => {
  const { token } = req.query;
 
  if (!token) {
    return res.status(400).send("Token no proporcionado.");
  }
 
  const deepLink = `coemac-app://resetPassword?token=${token}`;
  res.redirect(deepLink);
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  verifyEmailRedirect,
  resetPasswordRedirect,
};
