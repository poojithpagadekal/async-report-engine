# Performance Analysis

Load tested with Artillery across three architectural stages at ~100 req/sec on a single host. The workload is deterministic — 100M square-root iterations per job split across three stages (20M → 60M → 20M) — so results reflect real CPU pressure rather than artificial delays.

## Test Configuration

| Parameter | Value |
| :--- | :--- |
| Tool | Artillery |
| Load | ~100 req/sec sustained |
| Workload | 100M square-root iterations per job |
| Environment | Dockerized API + Redis + PostgreSQL + Worker(s) |
| Host | Single machine (multi-core) |

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

## Phase 3 — Three Worker Containers

Three worker replicas on the same host (logical concurrency: 12 jobs).

| Metric | Result |
| :--- | :--- |
| Total Requests | 3,000 |
| Success Rate | ~9.7% (291 successful) |
| Failures | 2,710 ETIMEDOUT |
| Mean Latency | 5,745 ms |

Adding workers made things worse — this is the most instructive result. Although each worker runs in its own container, all containers on the same host share the same physical CPU cores. Three CPU-saturating workers competing for the same cores meant each got less throughput than one worker alone. On top of that, parallel workers hitting PostgreSQL simultaneously exceeded the connection pool capacity, causing contention on every status update. This demonstrates infrastructure saturation rather than an application-level failure.

---

## Bottleneck Summary

| Phase | Bottleneck | Type |
| :--- | :--- | :--- |
| Sync | Event loop blocked | Design flaw — solved ✓ |
| 1 Worker | CPU throughput ceiling | Compute limit |
| 3 Workers | Shared host CPU + DB contention | Infrastructure limit |

The architecture eliminated the application-level problem in Phase 1. Phases 2 and 3 expose infrastructure constraints that would be addressed by running workers on separate physical hosts and adding a database connection pooler (e.g. PgBouncer).
