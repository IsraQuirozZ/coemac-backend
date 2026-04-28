const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/usuario.controller");
const { validateUpdateUsuario } = require("../validators/usuario.validator");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/",    controller.getUsuarios);   // GET  /api/usuarios       → lista (para pickers de miembros)
router.get("/me",  controller.getMe);         // GET  /api/usuarios/me    → perfil propio
router.put("/me",  validateUpdateUsuario, controller.updateMe); // PUT  /api/usuarios/me    → editar perfil
router.get("/:id", controller.getUsuario);    // GET  /api/usuarios/:id   → perfil de otro usuario

module.exports = router;