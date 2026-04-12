const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario.controller");
const { protect } = require("../middlewares/auth.middleware");

// router.use(protect);

// GET ALL
router.get("/", protect, usuarioController.getUsuarios);

module.exports = router;
