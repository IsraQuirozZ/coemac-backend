const { TipoReferencia } = require("@prisma/client");

const validateCreateReferencia = (req, res, next) => {
  const errors = [];

  const nombreRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
  const telefonoRegex = /^\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (req.body.id) {
    errors.push("Referencia ID must not be provided");
  }

  const {
    emisorId,
    receptorId,
    nombreContacto,
    telefonoContacto,
    emailContacto,
    descripcion,
    tipo,
  } = req.body;

  // EMISOR ID
  if (!emisorId || typeof emisorId !== "string") {
    errors.push("Emisor ID must be a string");
  }

  // RECEPTOR ID
  if (!receptorId || typeof receptorId !== "string") {
    errors.push("Receptor ID must be a string");
  }

  // REGLA DE NEGOCIO
  if (emisorId && receptorId && emisorId === receptorId) {
    errors.push("No puedes enviarte una referencia a ti mismo");
  }

  // NOMBRE CONTACTO
  if (
    !nombreContacto ||
    typeof nombreContacto !== "string" ||
    nombreContacto.trim().length < 3
  ) {
    errors.push(
      "Nombre de contacto must be a string with at least 3 characters",
    );
  } else if (!nombreRegex.test(nombreContacto.trim())) {
    errors.push("Nombre de contacto must contain only letters and spaces");
  } else {
    req.body.nombreContacto = nombreContacto.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }

  // TELEFONO CONTACTO (opcional)
  if (telefonoContacto !== undefined) {
    if (typeof telefonoContacto !== "string") {
      errors.push("Telefono de contacto must be a string");
    } else if (!telefonoRegex.test(telefonoContacto.trim())) {
      errors.push("Telefono de contacto must have 9 digits");
    }
  }

  // EMAIL CONTACTO (opcional)
  if (emailContacto !== undefined) {
    if (typeof emailContacto !== "string") {
      errors.push("Email de contacto must be a string");
    } else if (!emailRegex.test(emailContacto.trim())) {
      errors.push("Email de contacto must be a valid email address");
    }
  }

  // DESCRIPCION (opcional)
  if (descripcion !== undefined && typeof descripcion !== "string") {
    errors.push("Descripcion must be a string");
  }

  // TIPO (opcional con default en DB)
  if (tipo !== undefined) {
    if (typeof tipo !== "string") {
      errors.push("Tipo must be a string");
    } else {
      const normalizedTipo = tipo.trim().toUpperCase();

      if (!Object.values(TipoReferencia).includes(normalizedTipo)) {
        errors.push("Invalid tipoReferencia value");
      } else {
        req.body.tipo = normalizedTipo;
      }
    }
  }

  // RESPUESTA FINAL
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateCreateReferencia,
};
