# Async Report Processing System

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

A backend system that demonstrates how to offload CPU-intensive workloads from the main request-response cycle using a distributed job queue architecture.

---

## Overview

This project explores how to design a Node.js backend that remains responsive under CPU-heavy workloads by separating API request handling from background task execution.

Instead of executing a 3-second CPU-bound task inside the HTTP lifecycle, incoming requests are enqueued and processed asynchronously by dedicated worker processes. This ensures the API layer remains responsive even when workers are fully utilized.

The focus of this project is architectural design, event loop isolation, and system behavior under sustained load.

---

## Tech Stack

- Node.js & Express – API framework  
- TypeScript – Type safety and maintainability  
- Redis & BullMQ – Message broker and job queue management  
- PostgreSQL & Prisma – Relational database and ORM  
- Docker & Docker Compose – Containerized services  
- Artillery – Load testing and benchmarking  

---

## Architecture

1. Client submits a task request  
2. API validates input and enqueues a job using BullMQ  
3. Redis stores and manages queue state  
4. Dedicated worker processes consume jobs asynchronously  
5. Workers update PostgreSQL as job states transition (`PROCESSING` → `COMPLETED`)  
6. Clients poll the API for job status and results  

The system follows common distributed system patterns for decoupled background processing and workload isolation.

---

## Performance Benchmarking

Load testing was conducted at sustained request rates (50–75 requests/sec) for 60 seconds to compare:

- A synchronous, event-loop-blocking implementation  
- A distributed BullMQ-based worker model  

### Observations

- The synchronous model collapsed due to event loop blocking.
- The distributed model kept the API responsive under load.
- Under extreme traffic, the system reached infrastructure saturation (database/network limits) rather than application-level failure.
- Successfully ingested jobs were processed to completion by workers.
- Redis buffered incoming jobs when workers were at capacity (backpressure).

Detailed metrics, latency distributions, and saturation analysis are available in:

[View Detailed Performance Breakdown](docs/performance-baseline.md)

---

## Key Concepts Demonstrated

- Asynchronous job processing  
- Event loop isolation in Node.js  
- Sandboxed worker processes  
- Backpressure handling via Redis  
- Separation of API and worker services  
- Graceful degradation under load  
- Performance benchmarking and bottleneck analysis  

---

## Running Locally

Ensure Docker and Docker Compose are installed.

```bash
git clone https://github.com/poojithpagadekal/async-report-engine.git
cd async-report-engine
docker-compose up --build
