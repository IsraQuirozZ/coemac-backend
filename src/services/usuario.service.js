const prisma = require("../config/prisma");

// GET ALL
const getUsuarios = async (userId) => {
  return prisma.usuario.findMany({
    where: {
      activo: true,
      id: {
        not: userId,
      },
    },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      empresa: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });
};

module.exports = {
  getUsuarios,
};
