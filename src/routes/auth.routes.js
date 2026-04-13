const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  validateCreateUser,
  validateLoginUser,
} = require("../validators/auth.validator");

const { protect } = require("../middlewares/auth.middleware");

// REGISTER
router.post("/register", validateCreateUser, authController.register);

// LOGIN
router.post("/login", validateLoginUser, authController.login);

module.exports = router;
