const express = require("express");
const router = express.Router();
const incidenciasController = require("../controllers/incidencias.controller");

const {
  validateCreateIncidencia,
  validateUpdateIncidencia,
} = require("../validators/incidencias.validator");

const { protect } = require("../middlewares/auth.middleware");

// Protegemos todas las rutas de este router
router.use(protect);

// GET ALL
router.get("/", incidenciasController.getIncidencias);

// GET BY ID
router.get("/:id", incidenciasController.getIncidencia);

// CREATE
router.post(
  "/",
  validateCreateIncidencia,
  incidenciasController.createIncidencia
);

// UPDATE
router.put(
  "/:id",
  validateUpdateIncidencia,
  incidenciasController.updateIncidencia
);

// DELETE
router.delete("/:id", incidenciasController.deleteIncidencia);

module.exports = router;