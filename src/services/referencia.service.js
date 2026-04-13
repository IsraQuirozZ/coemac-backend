const prisma = require("../config/prisma");

// GET ALL
const getReferencias = async (userId, type) => {
  let where = {};

  if (type === "enviadas") {
    where = { emisorId: userId };
  } else if (type === "recibidas") {
    where = { receptorId: userId };
  } else {
    where = {
      OR: [{ emisorId: userId }, { receptorId: userId }],
    };
  }

  if (type && !["enviadas", "recibidas"].includes(type)) {
    const error = new Error("Invalid type filter");
    error.statusCode = 400;
    throw error;
  }

  return await prisma.referencia.findMany({
    where,
    orderBy: { createdAt: "desc" },
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

// GET BY ID
const getReferencia = async (id, userId) => {
  const referencia = await prisma.referencia.findFirst({
    where: {
      id,
      OR: [{ emisorId: userId }, { receptorId: userId }],
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

  if (!referencia) {
    const error = new Error("Referencia not found");
    error.statusCode = 404;

    throw error;
  }

  return referencia;
};

// CREATE
const createReferencia = async (data, emisorId) => {
  if (emisorId === data.receptorId) {
    const error = new Error("Cannot send a reference to yourself");
    error.statusCode = 400;

    throw error;
  }

  const [emisor, receptor] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: emisorId } }),
    prisma.usuario.findUnique({ where: { id: data.receptorId } }),
  ]);

  if (!emisor) {
    const error = new Error("Emisor not found");
    error.statusCode = 404;

    throw error;
  }

  if (!receptor) {
    const error = new Error("Receptor not found");
    error.statusCode = 404;

    throw error;
  }

  return await prisma.referencia.create({
    data: {
      emisorId,
      receptorId: data.receptorId,
      nombreContacto: data.nombreContacto,
      telefonoContacto: data.telefonoContacto,
      emailContacto: data.emailContacto,
      descripcion: data.descripcion,
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
    const error = new Error("Referencia not found");
    error.statusCode = 404;

    throw error;
  }

  if (data.receptorId !== undefined && referencia.agradecimientos.length > 0) {
    const error = new Error(
      "Cannot change receptor of a referencia with agradecimientos",
    );
    error.statusCode = 400;

    throw error;
  }

  if (
    data.receptorId !== undefined &&
    data.receptorId === referencia.emisorId
  ) {
    const error = new Error("Cannot send a reference to yourself");
    error.statusCode = 400;

    throw error;
  }

  if (data.receptorId !== undefined) {
    const receptor = await prisma.usuario.findUnique({
      where: { id: data.receptorId },
    });

    if (!receptor) {
      const error = new Error("Receptor not found");
      error.statusCode = 404;

      throw error;
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

  if (data.descripcion !== undefined) {
    updatedData.descripcion = data.descripcion;
  }

  if (data.tipo !== undefined) {
    updatedData.tipo = data.tipo;
  }

  if (Object.keys(updatedData).length === 0) {
    const error = new Error("No valid fields provided for update");
    error.statusCode = 400;

    throw error;
  } else {
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
  }
};

// DELETE
const deleteReferencia = async (id, userId) => {
  const referencia = await prisma.referencia.findFirst({
    where: { id, emisorId: userId },
    include: { agradecimientos: { select: { id: true } } },
  });

  if (!referencia) {
    const error = new Error("Referencia not found");
    error.statusCode = 404;

    throw error;
  }

  if (referencia.agradecimientos.length > 0) {
    const error = new Error("Cannot delete a referencia with agradecimientos");
    error.statusCode = 400;

    throw error;
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
  deleteReferencia,
};
