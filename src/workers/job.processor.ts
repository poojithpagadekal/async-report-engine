import { updateJobStatus } from "../modules/job/job.service";
import { Job } from "bullmq";

export default async function (job: Job) {
  const { jobId } = job.data;

  try {
    await updateJobStatus(jobId, "PROCESSING");

    await job.updateProgress(10);

    const startTime = Date.now();
    while (Date.now() - startTime < 1000) {}

    await job.updateProgress(40);

    const midTime = Date.now();
    while (Date.now() - midTime < 1000) {}

    await job.updateProgress(70);

    const endTime = Date.now();
    while (Date.now() - endTime < 1000) {}

    await job.updateProgress(100);

    await updateJobStatus(jobId, "COMPLETED");

    return { status: "success" };
  } catch (error) {
    await updateJobStatus(jobId, "FAILED");
    throw error;
  }
}
