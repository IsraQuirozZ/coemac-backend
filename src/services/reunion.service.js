const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const { EstadoReunion } = require("@prisma/client");

// Relaciones que se incluyen en todas las queries
const include = {
  creador: {
    select: { id: true, nombre: true, apellido: true, empresa: true },
  },
  invitado: {
    select: { id: true, nombre: true, apellido: true, empresa: true },
  },
};

// GET ALL
const getReuniones = async ({
  userId,
  isAdmin = false,
  direction,
  estado,
  page = 1,
  limit = 10,
}) => {
  if (direction && !["enviadas", "recibidas"].includes(direction)) {
    throw new AppError("Invalid direction filter", 400);
  }

  const estadoMap = {
    pendientes: EstadoReunion.PENDIENTE,
    realizadas: EstadoReunion.REALIZADA,
    canceladas: EstadoReunion.CANCELADA,
  };

  let mappedEstado = null;

  const estadoLower = estado?.toLowerCase();

  if (estadoLower && estadoLower !== "todas") {
    mappedEstado = estadoMap[estadoLower];

    if (!mappedEstado) {
      throw new AppError("Invalid estado filter", 400);
    }
  }

  const where = {};

  if (!isAdmin) {
    if (direction === "enviadas") {
      where.creadorId = userId;
    } else if (direction === "recibidas") {
      where.invitadoId = userId;
    } else {
      where.OR = [{ creadorId: userId }, { invitadoId: userId }];
    }
  }

  if (mappedEstado) {
    where.estado = mappedEstado;
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Number(limit) || 10);
  const skip = (pageNumber - 1) * pageSize;

  const [reuniones, total] = await Promise.all([
    prisma.reunion.findMany({
      where,
      orderBy: [{ fecha: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      skip,
      take: pageSize,
      include,
    }),
    prisma.reunion.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    data: reuniones,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
    },
  };
};

// GET BY ID
const getReunion = async (id, userId, isAdmin = false) => {
  const reunion = await prisma.reunion.findFirst({
    where: isAdmin
      ? { id }
      : {
          id,
          OR: [{ creadorId: userId }, { invitadoId: userId }],
        },
    include,
  });

  if (!reunion) {
    throw new AppError("Reunion not found", 404);
  }

  if (!isAdmin) {
    if (reunion.creadorId !== userId && reunion.invitadoId !== userId) {
      throw new AppError("Unauthorized access to this reunion", 403);
    }
  }
  return reunion;
};

// CREATE
const createReunion = async (data, creadorId) => {
  if (data.creadorId === data.invitadoId) {
    throw new AppError("You cannot invite yourself to a meeting", 400);
  }

  const [creador, invitado] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: creadorId } }),
    prisma.usuario.findUnique({ where: { id: data.invitadoId } }),
  ]);

  if (!creador) {
    throw new AppError("Creador not found", 404);
  }

  if (!invitado) {
    throw new AppError("Invitado not found", 404);
  }

  return prisma.reunion.create({
    data: {
      creadorId,
      invitadoId: data.invitadoId,
      fecha: data.fecha,
      descripcion: data.descripcion || undefined,
    },
    include,
  });
};

// UPDATE
const updateReunion = async (id, data, userId) => {
  const reunion = await prisma.reunion.findFirst({
    where: { id, creadorId: userId },
    include,
  });

  if (!reunion) {
    throw new AppError("Reunion not found", 404);
  }

  if (reunion.estado !== EstadoReunion.PENDIENTE) {
    throw new AppError("Only pending meetings can be updated", 400);
  }

  if (data.invitadoId !== undefined) {
    if (data.invitadoId === reunion.creadorId) {
      throw new AppError("You cannot invite yourself to a meeting", 400);
    }

    const invitado = await prisma.usuario.findUnique({
      where: { id: data.invitadoId },
      select: { id: true },
    });

    if (!invitado) {
      throw new AppError("Invitado not found", 404);
    }
  }

  const updateData = {};
  if (data.invitadoId !== undefined) {
    updateData.invitadoId = data.invitadoId;
  }

  if (data.fecha !== undefined) {
    updateData.fecha = data.fecha;
  }

  if (data.descripcion !== undefined) {
    updateData.descripcion = data.descripcion;
  }

  if (data.estado !== undefined) {
    updateData.estado = data.estado;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError("No valid fields to update", 400);
  }

  return prisma.reunion.update({
    where: { id },
    data: updateData,
    include,
  });
};

// MARK AS VIEWED
const markAsViewed = async (reunionId, userId) => {
  const reunion = await prisma.reunion.findUnique({
    where: { id: reunionId },
  });

  if (!reunion) {
    throw new AppError("Reunion not found", 404);
  }

  if (reunion.invitadoId !== userId) {
    throw new AppError(
      "Only the invited user can mark the reunion as viewed",
      403,
    );
  }

  if (reunion.viewedAt) {
    return reunion;
  }

  return prisma.reunion.update({
    where: { id: reunionId },
    data: { viewedAt: new Date() },
  });
};

// CONFIRM/CANCEL REUNION
const changeReunionStatus = async (reunionId, userId, estado) => {
  const reunion = await prisma.reunion.findUnique({
    where: { id: reunionId },
  });

  if (!reunion) {
    throw new AppError("Reunion not found", 404);
  }

  if (reunion.invitadoId !== userId) {
    console.log("User ID:", userId);
    console.log("Invitado ID:", reunion.invitadoId);

    throw new AppError(
      "Only the invited user can change the reunion status",
      403,
    );
  }

  if (reunion.estado !== EstadoReunion.PENDIENTE) {
    throw new AppError("Only pending meetings can change status", 400);
  }

  if (![EstadoReunion.REALIZADA, EstadoReunion.CANCELADA].includes(estado)) {
    throw new AppError("Invalid status", 400);
  }

  return prisma.reunion.update({
    where: { id: reunionId },
    data: { estado },
  });
};

// DELETE
const deleteReunion = async (id, userId) => {
  const reunion = await prisma.reunion.findUnique({ where: { id } }, include);

  if (!reunion) {
    throw new AppError("Reunion not found", 404);
  }

  if (reunion.creadorId !== userId) {
    throw new AppError("You can only delete meetings you created", 403);
  }

  if (reunion.estado === EstadoReunion.REALIZADA) {
    throw new AppError("Cannot delete a meeting that has been held", 400);
  }

  return prisma.reunion.delete({ where: { id } });
};

module.exports = {
  getReuniones,
  getReunion,
  createReunion,
  updateReunion,
  markAsViewed,
  changeReunionStatus,
  deleteReunion,
};
