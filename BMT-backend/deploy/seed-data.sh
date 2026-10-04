#!/bin/bash
set -e

echo "=============================================================="
echo "🇮🇳 Seeding Real Indian Railways Database (IRCTC)"
echo "   85+ Stations, 30 Directional Trains, Day-Specific Schedules"
echo "=============================================================="

cd "$(dirname "$0")/.."

# 1. Sync Prisma schema to PostgreSQL database
echo "🔄 Updating PostgreSQL database tables (trains, stations, schedules)..."
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec -T admin-service npx prisma db push --accept-data-loss
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec -T admin-service npx prisma generate

# 2. Recreate search indices cleanly
echo "🧹 Recreating Elasticsearch indices..."
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec -T search-service node -e "const { recreateIndices } = require('./src/config/elasticsearch'); recreateIndices().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); })" || true

# 3. Run seeder in admin-service
echo "🚆 Seeding PostgreSQL & Syncing to Elasticsearch..."
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec -T admin-service node src/scripts/seed-india.js

# 4. Sync booking-service database (PNRs are created only when users book tickets)
echo "🎫 Syncing Booking Service database schema..."
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec -T booking-service npx prisma db push --accept-data-loss || true
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec -T booking-service npx prisma generate || true
# Ensure no dummy/mock PNRs exist in database
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec -T booking-service node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.booking.deleteMany({
  where: {
    OR: [
      { idempotencyKey: { startsWith: 'seed-' } },
      { pnr: { in: ['2418937104', '4429182371', '2243612345', '1230198765'] } }
    ]
  }
}).then(r => console.log('Cleaned dummy PNRs:', r.count)).catch(() => {}).finally(() => prisma.\$disconnect());
" || true

echo "=============================================================="
echo "✅ Realistic Database Seeding Successfully Completed!"
echo "=============================================================="
