const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  validateCreateUser,
  validateLoginUser,
  validateForgotPassword,
  validateResetPassword,
} = require("../validators/auth.validator");

const { protect } = require("../middlewares/auth.middleware");

// REGISTER
router.post("/register", validateCreateUser, authController.register);

// VERIFY EMAIL
router.post("/verify-email", authController.verifyEmail);

// LOGIN
router.post("/login", validateLoginUser, authController.login);

// FORGOT PASSWORD
router.post(
  "/forgot-password",
  validateForgotPassword,
  authController.forgotPassword,
);

// RESET PASSWORD
router.post(
  "/reset-password",
  validateResetPassword,
  authController.resetPassword,
);

// GET /api/auth/verify-email?token=xxx
// El email apunta a esta URL HTTPS, el backend redirige al deep link de la app
router.get("/verify-email", authController.verifyEmailRedirect);

// GET /api/auth/reset-password-redirect?token=xxx  
// El email apunta a esta URL HTTPS, el backend redirige al deep link de la app
router.get("/reset-password-redirect", authController.resetPasswordRedirect);

module.exports = router;
