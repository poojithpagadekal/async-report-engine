# Async Report Engine

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

A backend project exploring how to handle CPU-intensive tasks without blocking the Node.js event loop, using a distributed job queue architecture.

---

## The Problem

Node.js runs on a single-threaded event loop. Running CPU-heavy logic directly inside an HTTP handler blocks the loop entirely — the server can't respond to anything else while it's computing. Under sustained load, this causes cascading timeouts and full unresponsiveness.

This project addresses that by separating concerns: the API only validates and enqueues jobs, while isolated worker processes handle the computation asynchronously.

This pattern shows up in real systems handling report generation, video encoding, AI inference, and payment processing pipelines — anywhere a task is too slow to live inside a request-response cycle.

---

## Architecture

```
Client → [Express API] → [BullMQ Queue] → [Worker Process(es)]
                ↑               ↓                   ↓
           (poll status)     [Redis]          [PostgreSQL]
```

1. Client creates a user, then submits a job via `POST /api/jobs`
2. API validates the request with Zod and enqueues a job into BullMQ
3. Redis stores the queue state and manages job lifecycle
4. Worker processes pick up jobs from the queue (concurrency: 4 per worker)
5. The processor runs 100M iterations of CPU-bound math, reporting progress at 30%, 80%, and 100%
6. Job status transitions (`PENDING → PROCESSING → COMPLETED / FAILED`) are written to PostgreSQL
7. Client polls `GET /api/jobs` for status and results

The API and worker run as **separate containers** — compute pressure on the worker never reaches the API event loop.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| API Framework | Node.js, Express, TypeScript |
| Queue / Broker | BullMQ, Redis 7 |
| Database / ORM | PostgreSQL 15, Prisma |
| Validation | Zod |
| Rate Limiting | express-rate-limit |
| Logging | Pino |
| Observability | BullBoard |
| Containerization | Docker, Docker Compose |
| Load Testing | Artillery |

---

## API Reference

All routes are prefixed with `/api`.

### Users

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/users` | Create a new user |
| `GET` | `/api/users` | List all users and their jobs |

```json
// POST /api/users
{
  "email": "user@example.com",
  "name": "John"
}
```

### Jobs

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/jobs` | Submit a new job (rate limited: 50 req/min) |
| `GET` | `/api/jobs` | List all jobs with user info |
| `PATCH` | `/api/jobs/:jobId` | Update job status and progress |

```json
// POST /api/jobs
{
  "userId": "94c027b2-a44d-4962-9946-7de970e1a9b2",
  "title": "Q4 Sales Report",
  "type": "PDF_EXPORT"
}
```

---

## Resilience Features

**Graceful shutdown** — on `SIGTERM`, the system stops the HTTP server first, waits for the active worker job to finish, then disconnects Prisma and Redis. A 30-second force-exit timer acts as a safety net.

**Retry with exponential backoff** — jobs are retried up to 5 times with `10s × 2ⁿ` delays, handling transient DB or network errors without immediately marking a job as failed.

**Rate limiting** — `POST /api/jobs` is capped at 50 requests per minute. Requests over the limit get a `429` with a retry message.

**Input validation** — every endpoint uses a Zod middleware that validates, sanitizes, and strips unknown fields before the request reaches the controller.

---

## Getting Started

**Prerequisites**: Docker and Docker Compose.

```bash
git clone https://github.com/poojithpagadekal/async-report-engine.git
cd async-report-engine
docker-compose up --build
```

| Service | URL |
| :--- | :--- |
| API | http://localhost:5000 |
| BullBoard dashboard | http://localhost:5000/admin/queues |

To run with multiple workers:

```bash
WORKER_REPLICAS=3 docker-compose up --build
```

### Workflow

```bash
# 1. Create a user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'

# 2. Submit a job using the returned userId
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"userId": "<userId>", "title": "Q4 Sales Report", "type": "PDF_EXPORT"}'

# 3. Poll for status
curl http://localhost:5000/api/jobs
```

---

## Performance Benchmarks

Tested with Artillery at ~100 req/sec using 100M math iterations per job on a single host.

| Phase | Architecture | Success Rate | Bottleneck |
| :--- | :--- | :--- | :--- |
| **1 — Sync** | Blocking, single-threaded | ~1.1% | Event loop blocked by CPU work |
| **2 — 1 Worker** | Decoupled worker process | ~91.4% | Worker CPU throughput |
| **3 — 3 Workers** | Horizontally scaled | ~9.7% | DB connection contention + host CPU |

The Phase 3 regression — where adding more workers made things worse — is the most interesting result. The API and worker run in separate containers, but all containers on the same host share the same physical CPU cores. Three CPU-saturating workers competing for the same cores meant each got less time than before, and parallel DB writes exceeded the connection pool capacity on top of that. It demonstrates infrastructure saturation rather than an application-level failure.

Full analysis: [docs/performance-baseline.md](docs/performance-baseline.md)
