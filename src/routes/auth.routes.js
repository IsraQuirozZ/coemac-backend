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

// RUTA PROTEGIDA DE PRUEBA
router.get("/me", protect, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

module.exports = router;
