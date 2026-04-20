const { body } = require("express-validator");
const { handleValidationErrors } = require("../middleware/handleValidation");

// ── Reglas CREATE (Se mantienen estrictas, esto está perfecto) ────────────────
const createRules = [
  body("asunto")
    .trim()
    .notEmpty().withMessage("El asunto es requerido.")
    .isLength({ min: 5, max: 100 }).withMessage("El asunto debe tener entre 5 y 100 caracteres."),
  body("descripcion")
    .trim()
    .notEmpty().withMessage("La descripción es requerida.")
    .isLength({ min: 10 }).withMessage("La descripción debe tener al menos 10 caracteres."),
  body("fechaIncidencia")
    .notEmpty().withMessage("La fecha de la incidencia es requerida.")
    .isISO8601().withMessage("La fecha debe ser válida.")
];

// ── Reglas UPDATE CORREGIDAS (Flexibilidad para actualizar estado) ──────────
const updateRules = [
  body("asunto")
    .optional() // Cambiado a opcional para que no bloquee si solo cambias el estado
    .trim()
    .isLength({ min: 5, max: 100 }).withMessage("El asunto debe tener entre 5 y 100 caracteres."),
  
  body("descripcion")
    .optional() // Cambiado a opcional
    .trim()
    .isLength({ min: 10 }).withMessage("La descripción debe tener al menos 10 caracteres."),
  
  body("estado")
    .optional()
    .isIn(["PENDIENTE", "RESUELTA"]).withMessage("El estado solo puede ser PENDIENTE o RESUELTA."),
  
  body("fechaIncidencia")
    .optional() // Cambiado a opcional
    .isISO8601().withMessage("La fecha debe ser válida.")
];

exports.validateCreateIncidencia = [...createRules, handleValidationErrors];
exports.validateUpdateIncidencia = [...updateRules, handleValidationErrors];