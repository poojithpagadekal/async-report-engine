# Async Report Processing System

A distributed, event-driven system designed to handle long-running report generation tasks asynchronously using a job queue architecture.

---

## Overview

This project demonstrates how to design and implement a scalable backend system capable of processing resource-intensive tasks outside the main request-response cycle.

Instead of blocking the API while a report is generated, tasks are queued and processed by dedicated worker services. This approach improves responsiveness, scalability, and system reliability.

---

## Tech Stack

- Node.js
- Express
- React
- Redis
- BullMQ
- PostgreSQL
- Docker
- Docker Compose

---

## Architecture

1. The client submits a report generation request.
2. The API server validates the request and enqueues a job using BullMQ.
3. Redis acts as the message broker for the job queue.
4. A separate worker service processes the job asynchronously.
5. The processed result is stored in the database.
6. The client retrieves job status and results via polling.

This architecture mirrors real-world distributed backend systems used in production environments.

---

## Key Concepts Demonstrated

- Asynchronous job processing
- Queue-based system design
- Separation of API and worker services
- Background task execution
- Containerized services using Docker
- Inter-service communication
