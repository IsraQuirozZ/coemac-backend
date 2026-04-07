const express = require("express");
const router = express.Router();
const referenciaController = require("../controllers/referencia.controller");
const {
  validateCreateReferencia,
} = require("../validators/referencia.validator");

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
router.put("/:id", referenciaController.updateReferencia);

// DELETE
router.delete("/:id", referenciaController.deleteReferencia);

module.exports = router;
