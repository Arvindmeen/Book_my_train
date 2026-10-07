const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { config } = require('./');
const connectionString = config.DATABASE_URL;

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
     const adapter = new PrismaPg({ connectionString });

     globalForPrisma.prisma = new PrismaClient({
          adapter,
          log: ['error', 'warn'],
     });
}

const prisma = globalForPrisma.prisma;

// Ensure PostgreSQL seats table has travelClass and coach columns safely
prisma.$executeRawUnsafe(`ALTER TABLE "seats" ADD COLUMN IF NOT EXISTS "travelClass" VARCHAR(10) DEFAULT 'SL';`).catch(() => {});
prisma.$executeRawUnsafe(`ALTER TABLE "seats" ADD COLUMN IF NOT EXISTS "coach" VARCHAR(10) DEFAULT 'S1';`).catch(() => {});
prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_seats_train_class" ON "seats" ("trainId", "travelClass");`).catch(() => {});

module.exports = prisma;
