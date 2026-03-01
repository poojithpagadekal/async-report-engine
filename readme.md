# Async Report Engine

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

A backend system that demonstrates how to offload CPU-intensive workloads from the main request-response cycle using a distributed job queue architecture.

---

## Overview

This project explores how to design a Node.js backend that remains responsive under CPU-heavy workloads by separating API request handling from background task execution. 

Instead of executing heavy tasks inside the HTTP lifecycle, incoming requests are enqueued and processed asynchronously by dedicated worker processes. This ensures the API layer remains responsive even when workers are fully utilized.

The focus of this project is architectural design, event loop isolation, and system behavior under sustained load.

---

## Tech Stack

- **Node.js & Express** – API framework
- **TypeScript** – Type safety and maintainability
- **Redis & BullMQ** – Message broker and job queue management
- **PostgreSQL & Prisma** – Relational database and ORM
- **Docker & Docker Compose** – Containerized services
- **Artillery** – Load testing and benchmarking
- **Pino** – Structured JSON logging and observability
- **BullBoard** – Queue observability dashboard

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

## Performance & Scaling Analysis

The system was benchmarked under sustained load (~100 requests/sec) using a **deterministic workload** of 100M math iterations per job:

### 1. Synchronous Baseline
- **Execution**: CPU-bound logic executed on the main thread.
- **Result**: Event loop blocked; success rate < 1.1%.
- **System State**: Total collapse/unresponsiveness.

### 2. Distributed – Single Worker
- **Execution**: Tasks offloaded to one worker (concurrency: 4).
- **Result**: API remained responsive; success rate ~91.4%.
- **Observation**: Redis successfully buffered burst traffic (backpressure).

### 3. Distributed – Three Workers
- **Execution**: Workers scaled to three containers (12 concurrent jobs).
- **Result**: Observed success rate decreased to ~9.7%.
- **Bottleneck**: Shifted from CPU to PostgreSQL connection contention and host-level I/O limits.

[Detailed benchmark data](docs/performance-baseline.md)

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
```
---
##  Monitoring & Observability

### BullBoard Dashboard

After starting the Docker containers, you can monitor queue state, active workers, and job progress in real time using the BullBoard UI.

**Local Access:**  
http://localhost:5000/admin/queues

> The dashboard is only accessible while the Docker containers are running locally.
