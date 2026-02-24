# Async Report Processing System

A distributed, event-driven backend system designed to handle long-running report generation tasks asynchronously using a job queue architecture.

---

## Overview

This project demonstrates how to design and implement a scalable backend system capable of processing resource-intensive tasks outside the main request-response cycle.

Instead of blocking the API while a report is generated, tasks are queued and processed by dedicated worker services. This approach improves responsiveness, scalability, and system reliability.

---

## Tech Stack

- Node.js
- Express
- Redis
- BullMQ
- PostgreSQL
- Prisma
- Docker
- Docker Compose

---

## Project Status

Event loop performance experiments completed  
Queue-based job processing (in progress)  
Worker service separation (planned)

This repository documents the architectural evolution from synchronous request handling to a distributed, queue-based processing model.
---

## Architecture

1. Client submits a report generation request.
2. API server validates and enqueues a job using BullMQ.
3. Redis acts as the message broker.
4. A separate worker service processes the job asynchronously.
5. Processed results are stored in PostgreSQL.
6. Client polls the API for job status and results.

This architecture is being implemented incrementally to mirror production-grade distributed backend systems.
---

## Key Concepts Demonstrated

- Asynchronous job processing
- Event loop behavior analysis
- Queue-based system design
- Separation of API and worker services
- Background task execution
- Containerized microservice-style setup
- Performance benchmarking under load

---

## Performance Testing

Load testing was conducted using Artillery.

Detailed results and experiment analysis:
- [Performance Baseline](docs/performance-baseline.md)

The experiments demonstrate the difference between:

- Async I/O workloads (non-blocking)
- CPU-bound blocking workloads (event loop collapse)

These findings motivated the queue-based architecture.

---