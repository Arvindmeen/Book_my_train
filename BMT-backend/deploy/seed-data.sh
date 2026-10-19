#!/bin/bash
set -e

echo "=============================================================="
echo "🇮🇳 Adding Indian Railways Sample Data"
echo "   Stations, directional trains, routes, and operating schedules"
echo "=============================================================="

cd "$(dirname "$0")/.."

# 1. Apply non-destructive Prisma schema changes
echo "🔄 Updating PostgreSQL database tables (trains, stations, schedules)..."
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec -T admin-service npx prisma db push
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec -T admin-service npx prisma generate

# 2. Run the additive seeder in admin-service
echo "🚆 Seeding PostgreSQL & Syncing to Elasticsearch..."
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec -T admin-service node src/scripts/seed-india.js

echo "=============================================================="
echo "✅ Additive sample data seeding completed!"
echo "=============================================================="
