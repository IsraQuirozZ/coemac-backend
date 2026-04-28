require("dotenv").config();

const bcrypt = require("bcrypt");
const prisma = require("../src/config/prisma");

async function createAdmin() {
  try {
    const email = "admin@coemac.com";
    const password = "Admin12345!";

    const existingAdmin = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("Ya existe un admin con este email");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.usuario.create({
      data: {
        nombre: "Admin",
        apellido: "Root",
        username: "admin_root",
        email,
        passwordHash,
        rol: "ADMIN",
        activo: true,
        isVerified: true,
      },
    });

    console.log("ADMIN creado correctamente:");
    console.log({
      id: admin.id,
      email: admin.email,
      rol: admin.rol,
    });
  } catch (error) {
    console.error("Error creando ADMIN:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
