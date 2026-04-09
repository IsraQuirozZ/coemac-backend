const { body } = require("express-validator");
const { handleValidationErrors } = require("../middleware/handleValidation");

// Reglas compartidas para crear un agradecimiento
const validateCreateAgradecimiento = [
  body("emisorId").notEmpty().withMessage("El emisor es requerido."),

  body("receptorId").notEmpty().withMessage("El receptor es requerido."),

  body("nombreContacto")
    .trim()
    .isLength({ min: 3 })
    .withMessage("El nombre del contacto debe tener al menos 3 caracteres.")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios."),

  body("importe")
    .isFloat({ gt: 0 })
    .withMessage("El importe debe ser un número mayor que 0."),
    
  body("referenciaId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("El ID de referencia no es válido."),
];

exports.validateCreateAgradecimiento = [
  ...validateCreateAgradecimiento,
  handleValidationErrors,
];