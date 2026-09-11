# BooK my Train Deployment Guide

This repository contains two different parts:

- `frontend/`: React + Vite browser application.
- Backend: API gateway plus seven Node.js services and shared infrastructure.

This is not a single-click static website deployment. The backend needs persistent databases, Redis, Kafka, Elasticsearch, secrets, and background consumers.

## Recommended first deployment

For a first production deployment, use one Ubuntu 22.04/24.04 VPS with Docker Compose:

- 4 vCPU minimum
- 8 GB RAM minimum; 16 GB is more comfortable because Kafka and Elasticsearch are memory-heavy
- 80+ GB SSD
- A domain name, for example `bookmytrain.example.com`
- Docker Engine and Docker Compose plugin
- Firewall allowing only SSH, HTTP, and HTTPS

Use managed PostgreSQL/Redis/Kafka/Elasticsearch later when traffic or reliability requirements justify the extra cost. Do not expose databases, Redis, Kafka, Elasticsearch, pgAdmin, Kafka UI, or Kibana to the public internet.

## Free deployment arrangement

For a demo or learning deployment with no monthly hosting bill:

- **Frontend:** Vercel Hobby plan, using the `frontend/` directory.
- **Backend and infrastructure:** Oracle Cloud Always Free Ubuntu VM, running Docker Compose.
- **Optional database services:** Neon free PostgreSQL and Upstash free Redis can reduce VM memory usage, but Kafka and Elasticsearch still need a server or paid managed services.
- **Optional HTTPS hostname:** a free DNS hostname such as DuckDNS, or a domain you already own. Oracle free capacity and free managed-service limits are subject to provider availability and policy changes.

The Oracle free VM is the practical place for this repository because Kafka, Zookeeper, Elasticsearch, and seven Node processes are difficult to run on free serverless platforms. Treat this arrangement as staging/demo infrastructure until backups, monitoring, failover, and payment security are proven.

### Vercel setup

Create a Vercel project from the repository with:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Set this Vercel environment variable after the API gateway has an HTTPS URL:

```env
VITE_API_BASE_URL=https://api.your-hostname.example/api
```

The committed `frontend/vercel.json` keeps React Router routes such as `/profile`, `/search`, and `/bookings` working after a browser refresh.

For the most reliable authentication, put the API behind a same-site hostname and reverse proxy `/api` through the frontend domain. If the API is on a different site, test production login carefully: the current backend uses secure, `SameSite=Strict` cookies.

## What runs where

| Component | Role | Production visibility |
|---|---|---|
| Frontend | Browser UI | Public HTTPS domain |
| API gateway | Only public backend entrypoint | Public HTTPS `/api` |
| User service | Auth and profiles | Private network only |
| Search service | Elasticsearch-backed search | Private network only |
| Admin service | Trains, stations, schedules | Private network only |
| Booking service | Booking saga and seat workflow | Private network only |
| Payment service | Razorpay orders, webhooks, refunds | Private; webhook routed through gateway or reverse proxy |
| Inventory service | Seats, locks, availability | Private network only |
| Notification service | Kafka consumer that sends email | Private worker, no public HTTP needed |
| PostgreSQL | Five separate service databases | Private, persistent volume or managed DB |
| Redis | OTP, sessions, rate limits, seat locks | Private, persistent volume or managed Redis |
| Kafka + Zookeeper | Event bus | Private, persistent volumes or managed Kafka |
| Elasticsearch | Train/station search index | Private, persistent volume or managed search |

The application ports are 4000 through 4007. Only port 4000 should be reachable by the frontend in production. The other service ports must stay on the Docker network.

## Current repository limitations

Before production deployment, account for these facts:

1. The original `docker-compose.yml` starts infrastructure only. The production stack is now in `deploy/docker-compose.prod.yml`.
2. Production Dockerfiles, an environment template, database initialization SQL, and Caddy configuration are in `deploy/`.
3. Backend defaults such as `http://localhost:4001` are suitable only for local development. The production Compose file overrides them with Docker service names.
4. The frontend production build uses `VITE_API_BASE_URL` on Vercel. The containerized frontend uses its Nginx `/api` proxy instead.
5. Kafka is configured as a single broker with replication factor 1. This is acceptable for a learning/staging deployment, not highly available production.
6. Elasticsearch has security disabled in the current Compose file. Keep it private at minimum; enable authentication/TLS for a serious production deployment.
7. Replace every placeholder password and secret in `deploy/.env` before deployment.
8. The user service currently contains fallback JWT and OTP secrets in source code. Production environment variables override them, and those fallbacks should eventually be removed.
9. The notification service requires email credentials. Configure a real SendGrid or SMTP sender before testing OTP and booking emails.
10. Payment webhooks require a public HTTPS endpoint and the correct Razorpay webhook secret.

## Production environment model

Create one private environment file per service on the server. Never commit these files:

- `api-gateway/.env`
- `user-service/.env`
- `admin-service/.env`
- `search-service/.env`
- `booking-service/.env`
- `payment-service/.env`
- `inventory-service/.env`
- `notification-service/.env`
- `frontend/.env.production`

Use Docker service names for internal connections. Example values when all containers share the Compose network:

```env
# Backend service-to-service examples
KAFKA_BROKER=kafka:9092
REDIS_URL=redis://:A_LONG_RANDOM_REDIS_PASSWORD@redis:6379
ELASTICSEARCH_URL=http://elasticsearch:9200
USER_SERVICE_URL=http://user-service:4001
SEARCH_SERVICE_URL=http://search-service:4002
ADMIN_SERVICE_URL=http://admin-service:4003
NOTIFICATION_SERVICE_URL=http://notification-service:4004
BOOKING_SERVICE_URL=http://booking-service:4005
PAYMENT_SERVICE_URL=http://payment-service:4006
INVENTORY_SERVICE_URL=http://inventory-service:4007

# Frontend build-time value
VITE_API_BASE_URL=https://your-domain.example.com/api
```

Generate secrets instead of inventing short passwords:

```bash
openssl rand -hex 32
openssl rand -hex 64
```

At minimum generate unique values for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `OTP_HMAC_SECRET`, `INTERNAL_SERVICE_KEY`, database passwords, Redis password, Razorpay secrets, and email credentials.

## Database setup

There are five Prisma-owned PostgreSQL databases:

- `user_service_database`
- `admin_service_database`
- `booking_service_database`
- `payment_service_database`
- `inventory_service_database`

After PostgreSQL is reachable and before starting application traffic, run these from the repository root:

```bash
for service in user-service admin-service booking-service payment-service inventory-service; do
	docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml run --rm "$service" npx prisma migrate deploy
done
```

Use `migrate deploy` in production. Do not use `migrate dev` against a production database.

## Deployment order

1. Provision the Ubuntu VPS and DNS.
2. Install Docker and configure the firewall.
3. Clone the repository on the server.
4. Replace development credentials in Compose and service environment files.
5. Start PostgreSQL, Redis, Kafka/Zookeeper, and Elasticsearch.
6. Wait for the infrastructure health checks.
7. Run all Prisma migrations.
8. Start the services and notification consumer.
9. Populate admin data: stations, trains, routes, and schedules.
10. Wait for Kafka consumers to index the data into Elasticsearch.
11. Build and publish the frontend with the production gateway URL.
12. Put Nginx or Caddy in front for HTTPS.
13. Configure the Razorpay webhook URL and test registration, OTP, search, booking, payment, cancellation, and refund flows.

## Basic VPS commands

These commands assume Ubuntu and Docker Compose is installed:

```bash
git clone <your-repository-url>
cd BMT-backend

cp deploy/.env.example deploy/.env
# Edit deploy/.env and replace every placeholder before continuing.

docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d postgres redis zookeeper kafka elasticsearch
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml ps
```

Run the five Prisma migrations:

```bash
for service in user-service admin-service booking-service payment-service inventory-service; do
	docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml run --rm "$service" npx prisma migrate deploy
done
```

Start all services:

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d --build
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml logs -f api-gateway search-service
```

The production Compose file exposes only Caddy on ports 80 and 443. The optional containerized frontend is available only on `127.0.0.1:3000`; use Vercel instead if preferred. Do not expose pgAdmin, Kafka UI, Kibana, PostgreSQL, Redis, Kafka, or Elasticsearch through the VPS firewall.

## HTTPS and domains

A simple arrangement is:

- `https://bookmytrain.example.com/` -> frontend static files
- `https://bookmytrain.example.com/api/*` -> API gateway on port 4000
- Razorpay webhook -> `https://bookmytrain.example.com/api/payments/webhooks/razorpay` or the exact gateway route used by this repository

Use Caddy for an easy automatic HTTPS certificate, or Nginx plus Certbot. Do not run the Vite development server in production.

## Minimum production checks

Run these checks after deployment:

```bash
curl -f https://your-domain.example.com/api/health
curl -f https://your-domain.example.com/api/gateway/health
curl -f https://your-domain.example.com/api/search/trains
```

Then manually verify:

- New user registration and OTP email
- Login, refresh, logout, and Google OAuth if enabled
- Station autocomplete and train search
- Admin station/train/route/schedule creation
- Search index updates after admin events
- Seat availability and seat locking
- Razorpay test payment and webhook signature verification
- Booking confirmation email
- Cancellation and refund
- Service restart recovery and persistent data after reboot

## Backups and operations

Before accepting real users:

- Schedule encrypted PostgreSQL backups and test restoring one.
- Back up Redis only if the chosen data is important; seat locks can usually expire and be recreated.
- Back up Kafka and Elasticsearch according to their retention/rebuild strategy.
- Keep application logs outside ephemeral containers or ship them to a log service.
- Add uptime checks for the frontend, gateway, databases, Kafka, and Elasticsearch.
- Rotate secrets and payment credentials when staff or machines change.
- Keep admin/debug endpoints private and protected.
- Pin image versions and npm lockfiles; do not use `latest` for production infrastructure.

## What is needed to perform the actual deployment

The deployment cannot be completed from this workspace alone because it requires external access. Before the next step, provide:

1. VPS/provider choice, or permission to use the recommended Ubuntu VPS approach.
2. A domain name, if you have one.
3. Git repository URL or the server method you want to use to transfer this code.
4. Whether this is a demo/staging deployment or a real-money production deployment.
5. Razorpay test/live credentials, email provider credentials, and Google OAuth values if those features are required.

Never paste private keys, passwords, API tokens, or payment secrets into chat. Enter them directly into the server's secret/environment configuration when instructed.

## Beginner deployment walkthrough

This section is the practical sequence to follow. Complete one phase at a time. Do not skip the tests between phases.

### Phase 0: Prepare your accounts

Create or confirm these accounts:

1. GitHub, with this repository pushed to a private or public repository.
2. Vercel, for the React frontend.
3. Oracle Cloud, for the free Ubuntu VM that runs the backend.
4. A DNS provider or domain registrar. A domain is easiest, but a free DNS hostname can also work.
5. SendGrid or another SMTP provider, for OTP and booking emails.
6. Razorpay, initially in Test Mode only.
7. Google Cloud OAuth, only if Google login is required.

The free backend plan is not guaranteed by the provider. Oracle may show no free VM capacity in a region. If that happens, try another region or use a temporary paid/alternative VM; never enter payment details into an unknown hosting website.

### Phase 1: Push the project to GitHub

From PowerShell in the project root:

```powershell
git status
git add .
git commit -m "Prepare project for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If a remote already exists, use `git remote -v` and skip `git remote add origin`.

Check that these files exist in GitHub:

- `deploy/docker-compose.prod.yml`
- `deploy/Dockerfile.service`
- `deploy/Dockerfile.frontend`
- `deploy/.env.example`
- `frontend/vercel.json`

Never commit `deploy/.env`.

### Phase 2: Deploy the frontend to Vercel

1. Sign in to Vercel.
2. Select **Add New Project**.
3. Import the GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Set **Build Command** to `npm run build`.
6. Set **Output Directory** to `dist`.
7. Set **Install Command** to `npm install`.
8. Deploy once, even before the backend exists.

The first Vercel URL will look like:

```text
https://your-project.vercel.app
```

Add this environment variable in Vercel under **Project Settings > Environment Variables** after the API hostname is ready:

```env
VITE_API_BASE_URL=https://api.your-domain.com/api
```

Redeploy after saving the variable. Vite variables are embedded at build time, so changing the variable does not change an already-built deployment until you redeploy.

### Phase 3: Create the free Oracle VM

In Oracle Cloud:

1. Open **Compute > Instances > Create Instance**.
2. Choose Ubuntu 22.04 or 24.04.
3. Choose an Always Free eligible shape with at least 4 OCPUs and 8 GB RAM when available.
4. Generate or upload an SSH key pair.
5. Download the private key and keep it private. It cannot be recovered from chat.
6. Assign a public IPv4 address.
7. Record the public IP address.

In the Oracle VCN security list, allow only:

```text
TCP 22   from your IP address if possible
TCP 80   from 0.0.0.0/0
TCP 443  from 0.0.0.0/0
```

On Ubuntu, also run:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Connect from Windows PowerShell:

```powershell
ssh -i C:\path\to\oracle-key.key ubuntu@YOUR_SERVER_IP
```

### Phase 4: Install Docker and download the project

Run on the Oracle VM:

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
exit
```

Reconnect with SSH, then verify:

```bash
docker --version
docker compose version
```

Download the project:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

### Phase 5: Point DNS to the VM

Create this DNS record at your DNS provider:

```text
Type: A
Name: api
Value: YOUR_SERVER_IP
TTL: 300
```

Wait until this command returns the Oracle IP:

```powershell
nslookup api.your-domain.com
```

Do not continue to HTTPS until DNS resolves correctly.

### Phase 6: Create the private production environment

On the Oracle VM:

```bash
cd YOUR_REPOSITORY
cp deploy/.env.example deploy/.env
nano deploy/.env
```

Change at least these values:

```env
API_DOMAIN=api.your-domain.com
ALLOWED_ORIGINS=https://your-project.vercel.app
FRONTEND_URL=https://your-project.vercel.app/login
COOKIE_SAME_SITE=none
POSTGRES_PASSWORD=your-private-random-password
REDIS_PASSWORD=your-private-random-password
JWT_ACCESS_SECRET=your-private-random-secret
JWT_REFRESH_SECRET=your-private-random-secret
OTP_HMAC_SECRET=your-private-random-secret
INTERNAL_SERVICE_KEY=your-private-random-secret
EMAIL_USER=your-verified-sender
EMAIL_PASS=your-private-email-token
RAZORPAY_KEY_ID=your-test-key
RAZORPAY_KEY_SECRET=your-private-test-secret
RAZORPAY_WEBHOOK_SECRET=your-private-webhook-secret
```

Generate random values on the VM:

```bash
openssl rand -hex 32
openssl rand -hex 64
```

The values above are examples only. Do not send the real values to me.

### Phase 7: Start infrastructure and migrate databases

From the repository root on the VM:

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d postgres redis zookeeper kafka elasticsearch
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml ps
```

Wait until PostgreSQL, Redis, Kafka, and Elasticsearch are healthy. Then run:

```bash
for service in user-service admin-service booking-service payment-service inventory-service; do
	docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml run --rm "$service" npx prisma migrate deploy
done
```

Start the application:

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d --build
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml ps
```

View errors:

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml logs --tail=200 api-gateway user-service search-service
```

### Phase 8: Connect Vercel to the API

In Vercel, set:

```env
VITE_API_BASE_URL=https://api.your-domain.com/api
```

Redeploy from **Deployments > Redeploy**.

Test in the browser:

1. Open the Vercel URL.
2. Open Search Trains.
3. Open the login page.
4. Check the browser Network tab for requests to `api.your-domain.com`.
5. Confirm the response is not blocked by CORS.

If login succeeds but the user is immediately logged out, check `ALLOWED_ORIGINS`, `COOKIE_SAME_SITE=none`, HTTPS, and `withCredentials` in the frontend client.

### Phase 9: Configure external providers

#### Email

Use a verified sender address. Put the provider username and token in `deploy/.env`. Never use a personal email password when an application token is available.

Test registration and confirm the OTP arrives.

#### Razorpay

Use Test Mode first. Configure the webhook URL shown below in Razorpay:

```text
https://api.your-domain.com/api/payments/webhooks/razorpay
```

Use the webhook secret generated by Razorpay as `RAZORPAY_WEBHOOK_SECRET`.

#### Google OAuth

If enabled, add the Vercel URL to Google OAuth authorized JavaScript origins. Add the correct callback URL used by this project to authorized redirect URIs. Do not guess the callback path; verify it in the frontend and user-service routes first.

### Phase 10: Final acceptance test

Run this in order:

1. Open the frontend.
2. Register a test user.
3. Receive and verify OTP.
4. Log out and log in again.
5. Refresh the browser and confirm the session remains valid.
6. Search for a station and train.
7. Log in as an admin and create a test station/train/schedule.
8. Confirm Kafka consumers update search data.
9. Select seats and create a Razorpay test order.
10. Complete a test payment.
11. Confirm the booking and email.
12. Cancel the test booking and verify refund behavior.
13. Restart the VM or containers and confirm data remains.

### Troubleshooting commands

```bash
# All container status
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml ps

# Recent errors
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml logs --tail=200 | grep -iE "error|failed|exception"

# Restart one service
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml restart api-gateway

# Check HTTPS certificate and API reachability from your PC
curl.exe -I https://api.your-domain.com/health

# Check disk and memory on the VM
df -h
free -h
```

Common causes:

- `502`: the gateway or Caddy cannot reach the target service.
- CORS error: `ALLOWED_ORIGINS` does not exactly match the Vercel URL.
- Login cookie missing: HTTPS or `COOKIE_SAME_SITE` is wrong.
- Search returns no trains: admin data was not created or Kafka/search indexing has not completed.
- OTP not received: email credentials or sender verification is wrong.
- Payment webhook fails: URL, HTTPS, or Razorpay webhook secret is wrong.
- Containers restart: inspect the service logs and check environment variables first.

## Deployment handoff questions

Fill in the notepad template `DEPLOYMENT_QUESTIONS.txt`. Once these answers are ready, I can continue with repository-side fixes and exact commands for your chosen URLs. Never put passwords, private keys, or API secrets in the file.
