import express from "express";
import {
  createJobHandler,
  getJobByIdHandler,
  getJobHandler,
  updateJobHandler,
} from "./job.controller";
import { validate } from "../../middleware/validate";
import {
  CreateJobSchema,
  GetAllJobsSchema,
  GetJobByIdSchema,
  UpdateJobSchema,
} from "./job.schema";
import { reportLimiter } from "../../middleware/limiter";

const jobRouter = express.Router();

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Submit a new job
 *     tags: [Jobs]
 *     description: |
 *       Submits a job to the processing queue. Rate limited to 50 requests per minute.
 *
 *       **Before using this endpoint**, create a user via `POST /api/users` and copy
 *       the `id` from the response to use as `userId` here.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - type
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: The `id` returned from POST /api/users
 *                 example: paste-your-user-id-here
 *               title:
 *                 type: string
 *                 example: Q4 Sales Report
 *               type:
 *                 type: string
 *                 enum: [SALES_REPORT, USER_ANALYTICS, PDF_EXPORT]
 *                 example: PDF_EXPORT
 *     responses:
 *       201:
 *         description: Job created and queued successfully
 *       400:
 *         description: Invalid userId — create a user first via POST /api/users
 *       429:
 *         description: Rate limit exceeded — max 50 requests per minute
 *       500:
 *         description: Server error
 */
jobRouter.post("/", reportLimiter, validate(CreateJobSchema), createJobHandler);

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: List all jobs (paginated)
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of jobs
 *       500:
 *         description: Server error
 */
jobRouter.get("/", validate(GetAllJobsSchema), getJobHandler);

/**
 * @swagger
 * /api/jobs/{jobId}:
 *   get:
 *     summary: Get a single job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The job `id` returned from POST /api/jobs
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
jobRouter.get("/:jobId", validate(GetJobByIdSchema), getJobByIdHandler);

jobRouter.patch("/:jobId", validate(UpdateJobSchema), updateJobHandler);

export default jobRouter;