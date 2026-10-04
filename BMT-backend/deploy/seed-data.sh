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

echo "=============================================================="
echo "✅ Realistic Database Seeding Successfully Completed!"
echo "=============================================================="
