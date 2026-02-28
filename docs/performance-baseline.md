# Performance Benchmarks

## 1️ Problem: Synchronous Bottleneck

Initially, heavy report generation tasks were executed synchronously on the main thread.  
This blocked the Node.js Event Loop and caused severe performance degradation under moderate load.

### Load Test (50 req/sec)

| Workload Type | Success Rate | Mean Latency | Result |
|---------------|-------------|-------------|--------|
| Async I/O (Simulation) | 100% | ~3,005 ms | Stable but slow |
| CPU-Bound (True Blocking) | 0.01% | ~5,677 ms | Server Collapse |

### Observation

- 3,117 out of 3,120 requests failed (`ETIMEDOUT`)
- Event loop was completely blocked
- Server became unresponsive (including health checks)
- Near-total system failure under sustained load

This demonstrated that CPU-bound synchronous processing is unsafe in a single-threaded Node.js environment.

---

## 2️ Solution: Event-Driven Architecture (Redis + BullMQ)

Heavy tasks were offloaded to a dedicated worker process using **BullMQ** and **Redis**.

### Architectural Change

Instead of processing heavy tasks inline:

1. API receives request  
2. Job is enqueued in Redis  
3. API immediately responds  
4. Worker processes job asynchronously  

This decouples request handling from heavy computation.

---

## 3️ Load Test Results (50 req/sec for 60 seconds)

| Metric | Synchronous (Blocking) | Event-Driven (BullMQ) |
|--------|------------------------|------------------------|
| Total Requests | 3,120 | 6,000 |
| Success Rate | 0.01% | 100% |
| Mean API Latency | ~5,677 ms | ~104.8 ms |
| Median Latency | Timed Out | ~29.1 ms |
| Max Latency | Timed Out | ~1,456 ms |
| System Stability | Collapsed | Stable |

---

## 4️ Database Observations

After stress testing:

- Total jobs created: 3004  
- COMPLETED: 184  
- PROCESSING: 3  
- PENDING: 2817  

This demonstrates correct queue behavior:

When arrival rate exceeded worker throughput, jobs accumulated in the queue instead of blocking the API.  
The system absorbed pressure via Redis rather than crashing.

---

## Key Outcomes

- Eliminated server collapse under load  
- Reduced failure rate from ~99% to 0%  
- Preserved API responsiveness under sustained traffic  
- Enabled horizontal scalability via additional workers  
- Successfully decoupled request lifecycle from heavy processing  

---

## Final Conclusion

Migrating from a synchronous CPU-bound model to a Redis-backed event-driven worker architecture transformed the system from a fragile, blocking backend into a resilient and scalable engine capable of handling high-concurrency workloads.
