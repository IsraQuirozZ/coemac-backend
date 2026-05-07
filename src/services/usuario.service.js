const prisma = require("../config/prisma.js");
const bcrypt = require("bcrypt");
const AppError = require("../utils/AppError.js");

// Campos que se devuelven — nunca el passwordHash
const select = {
  id: true,
  nombre: true,
  apellido: true,
  username: true,
  email: true,
  empresa: true,
  telefono: true,
  fechaNacimiento: true,
  rol: true,
  activo: true,
  createdAt: true,
};

// Lista todos los usuarios activos (para pickers de miembros en referencias, reuniones, etc.)
const getAll = () =>
  prisma.usuario.findMany({
    select,
    orderBy: { nombre: "asc" },
  });

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
      ...(data.nombre && { nombre: data.nombre }),
      ...(data.apellido && { apellido: data.apellido }),
      ...(data.username && { username: data.username }),
      ...(data.empresa && { empresa: data.empresa }),
      ...(data.telefono && { telefono: data.telefono }),
      ...(data.fechaNacimiento && {
        fechaNacimiento: new Date(data.fechaNacimiento),
      }),
    },
  });
};

// Activar/Desactivar usuario (para admin)
const toggleActive = async (id, userId) => {
  const user = await prisma.usuario.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError("Usuario not found", 404);
  }

  if (id === userId) {
    throw new AppError("No puedes desactivar tu propia cuenta", 400);
  }

  const updatedUser = await prisma.usuario.update({
    where: { id },
    data: {
      activo: !user.activo,
    },
  });

  return {
    message: updatedUser.activo ? "Usuario activado" : "Usuario desactivado",
  };
};

const changePassword = async (id, currentPassword, newPassword) => {
  const user = await prisma.usuario.findUnique({ where: { id: id } });

  if (!user) {
    throw new AppError("Usuario not found", 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isMatch) {
    throw new AppError("Current password is incorrect", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.usuario.update({
    where: { id: id },
    data: { passwordHash: hashedPassword },
  });

  return { message: "Password updated successfully" };
};

module.exports = { getAll, getById, update, changePassword, toggleActive };
