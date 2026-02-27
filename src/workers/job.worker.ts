import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { updateJobStatus } from "../modules/job/job.service";

const worker = new Worker(
  "jobQueue",
  async (job) => {
    const { jobId } = job.data;
    try {
      console.log(` ${jobId}`);

      //Mark as processing
      await updateJobStatus(jobId, "PROCESSING");

      //Simulate long task
      await new Promise((resolve) => setTimeout(resolve, 3000));

      //Mark as completed
      await updateJobStatus(jobId, "COMPLETED");

      console.log("Completed Job", jobId);
    } catch (error) {
      console.error(`Job ${jobId} failed `, error);
      await updateJobStatus(jobId, "FAILED");
      throw error;
    }
  },
  {
    connection: redisConnection,
  },
);

console.log("Worker started");
