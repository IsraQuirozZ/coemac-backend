const prisma = require("../config/prisma");

// GET ALL
const getReferencias = async () => {
  return await prisma.referencia.findMany({
    include: { agradecimientos: true },
  });
};

// GET BY ID
const getReferencia = async (id) => {
  const referencia = await prisma.referencia.findUnique({
    where: { id },
    include: { agradecimientos: true },
  });

  if (!referencia) {
    const error = new Error("Referencia not found");
    error.statusCode = 404;

    throw error;
  }

  return referencia;
};

// CREATE
const createReferencia = async (data) => {
  if (data.emisorId === data.receptorId) {
    const error = new Error("Cannot send a reference to yourself");
    error.statusCode = 400;

    throw error;
  }

  const [emisor, receptor] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: data.emisorId } }),
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
      emisorId: data.emisorId,
      receptorId: data.receptorId,
      nombreContacto: data.nombreContacto,
      telefonoContacto: data.telefonoContacto,
      emailContacto: data.emailContacto,
      descripcion: data.descripcion,
      tipo: data.tipo,
    },
    include: { agradecimientos: true },
  });
};

// UPDATE
const updateReferencia = async (id, data) => {
  const referencia = await prisma.referencia.findUnique({
    where: { id },
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

  return await prisma.referencia.update({
    where: { id },
    data: updatedData,
    include: { agradecimientos: true },
  });
};

// DELETE
const deleteReferencia = async (id) => {
  const referencia = await prisma.referencia.findUnique({
    where: { id },
    include: { agradecimientos: true },
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
