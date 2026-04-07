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
    error.status = 404;
    throw error;
  }

  return referencia;
};

// CREATE
const createReferencia = async (data) => {
  if (data.emisorId === data.receptorId) {
    const error = new Error("Cannot send a reference to yourself");
    error.status = 400;
    throw error;
  }

  const [emisor, receptor] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: data.emisorId } }),
    prisma.usuario.findUnique({ where: { id: data.receptorId } }),
  ]);

  if (!emisor) {
    const error = new Error("Emisor not found");
    error.status = 404;
    throw error;
  }

  if (!receptor) {
    const error = new Error("Receptor not found");
    error.status = 404;
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
  });

  if (!referencia) {
    const error = new Error("Referencia not found");
    error.status = 404;
    throw error;
  }

  const updatedData = {
    nombreContacto: data.nombreContacto,
    telefonoContacto: data.telefonoContacto,
    emailContacto: data.emailContacto,
    descripcion: data.descripcion,
    tipo: data.tipo,
  };

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
  });

  if (!referencia) {
    const error = new Error("Referencia not found");
    error.status = 404;
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
