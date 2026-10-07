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

// Ensure PostgreSQL BookingStatus enum includes WAITLISTED safely
prisma.$executeRawUnsafe(`ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'WAITLISTED';`).catch(() => {});
// Ensure PostgreSQL bookings table has travelClass column and index
prisma.$executeRawUnsafe(`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "travelClass" VARCHAR(10) DEFAULT 'SL';`).catch(() => {});
prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_bookings_schedule_class" ON "bookings" ("scheduleId", "travelClass");`).catch(() => {});

module.exports = prisma;
