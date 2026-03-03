import { z } from "zod";
import { JobType, JobStatus } from "@prisma/client";

export const CreateJobSchema = z.object({
  body: z.object({
    userId: z.string().uuid("Invalid user id format"),
    title: z.string().min(5, "Title should be more descriptive"),
    type: z.nativeEnum(JobType),
  }),
});

export const GetJobByIdSchema = z.object({
  params: z.object({
    jobId: z.string().uuid("Invalid Job Id format"),
  }),
});

export const UpdateJobSchema = z.object({
  params: z.object({
    jobId: z.string().uuid("Invalid Job Id format"),
  }),
  body: z.object({
    status: z.nativeEnum(JobStatus),
    progress: z.number().min(0).max(100).optional(),
  }),
});

export const GetAllJobsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
  }),
});
