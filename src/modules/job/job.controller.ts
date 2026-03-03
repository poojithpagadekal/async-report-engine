import { Request, Response } from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJobStatus,
} from "./job.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { jobQueue } from "./job.queue";
import { z } from "zod";
import { CreateJobSchema, GetAllJobsSchema } from "./job.schema";

type createJobInput = z.infer<typeof CreateJobSchema>["body"];
type GetAllJobsQuery = z.infer<typeof GetAllJobsSchema>["query"];

export const createJobHandler = async (
  req: Request<{}, {}, createJobInput>,
  res: Response,
) => {
  try {
    const { userId, title, type } = req.body;
    const job = await createJob(userId, title, type);
    await jobQueue.add(
      "processJob",
      { jobId: job.id },
      {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 10000,
        },
        removeOnComplete: {
          age: 3600,
          count: 1000,
        },
        removeOnFail: {
          age: 24 * 3600,
        },
      },
    );
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

export const getJobHandler = async (
  req: Request<{}, {}, {}, Partial<GetAllJobsQuery>>,
  res: Response,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await getAllJobs(page, limit);
    return res.status(200).json(result);
  } catch (error) {
    req.log.error({ err: error }, "Failed to fetch jobs");
    return res
      .status(500)
      .json({ message: "server error (error getting jobs)" });
  }
};

export const getJobByIdHandler = async (
  req: Request<{ jobId: string }>,
  res: Response,
) => {
  try {
    const { jobId } = req.params;
    const job = await getJobById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ job });
  } catch (error) {
    req.log.error({ err: error }, "Failed to fetch job");
    return res
      .status(500)
      .json({ message: "server error (error getting job)" });
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
