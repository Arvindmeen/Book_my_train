#!/bin/bash
set -e

echo "=============================================================="
echo "🇮🇳 Seeding Real Indian Railways Database (IRCTC)"
echo "   85+ Stations, 15 Flagship Trains, Routes & 30-Day Schedules"
echo "=============================================================="

cd "$(dirname "$0")/.."

sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec admin-service node src/scripts/seed-india.js

echo "=============================================================="
echo "✅ Database Seeding Successfully Completed!"
echo "=============================================================="
