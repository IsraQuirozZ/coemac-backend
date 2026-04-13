const express = require("express");
const router = express.Router();
const referenciaController = require("../controllers/referencia.controller");
const {
  validateCreateReferencia,
  validateUpdateReferencia,
} = require("../validators/referencia.validator");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

// GET ALL
router.get("/", referenciaController.getReferencias);

// GET BY ID
router.get("/:id", referenciaController.getReferencia);

// CREATE
router.post(
  "/",
  validateCreateReferencia,
  referenciaController.createReferencia,
);

// UPDATE
router.put(
  "/:id",
  validateUpdateReferencia,
  referenciaController.updateReferencia,
);

// DELETE
router.delete("/:id", referenciaController.deleteReferencia);

module.exports = router;
