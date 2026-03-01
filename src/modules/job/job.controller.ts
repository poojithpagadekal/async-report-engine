import { Request, Response } from "express";
import { createJob, getAllJobs, updateJobStatus } from "./job.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { jobQueue } from "./job.queue";

export const createJobHandler = async (req: Request, res: Response) => {
  try {
    const { userId, title, type } = req.body;
    const job = await createJob(userId, title, type);
    await jobQueue.add("processJob", {
      jobId: job.id,
    });
    return res.status(201).json({
      job,
    });
  } catch (error) {
    req.log.error({ err: error }, "Failed to create job");

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return res.status(400).json({
          message: "Invalid user id",
        });
      }
    }

    return res.status(500).json({
      message: "server error (error creating job)",
    });
  }
};

export const getJobHandler = async (req: Request, res: Response) => {
  try {
    const jobs = await getAllJobs();
    return res.status(200).json({
      jobs,
    });
  } catch (error) {
    req.log.error({ err: error }, "Failed to fetch jobs");
    return res.status(500).json({
      message: "server error (error getting jobs)",
    });
  }
};

export const updateJobHandler = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId as string;
    if (!jobId) {
      req.log.warn("Missing jobId in request params");
      return res.status(400).json({
        message: "Job Id is required",
      });
    }
    const { status, progress } = req.body;

    const updatedJob = await updateJobStatus(jobId, status, progress);

    return res.status(200).json({
      updatedJob,
    });
  } catch (error) {
    req.log.error({ err: error }, "Failed to update job");

    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "server error (error updating job)",
    });
  }
};
