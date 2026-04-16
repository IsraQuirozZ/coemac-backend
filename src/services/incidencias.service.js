const prisma = require("../config/prisma.js");

// Relaciones que se incluyen en todas las queries
const include = {
  usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
};

// Obtiene todas las incidencias de un usuario específico
const getAll = async ({ usuarioId }) => {
  return prisma.incidencia.findMany({
    where: { usuarioId }, // Solo ve sus propias incidencias
    include,
    orderBy: { createdAt: "desc" },
  });
};

// Obtiene una incidencia por ID — lanza error si no existe
const getById = async (id) => {
  const incidencia = await prisma.incidencia.findUnique({ where: { id }, include });
  if (!incidencia) throw { status: 404, message: "Incidencia no encontrada." };
  return incidencia;
};

// Crea una nueva incidencia
const create = async (data) => {
  return prisma.incidencia.create({
    data: {
      usuarioId: data.usuarioId,
      asunto: data.asunto,
      descripcion: data.descripcion,
    },
    include,
  });
};

// Actualiza una incidencia existente
const update = async (id, data) => {
  // Garantiza que la incidencia existe antes de actualizar
  await getById(id);

  return prisma.incidencia.update({
    where: { id },
    data: {
      ...(data.asunto && { asunto: data.asunto }),
      ...(data.descripcion && { descripcion: data.descripcion }),
      ...(data.estado && { estado: data.estado }),
    },
    include,
  });
};

// Elimina una incidencia asegurando que pertenezca al usuario
const remove = async (id, usuarioId) => {
  const incidencia = await prisma.incidencia.findFirst({
    where: { id, usuarioId },
  });

  if (!incidencia) {
    throw { status: 404, message: "Incidencia no encontrada o no tienes permisos." };
  }

  return prisma.incidencia.delete({
    where: { id },
  });
};

module.exports = { getAll, getById, create, update, remove };