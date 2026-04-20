const  prisma  = require("../config/prisma.js");

// Relaciones que se incluyen en todas las queries
const include = {
  emisor:    { select: { id: true, nombre: true, email: true } },
  receptor:  { select: { id: true, nombre: true, email: true } },
  referencia: { select: { id: true } },
};

// Obtiene agradecimientos filtrando según la dirección (Recibidos/Enviados)
const getAll = ({ userId, direction } = {}) => {
  let where = {};

  if (userId) {
    if (direction === "recibidos") {
      where = { receptorId: userId };
    } else if (direction === "enviados") {
      where = { emisorId: userId };
    } else {
      where = {
        OR: [
          { emisorId: userId },
          { receptorId: userId }
        ]
      };
    }
  }
  return prisma.agradecimiento.findMany({
    where,
    include,
    orderBy: { createdAt: "desc" },
  });
};

// Obtiene un agradecimiento por ID — lanza error si no existe
const getById = async (id) => {
  const agradecimiento = await prisma.agradecimiento.findUnique({ where: { id }, include });
  if (!agradecimiento) throw { status: 404, message: "Agradecimiento no encontrado." };
  return agradecimiento;
};

// Crea un nuevo agradecimiento
const create = async (data) => {
  try {
    // Si viene referenciaId, validamos consistencia
    if (data.referenciaId) {
      const referencia = await prisma.referencia.findUnique({
        where: { id: data.referenciaId }
      });

      if (!referencia) {
        throw { status: 400, message: "La referencia no existe." };
      }

      // Validar emisorId y receptorId
      const expectedEmisor = referencia.receptorId;
      const expectedReceptor = referencia.emisorId;
      // Normalización para comparación de nombres (ignora mayúsculas, acentos y espacios)
      const normalize = (str) =>
        str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();


      if (data.emisorId !== expectedEmisor) {
        throw {
          status: 400,
          message: "El emisorId no coincide con la referencia proporcionada."
        };
      }

      if (data.receptorId !== expectedReceptor) {
        throw {
          status: 400,
          message: "El receptorId no coincide con la referencia proporcionada."
        };
      }

      // Validar nombreContacto
      if (normalize(data.nombreContacto) !== normalize(referencia.nombreContacto)) {
        throw {
          status: 400,
          message: "El nombre de contacto no coincide con la referencia proporcionada."
        };
      }
    }

    // Crear agradecimiento
    return await prisma.agradecimiento.create({
      data: {
        emisorId: data.emisorId,
        receptorId: data.receptorId,
        nombreContacto: data.nombreContacto,
        importe: data.importe,
        ...(data.referenciaId && { referenciaId: data.referenciaId }),
        fechaNegocio: data.fechaNegocio || new Date(), 
      },
      include,
    });

  } catch (err) {

    if (err.code === "P2003") {
      const constraint =
        err.meta?.driverAdapterError?.cause?.constraint?.index || "";

      if (constraint.includes("emisorId"))
        throw { status: 400, message: "El emisor no existe." };

      if (constraint.includes("receptorId"))
        throw { status: 400, message: "El receptor no existe." };

      if (constraint.includes("referenciaId"))
        throw { status: 400, message: "La referencia no existe." };

      throw { status: 400, message: "Error de integridad referencial." };
    }

    throw err;
  }
};

// Actualiza campos editables de un agradecimiento existente
const update = async (id, data) => {
  // Garantiza que el agradecimiento existe
  const agradecimientoActual = await getById(id);

  // Si viene referenciaId, validamos consistencia
  if (data.referenciaId) {
    const referencia = await prisma.referencia.findUnique({
      where: { id: data.referenciaId }
    });

    if (!referencia) {
      throw { status: 400, message: "La referencia no existe." };
    }

      // Normalización para comparación de nombres (ignora mayúsculas, acentos y espacios)
    const normalize = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

    // Valores esperados según la referencia
    const expectedEmisor = referencia.receptorId;
    const expectedReceptor = referencia.emisorId;
    const expectedNombre = referencia.nombreContacto;

    // Validar emisorId
    if (data.emisorId && data.emisorId !== expectedEmisor) {
      throw {
        status: 400,
        message: "El emisorId no coincide con la referencia proporcionada."
      };
    }

    // Validar receptorId
    if (data.receptorId && data.receptorId !== expectedReceptor) {
      throw {
        status: 400,
        message: "El receptorId no coincide con la referencia proporcionada."
      };
    }

    // Validar nombreContacto
    if (
      data.nombreContacto &&
      normalize(data.nombreContacto) !== normalize(expectedNombre)
    ) {
      throw {
        status: 400,
        message: "El nombre de contacto no coincide con la referencia proporcionada."
      };
    }
  }


  return prisma.agradecimiento.update({
    where: { id },
    data: {
      ...(data.nombreContacto && { nombreContacto: data.nombreContacto }),
      ...(data.importe        && { importe: data.importe }),
      ...(data.referenciaId   && { referenciaId: data.referenciaId }),
      ...(data.emisorId       && { emisorId: data.emisorId }),
      ...(data.receptorId     && { receptorId: data.receptorId }),
      ...(data.fechaNegocio   && { fechaNegocio: data.fechaNegocio }),
    },
    include,
  });
};


const remove = async (id, userId) => {
  const agradecimiento = await prisma.agradecimiento.findFirst({
    where: { id, emisorId: userId },
  });

  if (!agradecimiento) {
    const error = new Error("Agradecimiento not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.agradecimiento.delete({
    where: { id },
  });
};


module.exports = { getAll, getById, create, update, remove };