import { updateJobStatus } from "../modules/job/job.service";

module.exports = async (job) => {
  const { jobId } = job.data;

  try {
    await updateJobStatus(jobId, "PROCESSING");

    //Blocking the CPU
    const startTime = Date.now();
    while (Date.now() - startTime < 3000) {
      Math.random() * Math.random();
    }
    await updateJobStatus(jobId, "COMPLETED");
    return { status: "success" };
  } catch (error) {
    await updateJobStatus(jobId, "FAILED");
    throw error;
  }
};
