# Async Report Processing System

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

Distributed event-driven backend system for asynchronous processing of long-running report generation tasks using a job queue architecture.

---

## Overview

This project demonstrates how to design and implement a scalable backend system capable of processing resource-intensive tasks outside the main request-response cycle.

Instead of blocking the API while a report is generated, tasks are queued and processed by dedicated worker services.

The system evolved from a synchronous, CPU-bound architecture to a distributed, queue-based processing model validated through performance benchmarking.

---

## Tech Stack

- Node.js & Express – API framework for request ingestion  
- Redis & BullMQ – Message broker and job queue management  
- PostgreSQL & Prisma – Relational database and ORM  
- Docker & Docker Compose – Service orchestration  
- Artillery – Load testing and benchmarking  

---

## Architecture

1. Client submits a report generation request  
2. API validates input and enqueues a job using BullMQ  
3. Redis manages the queue state  
4. A dedicated worker service processes jobs asynchronously  
5. Results and status updates are stored in PostgreSQL  
6. Client polls the API for job status and final results  

This architecture mirrors production-grade distributed backend systems.

---

## Performance Benchmarking

Load testing was conducted at 50 requests/sec for 60 seconds.

| Metric | Synchronous (Blocking) | Distributed (BullMQ) |
|--------|------------------------|----------------------|
| Success Rate | 0.01% | 100% |
| Failures (ETIMEDOUT) | 3,117 | 0 |
| Mean API Latency | ~5,677 ms | ~104.8 ms |
| Median API Latency | Timed Out | ~29.1 ms |
| System Stability | Collapsed | Stable |

---

### Key Findings

- Handled 6,000 total requests with 0% failure rate under sustained load  
- API remained responsive during heavy background processing  
- Over 3,000 jobs were ingested in under 60 seconds without server collapse  
- Backpressure was absorbed by Redis when worker throughput was exceeded  
- Request lifecycle was successfully decoupled from heavy computation  

Detailed benchmark analysis is available in:

[View Detailed Performance Breakdown](docs/performance-baseline.md)

---

## Key Concepts Demonstrated

- Asynchronous job processing  
- Event loop behavior analysis  
- Backpressure handling via message queues  
- Separation of API and worker services  
- Containerized distributed architecture  
- Performance benchmarking under load  

---

## Running Locally

Ensure Docker and Docker Compose are installed.

```bash
git clone https://github.com/poojithpagadekal/async-report-engine.git
cd async-report-engine
docker-compose up --build
