require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient({ adapter });
}

prisma = global.prisma;

module.exports = prisma;
