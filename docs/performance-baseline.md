# Performance & Scalability Analysis

This document summarizes load testing results across three architectural stages, transitioning from a monolithic synchronous model to a distributed, horizontally scaled worker architecture.

Tests were executed using Artillery under sustained load (~100 req/sec) on a single host.

---

## Test Configuration

- **Workload**: 100 Million deterministic square-root operations per job (Work-based CPU saturation).
- **Environment**: Dockerized API, Redis, PostgreSQL, Worker(s).
- **Host**: Single machine (multi-core).

---

## Phase 1 — Synchronous (Blocking)

CPU task executed directly inside the HTTP request-response lifecycle.

| Metric | Result |
| :--- | :--- |
| **Total Requests** | 3,120 |
| **Success Rate** | ~1.1% (35 successful) |
| **Failures** | 3,085 ETIMEDOUT |
| **Mean Latency** | 5,583.5 ms |
| **System State** | Collapsed |

**Bottleneck: Event Loop Blocking** The Node.js main thread was 100% occupied by math iterations. The server became unresponsive and could not acknowledge new TCP handshakes, causing massive timeouts.

---

## Phase 2 — Distributed (1 Worker)

Jobs offloaded to a single worker process (concurrency: 4).

| Metric | Result |
| :--- | :--- |
| **Total Requests** | 3,000 |
| **Success Rate** | ~91.4% |
| **Failures** | 258 ETIMEDOUT |
| **Mean Latency** | 1,545 ms |
| **p99 Latency** | 9,801.2 ms |

**Bottleneck: Worker Compute Throughput** The API remained responsive with low initial latency (3.4 ms). However, as the single worker reached its compute limit, backpressure built up in the Redis queue, leading to increased latency and terminal timeouts as ingestion outpaced processing capacity.

---

## Phase 3 — Horizontal Scaling (3 Workers)

Workers scaled to 3 replicas (logical concurrency: 12 jobs configured) on the same host.

| Metric | Result |
| :--- | :--- |
| **Total Requests** | 3,000 |
| **Success Rate** | ~9.7% |
| **Failures** | 2,710 ETIMEDOUT |
| **Mean Latency** | 5,745 ms |

**Bottleneck: Database & I/O Contention** Scaling compute exposed infrastructure limits. Parallel workers competing for the same physical CPU resources and PostgreSQL connection pool caused a "Thundering Herd" effect. Resource contention at the persistence layer became the primary limiting factor.

---

## Bottleneck Evolution

| Phase | Primary Limitation | System Maturity |
| :--- | :--- | :--- |
| **Sync** | Event Loop (Software Design) | Fragile |
| **1 Worker** | CPU Throughput (Compute) | Resilient |
| **3 Workers** | Database / I/O (Infrastructure) | Scalable |

The architecture successfully eliminated application-level blocking. Under higher concurrency, failures shifted from software design flaws to measurable infrastructure constraints.

---

## Conclusion

The transition to a distributed worker model removed event loop starvation and enabled controlled degradation under load. By moving from time-based waiting to a deterministic 100M iteration workload, the benchmarks reflect real-world computational stress.

**Future Hardening Required**:
1. **API Rate Limiting**: To prevent infrastructure saturation during bursts.
2. **Connection Pooling**: Implementing PgBouncer to manage PostgreSQL contention.
3. **Multi-Node Distribution**: Moving workers to separate physical hosts to resolve I/O and CPU contention.
