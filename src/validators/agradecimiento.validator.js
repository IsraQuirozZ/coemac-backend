const { body } = require("express-validator");
const { handleValidationErrors } = require("../middleware/handleValidation");

// ── Reglas CREATE (todos requeridos) ──────────────────────────────────────────
const createRules = [
  body("emisorId").notEmpty().withMessage("El emisor es requerido."),
  body("receptorId").notEmpty().withMessage("El receptor es requerido."),
  body("nombreContacto")
    .trim()
    .isLength({ min: 3 }).withMessage("El nombre debe tener al menos 3 caracteres.")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El nombre solo puede contener letras y espacios."),
  body("importe")
    .isFloat({ gt: 0 }).withMessage("El importe debe ser un número mayor que 0."),
  body("referenciaId")
    .optional({ nullable: true })
    .isUUID().withMessage("El ID de referencia no es válido."),
];

// ── Reglas UPDATE (todos opcionales, solo se validan si llegan) ───────────────
const updateRules = [
  body("nombreContacto")
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage("El nombre debe tener al menos 3 caracteres.")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El nombre solo puede contener letras y espacios."),
  body("importe")
    .optional()
    .isFloat({ gt: 0 }).withMessage("El importe debe ser un número mayor que 0."),
  body("referenciaId")
    .optional({ nullable: true })
    .isUUID().withMessage("El ID de referencia no es válido."),
];

exports.validateCreateAgradecimiento = [...createRules, handleValidationErrors];
exports.validateUpdateAgradecimiento = [...updateRules, handleValidationErrors];