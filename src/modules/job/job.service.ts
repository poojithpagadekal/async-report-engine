import { JobStatus, JobType, Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "../../config/db";

export const createJob = async (
  userId: string,
  title: string,
  type: JobType,
) => {
  return prisma.job.create({
    data: { title, type, userId },
  });
};

export const getAllJobs = async () => {
  return prisma.job.findMany({ include: { user: true } });
};

export const getJobById = async (jobId: string) => {
  return prisma.job.findUnique({
    where: { id: jobId },
    include: { user: true },
  });
};

export const updateJobStatus = async (
  jobId: string,
  status: JobStatus,
  progress?: number,
  errorMessage?: string,
) => {
  const updateData: Prisma.JobUpdateInput = {
    status,
    errorMessage: errorMessage ?? null,
  };

  if (progress !== undefined) updateData.progress = progress;

  switch (status) {
    case JobStatus.PENDING:
      updateData.startedAt = null;
      updateData.progress = 0;
      break;
    case JobStatus.PROCESSING:
      updateData.startedAt = new Date();
      break;
    case JobStatus.COMPLETED:
      updateData.completedAt = new Date();
      updateData.progress = 100;
      break;
    case JobStatus.FAILED:
      break;
  }

  try {
    return await prisma.job.update({
      where: { id: jobId },
      data: updateData,
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error(`Job with ID ${jobId} not found.`);
    }
    throw error;
  }
};
