const prisma = require("../config/prisma.js");
const AppError = require("../utils/AppError.js");

const include = {
  emisor: { select: { id: true, nombre: true, apellido: true, email: true } },
  receptor: { select: { id: true, nombre: true, apellido: true, email: true } },
  referencia: { select: { id: true } },
};

// Sin direction → trae todos los del usuario (enviados + recibidos)
const getAll = ({
  userId,
  isAdmin = false,
  direction,
  page = 1,
  limit = 10,
} = {}) => {
  let where = {};

  if (!isAdmin) {
    if (direction === "recibidos") {
      where = { receptorId: userId };
    } else if (direction === "enviados") {
      where = { emisorId: userId };
    } else {
      // Sin filtro → todos donde el user es emisor O receptor
      where = {
        OR: [{ emisorId: userId }, { receptorId: userId }],
      };
    }
  }

  return prisma.agradecimiento.findMany({
    where,
    include,
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id, userId, isAdmin = false) => {
  const agradecimiento = await prisma.agradecimiento.findFirst({
    where: isAdmin
      ? { id }
      : {
          id,
          OR: [{ emisorId: userId }, { receptorId: userId }],
        },
    include,
  });

  if (!agradecimiento) {
    throw { status: 404, message: "Agradecimiento no encontrado." };
  }

  if (!isAdmin) {
    if (
      agradecimiento.emisorId !== userId &&
      agradecimiento.receptorId !== userId
    ) {
      throw {
        status: 403,
        message: "Acceso no autorizado a este agradecimiento.",
      };
    }
  }
  return agradecimiento;
};

const create = async (data) => {
  try {
    if (data.emisorId === data.receptorId) {
      throw {
        status: 400,
        message: "No puedes enviarte un agradecimiento a ti mismo.",
      };
    }

    if (data.referenciaId) {
      const referencia = await prisma.referencia.findUnique({
        where: { id: data.referenciaId },
      });
      if (!referencia)
        throw { status: 400, message: "La referencia no existe." };

      const normalize = (s) =>
        s
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .toLowerCase();

      if (data.emisorId !== referencia.receptorId)
        throw {
          status: 400,
          message: "El emisorId no coincide con la referencia.",
        };

      if (data.receptorId !== referencia.emisorId)
        throw {
          status: 400,
          message: "El receptorId no coincide con la referencia.",
        };
      if (
        normalize(data.nombreContacto) !== normalize(referencia.nombreContacto)
      )
        throw {
          status: 400,
          message: "El nombre de contacto no coincide con la referencia.",
        };
    }

    const receptor = await prisma.usuario.findUnique({
      where: { id: data.receptorId },
    });

    if (receptor.activo === false) {
      throw new AppError(
        "Cannot send an agradecimiento to an inactive user",
        400,
      );
    }

    return await prisma.agradecimiento.create({
      data: {
        emisorId: data.emisorId,
        receptorId: data.receptorId,
        nombreContacto: data.nombreContacto,
        importe: data.importe,
        fechaNegocio: data.fechaNegocio
          ? new Date(data.fechaNegocio)
          : new Date(),
        ...(data.referenciaId && { referenciaId: data.referenciaId }),
      },
      include,
    });
  } catch (err) {
    if (err.code === "P2003")
      throw { status: 400, message: "Error de integridad referencial." };
    throw err;
  }
};

const update = async (id, data, userId) => {
  const existing = await getById(id, userId);

  const receptor = await prisma.usuario.findUnique({
    where: { id: existing.receptorId },
  });

  if (!receptor?.activo) {
    throw new AppError(
      "Cannot update an agradecimiento linked to an inactive user",
      400,
    );
  }

  if (data.receptorId && data.receptorId === existing.emisorId) {
    throw new AppError(
      "No puedes asignarte un agradecimiento a ti mismo.",
      400,
    );
  }

  return prisma.agradecimiento.update({
    where: { id },
    data: {
      ...(data.nombreContacto && { nombreContacto: data.nombreContacto }),
      ...(data.importe && { importe: data.importe }),
      ...(data.referenciaId && { referenciaId: data.referenciaId }),
      ...(data.fechaNegocio && { fechaNegocio: new Date(data.fechaNegocio) }),
    },
    include,
  });
};

const remove = async (id, userId) => {
  const item = await prisma.agradecimiento.findFirst({
    where: { id, emisorId: userId },
  });
  if (!item) throw new AppError("Agradecimiento no encontrado.", 404);

  const receptor = await prisma.usuario.findUnique({
    where: { id: item.receptorId },
  });

  if (!receptor?.activo) {
    throw new AppError(
      "Cannot delete an agradecimiento linked to an inactive user.",
      400,
    );
  }
  return prisma.agradecimiento.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove };
