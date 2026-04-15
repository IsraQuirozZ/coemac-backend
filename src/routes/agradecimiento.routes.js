const express = require("express");
const router = express.Router();
const agradecimientoController = require("../controllers/agradecimiento.controller");

const {
  validateCreateAgradecimiento,
  validateUpdateAgradecimiento,
} = require("../validators/agradecimiento.validator");

const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

// GET ALL
router.get("/", agradecimientoController.getAgradecimientos);

// GET BY ID
router.get("/:id", agradecimientoController.getAgradecimiento);

// CREATE
router.post(
  "/",
  (req, res, next) => {
    console.log("¡He recibido algo en POST /agradecimientos!");
    console.log("Body recibido:", req.body);
    next();
  },
  
  //validateCreateAgradecimiento,
  agradecimientoController.createAgradecimiento,
);

// UPDATE
router.put("/:id", 
  validateUpdateAgradecimiento,
  agradecimientoController.updateAgradecimiento);

// DELETE
router.delete("/:id", agradecimientoController.deleteAgradecimiento);

module.exports = router;