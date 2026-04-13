const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

// GET ALL
const getReferencias = async ({
  userId,
  direction,
  tipo,
  page = 1,
  limit = 10,
}) => {
  // Validación direction
  if (direction && !["enviadas", "recibidas"].includes(direction)) {
    throw new AppError("Invalid direction filter", 400);
  }

  // Normalizar tipo (case insensitive)
  const tipoMap = {
    internas: "INTERNA",
    externas: "EXTERNA",
  };

  let mappedTipo = null;

  if (tipo && tipo.toLowerCase() !== "todas") {
    mappedTipo = tipoMap[tipo.toLowerCase()];

    if (!mappedTipo) {
      throw new AppError("Invalid tipo filter", 400);
    }
  }

  // Construcción dinámica del where
  const where = {};

  // Dirección
  if (direction === "enviadas") {
    where.emisorId = userId;
  } else if (direction === "recibidas") {
    where.receptorId = userId;
  } else {
    where.OR = [{ emisorId: userId }, { receptorId: userId }];
  }

  // Tipo
  if (mappedTipo) {
    where.tipo = mappedTipo;
  }

  // Paginación
  const pageNumber = Number(page) || 1;
  const pageSize = Number(limit) || 10;
  const skip = (pageNumber - 1) * pageSize;

  // Query
  const [referencias, total] = await Promise.all([
    prisma.referencia.findMany({
      where,
      orderBy: [{ fechaReferencia: "desc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        nombreContacto: true,
        telefonoContacto: true,
        emailContacto: true,
        cargoContacto: true,
        tipo: true,
        fechaReferencia: true,
        createdAt: true,
        emisor: { select: { nombre: true, apellido: true } },
        receptor: { select: { nombre: true, apellido: true } },
        agradecimientos: {
          select: { id: true },
        },
      },
    }),
    prisma.referencia.count({ where }),
  ]);
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: referencias,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
    },
  };
};

// GET BY ID
const getReferencia = async (id, userId) => {
  const referencia = await prisma.referencia.findFirst({
    where: {
      id,
      OR: [{ emisorId: userId }, { receptorId: userId }],
    },
    include: {
      emisor: true,
      receptor: true,
      agradecimientos: { select: { id: true } },
    },
  });

  if (!referencia) {
    throw new AppError("Referencia not found", 404);
  }

  if (referencia.emisorId !== userId && referencia.receptorId !== userId) {
    throw new AppError("Unauthorized access to this referencia", 403);
  }

  return referencia;
};

// CREATE
const createReferencia = async (data, emisorId) => {
  if (emisorId === data.receptorId) {
    throw new AppError("Cannot send a reference to yourself", 400);
  }

  const [emisor, receptor] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: emisorId } }),
    prisma.usuario.findUnique({ where: { id: data.receptorId } }),
  ]);

  if (!emisor) {
    throw new AppError("Emisor not found", 404);
  }

  if (!receptor) {
    throw new AppError("Receptor not found", 404);
  }

  return prisma.referencia.create({
    data: {
      emisorId,
      receptorId: data.receptorId,
      nombreContacto: data.nombreContacto,
      telefonoContacto: data.telefonoContacto || undefined,
      emailContacto: data.emailContacto || undefined,
      cargoContacto: data.cargoContacto || undefined,
      fechaReferencia: data.fechaReferencia
        ? new Date(data.fechaReferencia)
        : undefined,
      descripcion: data.descripcion || undefined,
      tipo: data.tipo,
    },
    select: {
      id: true,
      emisor: { select: { nombre: true } },
      receptor: { select: { nombre: true } },
      agradecimientos: {
        select: { id: true },
      },
    },
  });
};

// UPDATE
const updateReferencia = async (id, data, userId) => {
  const referencia = await prisma.referencia.findFirst({
    where: { id, emisorId: userId },
    include: { agradecimientos: true },
  });

  if (!referencia) {
    throw new AppError("Referencia not found", 404);
  }

  if (data.receptorId !== undefined && referencia.agradecimientos.length > 0) {
    throw new AppError(
      "Cannot change receptor of a referencia with agradecimientos",
      400,
    );
  }

  if (
    data.receptorId !== undefined &&
    data.receptorId === referencia.emisorId
  ) {
    throw new AppError("Cannot send a reference to yourself", 400);
  }

  if (data.receptorId !== undefined) {
    const receptor = await prisma.usuario.findUnique({
      where: { id: data.receptorId },
    });

    if (!receptor) {
      throw new AppError("Receptor not found", 404);
    }
  }

  const updatedData = {};

  if (data.receptorId !== undefined) {
    updatedData.receptorId = data.receptorId;
  }

  if (data.nombreContacto !== undefined) {
    updatedData.nombreContacto = data.nombreContacto;
  }

  if (data.telefonoContacto !== undefined) {
    updatedData.telefonoContacto = data.telefonoContacto;
  }

  if (data.emailContacto !== undefined) {
    updatedData.emailContacto = data.emailContacto;
  }

  if (data.cargoContacto !== undefined) {
    updatedData.cargoContacto = data.cargoContacto;
  }

  if (data.fechaReferencia !== undefined) {
    updatedData.fechaReferencia = new Date(data.fechaReferencia);
  }

  if (data.descripcion !== undefined) {
    updatedData.descripcion = data.descripcion;
  }

  if (data.tipo !== undefined) {
    updatedData.tipo = data.tipo;
  }

  if (Object.keys(updatedData).length === 0) {
    throw new AppError("No valid fields provided for update", 400);
  }

  return await prisma.referencia.update({
    where: { id },
    data: updatedData,
    select: {
      id: true,
      emisor: { select: { nombre: true } },
      receptor: { select: { nombre: true } },
      agradecimientos: {
        select: { id: true },
      },
    },
  });
};

// MARK AS VIEWED
const markAsViewed = async (referenciaId, userId) => {
  const referencia = await prisma.referencia.findUnique({
    where: { id: referenciaId },
  });

  if (!referencia) {
    throw new AppError("Referencia not found", 404);
  }

  // Solo el receptor puede marcar como vista
  if (referencia.receptorId !== userId) {
    throw new AppError(
      "Only the receptor can mark this referencia as viewed",
      403,
    );
  }

  if (referencia.viewedAt) {
    return referencia;
  }

  return prisma.referencia.update({
    where: { id: referenciaId },
    data: { viewedAt: new Date() },
  });
};

// DELETE
const deleteReferencia = async (id, userId) => {
  const referencia = await prisma.referencia.findFirst({
    where: { id, emisorId: userId },
    include: { agradecimientos: { select: { id: true } } },
  });

  if (!referencia) {
    throw new AppError("Referencia not found", 404);
  }

  if (referencia.agradecimientos.length > 0) {
    throw new AppError("Cannot delete a referencia with agradecimientos", 400);
  }

  return await prisma.referencia.delete({
    where: { id },
  });
};

module.exports = {
  getReferencias,
  getReferencia,
  createReferencia,
  updateReferencia,
  markAsViewed,
  deleteReferencia,
};
