const { body } = require("express-validator");
const { EstadoReunion } = require("@prisma/client");

const createReunionValidator = [
  // CAMPOS PROHIBIDOS
  body("id").not().exists().withMessage("Id is generated automatically"),
  body("creadorId").not().exists().withMessage("Creador ID comes from auth"),

  //  INVITADO ID
  body("invitadoId")
    .notEmpty()
    .withMessage("invitado ID is required")
    .isUUID()
    .withMessage("invitado ID must be a valid UUID"),

  // FECHA
  body("fecha")
    .notEmpty()
    .withMessage("Fecha is required")
    .isISO8601()
    .withMessage("Fecha must be a valid ISO 8601 date")
    .custom((value) => {
      const fecha = new Date(value);
      const now = new Date();
      if (fecha > now) {
        throw new Error("Fecha cannot be in the future");
      }
      return true;
    })
    .toDate(),

  // DESCRIPCION (opcional)
  body("descripcion")
    .optional()
    .isString()
    .withMessage("Descripcion must be a string")
    .isLength({ min: 10, max: 255 })
    .withMessage("Descripcion must be between 10 and 255 characters")
    .trim(),

  // NO REUNIONES CONTIGO MISMO (Se refuerza en el service)
  body("invitadoId").custom((value, { req }) => {
    if (value === req.user.userId) {
      throw new Error("You cannot invite yourself to a meeting");
    }
    return true;
  }),
];

// UPDATE
const updateReunionValidator = [
  body().custom((value) => {
    if (Object.keys(value).length === 0) {
      throw new Error("At least one field must be provided");
    }
    return true;
  }),

  // CAMPOS PROHIBIDOS
  body("id").not().exists().withMessage("Id must not be provided"),
  body("creadorId").not().exists().withMessage("Creador ID comes from auth"),

  // INVITADO ID (opcional)
  body("invitadoId")
    .optional()
    .isUUID()
    .withMessage("invitado ID must be a valid UUID"),

  // FECHA (opcional)
  body("fecha")
    .optional()
    .isISO8601()
    .withMessage("Fecha must be a valid ISO 8601 date")
    .custom((value) => {
      const fecha = new Date(value);
      const now = new Date();
      if (fecha > now) {
        throw new Error("Fecha cannot be in the future");
      }
      return true;
    })
    .toDate(),

  // DESCRIPCION (opcional)
  body("descripcion")
    .optional()
    .isString()
    .withMessage("Descripcion must be a string")
    .isLength({ min: 10, max: 255 })
    .withMessage("Descripcion must be between 10 and 255 characters")
    .trim(),

  // ESTADO (opcional)
  body("estado")
    .optional()
    .isString()
    .toUpperCase()
    .isIn([EstadoReunion.REALIZADA, EstadoReunion.CANCELADA])
    .withMessage("Estado must be one of REALIZADA, CANCELADA"),
];

module.exports = {
  createReunionValidator,
  updateReunionValidator,
};
