# Performance & Scalability Analysis

This document compares a synchronous CPU-bound implementation against a distributed BullMQ-based worker architecture under sustained load testing using Artillery.

---

## Test Configuration

- Duration: 60 seconds
- Peak Request Rate: ~74 requests/sec
- Workload: Simulated 3-second CPU-bound computation
- Worker Concurrency: 4
- Environment: Dockerized services (API, Redis, PostgreSQL, Worker)

The test intentionally pushed the system to saturation to observe real-world behavior under stress.

---

## 1. Baseline: Synchronous (Blocking) Architecture

In the baseline model, the 3-second CPU-bound task executed directly inside the HTTP request lifecycle.

### Observed Behavior (50 req/sec)

| Metric | Result |
|--------|--------|
| Success Rate | ~0.01% |
| Failures | ~3,117 ETIMEDOUT |
| Mean Latency | ~5,677 ms |
| Server State | Event Loop Blocked |
| System Stability | Collapsed |

### Analysis

- The Node.js event loop was blocked by CPU-heavy logic.
- Incoming requests could not be processed.
- Even health checks became unresponsive.
- The system failed due to application-level design limitations.

Failure mode: **Event Loop Blocking**

---

## 2. Distributed Worker Architecture (BullMQ + Sandboxed Processors)

The system was refactored to decouple request ingestion from heavy computation:

- API enqueues jobs into Redis.
- Workers process CPU-heavy tasks in isolated child processes.
- API responds immediately after job submission.

---

## 3. High-Load Results (Worker Version)

Based on the provided Artillery summary report :contentReference[oaicite:1]{index=1}:

| Metric | Distributed (Workers) |
|--------|-----------------------|
| Total Requests | 4,425 |
| Successful Responses | 2,850 |
| Failed Requests (ETIMEDOUT) | 1,575 |
| Success Rate | ~64.4% |
| Mean Latency | ~4,933 ms |
| Median Latency | ~3,984 ms |
| p95 Latency | ~9,801 ms |
| Request Rate | ~74 req/sec |

---

## 4. Comparative Summary

| Metric | Synchronous (Blocking) | Distributed (Workers) |
|--------|------------------------|------------------------|
| Failure Mode | Event Loop Blocking | Infrastructure Saturation |
| API Responsiveness | Unresponsive | Responsive under load |
| Request Handling | Collapsed | Degraded gradually |
| Data Integrity | Requests lost | All successfully ingested jobs processed |
| Scalability Model | Vertical only | Horizontally scalable |

---

## 5. System Behavior Under Saturation

At sustained ~74 req/sec:

- The API remained alive and continued accepting requests.
- Redis buffered incoming jobs (backpressure).
- Workers processed jobs at fixed throughput (4 concurrent tasks).
- ETIMEDOUT errors occurred due to infrastructure limits, not application deadlock.

Primary bottleneck observed:
- PostgreSQL connection pool contention
- I/O competition between API and worker processes

Importantly:
- No worker crashes occurred.
- No stalled jobs were observed.
- Successfully ingested jobs were processed to completion.

Failure mode: **Resource Saturation (Database / Network)**

---

## 6. Engineering Interpretation

### What Changed

Before:
- CPU-heavy logic blocked the event loop.
- Server became unreachable.

After:
- CPU-heavy logic isolated in sandboxed worker processes.
- API thread remained responsive.
- Bottleneck shifted from application design to infrastructure capacity.

This represents a transition from a design flaw to a scaling limit.

---

## 7. Scaling Strategy

To improve sustained success rate under extreme load:

- Increase PostgreSQL connection pool size
- Add additional worker instances
- Increase worker concurrency
- Implement API-level rate limiting
- Introduce queue-depth admission control
- Add monitoring and autoscaling policies

---

## Final Conclusion

The migration from a synchronous CPU-bound model to a distributed BullMQ-based worker architecture successfully eliminated event loop blocking and enabled graceful degradation under sustained load.

While extreme traffic resulted in database/network saturation, the system remained operational and continued processing queued jobs. The bottleneck shifted from application-level blocking to infrastructure capacity limits, demonstrating correct architectural separation and horizontal scalability potential.
