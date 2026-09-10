# 🚆 Book My Train

> A production-style railway ticket booking platform built with **microservices architecture**, designed to demonstrate scalable backend engineering, distributed transactions, event-driven communication, secure authentication, seat inventory management, and payment workflows.

**Repository:** https://github.com/Arvindmeen/book-my-train-repo

---

## 📌 Overview

**Book My Train** is a full-stack railway reservation system inspired by real-world IRCTC-style booking workflows.

The project is designed around independent services rather than a single monolithic backend. Each major business capability owns its responsibilities and communicates with other services through **REST APIs** for synchronous operations and **Apache Kafka** for asynchronous, event-driven workflows.

The system covers:

- User registration and authentication
- OTP verification and email notifications
- JWT access/refresh token authentication
- Google OAuth
- Train, station, route and schedule management
- Elasticsearch-powered train and station search
- Seat availability and distributed seat locking
- Booking orchestration using the **Saga pattern**
- Razorpay payment processing and refunds
- Kafka-based asynchronous communication
- Retry and **Dead-Letter Queue (DLQ)** handling
- API Gateway with authentication, rate limiting and circuit breakers
- Docker-based infrastructure
- PostgreSQL database-per-service architecture
- Redis for caching, OTPs, sessions, locks and rate-limit counters

---

## 🏗️ Architecture

```text
                         ┌───────────────────────┐
                         │    Frontend           │
                         │  React + Vite :3000   │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │     API Gateway        │
                         │        :4000           │
                         │ JWT • Rate Limit       │
                         │ Circuit Breaker        │
                         └───────────┬───────────┘
                                     │
          ┌──────────────┬───────────┼───────────┬──────────────┐
          ▼              ▼           ▼           ▼              ▼
   ┌────────────┐ ┌────────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
   │   User     │ │   Search   │ │  Admin  │ │ Booking  │ │ Payment  │
   │   :4001    │ │   :4002    │ │  :4003  │ │  :4005   │ │  :4006   │
   └─────┬──────┘ └─────┬──────┘ └────┬────┘ └────┬─────┘ └────┬─────┘
         │               │             │            │              │
         │               │             │       ┌────▼─────┐       │
         │               │             │       │ Inventory│       │
         │               │             │       │  :4007   │       │
         │               │             │       └────┬─────┘       │
         │               │             │            │              │
         │               └─────────────┴────────────┴──────────────┘
         │                              │
         │                         Apache Kafka
         │                              │
         │                    ┌─────────▼─────────┐
         │                    │   Notification    │
         │                    │      :4004        │
         │                    │   Kafka Consumer  │
         │                    └───────────────────┘
         │
         ├────────────── PostgreSQL
         ├────────────── Redis Stack
         ├────────────── Elasticsearch
         └────────────── Kafka
```

### Core architectural principles

1. **Database-per-service** — each transactional service owns its PostgreSQL database.
2. **API Gateway** — frontend clients use one entry point instead of directly accessing every service.
3. **Event-driven architecture** — Kafka decouples services for asynchronous workflows.
4. **Saga pattern** — booking coordinates multiple distributed operations without requiring one global database transaction.
5. **Distributed seat locking** — inventory prevents concurrent users from purchasing the same seat.
6. **Idempotency** — critical operations are designed to safely handle repeated requests/events.
7. **Resilience** — retries, DLQs, rate limiting and circuit breakers improve failure handling.
8. **Separation of read/write concerns** — Elasticsearch acts as the search/read model while Admin remains the source of truth.

---

## ✨ Major Features

### 👤 Authentication & User Management

- Email-based OTP verification
- Secure password authentication
- JWT access and refresh tokens
- Refresh-token rotation
- Google OAuth authentication
- User profile management
- Redis-backed OTP/session-related data
- OTP expiration and verification-attempt limits
- Internal service authentication using `INTERNAL_SERVICE_KEY`

### 🚆 Train Management

Admin functionality includes:

- Station creation and lookup
- Train creation and lookup
- Route management
- Route-station relationships
- Schedule creation
- Schedule cancellation
- Domain-event publication through Kafka

The Admin Service acts as the **source of truth** for railway data.

### 🔎 Train Search

The Search Service uses **Elasticsearch** for:

- Train search
- Station search
- Autocomplete
- Full-text search
- Search-oriented indexing
- Event-driven index updates

Search indexes are updated by consuming Admin and Inventory events.

### 💺 Seat Inventory & Locking

The Inventory Service manages:

- Schedule-level seat availability
- Individual seat inventory
- Segment-level seat locks
- Seat locking
- Seat unlocking
- Seat confirmation
- Booking cancellation
- Expiration of stale locks

A background process periodically removes expired locks.

### 🎫 Booking

The Booking Service orchestrates the booking workflow:

```text
User
  │
  ▼
Booking Service
  │
  ├── Lock seats
  │      │
  │      ▼
  │   Inventory
  │
  ├── Create payment order
  │      │
  │      ▼
  │   Payment
  │
  ├── Wait for payment event
  │      │
  │      ▼
  │   Kafka
  │
  ├── Payment Success
  │      │
  │      ▼
  │   Confirm seats
  │
  └── Publish booking.confirmed
             │
             ▼
       Notification Service
```

If payment fails, the workflow can compensate by releasing the previously locked inventory.

### 💳 Payments

The Payment Service integrates with **Razorpay** and handles:

- Payment order creation
- Payment verification
- Webhook processing
- Refund processing
- Payment audit records
- Success/failure event publication

### 📧 Notifications

The Notification Service is intentionally **Kafka-only** and does not expose a normal HTTP API.

It consumes events such as:

- OTP email
- Welcome email
- Booking confirmation
- Booking failure
- Booking cancellation

It then sends transactional emails through the configured email provider.

### 🛡️ API Gateway

The gateway provides:

- Centralized routing
- JWT enforcement
- CORS
- Rate limiting
- Circuit breakers
- Downstream service proxying
- Health checks
- Aggregated service health

---

## 🧰 Technology Stack

### Backend

| Technology | Purpose |
|---|---|
| Node.js 18+ | Backend runtime |
| JavaScript / ES Modules | Backend language |
| Express.js 5 | REST APIs |
| Prisma 7 | ORM and database access |
| PostgreSQL 15 | Transactional databases |
| Redis Stack | Cache, OTP, locks, rate limiting |
| Apache Kafka | Event-driven communication |
| KafkaJS | Kafka client |
| Elasticsearch 8.12 | Train/station search |
| Winston | Application logging |
| Helmet | HTTP security |
| bcrypt | Password hashing |
| JWT | Authentication |
| Google Auth Library | Google OAuth |
| Razorpay SDK | Payments |

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI |
| Vite 6 | Frontend tooling |
| React Router 6 | Routing |
| Zustand | State management |
| React Hook Form | Form management |
| Axios | HTTP requests |
| Tailwind CSS 3 | Styling |

### DevOps & Infrastructure

- Docker
- Docker Compose
- PostgreSQL
- Redis Stack
- RedisInsight
- Apache Kafka
- Zookeeper
- Kafka UI
- Elasticsearch
- Kibana
- pgAdmin

---

## 📦 Services

| Service | Port | Responsibility |
|---|---:|---|
| Frontend | `3000` | React web application |
| API Gateway | `4000` | Routing, JWT, rate limiting, circuit breakers |
| User Service | `4001` | Authentication, OTP, users |
| Search Service | `4002` | Elasticsearch-based search |
| Admin Service | `4003` | Stations, trains, routes, schedules |
| Notification Service | `4004` | Kafka consumer + email delivery |
| Booking Service | `4005` | Booking Saga and booking lifecycle |
| Payment Service | `4006` | Razorpay orders, verification, refunds |
| Inventory Service | `4007` | Seat availability and locking |

---

## 🗄️ Data Architecture

### PostgreSQL

The system follows a **database-per-service** model.

```text
PostgreSQL
│
├── user_service_database
├── admin_service_database
├── booking_service_database
├── payment_service_database
└── inventory_service_database
```

This avoids tightly coupling every service to one shared transactional schema.

### Redis

Redis is used for:

- OTP storage
- Session-related data
- Distributed seat locks
- Rate-limit counters
- Temporary booking/lock state

### Elasticsearch

Elasticsearch stores the search-oriented representation of:

- Stations
- Trains
- Schedules
- Availability-related search data

The Search Service receives Kafka events and updates its indexes asynchronously.

---

## 📡 Kafka Event Architecture

Kafka is used for asynchronous communication between services.

| Topic | Producer | Consumer |
|---|---|---|
| `notification.otp-email` | User Service | Notification Service |
| `notification.welcome-email` | User Service | Notification Service |
| `admin.station-created` | Admin Service | Search Service |
| `admin.train-created` | Admin Service | — |
| `admin.route-created` | Admin Service | Search Service |
| `admin.schedule-created` | Admin Service | Inventory, Search |
| `admin.schedule-cancelled` | Admin Service | Inventory, Search, Booking |
| `inventory.seat-availability-updated` | Inventory Service | Search Service |
| `payment.success` | Payment Service | Booking Service |
| `payment.failed` | Payment Service | Booking Service |
| `booking.confirmed` | Booking Service | Notification Service |
| `booking.failed` | Booking Service | Notification Service |
| `booking.cancelled` | Booking Service | Notification Service |

### Retry + DLQ

Kafka consumers use retry handling.

```text
Kafka Message
     │
     ▼
Consumer
     │
     ├── Success ──► Processed
     │
     └── Failure
           │
           ▼
       Retry × 3
           │
           ▼
      DLQ Topic
```

DLQ topics follow:

```text
dlq.<service>
```

This prevents repeatedly failing messages from blocking normal event processing.

---

## 🔌 Infrastructure Ports

| Component | Port |
|---|---:|
| PostgreSQL | `5432` |
| pgAdmin | `8081` |
| Redis | `6379` |
| RedisInsight | `8001` |
| Zookeeper | `2181` |
| Kafka | `9092` / `9093` |
| Kafka UI | `8080` |
| Elasticsearch | `9200` |
| Kibana | `5601` |

---

## 🚀 Getting Started

### Prerequisites

Install:

- Node.js `>= 18`
- npm `>= 9`
- Docker `>= 20`
- Docker Compose `>= 2`
- Git

Verify:

```bash
node --version
npm --version
docker --version
docker compose version
git --version
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/Arvindmeen/book-my-train-repo.git
cd book-my-train-repo
cd BMT-backend
```

---

## 2. Start Infrastructure

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

The Compose stack starts the required infrastructure including:

- PostgreSQL
- pgAdmin
- Redis Stack
- Zookeeper
- Kafka
- Kafka UI
- Elasticsearch
- Kibana

---

## 3. Configure Environment Variables

Each service contains an `.env.example`.

For each service:

```bash
cd <service-name>
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Then configure the required secrets and service URLs.

> **Important:** Never commit `.env` files or real credentials.

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4. Prisma Setup

The following services use Prisma:

- User Service
- Admin Service
- Booking Service
- Payment Service
- Inventory Service

Run:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Run these commands inside each Prisma-enabled service.

---

## 5. Install Frontend Dependencies

```bash
cd frontend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

The frontend uses:

```env
VITE_API_BASE_URL=/api
```

---

## ▶️ Running the Project

Start infrastructure first:

```bash
docker compose up -d
```

Then start services.

### 1. Admin Service

```bash
cd admin-service
npm run dev
```

### 2. Inventory Service

```bash
cd inventory-service
npm run dev
```

### 3. Search Service

```bash
cd search-service
npm run dev
```

### 4. User Service

```bash
cd user-service
npm run dev
```

### 5. Payment Service

```bash
cd payment-service
npm run dev
```

### 6. Booking Service

```bash
cd booking-service
npm run dev
```

### 7. Notification Service

```bash
cd notification-service
npm run dev
```

### 8. API Gateway

```bash
cd api-gateway
npm run dev
```

### 9. Frontend

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:3000
```

API Gateway:

```text
http://localhost:4000
```

---

## 🔗 API Gateway Routes

Clients should normally communicate through the API Gateway.

```text
/api/users/*       → User Service
/api/search/*      → Search Service
/api/admins/*      → Admin Service
/api/bookings/*    → Booking Service
/api/payments/*    → Payment Service
/api/inventory/*   → Inventory Service
```

Direct service access is primarily useful for development and debugging.

---

## 📚 Important API Examples

### Send OTP

```http
POST /api/users/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Verify OTP

```http
POST /api/users/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Login

```http
POST /api/users/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Refresh Token

```http
POST /api/users/auth/refresh
Cookie: refreshToken=<refresh-jwt>
```

### Get User Profile

```http
GET /api/users/user/profile
Authorization: Bearer <access-jwt>
```

### Search Trains

```http
GET /api/search/trains?from=NDLS&to=BCT&date=2026-05-01
```

### Create Booking

```http
POST /api/bookings/bookings
Authorization: Bearer <access-jwt>
Content-Type: application/json
```

---

## 🔐 Security

Security mechanisms implemented in the architecture include:

- JWT authentication
- Access + refresh tokens
- Refresh token rotation
- OTP expiration
- OTP verification-attempt limits
- OTP rate limiting
- Password hashing with bcrypt
- Helmet
- CORS configuration
- API rate limiting
- Circuit breakers
- Internal service authentication
- Razorpay webhook signature verification
- Environment-based secrets

### Security Rules

```text
❌ Never commit .env files
❌ Never hard-code production secrets
❌ Never expose INTERNAL_SERVICE_KEY
❌ Never commit Razorpay/SendGrid credentials

✅ Use strong JWT secrets
✅ Use strong OTP HMAC secrets
✅ Rotate leaked credentials immediately
```

---

## 📁 Project Structure

```text
BMT-backend/
│
├── api-gateway/
│   └── src/
│
├── user-service/
│   ├── src/
│   └── prisma/
│
├── search-service/
│   └── src/
│
├── admin-service/
│   ├── src/
│   └── prisma/
│
├── notification-service/
│   └── src/
│
├── booking-service/
│   ├── src/
│   └── prisma/
│
├── payment-service/
│   ├── src/
│   └── prisma/
│
├── inventory-service/
│   ├── src/
│   └── prisma/
│
├── frontend/
│   └── src/
│
├── shared/
│   ├── constants/
│   │   ├── kafka-topics.js
│   │   ├── asyncHandler.js
│   │   └── error.js
│   │
│   └── utils/
│       └── dlqHandler.js
│
└── docker-compose.yml
```

### Standard Backend Service Structure

```text
<service>/
├── src/
│   ├── index.js
│   ├── app.js
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middlewares/
│   ├── kafka/
│   └── utils/
│
├── prisma/
├── .env.example
└── package.json
```

---

## 🔄 End-to-End Booking Flow

```text
                 ┌─────────────┐
                 │    User     │
                 └──────┬──────┘
                        │
                        ▼
                ┌───────────────┐
                │ API Gateway   │
                └──────┬────────┘
                       │
                       ▼
                ┌───────────────┐
                │ Booking       │
                │ Service       │
                └──────┬────────┘
                       │
                 Lock Seats
                       │
                       ▼
                ┌───────────────┐
                │ Inventory     │
                │ Service       │
                └──────┬────────┘
                       │
                  Seat Locked
                       │
                       ▼
                ┌───────────────┐
                │ Payment       │
                │ Service       │
                └──────┬────────┘
                       │
                 Razorpay Order
                       │
                       ▼
                    Payment
                       │
                ┌──────┴───────┐
                │              │
              Success         Failed
                │              │
                ▼              ▼
             Kafka         Kafka Event
          payment.success   payment.failed
                │              │
                ▼              ▼
          Booking Service  Compensation
                │
          Confirm Seats
                │
                ▼
       booking.confirmed
                │
                ▼
       Notification Service
                │
                ▼
         Confirmation Email
```

---

## 🧠 Distributed Systems Concepts Demonstrated

This project is primarily designed to demonstrate backend and system-design concepts rather than only CRUD functionality.

### 1. Microservices Architecture

Business capabilities are isolated into independently deployable services.

### 2. Database-per-Service

Each service owns its data, reducing direct database coupling.

### 3. API Gateway

Provides a single external entry point and centralizes cross-cutting concerns.

### 4. Synchronous REST Communication

Used when a service needs an immediate response from another service.

### 5. Asynchronous Kafka Communication

Used for events that do not require the caller to wait for immediate completion.

### 6. Saga Pattern

Coordinates distributed booking/payment/inventory operations and provides compensating actions when a later step fails.

### 7. Distributed Locking

Seat locks prevent multiple concurrent booking attempts from acquiring the same inventory.

### 8. Idempotency

Protects critical workflows from duplicate requests and duplicate event delivery.

### 9. Eventual Consistency

Search indexes and some read-side data are updated asynchronously from domain events.

### 10. Dead-Letter Queues

Failed Kafka messages are retried and eventually isolated in DLQs for operational handling.

### 11. Circuit Breaker

Prevents cascading failures when downstream services become unhealthy.

### 12. Rate Limiting

Protects APIs and sensitive endpoints from excessive requests.

### 13. Caching

Redis reduces repeated database work for suitable temporary/high-frequency data.

### 14. Search Indexing

Elasticsearch provides a specialized read/search layer rather than forcing complex search queries onto transactional PostgreSQL databases.

---

## 🧪 Development & Debugging Tools

| Tool | Purpose |
|---|---|
| pgAdmin | PostgreSQL administration |
| RedisInsight | Redis inspection |
| Kafka UI | Kafka topics/messages |
| Kibana | Elasticsearch visualization |
| Docker | Container management |

Useful commands:

```bash
docker ps
docker compose logs -f
docker compose down
docker compose restart
```

For a specific service:

```bash
docker compose logs -f <service-name>
```

---

## 🩺 Health Checks

The API Gateway exposes:

```http
GET /health
```

Gateway aggregate health:

```http
GET /api/gateway/health
```

Circuit breaker status:

```http
GET /api/gateway/circuit-breakers
```

Individual services also expose:

```http
GET /health
```

---

## 📈 Scalability Strategy

The architecture is designed so individual services can be scaled independently.

For example:

```text
High booking traffic
       │
       ▼
Scale Booking Service
       │
       ├── Inventory remains independently scalable
       ├── Payment remains independently scalable
       └── Notification processing remains asynchronous
```

Kafka allows producers and consumers to operate independently, while Redis and Elasticsearch reduce pressure on transactional databases for appropriate workloads.

---

## ⚠️ Production Considerations

The current project is a learning/portfolio implementation of production-style architecture. Before operating a real railway reservation platform, additional production engineering would be required, including:

- Kubernetes or another orchestration platform
- Managed PostgreSQL/Redis/Kafka/Elasticsearch
- TLS everywhere
- Secret management
- Stronger observability
- Centralized metrics
- Distributed tracing
- Automated CI/CD
- Database backup and disaster recovery
- Multi-region architecture where required
- Kafka replication and stronger durability configuration
- Production-grade Elasticsearch security
- Load testing and capacity planning
- Comprehensive automated testing
- Stronger fraud/payment controls
- Operational alerting and incident management

---

## 🎯 Learning Objectives

This project helps demonstrate practical understanding of:

- Microservices
- REST API design
- Event-driven architecture
- Apache Kafka
- Distributed transactions
- Saga pattern
- Distributed locking
- Idempotency
- Redis
- Elasticsearch
- PostgreSQL
- Prisma
- JWT authentication
- OAuth
- API Gateway
- Rate limiting
- Circuit breakers
- Retry mechanisms
- Dead-Letter Queues
- Docker
- Full-stack development
- Payment integration

---

## 👨‍💻 Project

**Book My Train**

A full-stack railway reservation platform focused on learning and demonstrating modern backend and distributed-system architecture.

**GitHub Repository:** https://github.com/Arvindmeen/book-my-train-repo

---

## 📄 License

This project is intended for educational and portfolio purposes.
