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

// LOGIN
router.post("/login", validateLoginUser, authController.login);

// FORGOT PASSWORD
router.post("/forgot-password", validateForgotPassword, authController.forgotPassword);

// RESET PASSWORD
router.post("/reset-password", validateResetPassword, authController.resetPassword);

module.exports = router;
