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

// Ensure PostgreSQL seat_inventories table has travelClass and coach columns safely
prisma.$executeRawUnsafe(`ALTER TABLE "seat_inventories" ADD COLUMN IF NOT EXISTS "travelClass" VARCHAR(10) DEFAULT 'SL';`).catch(() => {});
prisma.$executeRawUnsafe(`ALTER TABLE "seat_inventories" ADD COLUMN IF NOT EXISTS "coach" VARCHAR(10) DEFAULT 'S1';`).catch(() => {});
prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_seat_inv_schedule_class" ON "seat_inventories" ("scheduleId", "travelClass");`).catch(() => {});

module.exports = prisma;
