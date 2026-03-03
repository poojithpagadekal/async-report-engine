# Performance Analysis

Load tested with Artillery across four test runs at ~100 req/sec on a single host (16 logical cores, 24GB RAM, Docker on WSL 2). The workload is deterministic — 100M square-root iterations per job split across three stages (20M → 60M → 20M) — so results reflect real CPU pressure rather than artificial delays.

---

## Test Configuration

| Parameter | Value |
| :--- | :--- |
| Tool | Artillery |
| Load | ~100 req/sec sustained |
| Workload | 100M square-root iterations per job |
| Environment | Dockerized API + Redis + PostgreSQL + Worker(s) |
| Host | Single machine — 16 cores, 24GB RAM, WSL 2 |

---

## Phase 1 — Synchronous (Blocking)

CPU-bound logic executed directly inside the HTTP request handler.

| Metric | Result |
| :--- | :--- |
| Total Requests | 3,120 |
| Success Rate | ~1.1% (35 successful) |
| Failures | 3,085 ETIMEDOUT |
| Mean Latency | 5,583.5 ms |

The main thread was fully occupied running math and couldn't process new connections. Nearly every request timed out. This is a design problem — not a resource limit.

---

## Phase 2 — Single Worker Process

CPU work offloaded to a dedicated worker container (concurrency: 4).

| Metric | Result |
| :--- | :--- |
| Total Requests | 3,000 |
| Success Rate | ~91.4% (2,742 successful) |
| Failures | 258 ETIMEDOUT |
| Mean Latency | 1,545 ms |
| p99 Latency | 9,801.2 ms |

The API stayed responsive — initial latency dropped to ~3.4 ms. As the worker saturated its CPU allocation, the Redis queue backed up. Jobs submitted late in the test waited too long and timed out on the client side. Redis absorbed the burst rather than dropping jobs, which is the expected behavior.

---

## Phase 3 — Three Workers, Rate Limited

Three worker containers on the same host (logical concurrency: 12 jobs). Rate limiter active at 50 req/min on `POST /api/jobs`.

| Metric | Result |
| :--- | :--- |
| Total Requests | 3,000 |
| Success Rate | ~9.7% (291 successful) |
| Failures | 2,710 (429 Too Many Requests) |
| Mean Latency | 5,745 ms |

The failures here are `429` responses — not timeouts or infrastructure errors. Artillery was sending 100 req/sec (6,000 req/min) against a rate limiter capped at 50 req/min. The rate limiter rejected the excess load as designed. The API itself remained healthy throughout.

**This is not a regression — it is the rate limiter working correctly.**

---

## Phase 3 Repeated — Three Workers, No Rate Limiter

Same setup with the rate limiter removed from `POST /api/jobs`.

| Metric | Result |
| :--- | :--- |
| Total Requests | 6,000 |
| Success Rate | ~100% (0 failures) |
| Mean Latency | 46.1 ms |
| p99 Latency | 237.5 ms |

Zero failures. Zero timeouts. Zero errors in the API logs. The architecture handled 100 req/sec across 3 workers cleanly on this host.

---

## What the Results Actually Show

| Phase | Bottleneck | Type |
| :--- | :--- | :--- |
| Sync | Event loop blocked | Design flaw |
| 1 Worker | Queue backpressure | Compute limit — addressable with more workers |
| 3 Workers + Limiter | Rate limiter rejecting burst | Intentional — working as designed |
| 3 Workers, no limiter | None on this host | Architecture scales cleanly |

The architecture successfully eliminated the event loop blocking problem from Phase 1. Phase 2 showed the single worker reaching its compute limit. The re-run in Phase 3 without the rate limiter confirmed the distributed worker model scales correctly — 3 workers handled full load with no failures on a 16-core WSL 2 host.

---

## Notes on the Rate Limiter

The rate limiter on `POST /api/jobs` (50 req/min) is intentionally conservative. In a real deployment it would be tuned to match the worker processing capacity, preventing the Redis queue from growing faster than workers can drain it. The Phase 3 regression in the original benchmark was not an infrastructure failure — it was evidence the rate limiter was enforcing its configured limit under burst traffic.
