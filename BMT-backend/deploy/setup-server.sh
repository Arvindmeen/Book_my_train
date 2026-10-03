#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 BooK My Train - Automatic Production Server Setup"
echo "=========================================================="

echo "=== 1/7: Configuring Firewall (Opening ports 80 & 443) ==="
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
sudo netfilter-persistent save 2>/dev/null || true

echo "=== 2/7: Installing Docker & Essential Packages ==="
sudo apt-get update -y
sudo apt-get install -y git curl ca-certificates
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker ubuntu 2>/dev/null || true
fi

echo "=== 3/7: Cloning Project from GitHub ==="
cd /home/ubuntu
if [ ! -d "Book_my_train" ]; then
    git clone https://github.com/Arvindmeen/Book_my_train.git
fi
cd /home/ubuntu/Book_my_train/BMT-backend
git pull origin main

echo "=== 4/7: Writing Production Configuration (deploy/.env) ==="
cat << 'EOF' > deploy/.env
NODE_ENV=production
LOG_LEVEL=info

# Your Server Public IP
API_DOMAIN=129.154.230.113

# Database & Redis Passwords
POSTGRES_PASSWORD=BMTpassProduction2026!
REDIS_PASSWORD=BMTpassProduction2026!

# CORS & Frontend URLs
ALLOWED_ORIGINS=https://book-my-train-iota.vercel.app,http://129.154.230.113,http://localhost:3000,http://localhost:5173
FRONTEND_URL=https://book-my-train-iota.vercel.app/login
COOKIE_SAME_SITE=none

# Authentication & Security Secrets
JWT_ACCESS_SECRET=MySecretKeyForJWTAccessToken1234567890abcdef
JWT_REFRESH_SECRET=mySecretKeyForJWTRefreshToken1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
OTP_HMAC_SECRET=Arvind-Meena
INTERNAL_SERVICE_KEY=bmt_internal_secure_key_2026

ACCESS_TOKEN_EXP=15m
REFRESH_TOKEN_EXP=7d
ACCESS_TOKEN_EXP_SEC=900
REFRESH_TOKEN_EXP_SEC=604800
OTP_TTL=300
OTP_RATE_MAX_PER_HOUR=5
OTP_MAX_VERIFY_ATTEMPTS=5
REDIS_USER_TTL=86400

# Admin Access
ADMIN_EMAIL=arvindmeena8171@gmail.com

# Kafka Event Bus
KAFKA_CLIENT_ID=bmt-production

# Email Provider
EMAIL_USER=arvindmeena8171@gmail.com
EMAIL_PASS=jhyewtzmafswmyfn
SUPPORT_EMAIL=arvindmeena8171@gmail.com

# Payment Gateway
PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=placeholder_secret
RAZORPAY_WEBHOOK_SECRET=placeholder_webhook

# Rate Limits & Timeouts
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SERVICE_TIMEOUT_MS=60000
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000

# Booking & Inventory TTLs
BOOKING_TTL_SECONDS=600
LOCK_TTL_SECONDS=600
BOOKING_EXPIRY_CHECK_INTERVAL_MS=30000
LOCK_EXPIRY_INTERVAL_MS=60000

# Elasticsearch
ES_RECREATE_INDICES=false
EOF

echo "=== 5/7: Starting Databases (Postgres, Redis, Kafka, Elasticsearch) ==="
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d postgres redis zookeeper kafka elasticsearch

echo "Waiting 20 seconds for Postgres and Kafka to be ready..."
sleep 20

echo "=== 6/7: Running Prisma Migrations ==="
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml run --rm user-service npx prisma migrate deploy
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml run --rm admin-service npx prisma migrate deploy
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml run --rm booking-service npx prisma migrate deploy
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml run --rm payment-service npx prisma migrate deploy
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml run --rm inventory-service npx prisma migrate deploy

echo "=== 7/7: Starting All Microservices, Gateway & Frontend ==="
sudo docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d --build

echo ""
echo "=========================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "👉 Web App URL:    http://129.154.230.113"
echo "👉 API Gateway:    http://129.154.230.113/api/health"
echo "=========================================================="
