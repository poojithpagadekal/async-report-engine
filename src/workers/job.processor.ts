import { Job } from "bullmq";
import { logger } from "../utils/logger";

function performHeavyComputation(iterations: number) {
  let result = 0;
  for (let i = 0; i < iterations; i++) {
    result += Math.sqrt(i * Math.random());
  }
  return result;
}

export default async function jobProcessor(job: Job) {
  const { jobId } = job.data;
  const startTimestamp = Date.now();

  const jobLog = logger.child({
    jobId,
    jobName: job.name,
    attempt: job.attemptsMade + 1,
  });

  try {
    jobLog.info("Job execution started: Work-based CPU load");

    await job.updateProgress(0);

    performHeavyComputation(20_000_000);
    await job.updateProgress(30);

    performHeavyComputation(60_000_000);
    await job.updateProgress(80);

    performHeavyComputation(20_000_000);
    await job.updateProgress(100);

    const totalDuration = Date.now() - startTimestamp;
    jobLog.info(
      { status: "COMPLETED", durationMs: totalDuration },
      "Job successfully finished",
    );

    return { status: "success", duration: totalDuration };
  } catch (error) {
    jobLog.error(
      {
        err: error,
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Processor encountered an error",
    );
    throw error;
  }
}
