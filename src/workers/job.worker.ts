import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import path from "path";

const processorPath = path.join(__dirname, "job.processor.js");

const worker = new Worker("jobQueue", processorPath, {
  connection: redisConnection,
  concurrency: 4,
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} failed with ${err.message}`);
});

console.log("Worker started");
