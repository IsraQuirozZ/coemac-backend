const { TipoReferencia } = require("@prisma/client");

const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
const telefonoRegex = /^\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==== CREATE ====
const validateCreateReferencia = (req, res, next) => {
  const errors = [];

  const {
    receptorId,
    nombreContacto,
    telefonoContacto,
    emailContacto,
    descripcion,
    tipo,
  } = req.body;

  if (req.body.id || req.body.emisorId) {
    errors.push(
      "ID and Emisor ID are generated automatically and cannot be provided",
    );
  }

  // RECEPTOR ID
  if (!receptorId || typeof receptorId !== "string") {
    errors.push("Receptor ID must be a string");
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
      }
    }
  }

  // RESPUESTA SI HAY ERRORES
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // NORMALIZE
  req.body.receptorId = receptorId.trim();

  req.body.nombreContacto = nombreContacto
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  req.body.telefonoContacto = telefonoContacto
    ? telefonoContacto.trim()
    : undefined;

  req.body.emailContacto = emailContacto
    ? emailContacto.trim().toLowerCase()
    : undefined;

  req.body.descripcion = descripcion ? descripcion.trim() : undefined;

  if (tipo !== undefined) {
    req.body.tipo = tipo.trim().toUpperCase();
  }

  next();
};

// ==== UPDATE ====
const validateUpdateReferencia = (req, res, next) => {
  const errors = [];

  const allowedFields = [
    "receptorId",
    "nombreContacto",
    "telefonoContacto",
    "emailContacto",
    "descripcion",
    "tipo",
  ];

  Object.keys(req.body).forEach((key) => {
    if (!allowedFields.includes(key)) {
      errors.push(`Field "${key}" is not allowed for update`);
    }
  });

  const {
    receptorId,
    nombreContacto,
    telefonoContacto,
    emailContacto,
    descripcion,
    tipo,
  } = req.body;

  if (
    receptorId === undefined &&
    nombreContacto === undefined &&
    telefonoContacto === undefined &&
    emailContacto === undefined &&
    descripcion === undefined &&
    tipo === undefined
  ) {
    errors.push("At least one field must be provided for update");
  }

  // RECEPTOR ID
  if (receptorId !== undefined) {
    if (typeof receptorId !== "string") {
      errors.push("Receptor ID must be a string");
    }
  }

  // NOMBRE CONTACTO
  if (nombreContacto !== undefined) {
    if (
      typeof nombreContacto !== "string" ||
      nombreContacto.trim().length < 3
    ) {
      errors.push(
        "Nombre de contacto must be a string with at least 3 characters",
      );
    } else if (!nombreRegex.test(nombreContacto.trim())) {
      errors.push("Nombre de contacto must contain only letters and spaces");
    }
  }

  // TELEFONO CONTACTO
  if (telefonoContacto !== undefined) {
    if (
      typeof telefonoContacto !== "string" ||
      !telefonoRegex.test(telefonoContacto.trim())
    ) {
      errors.push("Telefono de contacto must be a string with 9 digits");
    }
  }

  // EMAIL CONTACTO
  if (emailContacto !== undefined) {
    if (
      typeof emailContacto !== "string" ||
      !emailRegex.test(emailContacto.trim())
    ) {
      errors.push("Email de contacto must be a valid email address");
    }
  }

  // DESCRIPCION
  if (descripcion !== undefined) {
    if (typeof descripcion !== "string") {
      errors.push("Descripcion must be a string");
    }
  }

  // TIPO
  if (tipo !== undefined) {
    if (typeof tipo !== "string") {
      errors.push("Tipo must be a string");
    } else {
      const normalizedTipo = tipo.trim().toUpperCase();

      if (!Object.values(TipoReferencia).includes(normalizedTipo)) {
        errors.push("Invalid tipoReferencia value");
      }
    }
  }

  // RESPUESTA SI HAY ERRORES
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // NORMALIZE
  if (receptorId !== undefined) {
    req.body.receptorId = receptorId.trim();
  }

  if (nombreContacto !== undefined) {
    req.body.nombreContacto = nombreContacto
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  if (telefonoContacto !== undefined) {
    req.body.telefonoContacto = telefonoContacto.trim();
  }

  if (emailContacto !== undefined) {
    req.body.emailContacto = emailContacto.trim().toLowerCase();
  }

  if (descripcion !== undefined) {
    req.body.descripcion = descripcion.trim();
  }

  if (tipo !== undefined) {
    req.body.tipo = tipo.trim().toUpperCase();
  }

  next();
};

module.exports = {
  validateCreateReferencia,
  validateUpdateReferencia,
};
