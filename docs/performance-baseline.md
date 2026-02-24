# Performance Experiments

## Async I/O Workload (50 req/sec)

- Mean latency: ~3005 ms
- p95: ~3011 ms
- Failures: 0
- Stable throughput

## CPU-Bound Blocking Workload (50 req/sec)

- Successful: 3/3120
- Failures: 3117 (ETIMEDOUT)
- Mean latency: ~5677 ms
- Server collapse observed

## Conclusion

Node handles async I/O workloads efficiently.
CPU-bound synchronous processing blocks the event loop
and causes severe performance degradation.

This motivated introduction of job queue architecture.