const { prisma } = require("../config/prisma.js");

// Relaciones que se incluyen en todas las queries
const include = {
  emisor:    { select: { id: true, nombre: true, email: true } },
  receptor:  { select: { id: true, nombre: true, email: true } },
  referencia: { select: { id: true } },
};

// Obtiene todos los agradecimientos (opcionalmente filtrados por emisor o receptor)
const getAll = ({ emisorId, receptorId } = {}) =>
  prisma.agradecimiento.findMany({
    where: {
      ...(emisorId   && { emisorId }),
      ...(receptorId && { receptorId }),
    },
    include,
    orderBy: { createdAt: "desc" },
  });

// Obtiene un agradecimiento por ID — lanza error si no existe
const getById = async (id) => {
  const agradecimiento = await prisma.agradecimiento.findUnique({ where: { id }, include });
  if (!agradecimiento) throw { status: 404, message: "Agradecimiento no encontrado." };
  return agradecimiento;
};

// Crea un nuevo agradecimiento
const create = (data) =>
  prisma.agradecimiento.create({
    data: {
      emisorId:       data.emisorId,
      receptorId:     data.receptorId,
      nombreContacto: data.nombreContacto,
      importe:        data.importe,
      ...(data.referenciaId && { referenciaId: data.referenciaId }),
    },
    include,
  });

// Actualiza campos editables de un agradecimiento existente
const update = async (id, data) => {
  await getById(id); // garantiza que existe
  return prisma.agradecimiento.update({
    where: { id },
    data: {
      ...(data.nombreContacto && { nombreContacto: data.nombreContacto }),
      ...(data.importe        && { importe: data.importe }),
      ...(data.referenciaId   && { referenciaId: data.referenciaId }),
    },
    include,
  });
};

// Elimina un agradecimiento por ID
const remove = async (id) => {
  await getById(id); // garantiza que existe
  return prisma.agradecimiento.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove };