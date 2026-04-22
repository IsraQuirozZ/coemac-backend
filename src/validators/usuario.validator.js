const { body } = require("express-validator");
const { handleValidationErrors } = require("../middleware/handleValidation");

const updateRules = [
  body("nombre")
    .optional().trim()
    .isLength({ min: 2, max: 50 }).withMessage("El nombre debe tener entre 2 y 50 caracteres.")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El nombre solo puede contener letras y espacios."),

  body("apellido")
    .optional().trim()
    .isLength({ min: 2, max: 50 }).withMessage("El apellido debe tener entre 2 y 50 caracteres.")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El apellido solo puede contener letras y espacios."),

  body("username")
    .optional().trim()
    .isLength({ min: 3, max: 20 }).withMessage("El username debe tener entre 3 y 20 caracteres.")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("El username solo puede contener letras, números y guiones bajos."),

  body("empresa")
    .optional({ nullable: true }).trim()
    .isLength({ max: 100 }).withMessage("La empresa no puede superar 100 caracteres."),

  body("telefono")
    .optional({ nullable: true })
    .matches(/^\d{9,12}$/).withMessage("El teléfono debe contener entre 9 y 12 dígitos."),

  body("fechaNacimiento")
    .optional({ nullable: true })
    .isISO8601().withMessage("La fecha de nacimiento debe ser válida.")
    .custom((value) => {
      if (new Date(value) > new Date()) throw new Error("La fecha no puede ser futura.");
      return true;
    }),
];

exports.validateUpdateUsuario = [...updateRules, handleValidationErrors];