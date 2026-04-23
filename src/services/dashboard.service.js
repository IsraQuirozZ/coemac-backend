const prisma = require("../config/prisma");

const getDashboardData = async (userId, period = "30d") => {
  const now = new Date();

  // -------------------------
  // Filtro temporal
  // -------------------------

  let fromDate = new Date();

  if (period === "30d") {
    fromDate.setDate(now.getDate() - 30);
  }

  if (period === "year") {
    fromDate.setFullYear(now.getFullYear() - 1);
  }

  // -------------------------
  // Queries paralelas
  // -------------------------

  const [
    referencias,
    reuniones,
    agradecimientos,
    referenciasCount,
    reunionesCount,
    agradecimientosCount,
  ] = await Promise.all([
    prisma.referencia.findMany({
      where: {
        OR: [{ emisorId: userId }, { receptorId: userId }],
        createdAt: {
          gte: fromDate,
        },
      },
      include: {
        emisor: true,
        receptor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.reunion.findMany({
      where: {
        OR: [{ creadorId: userId }, { invitadoId: userId }],
        createdAt: {
          gte: fromDate,
        },
        estado: { not: "CANCELADA" },
      },
      include: {
        creador: true,
        invitado: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.agradecimiento.findMany({
      where: {
        OR: [{ emisorId: userId }, { receptorId: userId }],
        createdAt: {
          gte: fromDate,
        },
      },
      include: {
        emisor: true,
        receptor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.referencia.count({
      where: { emisorId: userId, createdAt: { gte: fromDate } },
    }),

    prisma.reunion.count({
      where: {
        creadorId: userId,
        createdAt: { gte: fromDate },
      },
    }),

    prisma.agradecimiento.count({
      where: {
        receptorId: userId,
        createdAt: {
          gte: fromDate,
        },
      },
    }),
  ]);

  // -------------------------
  // Normalización actividad
  // -------------------------
  const recientes = [
    ...referencias.map((item) => ({
      id: item.id,
      tipo: "referencia",
      title:
        item.emisorId === userId
          ? `Referencia para: ${item.receptor.nombre}`
          : `Referencia de: ${item.emisor.nombre}`,
      createdAt: item.createdAt,
      detail: item.nombreContacto,
      nombreContacto: item.nombreContacto,
    })),

    ...reuniones.map((item) => ({
      id: item.id,
      tipo: "reunion",
      title:
        "Reunion con: " +
        (item.creadorId === userId
          ? item.invitado.nombre
          : item.creador.nombre),
      detail: new Date(item.fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }),
      createdAt: item.createdAt,
      fecha: item.fechaHora,
    })),

    ...agradecimientos.map((item) => ({
      id: item.id,
      tipo: "agradecimiento",
      title:
        item.emisorId === userId
          ? `Agradecimiento para: ${item.receptor.nombre}`
          : `Agradecimiento de: ${item.emisor.nombre}`,
      detail: item.importe + "€",
      createdAt: item.createdAt,
      nombreContacto: item.nombreContacto,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 15);

  // -------------------------
  // Return final
  // -------------------------

  return {
    counts: {
      referencias: referenciasCount,
      reuniones: reunionesCount,
      agradecimientos: agradecimientosCount,
    },
    lastDates: {
      referencias: referencias[0]?.createdAt || null,
      reuniones: reuniones[0]?.createdAt || null,
      agradecimientos: agradecimientos[0]?.createdAt || null,
    },
    recientes,
    referencias,
    reuniones,
    agradecimientos,
  };
};

// ADMIN
const getAdminDashboardData = async (period = "30d") => {
  const now = new Date();

  let fromDate = new Date();

  if (period === "30d") {
    fromDate.setDate(now.getDate() - 30);
  }

  if (period === "year") {
    fromDate.setFullYear(now.getFullYear() - 1);
  }

  const [
    referencias,
    reuniones,
    agradecimientos,
    referenciasCount,
    reunionesCount,
    agradecimientosCount,
    totalImporteCount,
    topImportadoresResult,
    topReferenciadoresResult,
    reunionesParticipacion,
  ] = await Promise.all([
    prisma.referencia.findMany({
      where: {
        createdAt: { gte: fromDate },
      },
      include: {
        emisor: true,
        receptor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.reunion.findMany({
      where: {
        createdAt: { gte: fromDate },
        estado: { not: "CANCELADA" },
      },
      include: {
        creador: true,
        invitado: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.agradecimiento.findMany({
      where: {
        createdAt: { gte: fromDate },
      },
      include: {
        emisor: true,
        receptor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.referencia.count({
      where: {
        createdAt: { gte: fromDate },
      },
    }),

    prisma.reunion.count({
      where: {
        createdAt: { gte: fromDate },
        estado: { not: "CANCELADA" },
      },
    }),

    prisma.agradecimiento.count({
      where: {
        createdAt: { gte: fromDate },
      },
    }),

    prisma.agradecimiento.aggregate({
      where: {
        createdAt: { gte: fromDate },
      },
      _sum: {
        importe: true,
      },
    }),

    prisma.agradecimiento.groupBy({
      by: ["receptorId"],
      where: {
        createdAt: { gte: fromDate },
      },
      _sum: {
        importe: true,
      },
      _count: {
        receptorId: true,
      },
      orderBy: {
        _sum: {
          importe: "desc",
        },
      },
      take: 3,
    }),

    prisma.referencia.groupBy({
      by: ["emisorId"],
      where: {
        createdAt: { gte: fromDate },
      },
      _count: {
        emisorId: true,
      },
      orderBy: {
        _count: {
          emisorId: "desc",
        },
      },
      take: 3,
    }),

    prisma.reunion.findMany({
      where: {
        createdAt: { gte: fromDate },
        estado: { not: "CANCELADA" },
      },
      select: {
        creadorId: true,
        invitadoId: true,
      },
    }),
  ]);

  const recientes = [
    ...referencias.map((item) => ({
      id: item.id,
      tipo: "referencia",
      title: `Referencia: ${item.emisor.nombre} → ${item.receptor.nombre}`,
      detail: item.nombreContacto,
      createdAt: item.createdAt,
    })),

    ...reuniones.map((item) => ({
      id: item.id,
      tipo: "reunion",
      title: `Reunión: ${item.creador.nombre} ↔ ${item.invitado.nombre}`,
      detail: new Date(item.fechaHora).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }),
      createdAt: item.createdAt,
    })),

    ...agradecimientos.map((item) => ({
      id: item.id,
      tipo: "agradecimiento",
      title: `Agradecimiento: ${item.emisor.nombre} → ${item.receptor.nombre}`,
      detail: `${item.importe}€`,
      createdAt: item.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 15);

  const totalImporte = totalImporteCount._sum.importe || 0;

  const topImportadores = await Promise.all(
    topImportadoresResult.map(async (item) => {
      const usuario = await prisma.usuario.findUnique({
        where: { id: item.receptorId },
        select: {
          id: true,
          nombre: true,
          apellido: true,
        },
      });

      return {
        usuario,
        totalImporte: item._sum.importe || 0,
        totalAgradecimientos: item._count.receptorId || 0,
      };
    }),
  );

  const topImportador = topImportadores[0] || null;

  const topReferenciadores = await Promise.all(
    topReferenciadoresResult.map(async (item) => {
      const usuario = await prisma.usuario.findUnique({
        where: {
          id: item.emisorId,
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
        },
      });

      return {
        usuario,
        totalReferencias: item._count.emisorId || 0,
      };
    }),
  );

  const reunionesMap = {};

  reunionesParticipacion.forEach((r) => {
    if (r.creadorId) {
      reunionesMap[r.creadorId] = (reunionesMap[r.creadorId] || 0) + 1;
    }
    if (r.invitadoId) {
      reunionesMap[r.invitadoId] = (reunionesMap[r.invitadoId] || 0) + 1;
    }
  });

  const topReuniones = await Promise.all(
    Object.entries(reunionesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(async ([userId, total]) => {
        const usuario = await prisma.usuario.findUnique({
          where: { id: userId },
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        });

        return {
          usuario,
          totalReuniones: total,
        };
      }),
  );

  return {
    counts: {
      referencias: referenciasCount,
      reuniones: reunionesCount,
      agradecimientos: agradecimientosCount,
    },
    lastDates: {
      referencias: referencias[0]?.createdAt || null,
      reuniones: reuniones[0]?.createdAt || null,
      agradecimientos: agradecimientos[0]?.createdAt || null,
    },
    recientes,
    referencias,
    reuniones,
    agradecimientos,
    metrics: {
      totalImporte,
      topImportador,
      topImportadores,
      topReferenciadores,
      topReuniones,
    },
  };
};

module.exports = {
  getDashboardData,
  getAdminDashboardData,
};
