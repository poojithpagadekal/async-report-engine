# Performance & Scalability Analysis

This document summarizes load testing results across three architectural stages:
1. Synchronous (blocking)
2. Distributed (1 worker)
3. Distributed (3 workers)

Tests were executed using Artillery under sustained load (~74 req/sec for 60s) on a single host.

---

## Test Configuration

- Workload: Simulated 3-second CPU-bound task
- Environment: Dockerized API, Redis, PostgreSQL, Worker(s)
- Host: Single machine (multiple CPU cores)

---

## Phase 1 — Synchronous (Blocking)

CPU task executed inside the HTTP lifecycle.

| Metric | Result |
|--------|--------|
| Success Rate | < 0.1% |
| Failures | ~3,117 ETIMEDOUT |
| Mean Latency | ~5,677 ms |
| System State | Collapsed |

**Bottleneck:** Event Loop Blocking  
The server became unresponsive due to CPU starvation.

---

## Phase 2 — Distributed (1 Worker)

Jobs offloaded to one worker (concurrency: 4).

| Metric | Result |
|--------|--------|
| Total Requests | 4,425 |
| Success Rate | ~64.4% |
| Successful Responses | 2,850 |
| Failed Requests | 1,575 ETIMEDOUT |
| Mean Latency | ~4,933 ms |

**Bottleneck:** Worker Compute Throughput  
The API remained responsive. Redis absorbed burst traffic (backpressure). Failures occurred when ingestion exceeded worker processing capacity.

---

## Phase 3 — Horizontal Scaling (3 Workers)

Workers scaled to 3 replicas (total concurrency: 12), all on the same host.

| Metric | Result |
|--------|--------|
| Total Requests | 3,371 |
| Success Rate | ~13.5% |
| Successful Responses | 454 |
| Failed Requests | 2,954 ETIMEDOUT |

**Bottleneck:** Database / I/O Contention  
Scaling compute exposed infrastructure limits:
- PostgreSQL connection contention
- Host-level resource saturation
- Increased ingestion timeouts

The API remained alive, but infrastructure capacity became the limiting factor.

---

## Bottleneck Evolution

| Phase | Primary Limitation |
|-------|-------------------|
| Sync | Event Loop (Software) |
| 1 Worker | CPU Throughput |
| 3 Workers | Database / I/O |

The architecture successfully eliminated application-level blocking.  
Under higher concurrency, failures shifted from software design flaws to measurable infrastructure constraints.

---

## Conclusion

The transition to a distributed worker model removed event loop starvation and enabled controlled degradation under load.

Horizontal scaling increased compute capacity but revealed persistence-layer limits on a single host. Further improvements require database tuning, connection pooling, and multi-node distribution.
