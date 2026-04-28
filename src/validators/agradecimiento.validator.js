const { body } = require("express-validator");
const { handleValidationErrors } = require("../middleware/handleValidation");

// ── Reglas CREATE (todos requeridos) ──────────────────────────────────────────
const createRules = [
body("emisorId")
  .not().exists().withMessage("El emisor se asignará automáticamente según el usuario autenticado."),
  body("receptorId")
    .notEmpty().withMessage("El receptor es requerido.")
    .isUUID().withMessage("El receptorId debe ser un UUID válido."),
  body("nombreContacto")
    .trim()
    .isLength({ min: 3 }).withMessage("El nombre debe tener al menos 3 caracteres.")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El nombre solo puede contener letras y espacios."),
  body("importe")
    .customSanitizer((value) => parseFloat(value))
    .isFloat({ gt: 0 }).withMessage("El importe debe ser un número mayor que 0."),
  body("referenciaId")
    .optional({ nullable: true })
    .isUUID().withMessage("El ID de referencia no es válido/existe."),
  body("fechaNegocio")
  .notEmpty().withMessage("La fecha del negocio es requerida.")
  .isISO8601().withMessage("La fecha debe ser válida.")
    
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
    .customSanitizer((value) => parseFloat(value))
    .isFloat({ gt: 0 }).withMessage("El importe debe ser un número mayor que 0."),
  body("referenciaId")
    .optional({ nullable: true })
    .isUUID().withMessage("El ID de referencia no es válido."),
  body("fechaNegocio")
  .notEmpty().withMessage("La fecha del negocio es requerida.")
  .isISO8601().withMessage("La fecha debe ser válida.")
];

exports.validateCreateAgradecimiento = [...createRules, handleValidationErrors];
exports.validateUpdateAgradecimiento = [...updateRules, handleValidationErrors];