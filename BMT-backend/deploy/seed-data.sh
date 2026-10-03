#!/bin/bash
set -e

echo "=============================================================="
echo "🇮🇳 Seeding Real Indian Railways Database (IRCTC)"
echo "   85+ Stations, 30 Directional Trains, Day-Specific Schedules"
echo "=============================================================="

cd "$(dirname "$0")/.."

# Recreate search indices cleanly
echo "🧹 Recreating Elasticsearch indices..."
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec search-service node -e "const { recreateIndices } = require('./src/config/elasticsearch'); recreateIndices().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); })" || true

# Run seeder in admin-service
echo "🚆 Seeding PostgreSQL & Syncing to Elasticsearch..."
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec admin-service node src/scripts/seed-india.js

echo "=============================================================="
echo "✅ Realistic Database Seeding Successfully Completed!"
echo "=============================================================="
