const { body } = require("express-validator");
const { handleValidationErrors } = require("../middleware/handleValidation"); // Ajusta la ruta si es necesario

// ── Reglas CREATE ──────────────────────────────────────────
const createRules = [
  body("asunto")
    .trim()
    .notEmpty().withMessage("El asunto es requerido.")
    .isLength({ min: 5, max: 100 }).withMessage("El asunto debe tener entre 5 y 100 caracteres."),
  body("descripcion")
    .trim()
    .notEmpty().withMessage("La descripción es requerida.")
    .isLength({ min: 10 }).withMessage("La descripción debe tener al menos 10 caracteres."),
  // El usuarioId lo saca el backend del token, no se valida aquí.
  // El estado por defecto es PENDIENTE (lo hace Prisma).
];

// ── Reglas UPDATE ──────────────────────────────────────────
const updateRules = [
  body("asunto")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 }).withMessage("El asunto debe tener entre 5 y 100 caracteres."),
  body("descripcion")
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage("La descripción debe tener al menos 10 caracteres."),
  body("estado")
    .optional()
    .isIn(["PENDIENTE", "RESUELTA"]).withMessage("El estado solo puede ser PENDIENTE o RESUELTA."),
];

exports.validateCreateIncidencia = [...createRules, handleValidationErrors];
exports.validateUpdateIncidencia = [...updateRules, handleValidationErrors];