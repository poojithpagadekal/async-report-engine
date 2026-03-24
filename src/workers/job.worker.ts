import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import path from "path";
import { updateJobStatus } from "../modules/job/job.service";
import { JobStatus } from "@prisma/client";
import { logger } from "../utils/logger";

const processorPath = path.join(__dirname, "job.processor.js");

export const worker = new Worker("jobQueue", processorPath, {
  connection: redisConnection,
  concurrency: 4,
});

worker.on("active", async (job) => {
  try {
    await updateJobStatus(job.data.jobId, JobStatus.PROCESSING);
    logger.info(`Job ${job.id} is processing`);
  } catch (err) {
    logger.error({ err }, "Failed to mark job as PROCESSING");
  }
});

worker.on("progress", async (job, progress) => {
  try {
    await updateJobStatus(
      job.data.jobId,
      JobStatus.PROCESSING,
      progress as number,
    );
  } catch (err) {
    logger.error({ err }, "Failed to sync job progress");
  }
});

worker.on("completed", async (job) => {
  try {
    await updateJobStatus(job.data.jobId, JobStatus.COMPLETED);
    logger.info(`Job ${job.id} has completed`);
  } catch (err) {
    logger.error({ err }, "Failed to mark job as COMPLETED");
  }
});

worker.on("failed", async (job, err) => {
  try {
    const attemptsMade = job?.attemptsMade ?? 0;
    const maxAttempts = job?.opts.attempts ?? 1;

    if (attemptsMade < maxAttempts) {
      logger.warn(
        `Job ${job?.id} failed. Attempt ${attemptsMade}/${maxAttempts}. Retrying...`,
      );
    } else {
      logger.error(`Job ${job?.id} exhausted all retries`);
      await updateJobStatus(
        job!.data.jobId,
        JobStatus.FAILED,
        undefined,
        err.message,
      );
    }
  } catch (error) {
    logger.error({ error }, "Failed to mark job as FAILED");
  }
});

logger.info("Worker container running");