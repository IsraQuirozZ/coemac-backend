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

// GET ME
const getMe = async (userId) => {
  return prisma.usuario.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      empresa: true,
      email: true,
      username: true,
      telefono: true,
      fechaNacimiento: true,
      rol: true,
    },
  });
};

module.exports = {
  getUsuarios,
  getMe,
};
