const prisma = require("../config/prisma.js");

// Campos que se devuelven — nunca el passwordHash
const select = {
  id: true, nombre: true, apellido: true, username: true,
  email: true, empresa: true, telefono: true, fechaNacimiento: true,
  rol: true, activo: true, createdAt: true,
};

// Lista todos los usuarios activos (para pickers de miembros en referencias, reuniones, etc.)
const getAll = () =>
  prisma.usuario.findMany({ where: { activo: true }, select, orderBy: { nombre: "asc" } });

// Perfil de un usuario por ID
const getById = async (id) => {
  const user = await prisma.usuario.findUnique({ where: { id }, select });
  if (!user) throw { status: 404, message: "Usuario no encontrado." };
  return user;
};

// Actualiza los campos editables del perfil
const update = async (id, data) => {
  // Comprueba unicidad de username si viene en el body
  if (data.username) {
    const existing = await prisma.usuario.findFirst({
      where: { username: data.username, NOT: { id } },
    });
    if (existing) throw { status: 409, message: "El username ya está en uso." };
  }

  return prisma.usuario.update({
    where: { id },
    select,
    data: {
      ...(data.nombre          && { nombre:          data.nombre }),
      ...(data.apellido        && { apellido:        data.apellido }),
      ...(data.username        && { username:        data.username }),
      ...(data.empresa         && { empresa:         data.empresa }),
      ...(data.telefono        && { telefono:        data.telefono }),
      ...(data.fechaNacimiento && { fechaNacimiento: new Date(data.fechaNacimiento) }),
    },
  });
};

module.exports = { getAll, getById, update };
